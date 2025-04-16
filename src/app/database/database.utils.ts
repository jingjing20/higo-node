import { connection } from './mysql';
import { promisify } from 'util';

/**
 * 将connection.query转换为Promise形式
 * 避免在每个服务文件中重复定义
 */
export const queryAsync = promisify(connection.query).bind(connection);
