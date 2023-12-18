import { Context, Next } from "koa"
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
export async function createRoom(ctx: Context, next: Next) {
  let id = generateRandomString(3)
  let roomInfo = await RoomModal.getRoomInfo(id)
  while (roomInfo) {
    id = generateRandomString(4)
    roomInfo = await RoomModal.getRoomInfo(id)
  }
  const room = await RoomModal.createRoom(id)
  ctx.body = {
    code: 200,
    data: room,
  }
  return next()
}

/**
 * 获取房间信息
 * @param ctx
 * @returns
 */
export async function getRoomInfo(ctx: Context, next: Next) {
  const { id } = ctx.params
  const room = await RoomModal.getRoomInfo(id)
  if (!room) {
    ctx.status = 404
    ctx.body = { error: ctx.__("Room not found") }
    return next()
  }
  ctx.body = {
    code: 200,
    data: room,
  }
  return next()
}

/**
 * 修改房间信息
 * @param ctx
 * @returns
 */

export async function modifyRoomInfo(ctx: Context, next: Next) {
  const { id } = ctx.params
  const { roomName } = ctx.request.body as {
    roomName: string
  }
  const room = await RoomModal.getRoomInfo(id)
  if (!room) {
    ctx.status = 404
    ctx.body = { error: ctx.__("Room not found") }
    return next()
  }
  const updatedRoom = await RoomModal.updateRoom(id, {
    roomName,
  })
  ctx.body = {
    code: 200,
    data: updatedRoom,
  }
  return next()
}
