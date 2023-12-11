// custom-types.d.ts
import "koa-body"

declare module "koa-body" {
  interface Files {
    path?: string
  }
}
