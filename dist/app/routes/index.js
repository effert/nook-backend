"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const koa_router_1 = __importDefault(require("koa-router"));
const auth_1 = __importDefault(require("@/middlewares/auth"));
const userController_1 = require("@/controllers/userController");
const koa_body_1 = __importDefault(require("koa-body"));
const router = new koa_router_1.default();
/**
 * 用户登录，未注册的话先注册再登录
 * @param email 邮箱
 * @param password 密码
 */
router.post("/login", userController_1.login);
/**
 * 测试接口
 */
router.get("/test", userController_1.test);
/**
 * 生成临时密码
 */
router.get("/generate-temp-password", userController_1.generateRandomPassword);
/**
 * 获取用户信息
 * @param id 用户id
 */
router.get("/user-info", auth_1.default, userController_1.getUserInfo);
/**
 * 获取用户所在的所有房间
 * @returns
 */
router.get("/user/rooms", auth_1.default, userController_1.getRooms);
/**
 * 上传用户头像
 * @param avatar 用户头像
 * @returns
 */
router.post("/user/avatar", (0, koa_body_1.default)({
    multipart: true,
    formidable: {
        keepExtensions: true, // 保持文件扩展名
    },
}), auth_1.default, userController_1.uploadAvatar);
exports.default = router;
