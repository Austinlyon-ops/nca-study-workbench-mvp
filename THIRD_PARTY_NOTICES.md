# 第三方软件声明

NCA Study Hub v0.3.0 的运行代码直接使用以下第三方组件。完整依赖版本锁定在相应 `package-lock.json`。

## 桌面应用运行依赖

### ts-fsrs 5.4.2

- 项目：https://github.com/open-spaced-repetition/ts-fsrs
- 用途：知识卡间隔复习调度
- 许可证：MIT
- 本项目只使用稳定版 5.4.2，没有使用 6.0.0-beta。

## Vercel 云端服务运行依赖

### @vercel/blob 2.8.1

- 项目：https://github.com/vercel/storage/tree/main/packages/blob
- 用途：在 Vercel 私有 Blob 中保存客户端加密后的备份版本
- 许可证：Apache-2.0

Electron、electron-builder、Playwright、Sharp 和 png-to-ico 是开发、测试或打包依赖，具体版本及其传递依赖见根目录 `package-lock.json`。许可证原文随各 npm 包分发。

外部 NCA 学习项目只用于结构和风险调研，没有复制其题库、考试 dump、课程截图或许可不明内容。
