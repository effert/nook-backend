import Router from "koa-router"
import koaBody from "koa-body"
import { exportMessage, importMessage } from "@/controllers/messageControllers"

const router = new Router({
  prefix: "/message",
})

/**
 * 导出房间内所有消息
 * @param roomId
 * @returns
 */
router.post("/export", exportMessage)

/**
 * 导入房间内所有消息
 * @param roomId
 * @param files
 * @returns
 */
router.post("/import", koaBody({ multipart: true }), importMessage)

export default router
