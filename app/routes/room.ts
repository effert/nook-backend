import Router from "koa-router"
import { createRoom } from "@/controllers/roomControllers"

const router = new Router({
  prefix: "/room",
})

/**
 * 新建房间
 * @returns
 */
router.post("/create", createRoom)

export default router
