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
exports.uploadAvatar = exports.getRooms = exports.getUserInfo = exports.generateRandomPassword = exports.login = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModal_1 = __importDefault(require("@/models/userModal"));
const utils_1 = require("@/utils");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const lodash_1 = require("lodash");
const { SECRET_KEY = "", EMAIL_HOST_USER, EMAIL_HOST_PASSWORD } = process.env;
/**
 * 用户登录，未注册的话先注册再登录
 * @param ctx
 * @returns
 */
function login(ctx, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { email, password } = ctx.request.body;
        if (!email || !password) {
            ctx.status = 400;
            ctx.body = { error: ctx.__("Please provide both email and password") };
            return next();
        }
        try {
            let user = yield userModal_1.default.getUserInfo(email);
            if (!user) {
                // 未注册的用户直接注册并登录
                const hashedPassword = yield bcrypt_1.default.hash(password, 10);
                user = yield userModal_1.default.createUser(email, {
                    password: hashedPassword,
                    name: email,
                });
                const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, SECRET_KEY, {
                    expiresIn: "24h",
                });
                ctx.body = { message: ctx.__("Login successful"), token, user };
                return next();
            }
            // 临时密码
            if (user.tempPassword) {
                if (user.tempPasswordExpiry && user.tempPasswordExpiry < new Date()) {
                    ctx.status = 401;
                    ctx.body = { error: ctx.__("Temporary password expired") };
                    return next();
                }
                if (yield bcrypt_1.default.compare(password, user.tempPassword)) {
                    // 清除临时密码
                    userModal_1.default.updateUser(user.email, {
                        tempPassword: null,
                        tempPasswordExpiry: null,
                    });
                    const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, SECRET_KEY, {
                        expiresIn: "24h",
                    });
                    ctx.body = { message: ctx.__("Login successful"), token, user };
                }
                else {
                    ctx.status = 401;
                    ctx.body = { error: ctx.__("Invalid password") };
                }
                return next();
            }
            // 正常密码
            if (yield bcrypt_1.default.compare(password, user.password)) {
                const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, SECRET_KEY, {
                    expiresIn: "24h",
                });
                ctx.body = { message: ctx.__("Login successful"), token, user };
            }
            else {
                ctx.status = 401;
                ctx.body = { error: ctx.__("Invalid password") };
            }
            return next();
        }
        catch (err) {
            ctx.status = 500;
            ctx.body = { error: ctx.__("Internal server error") };
            return next();
        }
    });
}
exports.login = login;
/**
 * 发送临时密码到邮箱
 * @param email
 * @param tempPassword
 */
function sendTemporaryPassword(ctx, email, tempPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        let transporter = nodemailer_1.default.createTransport({
            service: "gmail",
            auth: {
                user: EMAIL_HOST_USER,
                pass: EMAIL_HOST_PASSWORD,
            },
        });
        let mailOptions = {
            from: EMAIL_HOST_USER,
            to: email,
            subject: "Your Temporary Password",
            html: `<p>${ctx.__("Your temporary password is")} <span style="color:red;text-decoration-line: underline">${tempPassword}</span>. ${ctx.__("It will expire in 15 minutes")}.</p>`,
        };
        return yield transporter.sendMail(mailOptions);
    });
}
/**
 * 生成临时密码
 * @param ctx
 * @returns
 */
function generateRandomPassword(ctx, next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (ctx.query.email === undefined) {
            ctx.status = 400;
            ctx.body = { error: ctx.__("Please provide email") };
            return next();
        }
        const randomPassword = (0, utils_1.generateRandomString)(8);
        const hashedPassword = yield bcrypt_1.default.hash(randomPassword, 10);
        const email = typeof ctx.query.email === "object" ? ctx.query.email[0] : ctx.query.email;
        let user = yield userModal_1.default.getUserInfo(email);
        let method = "updateUser";
        if (!user) {
            // 未注册的用户直接注册
            method = "createUser";
        }
        user = yield userModal_1.default[method](email, {
            tempPassword: hashedPassword,
            tempPasswordExpiry: new Date(Date.now() + 15 * 60 * 1000),
        });
        try {
            yield sendTemporaryPassword(ctx, user.email, randomPassword);
            ctx.body = {
                code: 200,
                message: ctx.__("Temporary password generated"),
                // randomPassword,
            };
        }
        catch (err) {
            ctx.status = 500;
            ctx.body = { error: ctx.__("Internal server error") };
        }
        return next();
    });
}
exports.generateRandomPassword = generateRandomPassword;
/**
 * 获取用户信息
 * @param ctx
 * @returns
 */
function getUserInfo(ctx, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield userModal_1.default.getUserInfo(ctx.state.user.email);
        if (!user) {
            ctx.status = 401;
            ctx.body = { error: ctx.__("User not found") };
            return next();
        }
        ctx.body = {
            user: (0, lodash_1.omit)(user, ["password", "tempPassword", "tempPasswordExpiry"]),
        };
        return next();
    });
}
exports.getUserInfo = getUserInfo;
/**
 * 获取用户所在的所有房间
 * @param ctx
 * @returns
 */
function getRooms(ctx, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { email } = ctx.state.user;
        const rooms = yield userModal_1.default.getUserRooms(email);
        ctx.body = {
            code: 200,
            data: rooms,
        };
        return next();
    });
}
exports.getRooms = getRooms;
/**
 * 上传用户头像
 * @param ctx
 * @returns
 */
function uploadAvatar(ctx, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { email } = ctx.state.user;
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
            if (!["jpg", "png", "jpeg"].includes(extname.toLowerCase())) {
                ctx.body = {
                    code: 400,
                    message: ctx.__("Only images are allowed"),
                };
                return next();
            }
            const reader = fs_1.default.createReadStream(file.filepath);
            const fileName = `avatar-${Date.now()}${path_1.default.extname(file.newFilename)}`;
            const filePath = path_1.default.join(process.cwd(), "public/uploads", fileName);
            const stream = fs_1.default.createWriteStream(filePath); // 创建可写流
            reader.pipe(stream); // 保存文件到服务器
            const _filePath = filePath.split("public")[1];
            const user = yield userModal_1.default.updateUser(email, { avatar: _filePath });
            ctx.body = {
                code: 200,
                filePath: _filePath,
            };
        }
        return next();
    });
}
exports.uploadAvatar = uploadAvatar;
