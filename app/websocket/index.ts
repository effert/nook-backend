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
import logger from "@/utils/log"

const server = http.createServer()
const wss = new WebSocket.Server({ noServer: true })
const PORT = process.env.SOCKET_PORT || 8080

interface Room {
  [roomId: string]: Set<WebSocket>
}
// member 表示成员变动 update表示房间信息变动
enum MessageType {
  TEXT = "text",
  IMAGE = "image",
  FILE = "file",
  MEMBER = "member",
  ERROR = "error",
  UPDATE = "update",
}
type TMessage = {
  type: MessageType
  content: string // type 为 member 时,content 为成员变动的类型(join,leave)
  sender: User // type 为 member 时, sender 为成员
  time: number
  isSelf?: boolean
}

const rooms: Room = {}
const { SECRET_KEY = "" } = process.env
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
    if (!roomInfo || !user || rooms[roomId].size > 1000) {
      if (!roomInfo) {
        ws.send(
          JSON.stringify({
            type: MessageType.ERROR,
            content: websocketLocales[locale]["The room does not exist"],
            time: Date.now(),
          })
        )
      } else if (!user) {
        ws.send(
          JSON.stringify({
            type: MessageType.ERROR,
            content: websocketLocales[locale]["Login expiration"],
            time: Date.now(),
          })
        )
      } else if (rooms[roomId].size > 1000) {
        ws.send(
          JSON.stringify({
            type: MessageType.ERROR,
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
    try {
      await RoomModal.addUserToRoom(user.email, roomId)
    } catch (err: any) {
      logger.error(err.message)
    }
    rooms[roomId].forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        const newMessage: TMessage = {
          type: MessageType.MEMBER,
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
      const roomInfo = await RoomModal.getRoomInfo(roomId)
      if (!roomInfo) {
        ws.send(
          JSON.stringify({
            type: MessageType.ERROR,
            content: websocketLocales[locale]["The room does not exist"],
            time: Date.now(),
          })
        )
        ws.close()
        return
      }

      if (rooms[roomId]) {
        // xxx: 这里可以做一些消息过滤，比如敏感词过滤
        // 创建消息
        const messageObj = JSON.parse(message.toString())
        const { content: messageText, type } = messageObj

        // 通知房间内所有人更新房间消息
        if (type === MessageType.UPDATE) {
          rooms[roomId].forEach((client) => {
            if (client.readyState === WebSocket.OPEN && client !== ws) {
              client.send(
                JSON.stringify({
                  type: MessageType.UPDATE,
                  time: Date.now(),
                })
              )
            }
          })
          return
        }

        try {
          await MessageModal.createMessage(messageText, roomId, user.id)
        } catch (err: any) {
          logger.error(err.message)
        }
        // 广播消息
        rooms[roomId].forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            const newMessage: TMessage = {
              type,
              content: messageText,
              sender: user,
              isSelf: client === ws,
              time: Date.now(),
            }
            client.send(JSON.stringify(newMessage))
          }
        })

        // 处理ai相关逻辑
        const aiName = roomInfo?.aiName
        if (
          roomInfo.ai &&
          roomInfo.aiEnabled &&
          messageText.indexOf(`@${aiName}`) > -1
        ) {
          const question = messageText.replace(`@${aiName}`, "").trim()
          // ai 机器人
          let resp = "?"
          if (!!question) {
            resp =
              (await openAi(question)) ||
              websocketLocales[locale]["Sorry I don't know how to response"]
          }
          // 记录ai的消息
          await MessageModal.createMessage(resp, roomId, user.id)
          const aiMessage: TMessage = {
            type: MessageType.TEXT,
            content: resp,
            sender: {
              id: 0,
              email: "",
              password: null,
              tempPassword: null,
              tempPasswordExpiry: null,
              name: aiName,
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

    async function handleClose(user: User) {
      const roomInfo = await RoomModal.getRoomInfo(roomId)
      if (!roomInfo) {
        ws.send(
          JSON.stringify({
            type: MessageType.ERROR,
            content: websocketLocales[locale]["The room does not exist"],
            time: Date.now(),
          })
        )
        ws.close()
        return
      }

      if (rooms[roomId]) {
        rooms[roomId].delete(ws)
        // 用户离开房间
        try {
          await RoomModal.removeUserFromRoom(user.email, roomId)
        } catch (err: any) {
          logger.error(err.message)
        }
        if (user.name === "anonymous") {
          // 匿名用户离开时删除
          try {
            await UserModal.deleteUser(user.email)
          } catch (err: any) {
            logger.error(err.message)
          }
        }
        rooms[roomId].forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            const newMessage: TMessage = {
              type: MessageType.MEMBER,
              content: "leave",
              sender: user,
              time: Date.now(),
            }
            client.send(JSON.stringify(newMessage))
          }
        })
        // 房间剩余人数为 0 时，删除房间
        let restMembers = await RoomModal.getRoomMembers(roomId)
        if (restMembers?.length === 0) {
          delete rooms[roomId]
          try {
            // 删除房间内所有消息
            await MessageModal.deleteRoomMessage(roomId)
            // 删除房间
            await RoomModal.deleteRoom(roomId)
          } catch (err: any) {
            logger.error(err.message)
          }
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
