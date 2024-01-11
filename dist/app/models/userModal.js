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
const models_1 = __importDefault(require("@/models"));
class UserModal {
    /**
     * 获取用户信息
     * @param email
     * @returns
     */
    static getUserInfo(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return models_1.default.user.findUnique({
                where: {
                    email,
                },
            });
        });
    }
    /**
     * 创建用户
     * @param email
     * @param password
     * @returns
     */
    static createUser(email, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            const newUser = yield models_1.default.user.create({
                data: Object.assign({ email }, updateData),
            });
            return newUser;
        });
    }
    /**
     * 删除用户
     * @param email
     * @returns
     */
    static deleteUser(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const newUser = yield models_1.default.user.delete({
                where: {
                    email,
                },
            });
            return newUser;
        });
    }
    /**
     * 更新用户信息
     * @param email
     * @param updateData
     * @returns
     */
    static updateUser(email, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            const newUser = yield models_1.default.user.update({
                where: {
                    email,
                },
                data: updateData,
            });
            return newUser;
        });
    }
    /**
     * 获取用户所在的所有房间
     * @param email
     * returns
     */
    static getUserRooms(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const userWithRooms = yield models_1.default.user.findUnique({
                where: {
                    email,
                },
                include: {
                    rooms: true,
                },
            });
            return userWithRooms ? userWithRooms.rooms : [];
        });
    }
}
exports.default = UserModal;
