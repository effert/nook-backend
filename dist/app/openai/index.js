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
const openai_1 = __importDefault(require("openai"));
const https_proxy_agent_1 = require("https-proxy-agent");
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
    httpAgent: new https_proxy_agent_1.HttpsProxyAgent(process.env.PROXY_URL),
});
function main(content) {
    return __awaiter(this, void 0, void 0, function* () {
        const stream = openai.beta.chat.completions.stream({
            model: "gpt-3.5-turbo",
            // model: "gpt-3.5-turbo-1106",
            // model: "gpt-4-1106-preview",
            messages: [{ role: "user", content }],
            stream: true,
        });
        // for await (const chunk of stream) {
        //   console.log(chunk.choices[0].delta.content);
        // }
        const chatCompletion = yield stream.finalChatCompletion();
        return chatCompletion.choices[0].message.content;
    });
}
exports.default = main;
