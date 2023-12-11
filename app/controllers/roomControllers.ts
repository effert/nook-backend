import { Context } from "koa"
import RoomModal from "@/models/roomModal"
import { generateRandomString } from "@/utils"

/**
 * 新增一个房间
 * @param ctx
 * @returns
 * @description
 * 生成一个随机的房间 id，如果已经存在就重新生成，直到生成一个不存在的房间 id
 * 然后创建房间
 * 返回房间信息
 */
export async function createRoom(ctx: Context) {
  let id = generateRandomString(8)
  let roomInfo = await RoomModal.getRoomInfo(id)
  while (roomInfo) {
    id = generateRandomString(8)
    roomInfo = await RoomModal.getRoomInfo(id)
  }
  const room = await RoomModal.createRoom(id)
  ctx.body = {
    code: 200,
    data: room,
  }
}
