import { connection } from '../app/database/mysql';
import { UserModel, VerificationTokenModel } from './user.model';
import * as bcrypt from 'bcrypt';
import {
  generateToken,
  generateVerificationToken,
  generateExpiryDate
} from './auth.util';
import { promisify } from 'util';
import * as jwt from 'jsonwebtoken';

// JWT密钥 - 实际生产环境应该放在环境变量中
const JWT_SECRET = 'your-jwt-secret-key';

// 将connection.query转换为Promise形式
const queryAsync = promisify(connection.query).bind(connection);

/**
 * 创建用户
 */
export const createUser = async (user: UserModel) => {
  const { email, password, nickname } = user;

  try {
    // 检查邮箱是否已存在
    const [existingUsers] = await queryAsync(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return { success: false, message: '邮箱已被注册' };
    }

    // 对密码进行哈希处理
    const password_hash = await bcrypt.hash(password, 10);

    // 创建用户记录
    const result = await queryAsync(
      `INSERT INTO users (email, password_hash, nickname, is_verified, is_active)
       VALUES (?, ?, ?, ?, ?)`,
      [email, password_hash, nickname, 0, 1]
    );

    const userId = result.insertId;

    // 创建验证令牌
    await createVerificationToken(userId, 'email');

    return { success: true, message: '注册成功，请检查邮箱完成验证', userId };
  } catch (error) {
    console.error('创建用户失败:', error);
    return { success: false, message: '注册失败' };
  }
};

/**
 * 创建验证令牌
 */
export const createVerificationToken = async (userId: number, type: string) => {
  const token = generateVerificationToken();
  const expiresAt = generateExpiryDate(24); // 令牌有效期24小时

  try {
    await queryAsync(
      `INSERT INTO verification_tokens (user_id, token, type, expires_at)
       VALUES (?, ?, ?, ?)`,
      [userId, token, type, expiresAt]
    );

    // 这里应该发送包含token的验证邮件
    // sendVerificationEmail(email, token);

    return { success: true, token };
  } catch (error) {
    console.error('创建验证令牌失败:', error);
    return { success: false, message: '创建验证令牌失败' };
  }
};

/**
 * 验证邮箱
 */
export const verifyEmail = async (token: string) => {
  try {
    // 查找验证令牌
    const [tokens] = await queryAsync(
      `SELECT * FROM verification_tokens WHERE token = ? AND type = ? AND expires_at > NOW()`,
      [token, 'email']
    );

    if (!Array.isArray(tokens) || tokens.length === 0) {
      return { success: false, message: '无效或已过期的验证令牌' };
    }

    const verificationToken = tokens[0] as VerificationTokenModel;

    // 更新用户的验证状态
    await queryAsync(`UPDATE users SET is_verified = 1 WHERE id = ?`, [
      verificationToken.user_id
    ]);

    // 删除已使用的验证令牌
    await queryAsync(`DELETE FROM verification_tokens WHERE id = ?`, [
      verificationToken.id
    ]);

    return { success: true, message: '邮箱验证成功' };
  } catch (error) {
    console.error('验证邮箱失败:', error);
    return { success: false, message: '验证邮箱失败' };
  }
};

/**
 * 用户登录
 */
export const loginUser = async (userInfo: UserModel) => {
  const { email, password } = userInfo;

  try {
    // 查找用户
    const [users] = await queryAsync('SELECT * FROM users WHERE email = ?', [
      email
    ]);

    if (!Array.isArray(users) || users.length === 0) {
      return { success: false, message: '用户不存在' };
    }

    const user = users[0] as UserModel;

    // 检查账号状态
    if (!user.is_active) {
      return { success: false, message: '账号已被禁用' };
    }

    // 验证密码
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return { success: false, message: '密码错误' };
    }

    // 检查邮箱验证状态
    if (!user.is_verified) {
      return { success: false, message: '请先验证邮箱' };
    }

    // 更新最后登录时间
    await queryAsync(`UPDATE users SET last_login = NOW() WHERE id = ?`, [
      user.id
    ]);

    // 生成JWT令牌
    const tokens = generateToken(user.id);

    // 清除密码等敏感信息
    delete user.password_hash;

    return {
      success: true,
      message: '登录成功',
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    };
  } catch (error) {
    console.error('登录失败:', error);
    return { success: false, message: '登录失败' };
  }
};

