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
class RoomModal {
    /**
     * 获取房间信息
     * @param name
     * @returns
     */
    static getRoomInfo(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return models_1.default.room.findUnique({
                where: {
                    id,
                },
            });
        });
    }
    /**
     * 创建房间
     * @param name
     * @param password
     * @returns
     */
    static createRoom(id, roomName) {
        return __awaiter(this, void 0, void 0, function* () {
            roomName = roomName || id;
            const newRoom = yield models_1.default.room.create({
                data: {
                    id,
                    roomName,
                },
            });
            return newRoom;
        });
    }
    /**
     * 更新房间信息
     * @param name
     * @param updateData
     * @returns
     */
    static updateRoom(id, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            const newRoom = yield models_1.default.room.update({
                where: {
                    id,
                },
                data: updateData,
            });
            return newRoom;
        });
    }
    /**
     * 删除房间
     * @param name
     * @returns
     */
    static deleteRoom(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const newRoom = yield models_1.default.room.delete({
                where: {
                    id,
                },
            });
            return newRoom;
        });
    }
    /**
     * 把用户加到房间内
     * @param email
     * @param roomId
     * @returns
     */
    static addUserToRoom(email, roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedRoom = yield models_1.default.room.update({
                where: { id: roomId },
                data: {
                    members: {
                        connect: { email },
                    },
                },
            });
            return updatedRoom;
        });
    }
    /**
     * 把用户从房间内移除
     * @param email
     * @param roomId
     * @returns
     */
    static removeUserFromRoom(email, roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedRoom = yield models_1.default.room.update({
                where: { id: roomId },
                data: {
                    members: {
                        disconnect: { email },
                    },
                },
            });
            return updatedRoom;
        });
    }
    /**
     * 获取房间内所有用户
     * @param roomId
     * @returns
     */
    static getRoomMembers(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            const room = yield models_1.default.room.findUnique({
                where: {
                    id: roomId,
                },
                include: {
                    members: true,
                },
            });
            return room === null || room === void 0 ? void 0 : room.members;
        });
    }
    /**
     * 获取房间ai的权限
     * @param roomId
     * @returns
     */
    static getRoomAi(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            const room = yield models_1.default.room.findUnique({
                where: {
                    id: roomId,
                },
            });
            return room === null || room === void 0 ? void 0 : room.ai;
        });
    }
    /**
     * 设置房间ai的权限
     * @param roomId 房间id
     * @param ai ai的权限 false:无权限 true:有权限
     * @returns
     */
    static setRoomAi(roomId, ai) {
        return __awaiter(this, void 0, void 0, function* () {
            const room = yield models_1.default.room.update({
                where: {
                    id: roomId,
                },
                data: {
                    ai,
                },
            });
            return room;
        });
    }
}
exports.default = RoomModal;
