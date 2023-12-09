import Router from "koa-router"
import authMiddleware from "@/middlewares/auth"
import testMiddleware from "@/middlewares/test"
import {
  getUserInfo,
  login,
  generateRandomPassword,
} from "../controllers/userController"

const router = new Router()

/**
 * 获取用户信息
 * @param id 用户id
 */
router.get("/user-info", authMiddleware, getUserInfo)

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
export default router
