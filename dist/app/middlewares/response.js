"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@/utils");
const log_1 = __importDefault(require("@/utils/log"));
function responseFormatter(ctx, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // 执行下一个中间件
            yield next();
            // 如果有响应数据，则应用统一格式
            if (ctx.body !== undefined) {
                const isSuccess = ctx.status === 200;
                ctx.body = (0, utils_1.response)(isSuccess, "", ctx.body);
            }
        }
        catch (err) {
            // 错误日志记录
            log_1.default.error(err.message);
            ctx.status = err.statusCode || err.status || 500;
            ctx.body = (0, utils_1.response)(false, err.message || ctx.__("Internal server error"));
        }
    });
}
exports.default = responseFormatter;
