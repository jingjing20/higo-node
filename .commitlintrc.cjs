module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'ci',
        'chore',
        'docs',
        'feat',
        'fix',
        'perf',
        'refactor',
        'revert',
        'style',
        'test',
        'anno'
      ]
    ]
  }
};

/**
 * ci : 持续集成新增
 * chore : 构建过程或辅助工具的变动
 * feat : 开发新功能
 * docs : 修改文档
 * fix : 修复bug
 * perf : 性能优化
 * refactor : 某个已有功能的重构
 * revert : 撤销上一次的 commit
 * style : 只限代码格式的改变
 * test : 增加测试
 * anno: 增加注释
 */
