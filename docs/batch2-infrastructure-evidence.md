# 第二批基础设施内容：材料与核验记录

日期：2026-09-24。范围：Day 5–6；12张新卡、20道原创题（其中6道多选），20个补充来源登记。主教材/笔记保持原样；没有写入真实学习记录。正式14日计划没有修改。

## 发现什么

- 旧覆盖表2.2–2.10没有可学卡和题，2.1仅有容量/算力入门，属于**新增＋补充**，不与Day1–4重复导入。
- 现有单一JSON、卡/题ID、来源ID与考点关系足够容纳这些内容。增加课程和映射即可，不需要新知识库系统。
- 第三方04–06有可用的主题组织，也含dump断言、陈旧规格、绝对化规则和事实错误。本批只以它们为材料线索，用NVIDIA资料核对后原创解释与问题。

## 读取范围与获取方式

已先读根AGENTS.md、content-release/content-processing/exam-coverage、共享JSON、Day4课程、现有test-notes。当前test-notes保留用户在ChatGPT的学习证据，不把它当作应用成绩。

在本地GDRIVE范围按文件名查找未找到原教材，随后通过既有Drive来源ID只读取回：

|材料|本轮实际读取|来源边界|
|---|---|---|
|NVIDIA Training NCA - AIIO.pdf（160页）|完整PDF保存至tmp/sources/training-aiio.pdf；全文文字抽取；细读物理17–21、34–35、38、40–43、47–50、53、55–56、64–65、67、79–82、90–100页|同事提供培训讲义，不是官方考试教材|
|04-ai-hardware-and-scaling.pdf（10页）|Drive可读文本全文；重点2、5–8页|社区笔记；不接受所谓必出题、dump结论|
|05-datacenter-power-cooling-facility.pdf（8页）|Drive可读文本全文；重点1–6页|社区笔记；有数值解释错误与泛化|
|06-networking-for-ai.pdf（11页）|Drive可读文本全文；重点1–9页|社区笔记；按官方资料纠正概念边界|

主讲义渲染了18、21、43、56、64、81、82、91页，实际目视核对43页网络职责图及56页Cloud/On-Prem标签。56页纯文本抽取顺序可能让标题错配，课程按图示确认后的关系编写。没有声称160页全量事实核验。

|本地取回材料|字节数|SHA256|
|---|---:|---|
|training-aiio.pdf|18005102|e829d16402a5bc325168ae29a2d7308103b79577d594645bad3b361cc8304490|
|note04.txt（连接器抽取文本）|13532|c1818014a1b392e08c310057f2e6532a88513a2373d99f1fc5e1fffb0d140495|
|note05.txt（连接器抽取文本）|13244|af880ef681525ac7fa10d3788761e631819da55539b00830dfaea666b27c7f49|
|note06.txt（连接器抽取文本）|17243|5f4e13a78b0303f7d2993e0f4382669b30d2b7e59501dddea0d6c38914ff3a0e|

文本哈希只证明本轮抽取文本，不能冒充原PDF哈希。Drive签名下载地址没有写入项目文件。

## 明确纠正及排除

|原资料位置/说法|处理分类|本批处置与依据|
|---|---|---|
|NOTE05第2页：PUE≥2解释成非IT耗能是IT两倍|明显错误/停用此解释|PUE=2时总能耗=2×IT，非IT=IT；TRAIN第21页及NVIDIA PUE说明一致。card-pue和Q-D05-005/006重新编题，不改原笔记|
|NOTE05第2页：PUE>3就是fraud|无依据/不采用|指标大小不足以判定造假；保留公式与可比边界，不引入指控|
|NOTE05第1、4、7页：固定kW阈值强制某散热类型|过度泛化/不采用|按具体系统、总热负载和设施能力设计。NVIDIA H100散热指南说明还可调整密度/布局，不能用统一阈值替代核验|
|NOTE05第5–6页：本地自动满足法规/始终更便宜、云永远有容量|条件不足/修正|改成数据控制、利用率、完整成本与责任边界的条件比较；不作合规或采购承诺|
|NOTE04/06：scale up或NVLink只能在一台服务器内部|边界需补充|NVIDIA 2026 NVLink正文说明scale-up domain可达机架级；保留域内与scale-out的职责差别，不要求背新代参数|
|NOTE06：每个AI集群固定三/四张网络|dump口诀/不采用|NVIDIA BasePOD不同页面按物理/逻辑职责有不同划分；课中按计算、存储、带内、带外用途识别|
|NOTE06：IB必需OpenSM|实现与职责混淆/修正|需要有效Subnet Manager；OpenSM是一种实现，可主机或交换机承载，不把名称当唯一部署方式|
|TRAIN第48页Ethernet/TCP vs IB/RDMA简化表|补充边界|Ethernet可用RoCE承载RDMA，Ethernet不等于TCP；不背旧速率/固定延迟|
|TRAIN第97页固定CPU百分比/加速倍数|未通用核验/不采用|只保留数据搬运卸载概念，不把示例性能视为保证|
|NOTE06第8页DOCA操作系统、隔离绝对化|概念修正|DOCA为相关软件开发能力；DPU隔离依具体模式、软件和配置，不能宣称装卡即安全|
|TRAIN第100页GDS远程RDMA图|示例边界补充|GDS也可涉及本地NVMe；官方GDS文档要求支持条件且有兼容路径，不能把该图当唯一结构|
|04–06硬件代际/端口数量、题频预测|待核验题/本批不计分|未把所有参数逐条审完，不批量导入；新题主要考职责、关系与判断条件|

