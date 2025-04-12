import { connection } from '../app/database/mysql';
import { UserModel } from './user.model';

/**
 * 创建用户
 */
export const createUser = async (user: UserModel) => {
  const { email, password } = user;
  try {
    // ......
    return { success: true, message: '注册成功' };
  } catch (error) {
    return { success: false, message: '注册失败' };
  }
};

/**
 * 用户登录
 */
export const loginUser = async (userInfo: UserModel) => {
  try {
    // ......
    return { success: true, message: '登录成功' };
  } catch (error) {
    return { success: false, message: '登录失败' };
  }
};
