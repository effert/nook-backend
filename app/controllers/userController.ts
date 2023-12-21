import { Context, Next } from "koa"
import bcrypt from "bcrypt"
import nodemailer from "nodemailer"
import jwt from "jsonwebtoken"
import UserModal from "@/models/userModal"
import { generateRandomString } from "@/utils"

const { SECRET_KEY = "", EMAIL_HOST_USER, EMAIL_HOST_PASSWORD } = process.env

/**
 * 用户登录，未注册的话先注册再登录
 * @param ctx
 * @returns
 */
export async function login(ctx: Context, next: Next) {
  const { email, password } = ctx.request.body as {
    email: string
    password: string
  }
  if (!email || !password) {
    ctx.status = 400
    ctx.body = { error: ctx.__("Please provide both email and password") }
    return next()
  }
  try {
    let user = await UserModal.getUserInfo(email)
    if (!user) {
      // 未注册的用户直接注册并登录
      const hashedPassword = await bcrypt.hash(password, 10)
      user = await UserModal.createUser(email, {
        password: hashedPassword,
        name: email,
      })
      const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, {
        expiresIn: "24h",
      })
      ctx.body = { message: ctx.__("Login successful"), token, user }
      return next()
    }

    // 临时密码
    if (user.tempPassword) {
      if (user.tempPasswordExpiry && user.tempPasswordExpiry < new Date()) {
        ctx.status = 401
        ctx.body = { error: ctx.__("Temporary password expired") }
        return next()
      }
      if (await bcrypt.compare(password, user.tempPassword!)) {
        // 清除临时密码
        UserModal.updateUser(user.email, {
          tempPassword: null,
          tempPasswordExpiry: null,
        })
        const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, {
          expiresIn: "24h",
        })
        ctx.body = { message: ctx.__("Login successful"), token, user }
      } else {
        ctx.status = 401
        ctx.body = { error: ctx.__("Invalid password") }
      }
      return next()
    }
    // 正常密码
    if (await bcrypt.compare(password, user.password!)) {
      const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, {
        expiresIn: "24h",
      })
      ctx.body = { message: ctx.__("Login successful"), token, user }
    } else {
      ctx.status = 401
      ctx.body = { error: ctx.__("Invalid password") }
    }
    return next()
  } catch (err) {
    ctx.status = 500
    ctx.body = { error: ctx.__("Internal server error") }
    return next()
  }
}

/**
 * 发送临时密码到邮箱
 * @param email
 * @param tempPassword
 */
async function sendTemporaryPassword(
  ctx: Context,
  email: string,
  tempPassword: string
) {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL_HOST_USER,
      pass: EMAIL_HOST_PASSWORD,
    },
  })

  let mailOptions = {
    from: EMAIL_HOST_USER,
    to: email,
    subject: "Your Temporary Password",
    html: `<p>${ctx.__(
      "Your temporary password is"
    )} <span style="color:red;text-decoration-line: underline">${tempPassword}</span>. ${ctx.__(
      "It will expire in 15 minutes"
    )}.</p>`,
  }

  return await transporter.sendMail(mailOptions)
}

/**
 * 生成临时密码
 * @param ctx
 * @returns
 */
export async function generateRandomPassword(ctx: Context, next: Next) {
  if (ctx.query.email === undefined) {
    ctx.status = 400
    ctx.body = { error: ctx.__("Please provide email") }
    return next()
  }
  const randomPassword = generateRandomString(8)
  const hashedPassword = await bcrypt.hash(randomPassword, 10)
  const email =
    typeof ctx.query.email === "object" ? ctx.query.email[0] : ctx.query.email
  let user = await UserModal.getUserInfo(email)

  let method = "updateUser"
  if (!user) {
    // 未注册的用户直接注册
    method = "createUser"
  }

  user = await UserModal[method](email, {
    tempPassword: hashedPassword,
    tempPasswordExpiry: new Date(Date.now() + 15 * 60 * 1000),
  })
  try {
    await sendTemporaryPassword(ctx, user!.email, randomPassword)
    ctx.body = {
      message: ctx.__("Temporary password generated"),
      randomPassword,
    }
  } catch (err) {
    ctx.status = 500
    ctx.body = { error: ctx.__("Internal server error") }
  }

  return next()
}

/**
 * 获取用户信息
 * @param ctx
 * @returns
 */
export async function getUserInfo(ctx: Context, next: Next) {
  const user = await UserModal.getUserInfo(ctx.state.user.email)
  if (!user) {
    ctx.status = 401
    ctx.body = { error: ctx.__("User not found") }
    return next()
  }

  user.password = null
  ctx.body = {
    user,
  }
  return next()
}

/**
 * 获取用户所在的所有房间
 * @param ctx
 * @returns
 */
export async function getRooms(ctx: Context, next: Next) {
  const { email } = ctx.state.user
  const rooms = await UserModal.getUserRooms(email)
  ctx.body = {
    code: 200,
    data: rooms,
  }
  return next()
}
