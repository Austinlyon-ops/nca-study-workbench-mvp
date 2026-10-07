# Vercel 云端加密备份配置

## 设计

桌面应用默认只保存本机数据。只有用户主动点击“加密上传当前备份”，客户端才会：

1. 生成完整 v2 备份；
2. 用同步口令经 PBKDF2-SHA256（200,000 次）派生密钥；
3. 用 AES-256-GCM 加密；
4. 把密文封装发送给 Vercel Function；
5. Function 把版本文件写入私有 Vercel Blob，最多保留最近 10 份。

Vercel 环境变量只保存同步口令的 SHA-256，用于请求鉴权；不保存口令原文。原始学习记录不会以明文写入 Blob。同步口令丢失后无法解密已有备份，应放在密码管理器中。

## 当前部署（2026-10-07）

- Vercel 项目：`nca-study-hub`
- 生产地址：`https://nca-study-hub.vercel.app`
- 健康检查：`https://nca-study-hub.vercel.app/api/health`
- 私有 Blob：`nca-study-hub-data`，区域 `iad1`
- 本机口令文件：`C:\Users\asus\Documents\Codex\NCA-Study-Hub-Deliverables-0.3.0\Vercel同步配置-请保密.txt`

生产环境已关闭 Vercel SSO 访问门槛，使桌面客户端可以访问；`/api/state` 仍要求专属 Bearer 同步口令。预览和生产环境均通过 401 鉴权、合成密文上传/下载、字节一致性及 409 ETag 冲突测试。测试后已删除全部合成 Blob，未上传真实学习记录。

当前未连接 GitHub 自动部署。Vercel 账号需要先补充 GitHub Login Connection，才能启用按提交自动发布；本版本使用下述 CLI 手动流程。

## 1. 准备本地项目

```powershell
Set-Location 'E:\GDRIVE\MClaudD\AI_Codex_Workspace\CodexProjects\nca-study-workbench-mvp\nca-study-desk\cloud\vercel'
npm ci
npm test
npm run build
```

## 2. 登录并连接 Vercel

```powershell
npx vercel@latest login
npx vercel@latest link
```

可以连接现有项目，也可以让 CLI 创建新项目。`.vercel` 是本机配置，已被 `.gitignore` 排除。

## 3. 创建私有 Blob

在 Vercel 项目 **Storage** 页选择 **Create Database → Blob → Private**，并连接到当前项目。也可使用支持私有 Blob 的新版 CLI：

```powershell
npx vercel@latest blob create-store nca-study-hub-data --access private
```

连接后项目会获得 `BLOB_READ_WRITE_TOKEN`。不要把它写入仓库。

## 4. 生成同步口令和服务器哈希

```powershell
$bytes = [Security.Cryptography.RandomNumberGenerator]::GetBytes(32)
$syncToken = [Convert]::ToBase64String($bytes)
$hashBytes = [Security.Cryptography.SHA256]::HashData([Text.Encoding]::UTF8.GetBytes($syncToken))
$syncTokenHash = [Convert]::ToHexString($hashBytes).ToLowerInvariant()
$syncToken
$syncTokenHash
```

把 `$syncToken` 保存到密码管理器，并在桌面应用中输入。只把 `$syncTokenHash` 配置为 Vercel 环境变量：

```powershell
npx vercel@latest env add NCA_SYNC_TOKEN_SHA256 production --value $syncTokenHash --force --sensitive --yes
npx vercel@latest env add NCA_SYNC_TOKEN_SHA256 preview --value $syncTokenHash --force --sensitive --yes
npx vercel@latest env add NCA_SYNC_TOKEN_SHA256 development --value $syncTokenHash --force --sensitive --yes
```

## 5. 部署与验证

```powershell
npm run build
npx vercel@latest deploy
npx vercel@latest deploy --prod
```

`npm run build` 必须在完整源码目录中先执行。它从唯一的 `web/index.html` 和锁定的 `ts-fsrs` 依赖生成 `public/`；Vercel 子目录的远端构建只校验这份已准备产物，不维护第二份知识库。

部署后访问 `https://nca-study-hub.vercel.app/api/health`，应得到 `ok: true`。在桌面应用“资料依据与设置”中填写 `https://nca-study-hub.vercel.app` 和 `$syncToken`，依次执行“保存配置”“测试连接”“加密上传当前备份”。再使用“下载并预览恢复”，应用只有在解密、v1/v2 结构校验和用户确认全部通过后才覆盖本机状态。

桌面与静态网页使用不同的服务通道，避免不同状态结构互相覆盖。v0.3.0 已实现桌面通道；静态网页仍使用浏览器本地记录，`web` 通道只为后续兼容预留。

## 6. 冲突和恢复

- 上传带上最近下载/上传得到的 ETag；云端已有新版本时返回冲突，要求先下载核对。
- 每次上传写入新 Blob，不覆盖同名对象，以避免缓存返回旧数据。
- 客户端解密失败、口令不匹配、结构无效或网络失败时，不覆盖当前学习状态。
- 云端托管是可选备份，不是实时多端合并；同一时间只从一台设备上传更稳妥。

参考：Vercel 官方的 CLI 部署、环境变量和 Private Blob 文档。实际套餐、地区和平台限制应在部署当天再次核对。
