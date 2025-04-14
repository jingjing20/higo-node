// 邮件服务配置
export const EMAIL_CONFIG = {
  HOST: process.env.SMTP_HOST || 'smtp.qq.com',
  PORT: parseInt(process.env.SMTP_PORT || '465', 10),
  SECURE: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  AUTH: {
    USER: process.env.SMTP_USER,
    PASS: process.env.SMTP_PASSWORD
  }
};

// 邮件发送者配置
export const SENDER = {
  NAME: process.env.EMAIL_SENDER_NAME || 'HiGo 运动平台',
  EMAIL: process.env.SMTP_USER || '1269928993@qq.com'
};

// 前端应用URL，用于生成验证链接等
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// 邮件链接失效时间配置（小时）
export const EMAIL_EXPIRES = {
  VERIFICATION: 24, // 邮箱验证链接24小时有效
  PASSWORD_RESET: 1 // 密码重置链接1小时有效
};
