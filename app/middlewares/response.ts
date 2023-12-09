import { Context } from "koa"
import { response } from "../utils"

export default async function responseFormatter(
  ctx: Context,
  next: () => Promise<any>
) {
  try {
    // 执行下一个中间件
    await next()

    // 如果有响应数据，则应用统一格式
    if (ctx.body !== undefined) {
      ctx.body = response(true, "Success", ctx.body)
    }
  } catch (err: any) {
    // 错误处理
    ctx.status = err.statusCode || err.status || 500
    ctx.body = response(false, err.message)
  }
}
