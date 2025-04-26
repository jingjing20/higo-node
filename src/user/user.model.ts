export class UserModel {
  id?: number;
  email?: string;
  password_hash?: string;
  password?: string; // 临时字段，用于接收注册和登录的密码，不存储到数据库
  nickname?: string;
  avatar_url?: string;
  bio?: string;
  gender?: string;
  location?: string;
  is_active?: number;
  last_login?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export class VerificationTokenModel {
  id?: number;
  user_id: number;
  token: string;
  type: string; // email, password_reset
  expires_at: Date;
  created_at?: Date;
  updated_at?: Date;
}
