# NCA Study Hub v0.3.0 开发与重新打包 SOP

## 1. 环境和数据边界

- Windows 10/11 x64；Node.js 20 或更高；npm。
- 仓库目录：`E:\GDRIVE\MClaudD\AI_Codex_Workspace\CodexProjects\nca-study-workbench-mvp\nca-study-desk`。
- 正式构建目录：`C:\Users\asus\Documents\Codex\NCA-Study-Hub-Build-0.3.0`，位于 Google Drive 同步目录之外。
- 不把真实学习记录、云端同步口令、点评令牌或本机回执放入仓库或源码包。
- 开发、迁移和恢复测试必须设置 `NCA_DESK_USER_DATA` 为新建隔离目录，并只使用合成数据。

显示名称虽然从 NCA Study Desk 改为 NCA Study Hub，`appId=com.personal.ncastudydesk` 及已安装版用户数据目录 `NCA Study Desk` 保持不变。`NCA_DESK_USER_DATA` 环境变量始终优先，用于隔离验收。

## 2. 安装依赖

```powershell
Set-Location 'E:\GDRIVE\MClaudD\AI_Codex_Workspace\CodexProjects\nca-study-workbench-mvp\nca-study-desk'
npm ci
```

`npm ci` 必须使用根目录 lockfile。云端服务另在 `cloud\vercel` 执行一次 `npm ci`。

## 3. 内容与图标

唯一内容源是 `content\nca-content-v0.2.json`。文件名沿用旧名以保持维护入口唯一；内部版本为 0.3.0。

```powershell
npm run build:content
npm run make-icon
npm run verify-icon
```

图标源文件为 `assets\app-icon.svg`，预览为 `assets\app-icon-256.png`，安装图标为 `assets\app.ico`。校验必须显示 16、32、48、256 四帧。electron-builder 会把同一 ICO 配置到应用 EXE、窗口、安装器和卸载程序；桌面与开始菜单快捷方式使用应用 EXE 图标。

## 4. 测试

```powershell
npm test
npm run smoke:electron
npm run accept:v03
Set-Location cloud\vercel
npm test
npm run build
```

`accept:v03` 使用临时用户目录和 v1 合成 fixture，验证实际 Electron 启动、v1→v2、重启恢复、考点地图、案例保存，以及 1024×768 下 100%/125%/150% 缩放无整页横向溢出。测试结果不是学习成绩或教学效果证据。

## 5. 生成 NSIS 安装包

```powershell
Set-Location 'E:\GDRIVE\MClaudD\AI_Codex_Workspace\CodexProjects\nca-study-workbench-mvp\nca-study-desk'
npm run dist
```

预期文件：`C:\Users\asus\Documents\Codex\NCA-Study-Hub-Build-0.3.0\NCA-Study-Hub-Setup-0.3.0-x64.exe`。

安装器为 x64 NSIS 可见向导，`oneClick=false`，可以按“下一步”完成；创建桌面和开始菜单快捷方式并登记卸载入口。

## 6. 哈希、签名与隔离安装验收

```powershell
$installer = 'C:\Users\asus\Documents\Codex\NCA-Study-Hub-Build-0.3.0\NCA-Study-Hub-Setup-0.3.0-x64.exe'
Get-FileHash -Algorithm SHA256 -LiteralPath $installer
Get-Item -LiteralPath $installer | Select-Object FullName,Length
Get-AuthenticodeSignature -LiteralPath $installer | Select-Object Status,StatusMessage,SignerCertificate
```

当前版本不伪造签名，预期 Authenticode 状态是 `NotSigned`。安装验收前先记录旧安装目录和卸载项是否存在；首次启动必须由测试进程注入 `NCA_DESK_USER_DATA` 指向隔离目录。验证启动、关闭重开、v1 fixture、备份、快捷方式和卸载后，再复核原目标目录没有意外残留。

## 7. Windows SmartScreen

未签名安装包第一次运行可能出现 Windows SmartScreen。实际通行路径：

**“更多信息” → 核对发布者/文件哈希 → “仍要运行”**。

只有在文件来自可信交付位置并且 SHA-256 与交付清单一致时继续。

后续签名路径：获取可信 OV/EV 代码签名证书，或使用 Microsoft Trusted Signing；配置 Authenticode SHA-256 摘要和可信时间戳，再让 electron-builder 在构建过程中签名。验收报告必须分别记录：

1. 文件已经签名；
2. 时间戳成功且签名在证书到期后仍可验证；
3. SmartScreen 已建立信誉。

三项不是同一件事，不能因为“已签名”就宣称 SmartScreen 一定不提示。

## 8. 源码包

从已确认的发布提交生成源码 ZIP。包含源码、lockfile、测试、内容源、构建脚本和文档；排除 `node_modules`、`.vercel`、缓存、构建产物副本、`output`、真实学习记录、密钥和本地点评回执。解压后用 `npm ci` 重建。
