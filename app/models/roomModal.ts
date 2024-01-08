import { Room } from "@prisma/client"
import prisma from "@/models"

export default class RoomModal {
  /**
   * 获取房间信息
   * @param name
   * @returns
   */
  static async getRoomInfo(id: string) {
    return prisma.room.findUnique({
      where: {
        id,
      },
    })
  }

  /**
   * 创建房间
   * @param name
   * @param password
   * @returns
   */
  static async createRoom(id: string, roomName?: string) {
    roomName = roomName || id
    const newRoom = await prisma.room.create({
      data: {
        id,
        roomName,
      },
    })
    return newRoom
  }

  /**
   * 更新房间信息
   * @param name
   * @param updateData
   * @returns
   */
  static async updateRoom(id: string, updateData: Partial<Room>) {
    const newRoom = await prisma.room.update({
      where: {
        id,
      },
      data: updateData,
    })
    return newRoom
  }

  /**
   * 删除房间
   * @param name
   * @returns
   */
  static async deleteRoom(id: string) {
    const newRoom = await prisma.room.delete({
      where: {
        id,
      },
    })
    return newRoom
  }

  /**
   * 把用户加到房间内
   * @param email
   * @param roomId
   * @returns
   */
  static async addUserToRoom(email: string, roomId: string) {
    const updatedRoom = await prisma.room.update({
      where: { id: roomId },
      data: {
        members: {
          connect: { email },
        },
      },
    })

    return updatedRoom
  }

  /**
   * 把用户从房间内移除
   * @param email
   * @param roomId
   * @returns
   */
  static async removeUserFromRoom(email: string, roomId: string) {
    const updatedRoom = await prisma.room.update({
      where: { id: roomId },
      data: {
        members: {
          disconnect: { email },
        },
      },
    })

    return updatedRoom
  }

  /**
   * 获取房间内所有用户
   * @param roomId
   * @returns
   */
  static async getRoomMembers(roomId: string) {
    const room = await prisma.room.findUnique({
      where: {
        id: roomId,
      },
      include: {
        members: true,
      },
    })
    return room?.members
  }

  /**
   * 获取房间ai的权限
   * @param roomId
   * @returns
   */
  static async getRoomAi(roomId: string) {
    const room = await prisma.room.findUnique({
      where: {
        id: roomId,
      },
    })
    return room?.ai
  }

  /**
   * 设置房间ai的权限
   * @param roomId 房间id
   * @param ai ai的权限 false:无权限 true:有权限
   * @returns
   */
  static async setRoomAi(roomId: string, ai: boolean) {
    const room = await prisma.room.update({
      where: {
        id: roomId,
      },
      data: {
        ai,
      },
    })
    return room
  }
}
