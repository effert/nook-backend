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

const server = http.createServer()
const wss = new WebSocket.Server({ noServer: true })
const PORT = process.env.SOCKET_PORT || 8080

interface Room {
  [roomId: string]: Set<WebSocket>
}
type TMessageType = "text" | "image" | "file" | "member" // member 表示成员变动
type TMessage = {
  type: TMessageType
  content: string // type 为 member 时,content 为成员变动的类型(join,leave)
  sender: User // type 为 member 时, sender 为成员
  time: number
  isSelf?: boolean
}

let rooms: Room = {}
const { SECRET_KEY = "" } = process.env
/**
 * 获取用户信息
 * @param request
 * @returns
 * @description
 */
async function getUser(request: IncomingMessage) {
  const parameters = request.url ? url.parse(request.url, true).query : {}
  const authorization = parameters.authorization
  if (
    typeof authorization !== "string" ||
    authorization === "null" ||
    authorization === "anonymous"
  ) {
    // 创建一个匿名用户返回
    return await UserModal.createUser(generateRandomString(4), {
      name: "anonymous",
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
    const roomId: string = getRoomId(request)
    const user = await getUser(request)

    const roomInfo = await RoomModal.getRoomInfo(roomId)
    rooms[roomId] = rooms[roomId] || new Set()
    if (!roomInfo || !user || rooms[roomId].size > 1000) {
      // 房间不存在或人数大于1000就拒绝连接
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
          sender: user,
          time: Date.now(),
        }
        client.send(JSON.stringify(newMessage))
      }
    })

    ws.on("message", (message) => handleOnMessage(message, user))

    ws.on("close", (err) => handleClose(user))

    async function handleOnMessage(message: WebSocket.RawData, user: User) {
      if (rooms[roomId]) {
        // xxx: 这里可以做一些消息过滤，比如敏感词过滤
        // 创建消息
        await MessageModal.createMessage(message.toString(), roomId, user.id)
        // 广播消息
        rooms[roomId].forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            const newMessage: TMessage = {
              type: "text",
              content: message.toString(),
              sender: user,
              isSelf: client === ws,
              time: Date.now(),
            }
            client.send(JSON.stringify(newMessage))
          }
        })
      }
    }

    function handleClose(user: User) {
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
          // MessageModal.deleteRoomMessage(roomId)
          // 删除房间
          // RoomModal.deleteRoom(roomId)
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
