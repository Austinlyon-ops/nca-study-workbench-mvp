# 资料处理与来源边界｜第二批，2026-09-24

2026-09-25 更新：教学补充为 `2026-09-25-trial3`，Day 3修订、Day 4–8新增完整讲解与原答练习，Day 1–8增加原教材差异/阅读任务/停止位置。实际学习效果待验证。40卡中仅Day7显存指标卡修正标题和定义说明，80道计分题未改；下方第二批处理历史保留。78文件导航和优先级见“资料导航试用增补”，另见[教学审核原文](teaching-review-chatgpt-2026-09-25.md)。

当前运行内容：0.2.0-batch2，Day1–8、40卡、80道原创练习、63个来源入口。维护分类为新增、补充和有证据的修正；重复确认不改原记录。Day1–4卡片及题目字段保持不变；旧题库和原始教材没有被改写。

第二批读取了原讲义160页文件的基础设施/运维相关页、04–08笔记完整抽取文本，关键图表另作目视核对；不宣称全书每句话核验完成。官方认证页和2026中文指南仍是22项范围基线，技术定义逐卡对照官方资料。

- [基础设施读取与纠错](batch2-infrastructure-evidence.md)：新增Day5/6、12卡20题，纠正PUE解释、固定散热阈值、网络分工和互联边界。
- [运维读取与纠错](batch2-operations-evidence.md)：新增Day7/8、10卡20题，纠正L40S/MIG、监控指标和工具职责。
- [运维内容独立AI交叉复核](batch2-operations-ai-cross-review.md)；基础设施交叉复核记录在运维证据末尾。AI复核不是独立人工审题。
- [旧题库14题定向抽查](question-bank-audit-v0.2-batch2.md)：380条中4条样本可作已核验练习、5条争议、4条明显错误/停用、1条待核验；剩余366条未逐题审查。没有将旧题批量准入。
- 合并时结构校验拦截新片段的`multi`题型，统一为既有运行时的`multiple`后才接入；真实浏览器与Electron已逐个新Day提交多选验证。Q-D06-002经跨课去重改为存储/计算流量争用场景。

当前内容与学习状态分开保存；技术验收不等于学习效果，ChatGPT旧测试备忘仍为Test notes only，未写成应用成绩。当前知识规模沿用共享JSON、来源ID、考点映射和普通文件足够，不需要新增知识库系统。

## 第一批处理记录（保留出处，以下25来源为当批登记）

本批依据：同事提供的培训讲义组织知识，官方指南定义范围，当前NVIDIA技术资料核对具体职责。原创解释、场景、练习不是官方原文或真题。

|资料|本轮处理|结论|
|---|---|---|
|NVIDIA当前认证页 + Feb 2026中文指南|核对22项要求及领域权重|考试范围基线；不充当全部技术答案依据|
|NVIDIA Training NCA - AIIO.pdf|定位全书主题；细读Day1–4对应段落/图示|主要教学素材，未把整本每句核验完|
|02-nvidia-software-stack.pdf|读取相关章节并对照官方|只采用组织与可核事实；排除dump、必出题数、绝对化口号|
|01、03–08笔记|目录/主题候选映射|待逐项核验；不因文件名贴近考点就视为覆盖完成|
|word卷_在线刷题.html|静态解析，不运行来源脚本；检查cuDNN题|未批量装入40题；本批以原创题避免直接继承错配答案|
|Quizlet300、日期题集、test文本、09PPT、00指南|定位可访问入口|本批不宣称全量审题或全部采用|
|旧2024中文指南|保留既有停用作考纲决定|当前范围用2026官方；不删除原文|
|GitHub社区学习材料|保留既有参考定位，本轮未全量重新读取|不标为已核验官方内容|
|nvidia media、ZIP、模拟测试子目录|本批未深读/展开|不计入已处理数量|

## 明确补充/纠错，不静默替换教材

- CPU可并行；讲义核心数、GPU10倍加速等数值不作为通用事实。
- GPU硬件的CUDA Core与CUDA开发平台/Toolkit不是一件事。
- GPU容器仍需主机驱动、适当运行配置；不采用“任何容器都必然…”的绝对说法。
- cuDNN定义为深度学习基础运算库，不是数据中心管理界面。
- AI Enterprise被比作企业AI的“OS”是比喻，不是替代Linux内核。
- 讲义用Triton Inference Server；当前NVIDIA开发者页称Dynamo-Triton（formerly Triton）。正文保留熟悉术语，备注现名，不猜正式考试命名已变。
- 版本支持和性能依具体环境；不要求在生产服务器执行安装/修改。

## 第一批时的缺口及当前状态

第二批已自然组织为Day5–8的基础设施与运营基础单元，原“未来Day5–10”不再表示当前未做。1.1/1.2/1.6/1.7仍需更广产品/综合场景；正式模拟、陌生题迁移和学习效果独立验证仍未完成。原正式路径数据保留，界面按实际已开放课程呈现，不强制14天。

## 25个来源登记

### BP｜NVIDIA 中国 NCA-AIIO 当前认证页
类别：official；核对日期：2026-09-24；定位：考试大纲/考试概况

https://www.nvidia.cn/training/certification/ai-infrastructure-operations-associate/

范围基线，不用来证明所有技术结论。

### GUIDE｜NVIDIA 官方中文 Study Guide（Feb 2026）
类别：official；核对日期：2026-09-24；定位：物理第4–6页：1.1–3.4

https://images.nvidia.cn/aem-dam/zh_cn/Solutions/training/certification/nvt-certification-exam-study-guide-aiio-a4-web-zhCN-5103850.pdf

22考点编号；课程关联和覆盖程度为本项目判断。

### TRAIN｜同事提供：NVIDIA Training NCA - AIIO.pdf
类别：third-party；核对日期：2026-09-24；定位：每卡另附物理页码；本轮原始文件160页

https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view

培训讲义，不标为官方考试教材。版本/口诀需另核。

### NOTE02｜同事提供：02-nvidia-software-stack.pdf
类别：third-party；核对日期：2026-09-24；定位：第3–8页

https://drive.google.com/file/d/1ab3ilujbrSpsYd_4M3pNxNaUHz84qpRH/view

只参考组织和概念；dump/必出/题量预测不采纳，定义另核官方。

