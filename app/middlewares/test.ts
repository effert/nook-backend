import { Context, Next } from "koa"

export default async function authenticateToken(ctx: Context, next: Next) {
  console.log(ctx)
  await next()
}
