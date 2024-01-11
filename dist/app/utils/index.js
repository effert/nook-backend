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
exports.executeWithRetry = exports.response = exports.generateRandomString = void 0;
const crypto_1 = __importDefault(require("crypto"));
function generateRandomString(length) {
    return crypto_1.default.randomBytes(length).toString("hex");
}
exports.generateRandomString = generateRandomString;
function response(success, message, data) {
    return { success, message, data };
}
exports.response = response;
/**
 * 重试函数
 * @param operation
 * @param maxRetries
 * @returns
 */
function executeWithRetry(operation, maxRetries = 3) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return yield operation();
            }
            catch (error) {
                if (error.message.includes("write conflict") && attempt < maxRetries) {
                    // 可以在这里添加一些延迟（例如使用 setTimeout）
                    yield new Promise((resolve) => setTimeout(resolve, 500));
                    continue;
                }
                throw error;
            }
        }
    });
}
exports.executeWithRetry = executeWithRetry;
