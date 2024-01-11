"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const koa_router_1 = __importDefault(require("koa-router"));
const commonControllers_1 = require("@/controllers/commonControllers");
const koa_body_1 = __importDefault(require("koa-body"));
const router = new koa_router_1.default({
    prefix: "/common",
});
/**
 * 通用的上传文件接口
 * @param file 文件
 * @returns
 */
router.post("/upload", (0, koa_body_1.default)({
    multipart: true,
    formidable: {
        keepExtensions: true, // 保持文件扩展名
    },
}), commonControllers_1.upload);
exports.default = router;
