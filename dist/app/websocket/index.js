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
const ws_1 = __importDefault(require("ws"));
const url_1 = __importDefault(require("url"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const roomModal_1 = __importDefault(require("@/models/roomModal"));
const messageModal_1 = __importDefault(require("@/models/messageModal"));
const userModal_1 = __importDefault(require("@/models/userModal"));
const utils_1 = require("@/utils");
const cookie_1 = __importDefault(require("cookie"));
const websocketLocales_1 = __importDefault(require("@/locales/websocketLocales"));
const openai_1 = __importDefault(require("@/openai"));
const log_1 = __importDefault(require("@/utils/log"));
// member 表示成员变动 update表示房间信息变动
var MessageType;
(function (MessageType) {
    MessageType["TEXT"] = "text";
    MessageType["IMAGE"] = "image";
    MessageType["FILE"] = "file";
    MessageType["MEMBER"] = "member";
    MessageType["ERROR"] = "error";
    MessageType["UPDATE"] = "update";
})(MessageType || (MessageType = {}));
const rooms = {};
const { SECRET_KEY = "" } = process.env;
/**
 * 获取用户信息
 * @param request
 * @returns
 * @description
 */
function getUser(request, locale) {
    return __awaiter(this, void 0, void 0, function* () {
        const parameters = request.url ? url_1.default.parse(request.url, true).query : {};
        const authorization = parameters.authorization;
        if (typeof authorization !== "string" ||
            authorization === "null" ||
            authorization === "anonymous") {
            // 创建一个匿名用户返回
            return yield userModal_1.default.createUser((0, utils_1.generateRandomString)(4), {
                name: websocketLocales_1.default[locale]["anonymous"],
            });
        }
        const token = authorization.split(" ")[1];
        const user = jsonwebtoken_1.default.verify(token, SECRET_KEY);
        const userInfo = yield userModal_1.default.getUserInfo(user.email);
        return userInfo;
    });
}
/**
 * 获取房间 id
 * @param request
 * @returns
 * @description
 * 从请求路径中获取房间 id
 */
function getRoomId(request) {
    const pathname = url_1.default.parse(request === null || request === void 0 ? void 0 : request.url, true).pathname || "";
    const roomId = pathname.substring(1);
    return roomId;
}
function createWebsocket(wss, server) {
    wss.on("connection", function connection(ws, request) {
        return __awaiter(this, void 0, void 0, function* () {
            const cookies = cookie_1.default.parse(request.headers.cookie || "");
            const locale = cookies["locale"] || "en";
            const roomId = getRoomId(request);
            let user = null;
            try {
                user = yield getUser(request, locale);
            }
            catch (err) { }
            const roomInfo = yield roomModal_1.default.getRoomInfo(roomId);
            rooms[roomId] = rooms[roomId] || new Set();
            if (!roomInfo || !user || rooms[roomId].size > 1000) {
                if (!roomInfo) {
                    ws.send(JSON.stringify({
                        type: MessageType.ERROR,
                        content: websocketLocales_1.default[locale]["The room does not exist"],
                        time: Date.now(),
                    }));
                }
                else if (!user) {
                    ws.send(JSON.stringify({
                        type: MessageType.ERROR,
                        content: websocketLocales_1.default[locale]["Login expiration"],
                        time: Date.now(),
                    }));
                }
                else if (rooms[roomId].size > 1000) {
                    ws.send(JSON.stringify({
                        type: MessageType.ERROR,
                        content: websocketLocales_1.default[locale]["The maximum number of people is exceeded"],
                        time: Date.now(),
                    }));
                }
                ws.close();
                return;
            }
            rooms[roomId].add(ws);
            console.log(`房间：${roomId}，用户：${user.name},已连接:`);
            // 用户进入房间
            try {
                yield roomModal_1.default.addUserToRoom(user.email, roomId);
            }
            catch (err) {
                log_1.default.error(err.message);
            }
            rooms[roomId].forEach((client) => {
                if (client.readyState === ws_1.default.OPEN) {
                    const newMessage = {
                        type: MessageType.MEMBER,
                        content: "join",
                        sender: user,
                        time: Date.now(),
                    };
                    client.send(JSON.stringify(newMessage));
                }
            });
            ws.on("message", (message) => handleOnMessage(message, user));
            ws.on("close", (err) => handleClose(user));
            function handleOnMessage(message, user) {
                return __awaiter(this, void 0, void 0, function* () {
                    const roomInfo = yield roomModal_1.default.getRoomInfo(roomId);
                    if (!roomInfo) {
                        ws.send(JSON.stringify({
                            type: MessageType.ERROR,
                            content: websocketLocales_1.default[locale]["The room does not exist"],
                            time: Date.now(),
                        }));
                        ws.close();
                        return;
                    }
                    if (rooms[roomId]) {
                        // xxx: 这里可以做一些消息过滤，比如敏感词过滤
                        // 创建消息
                        const messageObj = JSON.parse(message.toString());
                        const { content: messageText, type } = messageObj;
                        // 通知房间内所有人更新房间消息
                        if (type === MessageType.UPDATE) {
                            rooms[roomId].forEach((client) => {
                                if (client.readyState === ws_1.default.OPEN && client !== ws) {
                                    client.send(JSON.stringify({
                                        type: MessageType.UPDATE,
                                        time: Date.now(),
                                    }));
                                }
                            });
                            return;
                        }
                        try {
                            yield messageModal_1.default.createMessage(messageText, roomId, user.id);
                        }
                        catch (err) {
                            log_1.default.error(err.message);
                        }
                        // 广播消息
                        rooms[roomId].forEach((client) => {
                            if (client.readyState === ws_1.default.OPEN) {
                                const newMessage = {
                                    type,
                                    content: messageText,
                                    sender: user,
                                    isSelf: client === ws,
                                    time: Date.now(),
                                };
                                client.send(JSON.stringify(newMessage));
                            }
                        });
                        // 处理ai相关逻辑
                        const aiName = roomInfo === null || roomInfo === void 0 ? void 0 : roomInfo.aiName;
                        if (roomInfo.ai &&
                            roomInfo.aiEnabled &&
                            messageText.indexOf(`@${aiName}`) > -1) {
                            const question = messageText.replace(`@${aiName}`, "").trim();
                            // ai 机器人
                            let resp = "?";
                            if (!!question) {
                                resp =
                                    (yield (0, openai_1.default)(question)) ||
                                        websocketLocales_1.default[locale]["Sorry I don't know how to response"];
                            }
                            // 记录ai的消息
                            yield messageModal_1.default.createMessage(resp, roomId, user.id);
                            const aiMessage = {
                                type: MessageType.TEXT,
                                content: resp,
                                sender: {
                                    id: 0,
                                    email: "",
                                    password: null,
                                    tempPassword: null,
                                    tempPasswordExpiry: null,
                                    name: aiName,
                                    avatar: "/uploads/gpt-logo.jpg",
                                },
                                time: Date.now(),
                            };
                            rooms[roomId].forEach((client) => {
                                client.send(JSON.stringify(aiMessage));
                            });
                        }
                    }
                });
            }
            function handleClose(user) {
                return __awaiter(this, void 0, void 0, function* () {
                    const roomInfo = yield roomModal_1.default.getRoomInfo(roomId);
                    if (!roomInfo) {
                        ws.send(JSON.stringify({
                            type: MessageType.ERROR,
                            content: websocketLocales_1.default[locale]["The room does not exist"],
                            time: Date.now(),
                        }));
                        ws.close();
                        return;
                    }
                    if (rooms[roomId]) {
                        rooms[roomId].delete(ws);
                        // 用户离开房间
                        try {
                            yield roomModal_1.default.removeUserFromRoom(user.email, roomId);
                        }
                        catch (err) {
                            log_1.default.error(err.message);
                        }
                        if (user.name === "anonymous") {
                            // 匿名用户离开时删除
                            try {
                                yield userModal_1.default.deleteUser(user.email);
                            }
                            catch (err) {
                                log_1.default.error(err.message);
                            }
                        }
                        rooms[roomId].forEach((client) => {
                            if (client.readyState === ws_1.default.OPEN) {
                                const newMessage = {
                                    type: MessageType.MEMBER,
                                    content: "leave",
                                    sender: user,
                                    time: Date.now(),
                                };
                                client.send(JSON.stringify(newMessage));
                            }
                        });
                        // 房间剩余人数为 0 时，删除房间
                        let restMembers = yield roomModal_1.default.getRoomMembers(roomId);
                        if ((restMembers === null || restMembers === void 0 ? void 0 : restMembers.length) === 0) {
                            delete rooms[roomId];
                            try {
                                // 删除房间内所有消息
                                yield messageModal_1.default.deleteRoomMessage(roomId);
                                // 删除房间
                                yield roomModal_1.default.deleteRoom(roomId);
                            }
                            catch (err) {
                                log_1.default.error(err.message);
                            }
                        }
                        console.log(`房间：${roomId}，用户：${user === null || user === void 0 ? void 0 : user.name},已断开连接`);
                    }
                });
            }
        });
    });
}
exports.default = createWebsocket;
