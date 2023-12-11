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
}