### ML｜NVIDIA Machine Learning
类别：official；核对日期：2026-09-24；定位：定义/工作方式

https://www.nvidia.com/en-us/glossary/machine-learning/



### DL｜NVIDIA Deep Learning
类别：official；核对日期：2026-09-24；定位：定义/神经网络

https://www.nvidia.com/en-us/glossary/deep-learning/



### GEN｜NVIDIA Generative AI
类别：official；核对日期：2026-09-24；定位：生成能力

https://www.nvidia.com/en-us/glossary/generative-ai/



### PERF｜NVIDIA GPU Performance Background
类别：official；核对日期：2026-09-24；定位：架构/性能限制

https://docs.nvidia.com/deeplearning/performance/dl-performance-gpu-background/index.html



### BATCH｜TensorRT 性能优化
类别：official；核对日期：2026-09-24；定位：Batching/吞吐/延迟

https://docs.nvidia.com/deeplearning/tensorrt/latest/performance/optimization.html



### CUDA｜CUDA Linux Installation Guide
类别：official；核对日期：2026-09-24；定位：Introduction/Toolkit/system requirements

https://docs.nvidia.com/cuda/cuda-installation-guide-linux/index.html



### COMPAT｜CUDA Compatibility
类别：official；核对日期：2026-09-24；定位：驱动与CUDA软件兼容

https://docs.nvidia.com/deploy/cuda-compatibility/why-cuda-compatibility.html



### CUDNN｜NVIDIA cuDNN
类别：official；核对日期：2026-09-24；定位：深度神经网络基础算子

https://docs.nvidia.com/deeplearning/cudnn/latest/



### CUBLAS｜NVIDIA cuBLAS
类别：official；核对日期：2026-09-24；定位：GPU线性代数库

https://developer.nvidia.com/cublas



### NCCL｜NVIDIA NCCL
类别：official；核对日期：2026-09-24；定位：多GPU/多节点通信

https://developer.nvidia.com/nccl



### CONTAINER｜NVIDIA Container Toolkit
类别：official；核对日期：2026-09-24；定位：Overview

https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/index.html



### CONTAINER-INSTALL｜GPU容器前置要求
类别：official；核对日期：2026-09-24；定位：Prerequisites/Configuration

https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html



### TRT｜NVIDIA TensorRT
类别：official；核对日期：2026-09-24；定位：推理优化和运行

https://docs.nvidia.com/deeplearning/tensorrt/latest/



### TRITON｜Dynamo-Triton（原Triton Inference Server）
类别：official；核对日期：2026-09-24；定位：模型部署与服务

https://developer.nvidia.com/dynamo-triton



### NIM｜NVIDIA NIM说明
类别：official；核对日期：2026-09-24；定位：NIM Inference Microservices

https://investor.nvidia.com/news/press-release-details/2024/NVIDIA-Launches-Generative-AI-Microservices-for-Developers-to-Create-and-Deploy-Generative-AI-Copilots-Across-NVIDIA-CUDA-GPU-Installed-Base/default.aspx



### NGC｜NVIDIA NGC
类别：official；核对日期：2026-09-24；定位：容器/模型资源目录

https://www.nvidia.cn/gpu-cloud/



### AIE｜NVIDIA AI Enterprise
类别：official；核对日期：2026-09-24；定位：Overview/企业支持/NeMo

https://www.nvidia.com/en-us/data-center/products/ai-enterprise/



### RAPIDS｜NVIDIA 数据科学文档
类别：official；核对日期：2026-09-24；定位：RAPIDS与数据科学

https://docs.nvidia.com/datascience/



### MERLIN｜NVIDIA Merlin
类别：official；核对日期：2026-09-24；定位：推荐系统

https://developer.nvidia.com/merlin



### RIVA｜NVIDIA Riva
类别：official；核对日期：2026-09-24；定位：语音AI

https://developer.nvidia.com/topics/ai/generative-ai/riva



### OPERATOR｜NVIDIA GPU Operator
类别：official；核对日期：2026-09-24；定位：GPU软件组件管理

https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/latest/overview.html




## 本轮实际复核的旧题库问题

`word卷_在线刷题.html` → `100题-AI基础设施认证模拟(100题)` → 第46题 `What is cuDNN?`：原数组的A选项描述深度学习基础运算库，B选项描述数据中心管理界面，而答案字段是B。本批按NVIDIA cuDNN文档核对，正确描述应是A。原文件保持不变；本批自编Q-D03-003明确检查相同概念，不复用旧答案字母。

静态解析识别原题库共380条；这是记录数，不代表380条互不重复的知识点，也不代表其他379条已经审完。

## 资料导航试用增补｜2026-09-25

本节按用户批准的教学试用与资料导航方案补充，属于**新增导航和阅读优先级建议**。批准导航落地不等于批准所有旧题计分，也不等于全部材料已经事实核验。本轮复用刚完成的目录清点和既有加工记录，没有搬移、改写原资料或逐页重审全部教材。

### 从哪里开始读

先用当前官方认证页及上方 **Feb 2026 官方中文指南物理4–6页**确定范围；随后读当前学习单元卡片，尝试不用选项复述或解释，再按卡内“讲义位置”回看原教材和已登记纠错。遇到一个具体薄弱点才补相应专题笔记、字幕或视频。原目录里的数量不构成必须全部读完的学习任务；标题、题量口号和“官方答案”自述也不构成真实性证明。

|导航优先级|本次用途|何时使用|
|---|---|---|
|P0 范围与当前入口|当前官方认证页、2026指南、共享内容、考点覆盖及课程讲义|确定需要学什么和当前Day读哪里；不把映射数当掌握度|
|P1 随课回读|主讲义及已有加工证据的相关笔记|本日卡片/诊断暴露问题时读指定页，不要求整本先通读|
|P2 按薄弱点补强|尚未充分加工的笔记、PPT、视频和字幕|先核对应主题与内容，再补当前缺口；候选映射不是已验证覆盖|
|P3 待审练习|历史HTML、PDF、DOCX及TXT题库|先核来源、答案、干扰项、翻译及重复；未经审查不作为可信计分或通过预测|
|P4 保留或延期|旧/版本未核指南、ZIP、NCP资料|保留来源；版本未核指南不替代P0，NCP不进入NCA必学范围|

