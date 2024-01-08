import { Context, Next } from "koa"
import RoomModal from "@/models/roomModal"
import { generateRandomString } from "@/utils"
import bcrypt from "bcrypt"

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
  const { password } = ctx.query // password 可以是明文或者加密后的密码
  const room = await RoomModal.getRoomInfo(id)
  if (!room) {
    ctx.status = 404
    ctx.body = { error: ctx.__("Room not found") }
    return next()
  }
  let isPasswordCorrect = false
  if (room.password && password) {
    try {
      isPasswordCorrect =
        password === room.password ||
        (await bcrypt.compare(password as string, room.password))
    } catch (err) {
      console.log(err)
    }
  }
  const data = {
    ...room,
    isPasswordCorrect,
  }
  ctx.body = {
    code: 200,
    data,
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
  const { password, ...rest } = ctx.request.body as {
    password: string
  }
  const room = await RoomModal.getRoomInfo(id)
  if (!room) {
    ctx.status = 404
    ctx.body = { error: ctx.__("Room not found") }
    return next()
  }
  const updatedRoom = await RoomModal.updateRoom(id, {
    password: password && (await bcrypt.hash(password, 10)),
    ...rest,
  })
  ctx.body = {
    code: 200,
    data: updatedRoom,
  }
  return next()
}

/**
 * 获取房间内所有成员
 * @param ctx
 * @returns
 */
export async function getRoomMembers(ctx: Context, next: Next) {
  const { id } = ctx.params
  const members = await RoomModal.getRoomMembers(id)
  ctx.body = {
    code: 200,
    data: members?.map((member) => ({
      id: member.id,
      email: member.email,
      name: member.name,
      avatar: member.avatar,
    })),
  }
  return next()
}

/**
 * 获取房间ai的权限
 * @param ctx
 * @returns boolean
 */
export async function getRoomAi(ctx: Context, next: Next) {
  const { id } = ctx.params
  const room = await RoomModal.getRoomInfo(id)
  ctx.body = {
    code: 200,
    data: room?.ai,
  }
  return next()
}

/**
 * 设置房间ai的权限
 * @param ctx
 * @returns boolean
 */
export async function setRoomAi(ctx: Context, next: Next) {
  const { id } = ctx.params
  const { ai } = ctx.request.body as { ai: boolean }
  const room = await RoomModal.getRoomInfo(id)
  if (!room) {
    ctx.status = 404
    ctx.body = { error: ctx.__("Room not found") }
    return next()
  }
  const updatedRoom = await RoomModal.updateRoom(id, {
    ai,
  })
  ctx.body = {
    code: 200,
    data: updatedRoom,
  }
  return next()
}