/**
 * 忘记密码
 */
export const forgotPassword = async (email: string) => {
  try {
    // 查找用户
    const [users] = await queryAsync('SELECT * FROM users WHERE email = ?', [
      email
    ]);

    if (!Array.isArray(users) || users.length === 0) {
      return { success: false, message: '用户不存在' };
    }

    const user = users[0] as UserModel;

    // 创建密码重置令牌
    const result = await createVerificationToken(user.id, 'password_reset');

    if (!result.success) {
      return result;
    }

    // 应该发送包含重置密码链接的邮件
    // sendPasswordResetEmail(email, result.token);

    return { success: true, message: '密码重置链接已发送到您的邮箱' };
  } catch (error) {
    console.error('忘记密码处理失败:', error);
    return { success: false, message: '处理失败' };
  }
};

/**
 * 重置密码
 */
export const resetPassword = async (token: string, newPassword: string) => {
  try {
    // 查找验证令牌
    const [tokens] = await queryAsync(
      `SELECT * FROM verification_tokens WHERE token = ? AND type = ? AND expires_at > NOW()`,
      [token, 'password_reset']
    );

    if (!Array.isArray(tokens) || tokens.length === 0) {
      return { success: false, message: '无效或已过期的密码重置链接' };
    }

    const verificationToken = tokens[0] as VerificationTokenModel;

    // 对新密码进行哈希处理
    const password_hash = await bcrypt.hash(newPassword, 10);

    // 更新用户密码
    await queryAsync(`UPDATE users SET password_hash = ? WHERE id = ?`, [
      password_hash,
      verificationToken.user_id
    ]);

    // 删除已使用的验证令牌
    await queryAsync(`DELETE FROM verification_tokens WHERE id = ?`, [
      verificationToken.id
    ]);

    return { success: true, message: '密码重置成功' };
  } catch (error) {
    console.error('重置密码失败:', error);
    return { success: false, message: '重置密码失败' };
  }
};

/**
 * 刷新令牌
 */
export const refreshToken = async (refreshToken: string) => {
  try {
    // 验证刷新令牌
    const payload = jwt.verify(refreshToken, JWT_SECRET) as any;
    if (!payload || !payload.id) {
      return { success: false, message: '无效的刷新令牌' };
    }

    // 查找用户
    const [users] = await queryAsync('SELECT * FROM users WHERE id = ?', [
      payload.id
    ]);
    if (!Array.isArray(users) || users.length === 0) {
      return { success: false, message: '用户不存在' };
    }

    // 生成新的令牌
    const tokens = generateToken(payload.id);

    return {
      success: true,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    };
  } catch (error) {
    console.error('刷新令牌失败:', error);
    return { success: false, message: '刷新令牌失败' };
  }
};

/**
 * 获取用户详情
 */
export const getUserProfile = async (userId: number) => {
  try {
    const [users] = await queryAsync(
      `SELECT id, email, nickname, avatar_url, bio, gender, location, is_verified, is_active, created_at
       FROM users WHERE id = ?`,
      [userId]
    );

    if (!Array.isArray(users) || users.length === 0) {
      return { success: false, message: '用户不存在' };
    }

    return { success: true, user: users[0] };
  } catch (error) {
    console.error('获取用户详情失败:', error);
    return { success: false, message: '获取用户详情失败' };
  }
};

/**
 * 更新用户信息
 */
export const updateUserProfile = async (
  userId: number,
  userData: UserModel
) => {
  const { nickname, bio, gender, location } = userData;

  try {
    await queryAsync(
      `UPDATE users SET nickname = ?, bio = ?, gender = ?, location = ? WHERE id = ?`,
      [nickname, bio, gender, location, userId]
    );

    return { success: true, message: '个人信息更新成功' };
  } catch (error) {
    console.error('更新用户信息失败:', error);
    return { success: false, message: '更新用户信息失败' };
  }
};

/**
 * 更新用户头像
 */
export const updateUserAvatar = async (userId: number, avatarUrl: string) => {
  try {
    await queryAsync(`UPDATE users SET avatar_url = ? WHERE id = ?`, [
      avatarUrl,
      userId
    ]);

    return { success: true, message: '头像更新成功', avatarUrl };
  } catch (error) {
    console.error('更新用户头像失败:', error);
    return { success: false, message: '更新用户头像失败' };
  }
};
