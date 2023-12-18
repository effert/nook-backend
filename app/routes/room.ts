import Router from "koa-router"
import {
  createRoom,
  getRoomInfo,
  modifyRoomInfo,
} from "@/controllers/roomControllers"

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

/**
 * 修改房间信息
 * @returns
 */
router.put("/:id", modifyRoomInfo)
export default router
