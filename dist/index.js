"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("module-alias/register");
const koa_1 = __importDefault(require("koa"));
const path_1 = __importDefault(require("path"));
const koa_static_1 = __importDefault(require("koa-static"));
const koa_bodyparser_1 = __importDefault(require("koa-bodyparser"));
const koa_helmet_1 = __importDefault(require("koa-helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("@koa/cors"));
const response_1 = __importDefault(require("@/middlewares/response"));
const websocket_1 = __importDefault(require("@/websocket"));
const koa_locales_1 = __importDefault(require("koa-locales"));
// router
const index_1 = __importDefault(require("@/routes/index"));
const room_1 = __importDefault(require("@/routes/room"));
const message_1 = __importDefault(require("@/routes/message"));
const common_1 = __importDefault(require("@/routes/common"));
const app = new koa_1.default();
dotenv_1.default.config();
app.use((0, koa_helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}));
(0, koa_locales_1.default)(app, {
    dirs: [__dirname + "/app/locales"],
});
app.use((0, koa_bodyparser_1.default)());
app.use((0, koa_static_1.default)(path_1.default.join(__dirname, "public")));
app.use(response_1.default);
app.use(index_1.default.routes()).use(index_1.default.allowedMethods());
app.use(room_1.default.routes()).use(room_1.default.allowedMethods());
app.use(message_1.default.routes()).use(message_1.default.allowedMethods());
app.use(common_1.default.routes()).use(common_1.default.allowedMethods());
(0, websocket_1.default)();
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}`);
});
