import httpServer from './app/app.server';
import { APP_PORT } from './app/app.config';
import { connection } from './app/database/mysql';

/**
 * 处理服务器保持活跃状态，防止 mysql 超时断开连接
 */
const handleServerActiveStatus = () => {
  setInterval(() => {
    connection.query('SELECT 1');
    console.log('🚀 保持mysql活跃状态');
  }, 3600000); // 每3600000毫秒（1小时）发送一次查询
};

httpServer.listen(Number(APP_PORT), '0.0.0.0', () => {
  console.log(`🚀 服务已启动在0.0.0.0:${APP_PORT}端口！`);
});

/**
 * 测试使用数据服务连接
 */
connection.connect((error) => {
  if (error) {
    console.log('👻 连接数据服务失败：', error.message);
    return;
  }

  console.log('🚛 成功连接数据服务 ~~');
  handleServerActiveStatus();
});
