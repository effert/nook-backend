import Router from "koa-router"
import { createRoom, getRoomInfo } from "@/controllers/roomControllers"

const router = new Router({
  prefix: "/room",
})

/**
 * 新建房间
 * @returns
 */
router.post("/create", createRoom)

/**
 * 获取房间信息
 * @returns
 */
router.get("/:id", getRoomInfo)

export default router
