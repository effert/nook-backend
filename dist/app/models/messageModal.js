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
class MessageModal {
    /**
     * 获取消息
     * @param id
     * @returns
     */
    static getMessage(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return models_1.default.message.findUnique({
                where: {
                    id,
                },
            });
        });
    }
    /**
     * 创建消息
     * @param content
     * @param user_id
     * @param room_id
     * @returns
     */
    static createMessage(content, roomId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const newMessage = yield models_1.default.message.create({
                data: {
                    content,
                    userId,
                    roomId,
                },
            });
            return newMessage;
        });
    }
    /**
     * 更新消息
     * @param id
     * @param updateData
     * @returns
     */
    static updateMessage(id, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            const newMessage = yield models_1.default.message.update({
                where: {
                    id,
                },
                data: updateData,
            });
            return newMessage;
        });
    }
    /**
     * 删除消息
     * @param id
     * @returns
     */
    static deleteMessage(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const newMessage = yield models_1.default.message.delete({
                where: {
                    id,
                },
            });
            return newMessage;
        });
    }
    /**
     * 删除房间内的所有消息
     * @param roomId
     * @returns
     */
    static deleteRoomMessage(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            const newMessage = yield models_1.default.message.deleteMany({
                where: {
                    roomId,
                },
            });
            return newMessage;
        });
    }
    /**
     * 获取房间内的所有消息
     * @param roomId
     * @returns
     */
    static getRoomMessage(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            const messages = yield models_1.default.message.findMany({
                where: {
                    roomId,
                },
            });
            return messages;
        });
    }
    /**
     * 导入某个房间的消息
     * @param messages Message[]
     */
    static importRoomMessage(messages) {
        return __awaiter(this, void 0, void 0, function* () {
            const newMessages = yield models_1.default.message.createMany({
                data: messages,
            });
            return newMessages;
        });
    }
}
exports.default = MessageModal;
