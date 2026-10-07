# NCA Study Hub

本仓库用于公开发布学习工作台的源码与静态学习页面。与本机 ChatGPT/Codex 对话绑定的反馈桥接脚本、真实学习记录和本地构建产物不随仓库发布；GitHub Pages 只提供 `web/` 静态学习页面。

显示名称于2026-10-02统一为 NCA Study Hub。项目目录、数据标识及既有点评任务绑定沿用原名，以保持已有学习记录和工作流连续；本次仅更新网页与桌面窗口内显示，没有重新打包安装。

当前源码应用版本 **0.2.0**，内容版本 **0.2.0-batch2**：Day1–8、40张知识卡、80道原创练习。不是NVIDIA官方产品或真题库，基础覆盖不等于完整备考或已掌握。

## 现在怎么用

需要学习和点评时，双击项目根目录或本目录的 **`启动学习工作台.cmd`**：自动准备点评服务，用 Chrome 打开原路径的 HTML。保存回答后点击“请求点评”，在原答下查看返回结果。原“启动学习点评.cmd”也进入同一流程；无需手动连接。启动并不发送答案。若 Chrome 有多个配置，请使用原来保存学习记录的配置。

直接用原来的Edge/Chrome打开 `web/index.html`，保持同一个文件位置和浏览器配置。选Day与20/45/60分钟预算，读卡、答题、标记猜测/不确定，再从复习回到对应卡。新版已在本机真实Edge与原生Electron验收。

网页和桌面各自保存记录，不自动互相同步；内容和答案来自同一份JSON。学习后可导出备份，反馈Day、题号、首次/重做、错答/猜测/不确定与卡住的位置。一次答对不会变成已掌握。

## 桌面版本要分开看

- 源码/本轮测试版本：0.2.0，内容0.2.0-batch2。
- 新测试包目录：`C:\Users\asus\Documents\Codex\NCA-Study-Desk-Build-0.2.0`。
- 电脑原来已安装的EXE仍是0.1.0（3卡5题）；本轮未运行安装向导覆盖它。
- 安装包构建和独立EXE验收不能代替升级安装流程、签名信誉或另一台干净电脑验收。

开发启动在本目录执行 `npm start`。本轮自动化用 `NCA_DESK_USER_DATA` 和独立浏览器配置保存测试数据，不触碰真实学习记录。

## 内容维护

唯一运行内容源：`content/nca-content-v0.2.json`。改完运行 `npm run build:content`，生成网页数据、桌面内容和考点覆盖表，再运行 `npm test`。构建拒绝无效题型、答案、来源、考点映射和重复ID，未变化内容不重写。

- `npm run test:windows`：本机Edge与原生Electron完整隔离验收。
- `npm run smoke:electron`：桌面阅读→错答→复习→关闭重开。
- `npm run dist`：输出新测试安装包到上述云盘外目录。

[当前交付说明](docs/content-release-v0.2.md) · [Day 3 第二节教学试点](docs/day03-section02-teaching-pilot.md) · [考点覆盖](docs/exam-coverage-v0.2.md) · [材料处理](docs/content-processing-v0.2.md) · [历史题库抽查](docs/question-bank-audit-v0.2-batch2.md)

`knowledge-base/` 是原有独立个人笔记页，本轮保留未改。NCA知识内容继续在Study Desk的JSON/卡题/来源关系中维护，不再建一套重复系统。
