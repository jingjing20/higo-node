import { UserModel, VerificationTokenModel } from './user.model';
import * as bcrypt from 'bcrypt';
import { generateToken } from './auth.util';
import * as jwt from 'jsonwebtoken';
import * as emailService from '../email/email.service';
import { queryAsync } from '../app/database/database.utils';

// JWT密钥 - 实际生产环境应该放在环境变量中
const JWT_SECRET = 'your-jwt-secret-key';

/**
 * 用户登录
 */
export const loginUser = async (userInfo: UserModel) => {
  const { email, password } = userInfo;

  try {
    // 查找用户
    const users = await queryAsync('SELECT * FROM users WHERE email = ?', [
      email
    ]);

    if (!users || users.length === 0) {
      return { success: false, message: 'USER_NOT_FOUND' };
    }

    const user = users[0] as UserModel;

    // 检查账号状态
    if (!user.is_active) {
      return { success: false, message: 'USER_NOT_ACTIVE' };
    }

    // 验证密码
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return { success: false, message: '密码错误' };
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
      data: {
        user,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }
    };
  } catch (error) {
    console.error('登录失败:', error);
    return { success: false, message: '登录失败' };
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
      return { success: false, message: 'INVALID_REFRESH_TOKEN' };
    }

    // 查找用户
    const users = await queryAsync('SELECT * FROM users WHERE id = ?', [
      payload.id
    ]);
    if (!users || users.length === 0) {
      return { success: false, message: 'USER_NOT_FOUND' };
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
    return { success: false, message: 'REFRESH_TOKEN_FAILED' };
  }
};

/**
 * 获取用户详情
 */
export const getUserProfile = async (userId: number) => {
  try {
    const users = await queryAsync(
      `SELECT id, email, nickname, avatar_url, bio, gender, location, is_active, created_at
       FROM users WHERE id = ?`,
      [userId]
    );

    if (!users || users.length === 0) {
      return { success: false, message: 'USER_NOT_FOUND' };
    }

    return { success: true, user: users[0] };
  } catch (error) {
    console.error('获取用户详情失败:', error);
    return { success: false, message: 'GET_USER_PROFILE_FAILED' };
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
    return { success: false, message: 'UPDATE_USER_PROFILE_FAILED' };
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

    return { success: true, message: '头像更新成功', data: { avatarUrl } };
  } catch (error) {
    console.error('更新用户头像失败:', error);
    return { success: false, message: 'UPDATE_USER_AVATAR_FAILED' };
  }
};

/**
 * 检查用户邮箱是否存在
 */
export const checkUserExists = async (email: string): Promise<boolean> => {
  try {
    const users = await queryAsync('SELECT * FROM users WHERE email = ?', [
      email
    ]);
    return Array.isArray(users) && users.length > 0;
  } catch (error) {
    console.error('检查用户存在失败:', error);
    return false;
  }
};

/**
 * 使用邮箱直接登录
 */
export const loginWithEmail = async (email: string, password: string) => {
  try {
    // 查找用户
    const users = await queryAsync('SELECT * FROM users WHERE email = ?', [
      email
    ]);

    if (!users || users.length === 0) {
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
      data: {
        user,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }
    };
  } catch (error) {
    console.error('登录失败:', error);
    return { success: false, message: '登录失败' };
  }
};

/**
 * 创建已验证的用户
 */
export const createUserWithVerifiedEmail = async (user: UserModel) => {
  const { email, password, nickname } = user;

  try {
    // 再次检查邮箱是否已存在（防止竞态条件）
    const existingUsers = await queryAsync(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    if (existingUsers && existingUsers.length > 0) {
      return { success: false, message: '邮箱已被注册' };
    }

    // 对密码进行哈希处理
    const password_hash = await bcrypt.hash(password, 10);

    // 创建用户记录（已验证状态）
    const result = await queryAsync(
      `INSERT INTO users (email, password_hash, nickname, is_active)
       VALUES (?, ?, ?, ?)`,
      [email, password_hash, nickname, 1]
    );

    const userId = result.insertId;

    return {
      success: true,
      message: '注册成功',
      userId
    };
  } catch (error) {
    console.error('创建用户失败:', error);
    return { success: false, message: '注册失败' };
  }
};
