import { Context } from "koa"
import { response } from "@/utils"
import logger from "@/utils/log"

export default async function responseFormatter(
  ctx: Context,
  next: () => Promise<any>
) {
  try {
    // 执行下一个中间件
    await next()
    // 如果有响应数据，则应用统一格式
    if (ctx.body !== undefined) {
      const isSuccess = ctx.status === 200
      ctx.body = response(isSuccess, "", ctx.body)
    }
  } catch (err: any) {
    // 错误日志记录
    logger.error(err.message)
    ctx.status = err.statusCode || err.status || 500
    ctx.body = response(false, err.message || ctx.__("Internal server error"))
  }
}
