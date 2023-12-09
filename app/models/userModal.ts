import { PrismaClient, User } from "@prisma/client"

const prisma = new PrismaClient()

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
  static async createUser(email: string, password: string) {
    const newUser = await prisma.user.create({
      data: {
        email,
        password,
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
}
