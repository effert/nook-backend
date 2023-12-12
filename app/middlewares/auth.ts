import { Context, Next } from "koa"
import jwt from "jsonwebtoken"

const { SECRET_KEY = "" } = process.env
export default async function authenticateToken(ctx: Context, next: Next) {
  const authHeader = ctx.headers.authorization
  if (authHeader) {
    const token = authHeader.split(" ")[1]
    try {
      const user = jwt.verify(token, SECRET_KEY)
      ctx.state.user = user // 将用户信息存储在 ctx.state 中，以便后续使用
      await next()
    } catch (error) {
      ctx.status = 403
      ctx.body = { error: ctx.__("Access denied") }
    }
  } else {
    ctx.status = 401
    ctx.body = { error: ctx.__("Authentication required") }
  }
}
