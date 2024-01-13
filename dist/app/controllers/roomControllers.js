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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setRoomAiEnabled = exports.setRoomAi = exports.getRoomAi = exports.getRoomMembers = exports.modifyRoomInfo = exports.getRoomInfo = exports.createRoom = void 0;
const roomModal_1 = __importDefault(require("@/models/roomModal"));
const utils_1 = require("@/utils");
const bcrypt_1 = __importDefault(require("bcrypt"));
const lodash_1 = require("lodash");
/**
 * 新增一个房间
 * @param ctx
 * @returns
 * @description
 * 生成一个随机的房间 id，如果已经存在就重新生成，直到生成一个不存在的房间 id
 * 然后创建房间
 * 返回房间信息
 */
function createRoom(ctx, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let id = (0, utils_1.generateRandomString)(3);
        let roomInfo = yield roomModal_1.default.getRoomInfo(id);
        while (roomInfo) {
            id = (0, utils_1.generateRandomString)(4);
            roomInfo = yield roomModal_1.default.getRoomInfo(id);
        }
        const room = yield roomModal_1.default.createRoom(id);
        ctx.body = {
            code: 200,
            data: room,
        };
        return next();
    });
}
exports.createRoom = createRoom;
/**
 * 获取房间信息
 * @param ctx
 * @returns
 */
function getRoomInfo(ctx, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id } = ctx.params;
        const { password } = ctx.query; // password 可以是明文或者加密后的密码
        const room = yield roomModal_1.default.getRoomInfo(id);
        if (!room) {
            ctx.status = 404;
            ctx.body = { error: ctx.__("Room not found") };
            return next();
        }
        let isPasswordCorrect = false;
        if (room.password && password) {
            try {
                isPasswordCorrect =
                    password === room.password ||
                    (yield bcrypt_1.default.compare(password, room.password));
            }
            catch (err) {
                console.log(err);
            }
        }
        const data = Object.assign(Object.assign({}, room), { isPasswordCorrect });
        ctx.body = {
            code: 200,
            data,
        };
        return next();
    });
}
exports.getRoomInfo = getRoomInfo;
/**
 * 修改房间信息
 * @param ctx
 * @returns
 */
function modifyRoomInfo(ctx, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id } = ctx.params;
        const _a = ctx.request.body, { password } = _a, rest = __rest(_a, ["password"]);
        const room = yield roomModal_1.default.getRoomInfo(id);
        if (!room) {
            ctx.status = 404;
            ctx.body = { error: ctx.__("Room not found") };
            return next();
        }
        const updatedRoom = yield roomModal_1.default.updateRoom(id, Object.assign({ password: password && (yield bcrypt_1.default.hash(password, 10)) }, (0, lodash_1.omit)(rest, ["ai", "aiEnabled"])));
        ctx.body = {
            code: 200,
            data: updatedRoom,
        };
        return next();
    });
}
exports.modifyRoomInfo = modifyRoomInfo;
/**
 * 获取房间内所有成员
 * @param ctx
 * @returns
 */
function getRoomMembers(ctx, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id } = ctx.params;
        const members = yield roomModal_1.default.getRoomMembers(id);
        ctx.body = {
            code: 200,
            data: members === null || members === void 0 ? void 0 : members.map((member) => ({
                id: member.id,
                email: member.email,
                name: member.name,
                avatar: member.avatar,
            })),
        };
        return next();
    });
}
exports.getRoomMembers = getRoomMembers;
/**
 * 获取房间ai的权限
 * @param ctx
 * @returns boolean
 */
function getRoomAi(ctx, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id } = ctx.params;
        const room = yield roomModal_1.default.getRoomInfo(id);
        ctx.body = {
            code: 200,
            data: room === null || room === void 0 ? void 0 : room.ai,
        };
        return next();
    });
}
exports.getRoomAi = getRoomAi;
/**
 * 设置房间ai的权限
 * @param ctx
 * @returns boolean
 */
function setRoomAi(ctx, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id } = ctx.params;
        const { ai } = ctx.request.body;
        const room = yield roomModal_1.default.getRoomInfo(id);
        if (!room) {
            ctx.status = 404;
            ctx.body = { error: ctx.__("Room not found") };
            return next();
        }
        if (!room.aiEnabled) {
            ctx.status = 403;
            ctx.body = { error: ctx.__("AI is not enabled") };
            return next();
        }
        const updatedRoom = yield roomModal_1.default.updateRoom(id, {
            ai,
        });
        ctx.body = {
            code: 200,
            data: updatedRoom,
        };
        return next();
    });
}
exports.setRoomAi = setRoomAi;
/**
 * 设置房间是否可以开启ai
 * @param ctx
 * @returns boolean
 */
function setRoomAiEnabled(ctx, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id } = ctx.params;
        console.log(id);
        const { id: userId } = ctx.state.user;
        const { aiEnabled } = ctx.request.body;
        const room = yield roomModal_1.default.getRoomInfo(id);
        if (!room) {
            ctx.status = 404;
            ctx.body = { error: ctx.__("Room not found") };
            return next();
        }
        if (userId != 1) {
            ctx.status = 403;
            ctx.body = { error: ctx.__("Access denied") };
            return next();
        }
        const updatedRoom = yield roomModal_1.default.updateRoom(id, {
            aiEnabled,
        });
        ctx.body = {
            code: 200,
            data: updatedRoom,
        };
        return next();
    });
}
exports.setRoomAiEnabled = setRoomAiEnabled;
