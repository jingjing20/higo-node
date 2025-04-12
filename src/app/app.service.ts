import axios from 'axios';
import nodemailer from 'nodemailer';

/**
 * HTTP 客户端
 */
export const httpClient = axios.create();

// 邮件发送器配置
export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});
