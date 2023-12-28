import Router from "koa-router"
import { upload } from "@/controllers/commonControllers"
import koaBody from "koa-body"

const router = new Router({
  prefix: "/common",
})

/**
 * 通用的上传文件接口
 * @param file 文件
 * @returns
 */
router.post(
  "/upload",
  koaBody({
    multipart: true,
    formidable: {
      keepExtensions: true, // 保持文件扩展名
    },
  }),
  upload
)

export default router
