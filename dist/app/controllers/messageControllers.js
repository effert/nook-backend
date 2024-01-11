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
exports.deleteRoomMessage = exports.importMessage = exports.exportMessage = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const messageModal_1 = __importDefault(require("@/models/messageModal"));
/**
 * 导出房间内所有信息
 * @param roomId
 * @returns
 */
function exportMessage(ctx, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { roomId } = ctx.request.body;
        const allMessage = yield messageModal_1.default.getRoomMessage(roomId);
        const formattedData = JSON.stringify(allMessage);
        const filename = `room-${roomId}-messages.json`;
        const filePath = path_1.default.join(process.cwd(), "public", filename);
        fs_1.default.writeFileSync(filePath, formattedData);
        ctx.set("Content-disposition", `attachment; filename=${filename}`);
        ctx.set("Content-Type", "application/json");
        ctx.body = fs_1.default.createReadStream(filePath);
        return next();
    });
}
exports.exportMessage = exportMessage;
/**
 * 导入房间内所有信息
 * @param roomId
 * @param files
 * @returns
 */
function importMessage(ctx, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const roomId = ctx.query.roomId;
        const files = ctx.request.files.file;
        // 检查 file 是单个文件还是文件数组
        const file = Array.isArray(files) ? files[0] : files;
        if (file && file.filepath) {
            const fileContent = fs_1.default.readFileSync(file.filepath, "utf8");
            const messages = JSON.parse(fileContent);
            for (const message of messages) {
                message.roomId = roomId;
            }
            yield messageModal_1.default.importRoomMessage(messages);
            ctx.body = ctx.__("Message imported");
        }
        else {
            ctx.status = 400;
            ctx.body = ctx.__("Invalid file upload");
        }
        return next();
    });
}
exports.importMessage = importMessage;
/**
 * 删除房间内所有消息
 * @param roomId
 */
function deleteRoomMessage(ctx, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { roomId } = ctx.request.body;
        yield messageModal_1.default.deleteRoomMessage(roomId);
        ctx.body = ctx.__("Message deleted");
        return next();
    });
}
exports.deleteRoomMessage = deleteRoomMessage;
