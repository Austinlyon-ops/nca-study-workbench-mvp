# 第二批 Day 7–8 内容加工与证据记录

日期：2026-09-24。分类：新增正式学习内容，并对教材中的个别错误作有依据的修正说明。没有修改原始教材、原始题库、AGENTS.md、正式学习计划、test-notes或用户学习记录。

## 本轮实际读取

- 当前共享JSON、content-release-v0.2.md、content-processing-v0.2.md、exam-coverage-v0.2.md、Day4课程备份及既有真实学习测试记录。
- `NVIDIA Training NCA - AIIO.pdf`：Drive原文件160页，按物理页105–116、129–137、151–154读取相关全文；第116页另渲染视觉核对，确认L40S表格内容不是文本抽取错位。来源：[TRAIN](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view)。主文件由本批另一内容处理任务下载于tmp/sources；没有重写源PDF。
- [07数据中心管理与监控](https://drive.google.com/file/d/1KsminMP_--vyYJrYQRIurt0KEcI_4gES/view)：Drive连接器读取9页完整文本；未逐页视觉验版。
- [08编排、调度和虚拟化](https://drive.google.com/file/d/1jDIcg23sQjWXr7fNKxdNx483-FydD-uz/view)：Drive连接器读取12页完整文本；未逐页视觉验版。
- 官方技术资料为本轮实时web访问；索引登记在片段sources以及各张卡内。第三方笔记的dump、必考题量和通过承诺全部不作为事实或试题来源。

## 教材/笔记差异及处理

|位置|发现|本批处理与依据|
|---|---|---|
|TRAIN物理116页|MIG支持产品含L40S；实例数一概写7|L40S官方规格MIG为No，vGPU为Yes；MIG支持表列出A30为4。新卡按型号与profile核对，原PDF保留。|
|TRAIN物理132/137页|说nvidia-smi仅手动、不支持持续监控；口诀误展开为Single System Management Interface|[官方nvidia-smi](https://docs.nvidia.com/deploy/nvidia-smi/index.html)支持循环查询；全称NVIDIA System Management Interface。新卡明确纠正。|
|NOTE07物理2–5页|将GPU-Util与DCGM SM_ACTIVE等同；以高GPU-Util推定计算饱和|[DCGM定义](https://docs.nvidia.com/datacenter/dcgm/latest/user-guide/feature-overview.html)的SM Activity是跨SM平均，nvidia-smi是内核忙碌时间；新卡区分，不采纳饱和推断。|
|NOTE07物理7/9页|统一温度85℃告警以及过于确定的根因归类|不采用通用故障阈值；按型号、持续时间、降频和任务表现看；[Xid文档](https://docs.nvidia.com/deploy/xid-errors/introduction.html)要求以错误线索继续调查。|
|TRAIN物理151–154页及NOTE08物理1–5页|训练对应Slurm、推理对应Kubernetes易被当硬性二分；Slurm仅整GPU分享亦过简化|保留典型场景，明确Kubernetes支持批作业；[Slurm GRES](https://slurm.schedmd.com/gres.html)含MIG管理，不采纳“只能整卡”。|
|TRAIN物理154页|GPU Operator根据利用率重平衡工作负载|[GPU Operator概述](https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/latest/overview.html)描述GPU组件管理；新卡分开组件准备、资源发布和调度，不承诺自动迁移应用。|
|NOTE08物理7页|MIG配置改变一律重置；P2P限制无版本条件|[Getting Started](https://docs.nvidia.com/datacenter/tesla/mig-user-guide/getting-started-with-mig.html)区分Hopper+模式启用；[部署约束](https://docs.nvidia.com/datacenter/tesla/mig-user-guide/deployment-considerations.html)按驱动版本列P2P限制。仅教授必须查版本，不把易漂移条件编成死记题。|
|TRAIN物理110–116页及NOTE08物理8页|vGPU与MIG的隔离、数量、部署环境被过度二分|[vGPU官方文档](https://docs.nvidia.com/vgpu/latest/grid-vgpu-user-guide/grid-vgpu-introduction.html)说明可与MIG结合；新卡保留支持条件，不宣称任何虚拟化方案均完全隔离、无性能损失。|
|NOTE08物理8页|MPS完全无隔离且共享上下文的表述过度泛化|本批不将MPS展开为正式卡/题；复杂代际隔离语义仍待专题核验，不采纳绝对表述。|

上述修正是知识内容校正，不代表已经在本机运行MIG、Slurm、Kubernetes或DCGM，也不证明学习者掌握。

## 交付及合并约定

- `content/batch2-operations.json`：临时合并片段，18个新增来源、10张卡、20道题、Day7/8两个课程对象、7条coverageUpdates。复用主JSON的TRAIN和OPERATOR来源，不能覆盖其原记录。
- `docs/day-07-lesson-v0.2.md` 与 `docs/day-08-lesson-v0.2.md`：由相同片段生成课程正文和逐项解析，避免两份答案手改。
- 合并时向cards/questions/lessons/sources追加新ID；coverageUpdates的cardIds/questionIds须与已有条目取并集，不覆盖其他Days。1.1/1.6/1.7仍保留待补，3.1–3.4可标基础内容已有，复杂生产配置与实操仍未覆盖。
- 本片段不修改src/content.cjs、web/index.html及主JSON；由主任务合并、构建、真实环境验收。
- 所有新题为本轮原创，已由作者对照资料和逐项解析；未独立双人审题。多选共4题，两日各10题；20/45/60分钟按现有3/6/10题机制使用。

## Day1–4独立技术抽查

读取了18张卡和40道题干、选项、答案、解释。重点检查CPU也可并行、显存容量/带宽、吞吐/延迟、训练/推理、cuDNN/cuBLAS/NCCL、容器/驱动、TensorRT/Triton职责及答案字母映射，未发现明确需要立即修改的错误。此为内容抽查，不宣称所有外部产品事实均已完成独立二审。原5题ID及答案应保留。

原Q-ORIGINAL-002的固定参数表述放在本课常规推理语境可成立；当前卡已写明“常规推理”，无需为特殊研究场景扩大修改。学习反馈文件继续保持Test notes only；ChatGPT表现、技术检查通过、应用成绩和用户实际使用效果不可互推。

## 仍未完成

生产部署实操、MPS专题、全部vGPU授权/迁移/互联支持矩阵、GPU架构特定计数器验证、历史题库全量二审、真实学习效果验证。没有借本批内容加入新的知识库应用。

## 对 Day5–6 的独立二审

在基础设施内容作者交付后，另一内容处理者（本记录作者）读取 `content/batch2-infrastructure.json` 的12张卡、20道题及逐项解释，对答案是否唯一/多选集合是否充分、题卡对应、来源ID与领域名称作独立检查。另打开官方PUE、NVLink scale-up、GPUDirect RDMA/GDS、RoCE和InfiniBand SM资料核对易错边界。未发现阻断接入的事实或答案映射错误；12卡/20题结构检查通过。题目仍是入门原创练习，不是正式模拟题或学习效果证据。未在本次二审中逐个重新验证全部设施/云部署引用页。

特别确认：PUE=总能耗/IT能耗的分母正确；低PUE不能推出更低总电费；RoCEv2可跨IP子网但需网络规划；GPUDirect不表示系统完全不需要CPU；NVLink域不被错误限定为单机；多GPU显存不能由任意软件自动合并。
