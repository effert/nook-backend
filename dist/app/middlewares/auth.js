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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const { SECRET_KEY = "" } = process.env;
function authenticateToken(ctx, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const authHeader = ctx.headers.authorization;
        if (authHeader) {
            const token = authHeader.split(" ")[1];
            try {
                const user = jsonwebtoken_1.default.verify(token, SECRET_KEY);
                ctx.state.user = user; // 将用户信息存储在 ctx.state 中，以便后续使用
                yield next();
            }
            catch (error) {
                ctx.status = 403;
                ctx.body = { error: ctx.__("Access denied") };
            }
        }
        else {
            ctx.status = 401;
            ctx.body = { error: ctx.__("Authentication required") };
        }
    });
}
exports.default = authenticateToken;
