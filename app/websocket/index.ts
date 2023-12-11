import WebSocket from "ws"
import http from "http"
import { IncomingMessage } from "http"
import url from "url"
import jwt, { JwtPayload } from "jsonwebtoken"
import RoomModal from "@/models/roomModal"
import MessageModal from "@/models/messageModal"

const server = http.createServer()
const wss = new WebSocket.Server({ noServer: true })
const PORT = process.env.SOCKET_PORT || 8080

interface Room {
  [roomId: string]: Set<WebSocket>
}

let rooms: Room = {}
const { SECRET_KEY = "" } = process.env
/**
 * 获取用户信息
 * @param request
 * @returns
 * @description
 * 从请求头中获取 token，然后解析 token 获取用户信息
 */
function getUser(request: IncomingMessage) {
  const parameters = request.url ? url.parse(request.url, true).query : {}
  const token = parameters.token || ""
  if (typeof token !== "string" || !token) {
    return {}
  }
  const token1 = token.split(" ")[1]
  const user = jwt.verify(token1, SECRET_KEY)
  return user
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
    const user = getUser(request)

    const roomInfo = await RoomModal.getRoomInfo(roomId)
    if (!roomInfo) {
      // 房间不存在就创建房间
      // await RoomModal.createRoom(roomId)
      // 房间不存在就拒绝连接
      ws.close()
      return
    }
    console.log(`客户端${roomId}已连接:`)
    rooms[roomId] = rooms[roomId] || new Set()
    rooms[roomId].add(ws)

    ws.on("message", async function incoming(message) {
      console.log(`${roomId}收到消息： ${message}`)
      if (rooms[roomId]) {
        // xxx: 这里可以做一些消息过滤，比如敏感词过滤
        // 创建消息
        await MessageModal.createMessage(
          message.toString(),
          roomId,
          typeof user === "string" ? undefined : user.id
        )
        // 广播消息
        rooms[roomId].forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(message)
          }
        })
      }
    })

    ws.on("close", () => {
      if (rooms[roomId]) {
        rooms[roomId].delete(ws)
        if (rooms[roomId].size === 0) {
          delete rooms[roomId]
          RoomModal.deleteRoom(roomId)
          MessageModal.deleteRoomMessage(roomId)
        }
        console.log(`${roomId}客户端已断开连接`)
      }
    })
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
