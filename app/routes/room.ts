import Router from "koa-router"
import {
  createRoom,
  getRoomInfo,
  modifyRoomInfo,
  getRoomMembers,
  getRoomAi,
  setRoomAi,
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

/**
 * 获取房间内所有成员
 * @returns
 */
router.get("/:id/users", getRoomMembers)

/**
 * 获取房间ai的权限
 * @returns
 */
router.get("/:id/ai", getRoomAi)

/**
 * 设置房间ai的权限
 * @returns boolean
 */
router.put("/:id/ai", setRoomAi)

export default router
