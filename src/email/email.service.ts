import nodemailer from 'nodemailer';
import { EMAIL_CONFIG, SENDER } from './email.config';
import { verificationEmailTemplate } from './templates/verification';
import { passwordResetEmailTemplate } from './templates/password-reset';
import { verificationCodeEmailTemplate } from './templates/verification-code';
import { queryAsync } from '../app/database/database.utils';

/**
 * 创建Nodemailer发送器
 */
const transporter = nodemailer.createTransport({
  host: EMAIL_CONFIG.HOST,
  port: EMAIL_CONFIG.PORT,
  secure: EMAIL_CONFIG.SECURE,
  auth: {
    user: EMAIL_CONFIG.AUTH.USER,
    pass: EMAIL_CONFIG.AUTH.PASS
  }
});

/**
 * 发送邮件基础方法
 */
export const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const info = await transporter.sendMail({
      from: `"${SENDER.NAME}" <${SENDER.EMAIL}>`,
      to,
      subject,
      html
    });

    console.log('邮件发送成功:', info.messageId);
    return { success: true, message: '邮件发送成功' };
  } catch (error) {
    console.error('邮件发送失败:', error);
    return { success: false, message: '邮件发送失败' };
  }
};

/**
 * 发送邮箱验证邮件
 */
export const sendVerificationEmail = async (
  email: string,
  token: string,
  nickname?: string
): Promise<{ success: boolean; message: string }> => {
  const subject = '请验证您的邮箱 - HiGo运动平台';
  const html = verificationEmailTemplate(token, nickname);

  return await sendEmail(email, subject, html);
};

/**
 * 发送密码重置邮件
 */
export const sendPasswordResetEmail = async (
  email: string,
  token: string,
  nickname?: string
): Promise<{ success: boolean; message: string }> => {
  const subject = '密码重置 - HiGo运动平台';
  const html = passwordResetEmailTemplate(token, nickname);

  return await sendEmail(email, subject, html);
};

/**
 * 发送欢迎邮件
 */
export const sendWelcomeEmail = async (
  email: string,
  nickname: string
): Promise<{ success: boolean; message: string }> => {
  const subject = '欢迎加入 HiGo运动平台';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>您好，${nickname || '用户'}！</h2>
      <p>欢迎加入HiGo运动平台。您的账号已经成功激活。</p>
      <p>我们希望您能享受在平台上的运动社交体验！</p>
      <p>如有任何问题，请随时联系我们的客服团队。</p>
      <p>祝您运动愉快！</p>
      <p>HiGo团队</p>
    </div>
  `;

  return await sendEmail(email, subject, html);
};

/**
 * 验证邮箱
 */
export const verifyEmail = async (token: string) => {
  try {
    // 查找验证令牌
    const tokens = await queryAsync(
      `SELECT * FROM verification_tokens WHERE token = ? AND type = ? AND expires_at > NOW()`,
      [token, 'email']
    );

    if (!Array.isArray(tokens) || tokens.length === 0) {
      return { success: false, message: '无效或已过期的验证令牌' };
    }

    const verificationToken = tokens[0];

    // 获取用户信息
    const users = await queryAsync(`SELECT * FROM users WHERE id = ?`, [
      verificationToken.user_id
    ]);

    if (!Array.isArray(users) || users.length === 0) {
      return { success: false, message: '用户不存在' };
    }

    const user = users[0];

    // 删除已使用的验证令牌
    await queryAsync(`DELETE FROM verification_tokens WHERE id = ?`, [
      verificationToken.id
    ]);

    // 发送欢迎邮件
    await sendWelcomeEmail(user.email, user.nickname);

    return { success: true, message: '邮箱验证成功' };
  } catch (error) {
    console.error('验证邮箱失败:', error);
    return { success: false, message: '验证邮箱失败' };
  }
};

/**
 * 发送验证码邮件
 */
export const sendVerificationCode = async (
  email: string,
  code: string
): Promise<{ success: boolean; message: string }> => {
  const subject = '验证码 - HiGo运动平台';
  const html = verificationCodeEmailTemplate(code);

  return await sendEmail(email, subject, html);
};

/**
 * 生成验证码
 * 生成6位随机数字验证码
 */
export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * 创建验证码记录
 */
export const createVerificationCode = async (
  email: string,
  code: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ success: boolean; message: string }> => {
  try {
    // 设置过期时间为5分钟后
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    // 创建验证码记录
    await queryAsync(
      `INSERT INTO email_verification_codes
       (email, code, expires_at, is_used, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [email, code, expiresAt, false, ipAddress, userAgent]
    );

    return { success: true, message: '验证码创建成功' };
  } catch (error) {
    console.error('创建验证码失败:', error);
    return { success: false, message: '创建验证码失败' };
  }
};

/**
 * 检查验证码
 */
export const verifyCode = async (
  email: string,
  code: string
): Promise<{ success: boolean; message: string; isValid?: boolean }> => {
  try {
    // 查找未使用的验证码
    const codes = await queryAsync(
      `SELECT * FROM email_verification_codes
       WHERE email = ? AND code = ? AND is_used = false AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [email, code]
    );

    if (!Array.isArray(codes) || codes.length === 0) {
      return { success: true, message: '验证码无效或已过期', isValid: false };
    }

    // 标记验证码为已使用
    await queryAsync(
      `UPDATE email_verification_codes SET is_used = true WHERE id = ?`,
      [codes[0].id]
    );

    return { success: true, message: '验证码验证成功', isValid: true };
  } catch (error) {
    console.error('验证码验证失败:', error);
    return { success: false, message: '验证码验证失败' };
  }
};

/**
 * 检查是否可以发送验证码
 * 检查最近是否已经发送过验证码（防止重复发送）
 */
export const canSendVerificationCode = async (
  email: string
): Promise<{ canSend: boolean; message: string }> => {
  try {
    // 查询最近一条验证码记录
    const codes = await queryAsync(
      `SELECT * FROM email_verification_codes
       WHERE email = ?
       ORDER BY created_at DESC LIMIT 1`,
      [email]
    );

    if (Array.isArray(codes) && codes.length > 0) {
      const lastCode = codes[0];
      const currentTime = new Date();
      const lastCreatedTime = new Date(lastCode.created_at);

      // 如果最近一条记录创建时间在1分钟内，则不允许再次发送
      const timeDiff =
        (currentTime.getTime() - lastCreatedTime.getTime()) / 1000;
      if (timeDiff < 60) {
        return {
          canSend: false,
          message: `请等待${Math.ceil(60 - timeDiff)}秒后再试`
        };
      }
    }

    return { canSend: true, message: '可以发送验证码' };
  } catch (error) {
    console.error('检查验证码发送状态失败:', error);
    return { canSend: false, message: '检查验证码发送状态失败' };
  }
};
