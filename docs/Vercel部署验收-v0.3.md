# NCA Study Hub v0.3.0 Vercel 部署验收

验收日期：2026-10-07（Asia/Shanghai）

## 部署结果

- 项目：`nca-study-hub`
- 生产地址：`https://nca-study-hub.vercel.app`
- 生产 Deployment：`dpl_41MJPhqRMeXUZeXNGvgPpakcwdhy`
- 预览 Deployment：`dpl_FKwqHG4VWMwJyCwhN7git7uQtrbz`
- Blob：`nca-study-hub-data`，`private`，区域 `iad1`
- 环境：`production`、`preview`、`development` 均配置 `NCA_SYNC_TOKEN_SHA256`；Vercel 不保存同步口令原文。
- 访问：生产站关闭 Vercel SSO 门槛；`/api/state` 继续要求 NCA Bearer 同步口令。

GitHub 自动部署未连接。Vercel CLI 创建项目时尝试连接 `Austinlyon-ops/nca-study-workbench-mvp`，账号缺少 GitHub Login Connection，因而当前采用手动 CLI 部署。

## 验收证据

|检查|结果|
|---|---|
|云端单元测试|2/2 通过|
|本地静态构建|通过；从项目唯一内容源生成|
|预览健康检查|HTTP 200，`ok: true`|
|预览匿名状态访问|HTTP 401|
|预览合成密文上传/下载|HTTP 200/200，下载字节 SHA-256 与上传一致|
|预览陈旧 ETag|HTTP 409|
|生产健康检查|HTTP 200，`ok: true`|
|生产匿名状态访问|HTTP 401|
|生产合成密文上传/下载|HTTP 200/200，下载字节 SHA-256 与上传一致|
|生产陈旧 ETag|HTTP 409，上传后 ETag 已变化|
|合成数据清理|删除 2 个 `nca-study-hub/desktop/` Blob；清理后剩余 0|
|清理后复核|健康检查 200；正确口令读取空通道 404；无口令 401|

所有读写测试只使用合成加密封装，没有读取或上传真实学习记录。自动化通过只证明软件行为，不表示用户已经掌握知识或教学效果已经验证。

## 本机配置

桌面应用填写：

- 服务地址：`https://nca-study-hub.vercel.app`
- 同步口令：读取 `C:\Users\asus\Documents\Codex\NCA-Study-Hub-Deliverables-0.3.0\Vercel同步配置-请保密.txt`

保密文件不能上传到 Git、公开下载页或商店材料。同步口令丢失后，已有加密备份无法恢复。
