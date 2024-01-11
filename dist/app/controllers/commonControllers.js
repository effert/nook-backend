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
exports.upload = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
/**
 * 上传用户头像
 * @param ctx
 * @returns
 */
function upload(ctx, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const files = ctx.request.files.file;
        // 检查 file 是单个文件还是文件数组
        const file = Array.isArray(files) ? files[0] : files;
        if (file && file.filepath) {
            if (file.size > 1024 * 1024 * 2) {
                ctx.body = {
                    code: 400,
                    message: ctx.__("File size cannot exceed 2MB"),
                };
                return next();
            }
            const extname = path_1.default.extname(file.originalFilename).split(".")[1];
            const reader = fs_1.default.createReadStream(file.filepath);
            const fileName = `file-${Date.now()}${path_1.default.extname(file.newFilename)}`;
            const filePath = path_1.default.join(process.cwd(), "public/uploads", fileName);
            const stream = fs_1.default.createWriteStream(filePath); // 创建可写流
            reader.pipe(stream); // 保存文件到服务器
            const _filePath = filePath.split("public")[1];
            ctx.body = {
                code: 200,
                filePath: _filePath,
            };
        }
        return next();
    });
}
exports.upload = upload;
