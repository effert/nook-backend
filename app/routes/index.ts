import Router from "koa-router"
import authMiddleware from "@/middlewares/auth"
import {
  getUserInfo,
  login,
  generateRandomPassword,
  getRooms,
} from "@/controllers/userController"

const router = new Router()

/**
 * 用户登录，未注册的话先注册再登录
 * @param email 邮箱
 * @param password 密码
 */
router.post("/login", login)

/**
 * 生成临时密码
 */
router.get("/generate-temp-password", generateRandomPassword)

/**
 * 获取用户信息
 * @param id 用户id
 */
router.get("/user-info", authMiddleware, getUserInfo)

/**
 * 获取用户所在的所有房间
 * @returns
 */
router.get("/user/rooms", authMiddleware, getRooms)

export default router
