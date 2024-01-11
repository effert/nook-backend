"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const koa_router_1 = __importDefault(require("koa-router"));
const koa_body_1 = __importDefault(require("koa-body"));
const messageControllers_1 = require("@/controllers/messageControllers");
const router = new koa_router_1.default({
    prefix: "/message",
});
/**
 * 导出房间内所有消息
 * @param roomId
 * @returns
 */
router.post("/export", messageControllers_1.exportMessage);
/**
 * 导入房间内所有消息
 * @param roomId
 * @param files
 * @returns
 */
router.post("/import", (0, koa_body_1.default)({ multipart: true }), messageControllers_1.importMessage);
/**
 * 删除房间内所有消息
 * @param roomId
 */
router.delete("/room-delete", messageControllers_1.deleteRoomMessage);
exports.default = router;
