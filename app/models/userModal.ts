import { User } from "@prisma/client"
import prisma from "@/models"

export default class UserModal {
  /**
   * 获取用户信息
   * @param email
   * @returns
   */
  static async getUserInfo(email: string) {
    return prisma.user.findUnique({
      where: {
        email,
      },
    })
  }

  /**
   * 创建用户
   * @param email
   * @param password
   * @returns
   */
  static async createUser(email: string, updateData: Partial<User>) {
    const newUser = await prisma.user.create({
      data: {
        email,
        ...updateData,
      },
    })
    return newUser
  }

  /**
   * 删除用户
   * @param email
   * @returns
   */
  static async deleteUser(email: string) {
    const newUser = await prisma.user.delete({
      where: {
        email,
      },
    })
    return newUser
  }

  /**
   * 更新用户信息
   * @param email
   * @param updateData
   * @returns
   */
  static async updateUser(email: string, updateData: Partial<User>) {
    const newUser = await prisma.user.update({
      where: {
        email,
      },
      data: updateData,
    })
    return newUser
  }

  /**
   * 获取用户所在的所有房间
   * @param email
   * returns
   */
  static async getUserRooms(email: string) {
    const userWithRooms = await prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        rooms: true,
      },
    })
    return userWithRooms ? userWithRooms.rooms : []
  }
}