这里的P0–P4只是阅读导航，**不是正式考试难度、掌握等级或新认证路径**。本表不新增自动同步或自动审题能力。

### 目录与计数边界

原资料入口为 [我的笔记本电脑 / Nvidia NCA-AIIO](https://drive.google.com/drive/folders/1uH4clXWVRujCFoJCZ5cQoJcPWvGC42hr)。已逐层列出5个下级文件夹中的**78个文件**：20 PDF、4 DOCX、1 PPTX、4 TXT、3 HTML、1 ZIP、17 MP4、28 SRT。ZIP内部未展开；同一内容的多格式副本尚未全量去重，78是文件数，不是78份独立且合格的学习内容。

- [certificateNvidia / certificateNvidia](https://drive.google.com/drive/folders/1h2eSjmWe1Enfw79eWSxIhmWLqYPsZ0FE)：17个文件及“模拟测试”子目录；两层同名目录是实际结构。
- [模拟测试](https://drive.google.com/drive/folders/1iP0-jyQ0TSid9kydMJ4rkaCg67CCjhlj)：12个文件。
- [nvidia media](https://drive.google.com/drive/folders/1u24L6sA-OSXbTrV0HTLqh3ZQ5QCAGpdu)：17个MP4及subtitles子目录。
- [subtitles](https://drive.google.com/drive/folders/1Ds8IS2Sa5oYAbtkd5TXQuoLDnlNZF1OP)：28个SRT。
- 根目录另外有3个HTML及1个ZIP。

“已读”只沿用上文有证据的阅读范围，不表示逐句无误；“抽查”只覆盖所列样本；“仅目录清点”只证明文件条目可定位。文件名中的年份、题量、中英标签与真实正文版本分别标记，未知不推定。下表页码均为已登记的物理页；未定位的页码/时间码明确留待核对。

### A. 根目录题库与压缩包（4个）

|编号与原文件|优先级|版本与语言证据|处理状态|建议阅读位置或用途|
|---|---|---|---|---|
|M01 [certificateNvidia.zip](https://drive.google.com/file/d/16F4dn_oYplXX4SIrlrMtDEj3Zgpyc5b4/view?usp=drivesdk)|P4|版本/内容语言未核|仅目录元数据；未展开|作为原资料容器保留；未核内部清单，不计额外独立知识。|
|M02 [nca-aiio-2026_在线刷题.html](https://drive.google.com/file/d/1tOGkOS2EPC8SKsrQx7Xwu8H6HUWMcsFX/view?usp=drivesdk)|P3|文件名标2026，实际版本/语言未核|仅定位，未全量审题|先核原始日期题集与答案映射，再挑陌生场景候选。|
|M03 [quizlet-NCA-AIIO-300题_在线刷题.html](https://drive.google.com/file/d/1m8sf8V2Ih0ZgqPXwg_uJ0fpfbKaLLL8K/view?usp=drivesdk)|P3|版本/正文语言未核；300仅为文件名声明|仅定位，题数/来源/答案未全量核验|先审与考点和原题的对应关系；不要因数量大优先刷完。|
|M04 [word卷_在线刷题.html](https://drive.google.com/file/d/1y0unu60ko98q62mWxVCFU80ePqrT9PC1/view?usp=drivesdk)|P3|版本未核；已见英文题干，整库语言比例未统计|静态解析380条；14条定向抽查，366条未逐审|先看本项目14题审查记录；4已核验练习/5争议/4错误停用/1待核，不批量计分。|

### B. 教材、专题笔记、指南与文本题集（17个）

|编号与原文件|优先级|版本与语言证据|处理状态|建议阅读位置或用途|
|---|---|---|---|---|
|M05 [00-NVIDIA Certified Associate备考指南.pdf](https://drive.google.com/file/d/1n3peovn8mdWxcNrF89cUawZj65lr_hTB/view?usp=drivesdk)|P4|版本未核；正文语言未核|已定位，未逐页核验|先看目录与版本信息；不替代当前官方2026指南。|
|M06 [01-essential-ai-knowledge.pdf](https://drive.google.com/file/d/1c_Oz3Ajem73lyWlpTeeILXOR3xDc4aGL/view?usp=drivesdk)|P2|版本未核；正文语言未核|目录/主题映射，待逐项核验|Day1补强候选；先查AI/ML/DL、行业场景相关小节，页码待核。|
|M07 [02-nvidia-software-stack.pdf](https://drive.google.com/file/d/1ab3ilujbrSpsYd_4M3pNxNaUHz84qpRH/view?usp=drivesdk)|P1|版本未核；正文语言本次未核|已读相关章节并对照官方|Day3/4：物理3–8页；围绕软件职责和调用关系读，不背dump或必出题量。|
|M08 [03-gpu-cpu-architecture.pdf](https://drive.google.com/file/d/1CVot8UU81uaCuPtrDrMD3dV2JkNrdfrw/view?usp=drivesdk)|P2|版本未核；正文语言未核|目录/主题映射，待逐项核验|Day2补强候选；CPU/GPU、显存与带宽相关小节，页码待核。|
|M09 [04-ai-hardware-and-scaling.pdf](https://drive.google.com/file/d/1nruFbzkvcdguADvzntWdbCHMNhqaWnBK/view?usp=drivesdk)|P1|版本未核；缓存抽样为英文|10页抽取文本已读；非逐句全量核验|Day5：重点物理2、5–8页；核对GPU选型、扩展和系统组件。|
|M10 [05-datacenter-power-cooling-facility.pdf](https://drive.google.com/file/d/1nIpHguc2PoUAQyLSRcw5evK99_ZNgmwq/view?usp=drivesdk)|P1|版本未核；缓存抽样为英文|8页抽取文本已读；已登记PUE/阈值纠错|Day5：重点物理1–6页；先掌握PUE分子分母和供电散热条件。|
|M11 [06-networking-for-ai.pdf](https://drive.google.com/file/d/1JCCAuLW7x_JUVUjmwIfbpsDJJnr_dmT6/view?usp=drivesdk)|P1|版本未核；缓存抽样为英文|11页抽取文本已读；已登记网络边界纠错|Day6：重点物理1–9页；按通信对象区分网络/互联，再看适用条件。|
|M12 [07-datacenter-management-monitoring.pdf](https://drive.google.com/file/d/1KsminMP_--vyYJrYQRIurt0KEcI_4gES/view?usp=drivesdk)|P1|版本未核；正文语言本次未核|9页完整抽取文本已读；未逐页视觉验版|Day7：重点物理2–5、7、9页；指标、趋势与管理工具职责。|
|M13 [08-orchestration-scheduling-virtualization.pdf](https://drive.google.com/file/d/1jDIcg23sQjWXr7fNKxdNx483-FydD-uz/view?usp=drivesdk)|P1|版本未核；正文语言本次未核|12页完整抽取文本已读；未逐页视觉验版|Day8：重点物理1–5、7–8页；调度、GPU Operator、MIG/vGPU及版本条件。|
|M14 [09-NCA-AIIO备考材料.pptx](https://docs.google.com/presentation/d/19-uFNnXDRfMqtgJ5x7tXQrNc69pOvZvM/edit?usp=drivesdk&ouid=103349805082703775078&rtpof=true&sd=true)|P2|版本未核；正文语言未核|仅定位，未深入加工|需要另一种讲解时先读目录；再抽当前薄弱主题，页码待核。|
|M15 [answer4test2.txt](https://drive.google.com/file/d/1rFmGy55T7hntJ70kLgiDIlh_fANTp_NL/view?usp=drivesdk)|P3|版本/正文语言未核|仅定位，答案对应关系未核|与test2逐题匹配后再审题；本文件不单独作为答案依据。|
|M16 [NCA-AIIO-中文学习指南 PDF.pdf](https://drive.google.com/file/d/1N6QFAFRBv7vu6csD6XGG037BgGGvZxF7/view?usp=drivesdk)|P4|文件名标中文；正文/版本本次未核|原目录副本已定位；不能仅凭名称绑定旧2024版|先核版本；已明确的旧2024指南不得继续作当前范围基线。|
|M17 [NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view?usp=drivesdk)|P1|具体发行版未核；缓存抽样为英文；160物理页|全书主题定位/文字抽取；相关页细读及部分图表核对|按当前Day讲义的“讲义位置”回读。Day3按卡分读104–106、122–127、141（集成示意）、149；Day5/6见基础设施证据；Day7/8见运维证据。非从头重读的强制任务。|
|M18 [nvt-certification-exam-study-guide-aiio-web.pdf](https://drive.google.com/file/d/1RjLM3eR6ObJK5duheuQyg5aysbJtKl-m/view?usp=drivesdk)|P4|版本未核；正文语言未核（英文文件名不能证明语言）|原目录副本已定位，未重新核对版本|先核发布日期和22项编号；范围基线使用上方官方2026链接。|
|M19 [test1.txt](https://drive.google.com/file/d/1BKvbZr9iyXKwM9qpycbqdqsaVgq8Wb8y/view?usp=drivesdk)|P3|版本/正文语言未核|仅定位，未全量审题|先与Word卷/合集核对来源和重复关系；经审题后才选作练习。|
|M20 [test2.txt](https://drive.google.com/file/d/1PktTmFtecOFWCi9SiTsQmerJpkxjTVPc/view?usp=drivesdk)|P3|版本/正文语言未核|仅定位，未全量审题|先核题干与answer4test2对应关系；不要直接继承答案字母。|
|M21 [test3.txt](https://drive.google.com/file/d/14lcf4Fa5qiu6okVch7yGfLcsZ2xmsYJj/view?usp=drivesdk)|P3|版本/正文语言未核|仅定位，未全量审题|先与同名DOCX及Word卷Test3核对；题号不能单独证明相同版本。|

### C. 模拟测试目录（12个）

|编号与原文件|优先级|版本与语言证据|处理状态|建议阅读位置或用途|
|---|---|---|---|---|
|M22 [考试试卷_100题.docx](https://docs.google.com/document/d/1QGTCJpRRo1ts8GSNsVqSSNvMraOHDeOw/edit?usp=drivesdk&ouid=103349805082703775078&rtpof=true&sd=true)|P3|版本/正文语言未核|仅目录清点，未全量审题|先与Word卷/TXT/其他日期卷核重；页码、题数和答案正确性待核，通过审题后才选练习。|
|M23 [考试试卷_test2.docx](https://docs.google.com/document/d/1lYWEyjHQLKJEKTdYi-mq8u8-mTvxylqa/edit?usp=drivesdk&ouid=103349805082703775078&rtpof=true&sd=true)|P3|版本/正文语言未核|仅目录清点，未全量审题|先与Word卷/TXT/其他日期卷核重；页码、题数和答案正确性待核，通过审题后才选练习。|
|M24 [考试试卷_test3.docx](https://docs.google.com/document/d/1vuLHr-hhF-YaO4HY3yLdbfSX6RGIryb7/edit?usp=drivesdk&ouid=103349805082703775078&rtpof=true&sd=true)|P3|版本/正文语言未核|仅目录清点，未全量审题|先与Word卷/TXT/其他日期卷核重；页码、题数和答案正确性待核，通过审题后才选练习。|
|M25 [nca-aiio-2026-03-31.pdf](https://drive.google.com/file/d/1aB1JbatBD2sSqsRfQc5W7-cV8BlqWj3A/view?usp=drivesdk)|P3|文件名含日期；实际版本/正文语言未核|仅目录清点，未全量审题|先与Word卷/TXT/其他日期卷核重；页码、题数和答案正确性待核，通过审题后才选练习。|
|M26 [nca-aiio-2026-05-20.pdf](https://drive.google.com/file/d/1H3M-oX5sKkSlVNTpFAH3KxIgSWmf3eZu/view?usp=drivesdk)|P3|文件名含日期；实际版本/正文语言未核|仅目录清点，未全量审题|先与Word卷/TXT/其他日期卷核重；页码、题数和答案正确性待核，通过审题后才选练习。|
|M27 [nca-aiio-2026-06-18.pdf](https://drive.google.com/file/d/14I6tpolLveMWsHe1cjzYGH64RbXU7xH9/view?usp=drivesdk)|P3|文件名含日期；实际版本/正文语言未核|仅目录清点，未全量审题|先与Word卷/TXT/其他日期卷核重；页码、题数和答案正确性待核，通过审题后才选练习。|
|M28 [nca-aiio-2026-07-05.pdf](https://drive.google.com/file/d/1O9UAI-HfAzQKVN7ne0OPyclgAS4RyFxI/view?usp=drivesdk)|P3|文件名含日期；实际版本/正文语言未核|仅目录清点，未全量审题|先与Word卷/TXT/其他日期卷核重；页码、题数和答案正确性待核，通过审题后才选练习。|
|M29 [nca-aiio-2026-08-09.pdf](https://drive.google.com/file/d/1zsoQydX_-Yk8W97JJg56HJwvEdRwKasZ/view?usp=drivesdk)|P3|文件名含日期；实际版本/正文语言未核|仅目录清点，未全量审题|先与Word卷/TXT/其他日期卷核重；页码、题数和答案正确性待核，通过审题后才选练习。|
|M30 [NCA-AIIO.pdf](https://drive.google.com/file/d/1CQyzG7pqU5r5KeZ0Nt6dtE3gZJ5E28r-/view?usp=drivesdk)|P3|版本/正文语言未核|仅目录清点，未全量审题|先与Word卷/TXT/其他日期卷核重；页码、题数和答案正确性待核，通过审题后才选练习。|
|M31 [NVIDIA_NCA-AIIO_50题中英双语模拟题库.pdf](https://drive.google.com/file/d/1PxDCODs3hSDs7mXyvPBh8NZFY6uR0Lkb/view?usp=drivesdk)|P3|文件名标中英双语/50题；正文语言和题数未核|仅定位，未全量审题|可作双语场景候选；先核翻译、题干、干扰项及答案再用于试测。|
|M32 [NVIDIA_NCP-AII_75题模拟题库.pdf](https://drive.google.com/file/d/1ehXizhXBSda0Ul9ffM4YTvWv-Tejgbpo/view?usp=drivesdk)|P4|文件名标NCP-AII/75题，版本/语言/题数未核|仅定位，另一级认证材料|从NCA必学和计分清单排除；仅在用户另选NCP路线时评估。|
|M33 [practice-exams合集.docx](https://docs.google.com/document/d/1To6dG4xndEamZAMI-xm8RIdchQCqCVoC/edit?usp=drivesdk&ouid=103349805082703775078&rtpof=true&sd=true)|P3|版本/正文语言未核|仅目录清点，未全量审题|先与Word卷/TXT/其他日期卷核重；页码、题数和答案正确性待核，通过审题后才选练习。|

### D. 视频目录（17个）

视频表只是入口。尚未核实音轨、完整时长、字幕匹配和每段实际覆盖，不能据文件名给出必看时间码。

|编号与原文件|优先级|版本与语言证据|处理状态|建议阅读位置或用途|
|---|---|---|---|---|
|M34 [Course NVIDIA 0.mp4](https://drive.google.com/file/d/1TjCKHW0_4eDrdfcb10vWr4Zhu4o7b__W/view?usp=drivesdk)|P2|音轨/字幕语言、发行版和时长未核|仅目录清点，未逐段观看|先核对视频标题和相应字幕；有当前薄弱点时按关键词定位，时间码待核。|
|M35 [Course NVIDIA 1.mp4](https://drive.google.com/file/d/1cloCobkdM6JHwQ47C5-XoKDYziepo9Pu/view?usp=drivesdk)|P2|音轨/字幕语言、发行版和时长未核|仅目录清点，未逐段观看|先核对视频标题和相应字幕；有当前薄弱点时按关键词定位，时间码待核。|
|M36 [Course NVIDIA 2.mp4](https://drive.google.com/file/d/15BcyZvHCVgJ024D1QJTmbG1zunfiS4Ap/view?usp=drivesdk)|P2|音轨/字幕语言、发行版和时长未核|仅目录清点，未逐段观看|先核对视频标题和相应字幕；有当前薄弱点时按关键词定位，时间码待核。|
|M37 [Course NVIDIA 3.1.mp4](https://drive.google.com/file/d/1PMfl79OkCOEGh0rS_LAlQ5POVtt8FVRc/view?usp=drivesdk)|P2|音轨/字幕语言、发行版和时长未核|仅目录清点，未逐段观看|先核对视频标题和相应字幕；有当前薄弱点时按关键词定位，时间码待核。|
|M38 [Course NVIDIA 3.2.mp4](https://drive.google.com/file/d/1IrIYqU4kFU_PCVSP756Yl-6AciHBeufe/view?usp=drivesdk)|P2|音轨/字幕语言、发行版和时长未核|仅目录清点，未逐段观看|先核对视频标题和相应字幕；有当前薄弱点时按关键词定位，时间码待核。|
|M39 [Course NVIDIA 3.3.mp4](https://drive.google.com/file/d/1WWcqNeJwViecI7EvGWxK9hRWXTho7DJw/view?usp=drivesdk)|P2|音轨/字幕语言、发行版和时长未核|仅目录清点，未逐段观看|先核对视频标题和相应字幕；有当前薄弱点时按关键词定位，时间码待核。|
|M40 [Course NVIDIA 4.mp4](https://drive.google.com/file/d/114MGUb0VyOHgKRcbI_IDxdTPZ17EZr7i/view?usp=drivesdk)|P2|音轨/字幕语言、发行版和时长未核|仅目录清点，未逐段观看|先核对视频标题和相应字幕；有当前薄弱点时按关键词定位，时间码待核。|
|M41 [Course NVIDIA 5.mp4](https://drive.google.com/file/d/1GKhml1zfYT9VnnIMKlTjduxjP0f_kWXc/view?usp=drivesdk)|P2|音轨/字幕语言、发行版和时长未核|仅目录清点，未逐段观看|先核对视频标题和相应字幕；有当前薄弱点时按关键词定位，时间码待核。|
|M42 [Course NVIDIA 6.mp4](https://drive.google.com/file/d/1ujMMZP8GGkn0hZs_Gd_nHZAKygCkaKnh/view?usp=drivesdk)|P2|音轨/字幕语言、发行版和时长未核|仅目录清点，未逐段观看|先核对视频标题和相应字幕；有当前薄弱点时按关键词定位，时间码待核。|
|M43 [Course NVIDIA 7.1.mp4](https://drive.google.com/file/d/168DOx_0qY7P_nIX2uNHNO6onLn1CELX9/view?usp=drivesdk)|P2|音轨/字幕语言、发行版和时长未核|仅目录清点，未逐段观看|先核对视频标题和相应字幕；有当前薄弱点时按关键词定位，时间码待核。|
|M44 [Course NVIDIA 7.2.mp4](https://drive.google.com/file/d/17P-0RwM1TKcLyrvYByjqRG-tOtoZt6uH/view?usp=drivesdk)|P2|音轨/字幕语言、发行版和时长未核|仅目录清点，未逐段观看|先核对视频标题和相应字幕；有当前薄弱点时按关键词定位，时间码待核。|
|M45 [Course NVIDIA 7.3.mp4](https://drive.google.com/file/d/1HS1RPARZOQn-1ZfFbaSOlrEoPeEyWWsz/view?usp=drivesdk)|P2|音轨/字幕语言、发行版和时长未核|仅目录清点，未逐段观看|先核对视频标题和相应字幕；有当前薄弱点时按关键词定位，时间码待核。|
|M46 [Course NVIDIA 7.4.mp4](https://drive.google.com/file/d/1mIJ6XxAVj3i9iPgye5O4RhDmTgVETkGR/view?usp=drivesdk)|P2|音轨/字幕语言、发行版和时长未核|仅目录清点，未逐段观看|先核对视频标题和相应字幕；有当前薄弱点时按关键词定位，时间码待核。|
|M47 [Course NVIDIA 8.1.mp4](https://drive.google.com/file/d/1yRUvLsR8vnfKYTNiQkdwwkzYUoBCnLoj/view?usp=drivesdk)|P2|音轨/字幕语言、发行版和时长未核|仅目录清点，未逐段观看|先核对视频标题和相应字幕；有当前薄弱点时按关键词定位，时间码待核。|
|M48 [Course NVIDIA 8.2.mp4](https://drive.google.com/file/d/1aYs6LFcMER9zLrwZheub5cTgven6O5Ww/view?usp=drivesdk)|P2|音轨/字幕语言、发行版和时长未核|仅目录清点，未逐段观看|先核对视频标题和相应字幕；有当前薄弱点时按关键词定位，时间码待核。|
|M49 [Course NVIDIA 8.3.mp4](https://drive.google.com/file/d/1rfoA5GSOA6j786katKfGitr_SJFx17Ha/view?usp=drivesdk)|P2|音轨/字幕语言、发行版和时长未核|仅目录清点，未逐段观看|先核对视频标题和相应字幕；有当前薄弱点时按关键词定位，时间码待核。|
|M50 [Course NVIDIA 8.4.mp4](https://drive.google.com/file/d/1O6ds_UWVWClPjWciHkigcTBtUyHffuun/view?usp=drivesdk)|P2|音轨/字幕语言、发行版和时长未核|仅目录清点，未逐段观看|先核对视频标题和相应字幕；有当前薄弱点时按关键词定位，时间码待核。|

### E. 字幕目录（28个）

主题与Day的关系依据现有标题提出，属于检索候选；尚未读正文、校正翻译或与视频逐段对齐。字幕不得直接当作已核验官方讲义。

|编号与原文件|优先级|版本与语言证据|处理状态|建议阅读位置或用途|
|---|---|---|---|---|
|M51 [00-课程概览.srt](https://drive.google.com/file/d/1_uvrKJSyz_TXe6EVIv3rpQmCidDDJPlR/view?usp=drivesdk)|P2|中文标题；正文语言、翻译来源及版本未核|仅目录清点，未校对字幕正文/视频对应|先看课程目标与单元结构，定位与NCA范围的关系。 精确时间码待核。|
|M52 [01-单元1-AI推动各行业转型.srt](https://drive.google.com/file/d/1OuD3xjALDUjjTk0HXHj_3gNfxTB3Oej3/view?usp=drivesdk)|P2|中文标题；正文语言、翻译来源及版本未核|仅目录清点，未校对字幕正文/视频对应|Day1/4候选：行业问题、AI用途、收益与限制。 精确时间码待核。|
|M53 [02-单元2-人工智能简介.srt](https://drive.google.com/file/d/1zXv_CEWBAnyxASIg1F3tS-O0CC1ZYmzW/view?usp=drivesdk)|P2|中文标题；正文语言、翻译来源及版本未核|仅目录清点，未校对字幕正文/视频对应|Day1候选：AI、ML、DL定义与关系。 精确时间码待核。|
|M54 [03-单元3.1-生成式AI概览.srt](https://drive.google.com/file/d/1gYB7kXPLRR78kqMCQsFZKLG_gVA2vp5A/view?usp=drivesdk)|P2|中文标题；正文语言、翻译来源及版本未核|仅目录清点，未校对字幕正文/视频对应|Day1候选：生成任务、输入输出和适用场景。 精确时间码待核。|
|M55 [03-单元3.2-用生成式AI生成图像.srt](https://drive.google.com/file/d/1sdB6jcGF1hjgZCN731Crusw-Ujpj1Coi/view?usp=drivesdk)|P2|中文标题；正文语言、翻译来源及版本未核|仅目录清点，未校对字幕正文/视频对应|Day1候选：生成任务、输入输出和适用场景。 精确时间码待核。|
|M56 [03-单元3.3-生成式AI之外.srt](https://drive.google.com/file/d/14mChVBR7CBwCJbTLPUBRx6nYIAUtp-Ym/view?usp=drivesdk)|P2|中文标题；正文语言、翻译来源及版本未核|仅目录清点，未校对字幕正文/视频对应|Day1候选：生成任务、输入输出和适用场景。 精确时间码待核。|
|M57 [04-单元4-使用GPU加速AI.srt](https://drive.google.com/file/d/1I-U7l_KDDwlo2aijFB1JqRrcuONZJYfl/view?usp=drivesdk)|P2|中文标题；正文语言、翻译来源及版本未核|仅目录清点，未校对字幕正文/视频对应|Day2候选：并行、计算瓶颈与加速条件。 精确时间码待核。|
|M58 [05-单元5-AI软件生态系统.srt](https://drive.google.com/file/d/15ABcnjeUf3qJr-upn0XjRgeYQs8ynXZd/view?usp=drivesdk)|P2|中文标题；正文语言、翻译来源及版本未核|仅目录清点，未校对字幕正文/视频对应|Day3/4候选：驱动、CUDA、库、框架与部署工具职责。 精确时间码待核。|
|M59 [06-单元6-数据中心与云计算.srt](https://drive.google.com/file/d/14aipqRmQe0pQCmu-vPhr-5CCXyN_xfnq/view?usp=drivesdk)|P2|中文标题；正文语言、翻译来源及版本未核|仅目录清点，未校对字幕正文/视频对应|Day5候选：数据中心组件、云与本地的约束。 精确时间码待核。|
|M60 [07-单元7.1-数据中心平台.srt](https://drive.google.com/file/d/1udn-zYmPTlRHHaiqHu1Q0Spuc8zH89WR/view?usp=drivesdk)|P2|中文标题；正文语言、翻译来源及版本未核|仅目录清点，未校对字幕正文/视频对应|Day5/6候选：组件、CPU/GPU、多GPU或DPU；先核标题与正文对应。 精确时间码待核。|
|M61 [07-单元7.2-数据中心的GPU和CPU.srt](https://drive.google.com/file/d/16hVBWusx0oYGOA-BoMMEly_GekrwJ21U/view?usp=drivesdk)|P2|中文标题；正文语言、翻译来源及版本未核|仅目录清点，未校对字幕正文/视频对应|Day5/6候选：组件、CPU/GPU、多GPU或DPU；先核标题与正文对应。 精确时间码待核。|
|M62 [07-单元7.3-多GPU系统.srt](https://drive.google.com/file/d/1Ehig1u0p7tvQvZuoV9icV8jCguUbp1zl/view?usp=drivesdk)|P2|中文标题；正文语言、翻译来源及版本未核|仅目录清点，未校对字幕正文/视频对应|Day5/6候选：组件、CPU/GPU、多GPU或DPU；先核标题与正文对应。 精确时间码待核。|
|M63 [07-单元7.4-DPU简介.srt](https://drive.google.com/file/d/1jf1_lGtoWqoPZ6XHQCIB8HQMt8dCy-bB/view?usp=drivesdk)|P2|中文标题；正文语言、翻译来源及版本未核|仅目录清点，未校对字幕正文/视频对应|Day5/6候选：组件、CPU/GPU、多GPU或DPU；先核标题与正文对应。 精确时间码待核。|
|M64 [08-单元8-面向AI的网络.srt](https://drive.google.com/file/d/1a5ZjSL39zPxOTS-849szx1ykppk1iyjl/view?usp=drivesdk)|P2|中文标题；正文语言、翻译来源及版本未核|仅目录清点，未校对字幕正文/视频对应|Day6候选：网络协议、互联对象与产品职责；先核总篇/分篇重复。 精确时间码待核。|
|M65 [08-单元8.1-面向AI的网络.srt](https://drive.google.com/file/d/1fwFJt0N9t_GaGGemtwR12tMK2Gj1_T9G/view?usp=drivesdk)|P2|中文标题；正文语言、翻译来源及版本未核|仅目录清点，未校对字幕正文/视频对应|Day6候选：网络协议、互联对象与产品职责；先核总篇/分篇重复。 精确时间码待核。|
|M66 [08-单元8.2-InfiniBand与Ethernet.srt](https://drive.google.com/file/d/1gGur9EhroCOLHg0TlP6En6_bnoY8wtz8/view?usp=drivesdk)|P2|中文标题；正文语言、翻译来源及版本未核|仅目录清点，未校对字幕正文/视频对应|Day6候选：网络协议、互联对象与产品职责；先核总篇/分篇重复。 精确时间码待核。|
|M67 [08-单元8.3-NVIDIA网络产品组合.srt](https://drive.google.com/file/d/1pitO9bUP8wBt0YlWMXPZBQS-Ds6Utbbx/view?usp=drivesdk)|P2|中文标题；正文语言、翻译来源及版本未核|仅目录清点，未校对字幕正文/视频对应|Day6候选：网络协议、互联对象与产品职责；先核总篇/分篇重复。 精确时间码待核。|
|M68 [09-单元9-面向AI的存储.srt](https://drive.google.com/file/d/1Ckhw9pHACSHJv-rOYg-kcqLU5LFGQwF1/view?usp=drivesdk)|P2|中文标题；正文语言、翻译来源及版本未核|仅目录清点，未校对字幕正文/视频对应|Day5/6补强候选：存储吞吐、数据供给与训练瓶颈。 精确时间码待核。|
|M69 [10-单元10-节能计算.srt](https://drive.google.com/file/d/1m9PGbXh0pQs0M8w8TqlWWAnWs8TNgWgW/view?usp=drivesdk)|P2|中文标题；正文语言、翻译来源及版本未核|仅目录清点，未校对字幕正文/视频对应|Day5补强候选：能效、PUE与性能/能耗权衡。 精确时间码待核。|
|M70 [11-单元11-参考架构.srt](https://drive.google.com/file/d/1uBv-g5Jo_mwSxDAkBqNSF2STAk6P2tLY/view?usp=drivesdk)|P2|中文标题；正文语言、翻译来源及版本未核|仅目录清点，未校对字幕正文/视频对应|跨模块补强候选：组件关系、需求约束与参考架构。 精确时间码待核。|
|M71 [12-单元12.1-云端AI.srt](https://drive.google.com/file/d/1IHoZXSNJJszvuFiVrdjFiAgtIU9plkB3/view?usp=drivesdk)|P2|中文标题；正文语言、翻译来源及版本未核|仅目录清点，未校对字幕正文/视频对应|Day5及跨模块补强候选：云用例、数据/成本约束与服务模式。 精确时间码待核。|
|M72 [12-单元12.2-云端AI简介.srt](https://drive.google.com/file/d/1fFLQ0zeG0TSP0kiDzuo_h6Zg7Rd60h-o/view?usp=drivesdk)|P2|中文标题；正文语言、翻译来源及版本未核|仅目录清点，未校对字幕正文/视频对应|Day5及跨模块补强候选：云用例、数据/成本约束与服务模式。 精确时间码待核。|
|M73 [12-单元12.3-云端AI用例.srt](https://drive.google.com/file/d/1aNY_tsFrvhHyGjuizLgTt13Uzm02PpVs/view?usp=drivesdk)|P2|中文标题；正文语言、翻译来源及版本未核|仅目录清点，未校对字幕正文/视频对应|Day5及跨模块补强候选：云用例、数据/成本约束与服务模式。 精确时间码待核。|
|M74 [12-单元12.4-云端AI注意事项.srt](https://drive.google.com/file/d/16Lvivi7sKlxosH01BDSTEk_D5ELc1OwZ/view?usp=drivesdk)|P2|中文标题；正文语言、翻译来源及版本未核|仅目录清点，未校对字幕正文/视频对应|Day5及跨模块补强候选：云用例、数据/成本约束与服务模式。 精确时间码待核。|
|M75 [12-单元12.5-支持的云服务提供商与消费模型.srt](https://drive.google.com/file/d/1ptGhjhcw_qVJG06XjZIfMkO5CLun1VpI/view?usp=drivesdk)|P2|中文标题；正文语言、翻译来源及版本未核|仅目录清点，未校对字幕正文/视频对应|Day5及跨模块补强候选：云用例、数据/成本约束与服务模式。 精确时间码待核。|
|M76 [12-单元12.6-NVIDIA云端解决方案.srt](https://drive.google.com/file/d/1CuCWcwWPj9EJoieFX-6VZLb6aPRMfXvR/view?usp=drivesdk)|P2|中文标题；正文语言、翻译来源及版本未核|仅目录清点，未校对字幕正文/视频对应|Day5及跨模块补强候选：云用例、数据/成本约束与服务模式。 精确时间码待核。|
|M77 [13-单元13-管理与监控.srt](https://drive.google.com/file/d/1F4h1u4oJKtZ7f24E_aPdvK-AC7DTocDd/view?usp=drivesdk)|P2|中文标题；正文语言、翻译来源及版本未核|仅目录清点，未校对字幕正文/视频对应|Day7候选：监控、工具职责、指标与证据不足的判断。 精确时间码待核。|
|M78 [14-单元14-编排MLOps和作业调度.srt](https://drive.google.com/file/d/1vwR9o09ZpsG4Om2gvH6-5Bjtn48mP_U9/view?usp=drivesdk)|P2|中文标题；正文语言、翻译来源及版本未核|仅目录清点，未校对字幕正文/视频对应|Day8候选：编排、MLOps与作业调度的职责。 精确时间码待核。|

### F. 当前项目入口与历史副本

以下项目产物另计，不包含在上面的78个原资料文件中。

|入口|用途与边界|
|---|---|
|[共享内容 JSON](../content/nca-content-v0.2.json)|当前运行卡片、题目、答案、来源与考点关系的维护入口；实际数量与版本以此文件为准|
|[考点覆盖表](exam-coverage-v0.2.md)|从共享内容生成；检查基础映射和缺口，不能把“已有（基础）”当所有变式覆盖|
|[Day1](day-01-lesson-v0.2.md) / [Day2](day-02-lesson-v0.2.md) / [Day3](day-03-lesson-v0.2.md) / [Day4](day-04-lesson-v0.2.md)|当前入门单元与原讲义页码入口；若共享内容后续变化，以当前共享内容为准|
|[Day5](day-05-lesson-v0.2.md) / [Day6](day-06-lesson-v0.2.md) / [Day7](day-07-lesson-v0.2.md) / [Day8](day-08-lesson-v0.2.md)|当前基础设施与运维单元；阅读时同时看对应纠错证据|
|[基础设施证据](batch2-infrastructure-evidence.md) / [运维证据](batch2-operations-evidence.md)|主讲义细读页、图表核对位置和具体纠错；不等于全书审校|
|[旧题库14题审查](question-bank-audit-v0.2-batch2.md) / [逐题记录](../content/question-bank-review-v0.2.json)|保留原题、原答案、处置与依据；抽样不估算整库错误率，不继承“官方真题”身份|
|[真实学习测试备忘](test-notes/study-desk-test-notes-2026-09-22.md)|Test notes only；既有ChatGPT学习来源与即时/延迟证据边界，不充当全部应用成绩|
|[content目录说明](../content/README.md)|两份batch2作者片段是冻结加工来源，不是当前维护入口|
|[交付说明](content-release-v0.2.md)|查看当前交付和限制；软件测试通过与学习效果分开|

云端入口：[项目根目录](https://drive.google.com/drive/folders/1BjdYFIVmdxl-aDHojhxUsw8dQrqHNox5)、[共享内容](https://drive.google.com/file/d/1ntuIHDgPX54UtI7VzVCKCHa8ww-mNiOo/view)、[docs目录](https://drive.google.com/drive/folders/1SWn66glVNzyXe8pfD_7qBEPldH2rCoAP)。本次清点确认这些入口可列、主JSON当时元数据大小与本机相同；没有据此断言每个云端文件实时同步。让ChatGPT审阅时应报告实际读到的文件/版本、只见目录和无法访问项，不能将“有访问入口”写成“已读完整项目”。

本机原资料完整目录尚未定位；项目中 `tmp/sources` 是阅读缓存，含原讲义PDF、抽取文本及部分截图。网页内嵌内容、桌面生成模块、冻结作者片段、课程讲义与历史ZIP不得重复计作独立知识来源。原 `knowledge-base` 个人笔记页保留；导航继续使用现有文件，不复制另一套课程。

### 仍需核实的关系与后续顺序

1. **先用学习表现定位缺口，再补材料。** 对当前Day安排解释、辨析和新场景试用，记录即时理解、延迟回忆、陌生题迁移和语言困难；这些证据真实发生后才更新学习状态。
2. **再审准备使用的题。** Word/TXT/HTML/PDF之间可能转录或重复；先确定原题版本与答案链，再做语义核重。题数不能跨格式直接相加，答对旧题也不证明独立迁移。
3. **视频与字幕先对齐再推荐。** 视频可见0–8命名，字幕延伸至14；可能是编号/拆分差异，也可能材料不全，目前UNKNOWN。7.1和7.2字幕元数据同为13,905字节，只是待核重线索；同大小不能认定内容相同。
4. **版本先核再定重点。** 旧2024中文指南继续停用作当前考纲；本次未将某个仅同名的云端副本强行绑定为该旧版。当前基线仍按P0来源核对；产品参数、支持矩阵和命令细节按适用版本查证。
5. **按需维护本导航。** 用户本轮批准的是教学试用与导航落地。后续新增事实核验、题目准入或学习结论需有实际证据；没有实质变化不改写，不把本清单当作全资料审校完成报告。
