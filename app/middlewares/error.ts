import { Context, Next } from "koa"
import { response } from "@/utils"

export default async (ctx: Context, next: Next) => {
  try {
    await next()
  } catch (err: any) {
    ctx.status = err.statusCode || err.status || 500
    ctx.body = response(false, err.message || ctx.__("Internal server error"))
  }
}
