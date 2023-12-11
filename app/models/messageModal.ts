import { Message } from "@prisma/client"
import prisma from "@/models"

export default class MessageModal {
  /**
   * 获取消息
   * @param id
   * @returns
   */
  static async getMessage(id: number) {
    return prisma.message.findUnique({
      where: {
        id,
      },
    })
  }

  /**
   * 创建消息
   * @param content
   * @param user_id
   * @param room_id
   * @returns
   */
  static async createMessage(content: string, roomId: string, userId?: number) {
    const newMessage = await prisma.message.create({
      data: {
        content,
        userId,
        roomId,
      },
    })
    return newMessage
  }

  /**
   * 更新消息
   * @param id
   * @param updateData
   * @returns
   */
  static async updateMessage(id: number, updateData: Partial<Message>) {
    const newMessage = await prisma.message.update({
      where: {
        id,
      },
      data: updateData,
    })
    return newMessage
  }

  /**
   * 删除消息
   * @param id
   * @returns
   */
  static async deleteMessage(id: number) {
    const newMessage = await prisma.message.delete({
      where: {
        id,
      },
    })
    return newMessage
  }

  /**
   * 删除房间内的所有消息
   * @param roomId
   * @returns
   */
  static async deleteRoomMessage(roomId: string) {
    const newMessage = await prisma.message.deleteMany({
      where: {
        roomId,
      },
    })
    return newMessage
  }

  /**
   * 获取房间内的所有消息
   * @param roomId
   * @returns
   */
  static async getRoomMessage(roomId: string) {
    const messages = await prisma.message.findMany({
      where: {
        roomId,
      },
    })
    return messages
  }

  /**
   * 导入某个房间的消息
   * @param messages Message[]
   */
  static async importRoomMessage(messages: Message[]) {
    const newMessages = await prisma.message.createMany({
      data: messages,
    })
    return newMessages
  }
}
