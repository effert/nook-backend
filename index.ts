import "module-alias/register"
import Koa from "koa"
import path from "path"
import staticServer from "koa-static"
import bodyParser from "koa-bodyparser"
import helmet from "koa-helmet"
import dotenv from "dotenv"
import cors from "@koa/cors"
import errorMiddleWare from "@/middlewares/error"
import responseFormatter from "@/middlewares/response"
import createWebsocket from "@/websocket"
import locales from "koa-locales"
// router
import userRouter from "@/routes/index"
import roomRouter from "@/routes/room"
import messageRouter from "@/routes/message"

const app = new Koa()

dotenv.config()
app.use(helmet())
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
)
locales(app, {
  dirs: [__dirname + "/app/locales"],
})
app.use(bodyParser())
app.use(staticServer(path.join(__dirname, "public")))
app.use(userRouter.routes()).use(userRouter.allowedMethods())
app.use(roomRouter.routes()).use(roomRouter.allowedMethods())
app.use(messageRouter.routes()).use(messageRouter.allowedMethods())
app.use(responseFormatter)
app.use(errorMiddleWare)

createWebsocket()
const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`)
})
