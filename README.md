# NCA Study Hub

NCA Study Hub 是个人本地优先的 NCA-AIIO 学习工作台。v0.3.0 保留 Day 1–8、40 张知识卡、80 道原创练习、20/45/60 分钟预算、猜测/不确定标记、错题回卡、原答、点评、来源追踪和备份，并补充：

- 3 个考试领域、22 个考点的应用内地图；
- 6 个明确标为“虚构教学案例”的案例柜；
- 使用 `ts-fsrs@5.4.2` 的知识卡到期复习；
- schema v2、v1→v2 迁移及 v1/v2 备份导入；
- 可选的 Vercel 私有 Blob 客户端加密备份。

内容覆盖、学习活动、到期排期和作答表现分别展示。应用不输出“已掌握率”、通过概率或考试准备度，也不把案例回答计入正确率或 FSRS。

## 桌面开发

环境：Windows 10/11 x64、Node.js 20 或更高版本、npm。

```powershell
npm ci
npm run build:content
npm test
npm run smoke:electron
npm run accept:v03
npm run dist
```

正式安装包输出到 `C:\Users\asus\Documents\Codex\NCA-Study-Hub-Build-0.3.0`。

开发和验收必须设置 `NCA_DESK_USER_DATA` 指向专用隔离目录。安装版显示名称已改为 **NCA Study Hub**，但继续使用旧 `NCA Study Desk` 用户数据目录和 `com.personal.ncastudydesk` 应用身份，避免升级后记录看似丢失。

## 内容维护

唯一运行内容源仍是 `content/nca-content-v0.2.json`。文件名保持不变是为了避免建立第二套内容库；内部版本已经升级为 0.3.0。修改后执行 `npm run build:content`，它会生成桌面内容、网页内容、课程文档和考点覆盖表。

内容构建会拒绝悬空的来源、考点、卡片、题目、案例关联以及无效答案。测试通过只证明软件和内容关系符合规则，不表示学习效果或个人掌握已经验证。

## 云端备份

桌面应用默认只写本机。用户主动点击上传后，客户端才用 AES-256-GCM 加密 v2 备份，再把密文发送到 Vercel 私有 Blob。Vercel 端只保存同步口令的 SHA-256，不保存口令原文。

已部署的生产服务：<https://nca-study-hub.vercel.app>。桌面应用仍需填写本机保密文件中的专属同步口令，才能读写私有备份。

部署代码在 `cloud/vercel/`。完整步骤见 [Vercel 云端备份配置](docs/Vercel云端备份配置-v0.3.md)。

## 发布资料

- [开发 SOP](docs/开发SOP-v0.3.md)
- [上线准备清单](docs/上线准备清单-v0.3.md)
- [v0.3.0 交付记录](docs/交付记录-v0.3.md)
- [第三方声明](THIRD_PARTY_NOTICES.md)
- [考点覆盖](docs/exam-coverage-v0.2.md)

本项目不是 NVIDIA 官方产品或真题库。源码当前仍标记为 `UNLICENSED`；公开可见不等于授予第三方复用许可。