以上是资料质量处置，不是用户成绩或掌握状态。

## 官方核验入口

所有卡和题都有sourceIds，完整URL、定位和适用边界登记于合并片段sources；合并后进入主JSON。主要入口：

- [BasePOD核心组件](https://docs.nvidia.com/dgx-basepod/reference-architecture-infrastructure-foundation-enterprise-ai/latest/core-components.html)、[网络职责](https://docs.nvidia.com/dgx-basepod/deployment-guide-dgx-basepod/latest/network-overview.html)：集群和网络关系。
- [设施](https://docs.nvidia.com/dgx-superpod/design-guides/dgx-superpod-data-center-design-h100/latest/infrastructure.html)、[供电](https://docs.nvidia.com/dgx-superpod/design-guides/dgx-superpod-data-center-design-h100/latest/electrical.html)、[散热](https://docs.nvidia.com/dgx-superpod/design-guides/dgx-superpod-data-center-design-h100/latest/cooling.html)：规划原则，有具体H100部署边界。
- [PUE的定义与不足](https://blogs.nvidia.com/blog/datacenter-efficiency-metrics-isc/)：不把设施能效当作有用计算产出。
- [NVLink正文](https://developer.nvidia.com/blog/nvidia-nvlink-the-scale-up-network-for-ai-factories/)：scale-up/scale-out和计算域，排除页面AI摘要与加速宣传数字。
- [RoCE协议文档](https://docs.nvidia.com/doca/sdk/rdma-over-converged-ethernet.pdf)、[IB子网管理](https://docs.nvidia.com/networking/display/QM87XX/software-management.pdf)：协议和职责；旧速率示例不当作当前上限。
- [DPU定义](https://blogs.nvidia.com/blog/whats-a-dpu-data-processing-unit/)、[BlueField](https://www.nvidia.com/en-us/networking/products/data-processing-unit/)、[GPUDirect RDMA](https://docs.nvidia.com/cuda/gpudirect-rdma/index.html)、[GDS](https://docs.nvidia.com/gpudirect-storage/overview-guide/index.html)：职责与支持条件。
- 部署比较参考培训材料、[NVIDIA企业控制环境说明](https://docs.nvidia.com/enterprise-reference-architectures/deploying-proprietary-models-confidential-compute-self-hosted-kubernetes/latest/introduction.html)和AI Enterprise release-4部署说明的公开检索摘要。release-4入口本轮重定向到archive域；初次取得页面记录，后续回读被工具阻止，故明确标记归档概念参考，不作为当前软件安装证据。

## 本批新增与接入说明

Day5：集群关键组件、扩展策略、供电散热、PUE、设施、本地/云。Day6：流量职责、Ethernet/IB、RDMA/RoCE、NVLink/NVSwitch、BlueField/DPU、GPUDirect。

输出：content/batch2-infrastructure.json为合并片段；docs/day-05-lesson-v0.2.md、docs/day-06-lesson-v0.2.md为可读课程。主JSON/src/web由主任务统一合并生成，本子任务未直接写这些文件。

coverageUpdates对既有考点增加卡/题ID，主任务需合并旧映射并按所有卡/题重算关联；不能以新增片段覆盖已有映射。2.1–2.10只标“已有（基础）”，完整配置评估、复杂综合情境仍可补充。1.2/1.6维持“待补（部分已有）”。

## 校验与剩余边界

- 12张卡都有小白解释、英文、区别/陷阱、场景、原讲义页码与官方来源。
- 20题答案与四个选项逐项解释齐全；每Day10题、3道多选，题ID固定为Q-D05-001…010与Q-D06-001…010。
- 本地检查通过唯一卡/题/来源ID、来源和考点引用、答案存在、多选答案数量、题卡同日及课程集合；还以最新validate-content.cjs对“旧内容＋片段”内存合并进行了校验，未修改主JSON。
- 这些是内容结构和资料对照证据；本子任务不宣称本机UI/EXE验收通过，不宣称真实学习有效或已经覆盖所有考试变式。
- 未独立人工二审。原题库没有因本片段而被改写；任何后续AI交叉复核仍不能标成独立人工审题。

## 跨课去重补充

在交叉审读Day7–8时，发现初稿Q-D06-002与Q-D07-008都以“OS不可用但BMC可达”考带外管理。Day7保留该管理场景；Day6 Q-D06-002改为“检查点写入与计算流量争用”考网络容量/拥塞/隔离评估，题ID与正确选项A保持不变。仅新题初稿去重，不触碰既有Day1–4题或历史首次成绩。
