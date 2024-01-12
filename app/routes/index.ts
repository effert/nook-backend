import Router from "koa-router"
import authMiddleware from "@/middlewares/auth"
import {
  getUserInfo,
  login,
  generateRandomPassword,
  getRooms,
  uploadAvatar,
} from "@/controllers/userController"
import koaBody from "koa-body"
import path from "path"

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

/**
 * 上传用户头像
 * @param avatar 用户头像
 * @returns
 */
router.post(
  "/user/avatar",
  koaBody({
    multipart: true,
    formidable: {
      keepExtensions: true, // 保持文件扩展名
    },
  }),
  authMiddleware,
  uploadAvatar
)

export default router
