import WebSocket from "ws"
import http from "http"
import { IncomingMessage } from "http"
import url from "url"
import jwt, { JwtPayload } from "jsonwebtoken"
import RoomModal from "@/models/roomModal"
import MessageModal from "@/models/messageModal"
import UserModal from "@/models/userModal"
import { User } from "@prisma/client"
import { generateRandomString } from "@/utils"
import cookie from "cookie"
import websocketLocales from "@/locales/websocketLocales"
import openAi from "@/openai"

const server = http.createServer()
const wss = new WebSocket.Server({ noServer: true })
const PORT = process.env.SOCKET_PORT || 8080

interface Room {
  [roomId: string]: Set<WebSocket>
}
interface RoomAi {
  [roomId: string]: string
}
type TMessageType = "text" | "image" | "file" | "member" | "error" // member 表示成员变动
type TMessage = {
  type: TMessageType
  content: string // type 为 member 时,content 为成员变动的类型(join,leave)
  sender: User // type 为 member 时, sender 为成员
  time: number
  isSelf?: boolean
}

const rooms: Room = {}
const roomAi: RoomAi = {}
const { SECRET_KEY = "" } = process.env
const CHANGE_NAME_KEY = "changeAiName"
/**
 * 获取用户信息
 * @param request
 * @returns
 * @description
 */
async function getUser(request: IncomingMessage, locale: string) {
  const parameters = request.url ? url.parse(request.url, true).query : {}
  const authorization = parameters.authorization
  if (
    typeof authorization !== "string" ||
    authorization === "null" ||
    authorization === "anonymous"
  ) {
    // 创建一个匿名用户返回
    return await UserModal.createUser(generateRandomString(4), {
      name: websocketLocales[locale]["anonymous"],
    })
  }
  const token = authorization.split(" ")[1]

  const user = jwt.verify(token, SECRET_KEY) as JwtPayload
  const userInfo = await UserModal.getUserInfo(user.email)
  return userInfo
}
/**
 * 获取房间 id
 * @param request
 * @returns
 * @description
 * 从请求路径中获取房间 id
 */
function getRoomId(request: IncomingMessage) {
  const pathname = url.parse(request?.url!, true).pathname || ""
  const roomId = pathname.substring(1)
  return roomId
}

export default function createWebsocket() {
  wss.on("connection", async function connection(ws, request: IncomingMessage) {
    const cookies = cookie.parse(request.headers.cookie || "")
    const locale = cookies["locale"] || "en"

    const roomId: string = getRoomId(request)
    let user: User | null = null
    try {
      user = await getUser(request, locale)
    } catch (err) {}

    const roomInfo = await RoomModal.getRoomInfo(roomId)
    rooms[roomId] = rooms[roomId] || new Set()
    roomAi[roomId] = roomAi[roomId] || "ai" // 默认叫做ai
    if (!roomInfo || !user || rooms[roomId].size > 1000) {
      if (!roomInfo) {
        ws.send(
          JSON.stringify({
            type: "error",
            content: websocketLocales[locale]["The room does not exist"],
            time: Date.now(),
          })
        )
      } else if (!user) {
        ws.send(
          JSON.stringify({
            type: "error",
            content: websocketLocales[locale]["Login expiration"],
            time: Date.now(),
          })
        )
      } else if (rooms[roomId].size > 1000) {
        ws.send(
          JSON.stringify({
            type: "error",
            content:
              websocketLocales[locale][
                "The maximum number of people is exceeded"
              ],
            time: Date.now(),
          })
        )
      }
      ws.close()
      return
    }
    rooms[roomId].add(ws)
    console.log(`房间：${roomId}，用户：${user.name},已连接:`)
    // 用户进入房间
    await RoomModal.addUserToRoom(user.email, roomId)
    rooms[roomId].forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        const newMessage: TMessage = {
          type: "member",
          content: "join",
          sender: user!,
          time: Date.now(),
        }
        client.send(JSON.stringify(newMessage))
      }
    })

    ws.on("message", (message) => handleOnMessage(message, user!))

    ws.on("close", (err) => handleClose(user!))

    async function handleOnMessage(message: WebSocket.RawData, user: User) {
      if (rooms[roomId]) {
        // xxx: 这里可以做一些消息过滤，比如敏感词过滤
        // 创建消息
        const messageText = message.toString()
        await MessageModal.createMessage(messageText, roomId, user.id)
        // 广播消息
        rooms[roomId].forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            const newMessage: TMessage = {
              type: "text",
              content: messageText,
              sender: user,
              isSelf: client === ws,
              time: Date.now(),
            }
            client.send(JSON.stringify(newMessage))
          }
        })

        // 修改本房间ai的名字
        if (messageText.includes(CHANGE_NAME_KEY)) {
          const name = messageText.split(" ")[1]
          if (name) {
            roomAi[roomId] = name
          }
        }
        // 处理ai相关逻辑
        if (messageText.indexOf(`@${roomAi[roomId]}`) > -1) {
          const question = messageText.replace(`@${roomAi[roomId]}`, "").trim()
          // ai 机器人
          let resp = "?"
          if (!!question) {
            resp =
              (await openAi(question)) ||
              websocketLocales[locale]["Sorry I don't know how to response"]
          }
          const aiMessage: TMessage = {
            type: "text",
            content: resp,
            sender: {
              id: 0,
              email: "",
              password: null,
              tempPassword: null,
              tempPasswordExpiry: null,
              name: roomAi[roomId],
              avatar: "/uploads/gpt-logo.jpg",
            },
            time: Date.now(),
          }
          rooms[roomId].forEach((client) => {
            client.send(JSON.stringify(aiMessage))
          })
        }
      }
    }

    function handleClose(user: User) {
      if (roomAi[roomId]) {
        delete roomAi[roomId]
      }

      if (rooms[roomId]) {
        rooms[roomId].delete(ws)
        // 用户离开房间
        RoomModal.removeUserFromRoom(user.email, roomId)
        if (user.name === "anonymous") {
          // 匿名用户离开时删除
          UserModal.deleteUser(user.email)
        }
        rooms[roomId].forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            const newMessage: TMessage = {
              type: "member",
              content: "leave",
              sender: user,
              time: Date.now(),
            }
            client.send(JSON.stringify(newMessage))
          }
        })
        if (rooms[roomId].size === 0) {
          delete rooms[roomId]
          // 删除房间内所有消息
          MessageModal.deleteRoomMessage(roomId)
          // 删除房间
          RoomModal.deleteRoom(roomId)
        }
        console.log(`房间：${roomId}，用户：${user?.name},已断开连接`)
      }
    }
  })

  server.on("upgrade", function upgrade(request, socket, head) {
    if (request.url?.startsWith("/")) {
      wss.handleUpgrade(request, socket, head, function done(ws) {
        wss.emit("connection", ws, request)
      })
    } else {
      socket.destroy()
    }
  })

  server.listen(PORT)
  console.log(`WebSocket 服务运行在 ${PORT} 端口`)
}
