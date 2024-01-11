"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const koa_router_1 = __importDefault(require("koa-router"));
const roomControllers_1 = require("@/controllers/roomControllers");
const router = new koa_router_1.default({
    prefix: "/room",
});
/**
 * 新建房间
 * @returns
 */
router.post("/create", roomControllers_1.createRoom);
/**
 * 获取房间信息
 * @returns
 */
router.get("/:id", roomControllers_1.getRoomInfo);
/**
 * 修改房间信息
 * @returns
 */
router.put("/:id", roomControllers_1.modifyRoomInfo);
/**
 * 获取房间内所有成员
 * @returns
 */
router.get("/:id/users", roomControllers_1.getRoomMembers);
/**
 * 获取房间ai的权限
 * @returns
 */
router.get("/:id/ai", roomControllers_1.getRoomAi);
/**
 * 设置房间ai的权限
 * @returns boolean
 */
router.put("/:id/ai", roomControllers_1.setRoomAi);
exports.default = router;
