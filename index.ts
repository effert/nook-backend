import Koa from "koa"
import bodyParser from "koa-bodyparser"
import helmet from "koa-helmet"
import dotenv from "dotenv"
import cors from "@koa/cors"
import router from "./app/routes/index"
import errorMiddleWare from "./app/middlewares/error"
import responseFormatter from "./app/middlewares/response"

const app = new Koa()
dotenv.config()
app.use(bodyParser())
// 使用默认的 CORS 配置
app.use(cors())
app.use(responseFormatter)
app.use(router.routes()).use(router.allowedMethods())
app.use(errorMiddleWare)
app.use(helmet())

const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`)
})
