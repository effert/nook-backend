import "koa-body"

declare module "fs" {
  interface File {
    path?: string
  }
}

declare module "koa-body" {
  interface Files {
    path?: string
  }
}
