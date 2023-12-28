import { Context, Next } from "koa"
import path from "path"
import fs from "fs"

/**
 * 上传用户头像
 * @param ctx
 * @returns
 */
export async function upload(ctx: Context, next: Next) {
  const files = ctx.request.files!.file as any
  // 检查 file 是单个文件还是文件数组
  const file = Array.isArray(files) ? files[0] : files
  if (file && file.filepath) {
    if (file.size > 1024 * 1024 * 2) {
      ctx.body = {
        code: 400,
        message: ctx.__("File size cannot exceed 2MB"),
      }
      return next()
    }
    const extname = path.extname(file.originalFilename).split(".")[1]
    const reader = fs.createReadStream(file.filepath)
    const fileName = `file-${Date.now()}${path.extname(file.newFilename)}`
    const filePath = path.join(process.cwd(), "public/uploads", fileName)
    const stream = fs.createWriteStream(filePath) // 创建可写流
    reader.pipe(stream) // 保存文件到服务器
    const _filePath = filePath.split("public")[1]

    ctx.body = {
      code: 200,
      filePath: _filePath,
    }
  }

  return next()
}
