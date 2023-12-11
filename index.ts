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
// router
import router from "@/routes/index"
import roomRouter from "@/routes/room"
import messageRouter from "@/routes/message"

const app = new Koa()
dotenv.config()
app.use(bodyParser())
app.use(cors())
app.use(responseFormatter)
app.use(staticServer(path.join(__dirname, "public")))
app
  .use(router.routes())
  .use(roomRouter.routes())
  .use(messageRouter.routes())
  .use(router.allowedMethods())
app.use(errorMiddleWare)
app.use(helmet())

createWebsocket()
const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`)
})
