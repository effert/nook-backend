import { Context, Next } from "koa"
import bcrypt from "bcrypt"
import nodemailer from "nodemailer"
import jwt from "jsonwebtoken"
import UserModal from "../models/userModal"
import { generateRandomString } from "../utils"

const { SECRET_KEY = "", EMAIL_HOST_USER, EMAIL_HOST_PASSWORD } = process.env

/**
 * 用户登录，未注册的话先注册再登录
 * @param ctx
 * @returns
 */
export async function login(ctx: Context) {
  const { email, password } = ctx.request.body as {
    email: string
    password: string
  }
  if (!email || !password) {
    ctx.status = 400
    ctx.body = { error: "Please provide both email and password" }
    return
  }
  try {
    let user = await UserModal.getUserInfo(email)
    if (!user) {
      // 未注册的用户直接注册并登录
      const hashedPassword = await bcrypt.hash(password, 10)
      user = await UserModal.createUser(email, hashedPassword)
      const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, {
        expiresIn: "24h",
      })
      ctx.body = { message: "Login successful", token }
      return
    }

    // 临时密码
    if (user.tempPassword) {
      if (BigInt(Date.now()) > user.tempPasswordExpiry!) {
        ctx.status = 401
        ctx.body = { error: "Temporary password expired" }
        return
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
        ctx.body = { message: "Login successful", token }
      } else {
        ctx.status = 401
        ctx.body = { error: "Invalid password" }
      }
      return
    }
    // 正常密码
    if (await bcrypt.compare(password, user.password!)) {
      const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, {
        expiresIn: "24h",
      })
      ctx.body = { message: "Login successful", token }
    } else {
      ctx.status = 401
      ctx.body = { error: "Invalid password" }
    }
  } catch (err) {
    ctx.status = 500
    console.log(212, err)
    ctx.body = { error: "Internal server error" }
  }
}

/**
 * 发送临时密码到邮箱
 * @param email
 * @param tempPassword
 */
async function sendTemporaryPassword(email: string, tempPassword: string) {
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
    text: `Your temporary password is ${tempPassword}. It will expire in 15 minutes.`,
  }

  return await transporter.sendMail(mailOptions)
}

/**
 * 生成临时密码
 * @param ctx
 * @returns
 */
export async function generateRandomPassword(ctx: Context) {
  const randomPassword = generateRandomString(8)
  const hashedPassword = await bcrypt.hash(randomPassword, 10)
  if (ctx.query.email === undefined) {
    ctx.status = 400
    ctx.body = { error: "Please provide email" }
    return
  }
  const email =
    typeof ctx.query.email === "object" ? ctx.query.email[0] : ctx.query.email
  const user = await UserModal.getUserInfo(email)
  if (!user) {
    ctx.status = 401
    ctx.body = { error: "User not found" }
    return
  }
  await UserModal.updateUser(user.email, {
    tempPassword: hashedPassword,
    tempPasswordExpiry: BigInt(Date.now() + 15 * 60 * 1000), // 15分钟后过期
  })
  // TODO FIXME connect ETIMEDOUT 64.233.188.108:465
  // let sendResp = await sendTemporaryPassword(user.email, randomPassword)
  ctx.body = {
    message: "Temporary password generated",
    randomPassword,
  }
}

/**
 * 获取用户信息
 * @param ctx
 * @returns
 */
export async function getUserInfo(ctx: Context) {
  const user = await UserModal.getUserInfo(ctx.state.user.email)
  if (!user) {
    ctx.status = 401
    ctx.body = { error: "User not found" }
    return
  }

  user.password = null
  ctx.body = {
    message: "This is a protected route",
    user,
  }
}
