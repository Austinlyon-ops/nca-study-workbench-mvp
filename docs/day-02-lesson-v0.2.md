# Day 2｜CPU/GPU、性能指标与训练推理

状态：首批可学习内容；非官方课程、非官方真题；不推定学习者已掌握。
建议：20分钟读核心并做3题；45分钟读解释并做6题；60分钟含展开说明与10题。时间为建议，按实际耗时调整。

## CPU与GPU：架构决定分工
**目标：** 解释并行吞吐和复杂控制。
**一句话：** GPU擅长大量相似计算，CPU擅长通用控制与复杂逻辑。

CPU通常重视单线程响应、缓存和控制逻辑；GPU组织大量计算线程，提高可并行任务的总体吞吐。线程在这里先理解为程序中正在执行的一路工作。假设对一张图片的每个像素分别做同样的亮度调整，许多像素的结果可独立算出，GPU可把这类计算分给许多执行单元；程序仍需要读取图片、安排工作并显示结果。若下一步必须等上一步结果，多加执行单元不等于这条依赖链消失。CPU也支持并行，GPU也执行顺序指令；区别是设计侧重点，不是两者只能做某一种事。

**术语：** CPU / GPU / Parallelism / Serial dependency
**易混淆：** 串行表示按顺序执行，前后依赖会限制并行；串行/并行与线性/非线性函数不是同一概念。CPU核心与CUDA核心不能逐个直接比较。
**场景：** 示例：审批步骤等待前一步结果，不能仅靠更强GPU获得与矩阵计算相同的加速。
**进一步理解：** 先找能并行的部分，再考虑数据读写、CPU和调度。
**考点关联：** 1.8
**讲义位置：** 28–30
**核验/补充说明：** 不背讲义4–16核为CPU上限；补充CPU也能并行的边界。
- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view)｜每卡另附物理页码；本轮原始文件160页｜第三方教材
- [CUDA Linux Installation Guide](https://docs.nvidia.com/cuda/cuda-installation-guide-linux/index.html)｜Introduction/Toolkit/system requirements｜官方
- [NVIDIA GPU Performance Background](https://docs.nvidia.com/deeplearning/performance/dl-performance-gpu-background/index.html)｜架构/性能限制｜官方

## CUDA Core与Tensor Core
**目标：** 认清硬件计算单元职责。
**一句话：** CUDA Core承担通用计算，Tensor Core重点加速矩阵乘加。

CUDA Core与Tensor Core是GPU中的硬件计算单元，不是需要下载的两个应用。神经网络里常要把一组输入数与对应权重相乘后相加，再对很多组数据重复；把数据排成行列就是矩阵，矩阵运算能表达其中许多工作。Tensor Core为受支持的矩阵乘加等特定操作提供硬件加速，CUDA Core执行其他通用算术等指令。不是所有乘法都由Tensor Core完成，也不是有它就能跳过数据读取与准备；具体使用受运算形式、数据类型和软件实现影响。RT Core用于光线追踪，不是所有数据中心GPU都有的部件。

**术语：** CUDA Core / Tensor Core / Matrix multiply-accumulate
**易混淆：** CUDA Core是硬件，CUDA平台与Toolkit是软件。Tensor Core不负责整个AI程序的所有步骤。
**场景：** 示例：矩阵计算与读取工单文件是不同工作，不能忽略数据准备。
**进一步理解：** 记职责，不背讲义10倍等缺少适用条件的宣传数字。
**考点关联：** 1.8
**讲义位置：** 72–75
**核验/补充说明：** 以下官方依据为概念核对与必要扩展，不将整理文字冒充官方原文。
- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view)｜每卡另附物理页码；本轮原始文件160页｜第三方教材
- [NVIDIA GPU Performance Background](https://docs.nvidia.com/deeplearning/performance/dl-performance-gpu-background/index.html)｜架构/性能限制｜官方

## 算力、容量、带宽分开判断
**目标：** 分辨算不快、装不下和数据送不及时。
**一句话：** 算力看计算速度，容量看装多少，带宽看每秒读写多少。

显存容量通常用GB；显存带宽用GB/s或TB/s；浮点计算能力可用TFLOPS。模型参数不是唯一占用显存的内容，输入、中间结果和训练记录也可能占用。资料装得下，也不表示计算单元不会等待数据。

**术语：** Compute / Memory capacity / Memory bandwidth / TFLOPS
**易混淆：** 相同32GB容量下只提高算力，不能单独保证装下40GB任务；显存带宽与PCIe或GPU互联带宽不是同一指标。
**场景：** 示例：运行方式不变、需求40GB而可用32GB时，先处理容量不足。
**进一步理解：** 精度、分片或卸载会影响需求，但题目未说明时不能默认存在。
**考点关联：** 1.2, 1.8, 2.1
**讲义位置：** 30、150
**核验/补充说明：** 以下官方依据为概念核对与必要扩展，不将整理文字冒充官方原文。
- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view)｜每卡另附物理页码；本轮原始文件160页｜第三方教材
- [NVIDIA GPU Performance Background](https://docs.nvidia.com/deeplearning/performance/dl-performance-gpu-background/index.html)｜架构/性能限制｜官方

## 吞吐量、延迟与批次
**目标：** 把中文理解对应英文词，再判断场景。
**一句话：** Throughput是一段时间做多少，Latency是一件事等多久。

Latency（延迟）看一条请求从提交到得到结果等了多久；Throughput（吞吐）看一段时间共完成多少条。Batch把多个输入组成一批交给模型处理，让一些准备与计算开销分摊到更多输入。例子：图片甲先到达，但服务等待其他图片凑批，再一起计算；这一批合计完成得更有效率，甲却增加了凑批等待。是否值得取决于实际任务，不是批次越大必然越好。不能从每秒处理20个直接推出每个请求只等0.05秒：多请求可能并发或排队，统计总体完成量没有告诉你每个请求何时开始等待。

**术语：** Throughput（吞吐量）/ Latency（延迟）/ Batch（批次）
**易混淆：** 吞吐提高不保证延迟降低；批次大也不保证所有场景更快。
**场景：** 示例：每秒处理更多请求，同时有些人等更久，两者并不矛盾。
**进一步理解：** 术语巩固与情境判断分开练；不把术语不熟自动等同概念错误。
**考点关联：** 1.2
**讲义位置：** 29、150
**核验/补充说明：** 以下官方依据为概念核对与必要扩展，不将整理文字冒充官方原文。
- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view)｜每卡另附物理页码；本轮原始文件160页｜第三方教材
- [TensorRT 性能优化](https://docs.nvidia.com/deeplearning/tensorrt/latest/performance/optimization.html)｜Batching/吞吐/延迟｜官方

## 训练与推理的资源需求
**目标：** 理解训练的额外工作和不同推理目标。
**一句话：** 典型训练含前向、反向和参数更新；常规推理使用已有参数。

以带标签的神经网络训练为例：输入图片→算出预测→与已知类别比较→计算参数该怎样调整→更新参数。前向计算产生的中间结果常称激活；梯度用于描述参数调整对误差的影响；优化器按更新规则使用这些信息，可能另存历史状态。本课只需理解“为了改参数，还要保存和使用额外信息”，不要求会推公式。推理通常使用现有参数完成输入到输出，不做这轮参数更新，但仍需存放参数、输入与中间结果。相近模型与条件下，训练通常更重；推理更关注响应、吞吐和服务成本。模型大小、请求量不同，不能只按训练/推理标签比较总成本。

**术语：** Forward pass / Backward pass / Gradients / Optimizer state
**易混淆：** 不能把任何训练都说成大于任何推理；训练也不必把全部历史数据同时放进显存。
**场景：** 示例：实时告警分类关心响应，夜间批量分类历史日志关心按时完成总量，二者都是推理。
**进一步理解：** 多GPU可服务容量、加速或并发目标；网络与扩展完整讨论留到后续。
**考点关联：** 1.2, 2.1
**讲义位置：** 150
**核验/补充说明：** 以下官方依据为概念核对与必要扩展，不将整理文字冒充官方原文。
- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view)｜每卡另附物理页码；本轮原始文件160页｜第三方教材
- [TensorRT 性能优化](https://docs.nvidia.com/deeplearning/tensorrt/latest/performance/optimization.html)｜Batching/吞吐/延迟｜官方

## 原创练习（先作答再看解析）

### 1. 下列哪项最能区分训练与推理？（单选）
题目ID：`Q-ORIGINAL-002`
A. 训练会使用数据和反馈更新模型参数；推理用固定参数处理新输入。
B. 推理一定不使用 GPU。
C. 训练只做一次计算，不需要迭代。
D. 二者没有资源规划差异。

### 2. 关于 CPU 和 GPU 的分工，哪些说法合理？（多选）（多选）
题目ID：`Q-ORIGINAL-003`
A. GPU 的并行结构通常适合大量相似数值计算。
B. CPU 可承担通用控制、协调和复杂逻辑。
C. 有 GPU 后，系统完全不需要 CPU。
D. GPU 只能用于训练，绝不能用于推理。

### 3. 为在线推理服务规划资源时，哪些指标通常值得重点关注？（多选）（多选）
题目ID：`Q-ORIGINAL-004`
A. 响应延迟。
B. 可承载的并发或吞吐。
C. 模型服务的稳定性。
D. 训练时每一步的反向传播次数。

### 4. 某团队需要让模型训练更快。以下哪种判断最稳妥？（单选）
题目ID：`Q-ORIGINAL-005`
A. 只要增加 GPU，任何工作负载都会按相同比例加速。
B. 应同时检查可并行的计算、数据供给、CPU 协调和目标吞吐。
C. 训练性能与数据读取无关。
D. 训练和推理的资源关注点完全相同。

### 5. 当前方式需40GB显存、可用32GB。哪项不能单独保证装得下？（单选）
题目ID：`Q-D02-001`
A. 降低实际占用
B. 只提高算力但仍32GB
C. 增加足够可用显存
D. 已验证有效的节省显存方案

### 6. 一条告警提交后等很久才收到结果，直接描述的是？（单选）
题目ID：`Q-D02-002`
A. 显存容量
B. 参数数目
C. 响应延迟
D. 每小时总产量

### 7. 同模型相近条件下，典型训练更占显存的原因是？（单选）
题目ID：`Q-D02-003`
A. 全部数据必须一次装入
B. 推理不用显存
C. 训练不用GPU
D. 梯度、优化器状态等额外记录

### 8. Tensor Core特别擅长什么？（单选）
题目ID：`Q-D02-004`
A. 矩阵乘加
B. 权限审批
C. 长期存储原文
D. 替代所有OS任务

### 9. 数据放得下，主要等显存数据读写。最应考虑什么？（单选）
题目ID：`Q-D02-005`
A. 容量不足
B. 账号不足
C. 显存带宽限制
D. 推理不能用GPU

### 10. 批处理后每秒总量提高，部分请求等更久。合理解释是？（单选）
题目ID：`Q-D02-006`
A. 不可能同时发生
B. 吞吐提高但凑批/排队可能增大延迟
C. 吞吐与延迟是同一数
D. 说明正在训练

## 答案与解析

### 1. A
训练的目标是优化参数；推理用训练后的参数产出结果。二者都可能使用 GPU，但关注的性能指标不同。
A：正确：是否更新参数是核心区别。
B：推理也常使用 GPU。
C：训练通常需要多轮迭代。
D：训练与推理关注点不同。
关联卡：`card-training-inference`；依据：TRAIN, BATCH

### 2. A / B
CPU 和 GPU 通常协同工作。GPU 常用于并行计算，CPU 负责许多通用控制与系统任务；推理同样可使用 GPU。
A：正确：这是 GPU 的典型优势。
B：正确：CPU 并未被替代。
C：错误：完整系统仍需要 CPU 等组件。
D：错误：GPU 也可加速推理。
关联卡：`card-cpu-gpu`；依据：TRAIN, CUDA, PERF

### 3. A / B / C
推理服务常关注响应时间、并发/吞吐、可用性与成本。反向传播是训练阶段用于更新参数的过程。
A：正确：用户和上游系统会感知延迟。
B：正确：服务需要处理请求规模。
C：正确：线上服务需要稳定。
D：错误：这属于训练过程。
关联卡：`card-training-inference`；依据：TRAIN, BATCH

### 4. B
GPU 是关键组件之一，但整体性能还受并行度、数据管线、CPU、存储与网络等影响。
A：错误：扩展效果取决于整体瓶颈。
B：正确：以系统视角判断更可靠。
C：错误：数据供给可能成为瓶颈。
D：错误：两类工作负载的重点不同。
关联卡：`card-cpu-gpu`；依据：TRAIN, CUDA, PERF

### 5. B
算力与容量是两种指标。
A：针对需求处理。
B：正确，容量没变。
C：针对容量。
D：题干已限定有效。
关联卡：`card-memory-compute`；依据：TRAIN, PERF

### 6. C
关心单个请求等待。
A：非容量描述。
B：无该信息。
C：正确。
D：后者偏吞吐。
关联卡：`card-latency-throughput`；依据：TRAIN, BATCH

### 7. D
训练涉及参数更新记录。
A：不必全数据同时入显存。
B：推理也需内存。
C：训练可以用GPU。
D：正确。
关联卡：`card-training-inference`；依据：TRAIN, BATCH

### 8. A
它加速特定矩阵类操作。
A：正确。
B：不属其职责。
C：非存储介质。
D：不替代CPU和OS。
关联卡：`card-gpu-units`；依据：TRAIN, PERF

### 9. C
题干给定容量够而读写供给慢。
A：与前提不符。
B：无关。
C：正确。
D：推理可以用GPU。
关联卡：`card-memory-compute`；依据：TRAIN, PERF

### 10. B
总体产量和单条等待分别衡量。
A：两种指标可以出现此变化。
B：正确。
C：维度不同。
D：不能由此判断训练。
关联卡：`card-latency-throughput`；依据：TRAIN, BATCH

## 口述自检
吞吐提高但有些人等待更久，为什么不矛盾？
口述自检不自动计分；答后讲解不能冒充独立首次作答。

本批新增问题由AI按上述材料编制并对照；没有独立人工二审。和此前聊天内容重合不代表未见新题。历史首次成绩继续保留，不在这里导入或改写。

<!-- NCA_TEACHING_START -->

<!-- NCA teaching revision: 2026-10-09-day02-full1 -->

## 本课与原教材：怎样搭配着学

当前主课：先读五节主课，按并行程度、计算单元、容量/带宽/计算以及吞吐/延迟判断虚构情境；选少量理解练习保存原答，知识卡供学后速查。避免把“更快GPU”当通用结论。

何时先用主课：能解释为何总吞吐增加不保证每条请求等待更短、数据搬运与计算不同，可先以当前内容练习；需要看硬件结构再回原图。

原教材：原讲义物理28–30、72–75、150页提供CPU/GPU、计算单元与训练推理的对照。

具体差异：原资料更偏结构/产品图；当前课程补充性能判断的条件和反例。

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view)：160页培训讲义，物理页28–30；CPU/GPU
  - 阅读任务：需要结构图时，只看CPU/GPU设计侧重，再回第一卡解释独立像素与前后依赖。
  - 停止条件：能说明为何任务并行程度影响收益后停止。
  - 来源边界：同事提供的培训讲义，不等于已认证的官方考试教材。产品条件与版本以当前官方说明为准。
- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view)：160页培训讲义，物理页72–75；计算单元
  - 阅读任务：只找CUDA Core与Tensor Core的角色，不抄代际参数或宣传倍数。
  - 停止条件：能说出硬件单元与软件程序的区别，并指出Tensor Core不加速所有工作即可返回。
  - 来源边界：同事提供的培训讲义，不等于已认证的官方考试教材。产品条件与版本以当前官方说明为准。
- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view)：160页培训讲义，物理页150；训练/推理
  - 阅读任务：只看过程区别，结合第五卡理解训练为什么保存额外信息。
  - 停止条件：能解释参数更新与额外记录的关系即可停止，不推导公式。
  - 来源边界：同事提供的培训讲义，不等于已认证的官方考试教材。产品条件与版本以当前官方说明为准。
- [TensorRT 性能优化](https://docs.nvidia.com/deeplearning/tensorrt/latest/performance/optimization.html)：Optimizing TensorRT Performance → Batching
  - 阅读任务：仅在凑批仍难理解时看等待时间与批处理说明，再回第四卡区分单条等待与总产量。
  - 停止条件：解释为何可能提高吞吐却增加等待后停止，不读后续优化。
  - 来源边界：官方文档用于核对本问题；不用阅读整份指南或执行其中命令。

遇到具体型号、版本、指标字段或真实操作时，打开对应知识卡中的官方依据，只查与问题有关的定义/支持条件；不把官方网站全站作为当天作业。

原目录的视频与字幕可作为补讲候选，但当前只完成目录级清点，未逐段核对；本课不指定未经核验的时间码或宣称看完某段即可覆盖考点。

完成这里的基础目标，只说明可以继续本课学习；不代表考试范围已完整覆盖、已掌握或能直接进行生产操作。

## Day 2 主课与理解练习：按瓶颈判断计算与性能

状态：新增试用；学习效果待验证；用户批准日期：2026-10-09。

主课以虚构批量工单与交互请求为例；短答保存原答和接触情况，不自动更新题库正确率或 FSRS。

### 需要理解到什么程度

- 能按并行程度解释 CPU/GPU 分工。
- 能区分计算单元、容量、带宽和计算能力。
- 能解释批处理可能提高吞吐却增加等待。
- 能从是否更新参数区分训练与推理，保留实测未知。

## Day 2 主课｜CPU/GPU 分工、瓶颈与训练推理

延续虚构工单助手：既要批量处理历史记录，也要及时回应单个员工。先分清任务能否并行，再看 GPU 单元、计算与数据搬运、延迟与吞吐，最后回到训练和推理。所有数值和情境仅为教学假设。

- 沿着一条请求追问：控制和分支在哪里，重复计算在哪里，数据放得下吗、送得动吗，用户等多久、系统总共做多少？
- CPU 和 GPU 是不同的计算角色；具体加速取决于任务结构、数据移动和软件实现。宣传峰值不是某个应用的实际完成时间。
- 先读主课再练短答；知识卡供复习速查，选择题仍按原规则独立计分。

### 一、CPU 与 GPU 按工作结构分工（核心）

CPU 擅长通用控制、复杂分支和协调任务。GPU 能同时处理大量相似计算，适合可拆成许多相近工作单元的负载。一个应用常由 CPU 准备、调度数据，GPU 完成适合并行的部分，而不是二者选其一。

若每一步必须等前一步的结果，或数据量很小且搬运开销显著，把任务交给 GPU 可能没有收益。先识别可并行部分及数据流，再讨论是否值得加速。

#### 批量图像与依赖链

对许多独立图像做同样变换，存在并行机会；一条必须按前一步决定下一步的小型控制流程，难以用大量并行单元同时完成。

- GPU 核心多不意味着任何单条任务都更快。
- CPU 负责调度不等于 CPU 没有计算能力。

**这一节带走：** 并行程度与搬运成本是判断起点。

<details>
<summary>依据与选读</summary>

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页

讲义结构图帮助看设计侧重，不代表所有实际程序具有相同加速比。

</details>

### 二、硬件计算单元与软件程序不要混叫（核心）

CUDA Core 和 Tensor Core 是 GPU 上承担不同计算的硬件单元；CUDA 也指开发和运行相关的软件平台。它们名字相似，却不是同一对象。需要说明是硬件能力、编程环境，还是具体应用。

Tensor Core 针对适配的矩阵运算和数据类型提供能力，并不让每一段代码自动变快。能否使用还依赖硬件型号、运算形式和软件实现。

#### 读取一条性能宣传

“有 Tensor Core”说明存在某类硬件能力；若工单程序主要在等待网络或做复杂分支，不能因此推定它的端到端响应就会变快。

- 不要把 CUDA Core 写成 CUDA 软件工具包。
- 不要把理论运算能力当成应用实测。

**这一节带走：** 先问所说的是硬件、软件还是工作负载。

<details>
<summary>依据与选读</summary>

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [CUDA Linux Installation Guide](https://docs.nvidia.com/cuda/cuda-installation-guide-linux/index.html) — Introduction/Toolkit/system requirements

讲义单元图用于区分角色，型号规格须查对应官方文档。

</details>

### 三、计算能力、显存容量与带宽分别限住什么（核心）

计算能力描述可完成运算的速度维度；显存容量关系到模型、输入和中间数据能否在设备上容纳；内存带宽关系到单位时间能移动多少数据。应用变慢或无法运行，可能分别由计算、容量或搬运造成。

“放得下”不等于“算得快”。容量不足可能使任务无法按当前方式运行，带宽不足可能让计算单元等待数据，计算不足则可能让大量运算耗时。实际判断要结合测量，不可只看单个峰值指标。

#### 大模型与数据搬运

模型与批次需要的内存超过可用容量，先是能否容纳的问题；若能容纳但计算单元常在等数据，带宽和数据访问可能是线索。

- 显存容量翻倍不等于吞吐翻倍。
- 带宽更高也不保证计算密集阶段更快。

**这一节带走：** 按容量、搬运、运算三个维度定位瓶颈。

<details>
<summary>依据与选读</summary>

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [NVIDIA GPU Performance Background](https://docs.nvidia.com/deeplearning/performance/dl-performance-gpu-background/index.html) — 架构/性能限制

性能资料用于核对概念；真实瓶颈需来自目标负载的测量。

</details>

### 四、吞吐与延迟可能朝不同方向变化（核心）

延迟描述一条请求从提交到得到结果所经历的时间；吞吐描述单位时间处理的总量。批处理把多个请求放在一起计算，可能提高设备利用率和总吞吐，但等待凑批也可能增加某些请求的延迟。

比较方案时先写服务目标：批量离线任务关心总完成量，交互问答还要关心单条等待。平均数也可能掩盖尾部等待，不能用一个“更快”代替两个指标。

#### 两条请求和一个批次

假设首条请求到达后需等第二条才成批，总体每分钟处理更多，但首条额外等候。没有实测数据时只说明“可能”，不宣布该配置最优。

- 吞吐上升不保证每条请求都更早完成。
- 延迟下降也不等于系统总产量一定增加。

**这一节带走：** 先选指标，再说明批处理引入的等待和利用率权衡。

<details>
<summary>依据与选读</summary>

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [TensorRT 性能优化](https://docs.nvidia.com/deeplearning/tensorrt/latest/performance/optimization.html) — Batching/吞吐/延迟
- [NVIDIA GPU Performance Background](https://docs.nvidia.com/deeplearning/performance/dl-performance-gpu-background/index.html) — 架构/性能限制

按需看官方批处理说明，只用来理解机制，不把示意当本应用测量。

</details>

### 五、训练和推理的资源需求按阶段看（核心）

训练利用样本计算并更新参数，通常还要保存与更新相关的中间信息；推理使用已有参数处理新输入，通常不在这次请求中更新模型。两者都可能需要大量计算，但内存与性能目标要按模型、批次、精度和实现分别核对。

推理服务可以用批处理提高总处理量，却要考虑交互等待；训练也会受数据供给和内存限制。不能因为“推理”就断言一定轻量，也不能因为“训练”就给出固定显存倍数。

#### 历史工单与新工单

用标注的历史工单更新模型参数是训练；员工提交新工单并得到预测是推理。即便模型相同，两阶段需要的工作与性能指标也不完全一样。

- 生成回答不意味着这次请求在训练。
- 只看 GPU 峰值不能决定训练或推理的实际容量。

**这一节带走：** 先确认是否更新参数，再按目标负载测量资源与响应。

<details>
<summary>依据与选读</summary>

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [TensorRT 性能优化](https://docs.nvidia.com/deeplearning/tensorrt/latest/performance/optimization.html) — Batching/吞吐/延迟

讲义阶段图用于概念对照；实际内存和性能应在目标环境验证。

</details>

### 本课关系总结

- CPU 组织通用控制，GPU 适合大量相似并行运算；收益取决于任务结构。
- 硬件单元、软件平台与程序负载要分别指认。
- 容量、带宽、计算与延迟、吞吐是不同维度；单个峰值不能证明应用效果。
- 训练更新参数，推理使用已有参数；短答只记录这次理解表现。

- 20分钟读前三节并选一道短答；余下内容可下次继续。
- 45分钟覆盖五节与一条性能情境；60分钟再对照知识卡、来源或选择题。
- 时间安排不是用户完成记录；英文题可用中文回答，看过译文应如实记录。

## 理解练习

网页和桌面源码可保存原答、修改稿与点评；本 Markdown 是可读讲义，不采集回答。先学后练，允许看提示；参考解释不等于针对性点评。

### 1. 并行性判断

试用练习ID：`P-D02-01`。

任务 A 对一批彼此独立的图像做相同变换；任务 B 每一步都依赖上一步的选择。哪项更可能受益于 GPU 大量并行工作？还需要核查什么？

<details>
<summary>完成自己的回答后，再看参考解释与核对要点</summary>

**为什么这样理解：**

GPU 擅长大量相似并行计算，因此 A 更有机会；B 的顺序依赖限制并行。是否真正更快还要看数据量、搬运与实现。

**核对要点（原评价标准）：**

- A 有更明显的并行机会。
- 提到数据搬运、软件实现或任务规模仍需验证实际收益。

对应知识卡：card-cpu-gpu；考点：1.8；相关旧题：Q-ORIGINAL-002、Q-D02-001。

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页

</details>

### 2. 硬件与软件辨析

试用练习ID：`P-D02-02`。

同事说“装了 CUDA Core 软件，所以任何程序都用上 Tensor Core”。请指出至少两处概念混淆，并说明需要什么证据才能判断程序是否受益。

<details>
<summary>完成自己的回答后，再看参考解释与核对要点</summary>

**为什么这样理解：**

CUDA Core 与 Tensor Core 是 GPU 硬件单元；CUDA 平台是软件相关概念。Tensor Core 加速特定适配运算，需核查型号、运算与程序路径，最好在目标负载中测量。

**核对要点（原评价标准）：**

- CUDA Core 和 Tensor Core 是硬件计算单元，不能称为装的软件。
- 是否用到相关运算取决于硬件支持、运算和实现，不能推定任何程序自动获益。

对应知识卡：card-gpu-units；考点：1.8；相关旧题：Q-ORIGINAL-003、Q-D02-002。

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [CUDA Linux Installation Guide](https://docs.nvidia.com/cuda/cuda-installation-guide-linux/index.html) — Introduction/Toolkit/system requirements

</details>

### 3. 定位三种限制

试用练习ID：`P-D02-03`。

虚构模型一度因显存不够无法装入；缩小批次后能运行，但计算单元经常等数据。分别对应容量、带宽或计算的哪类线索？为什么不能只报一个峰值算力？

<details>
<summary>完成自己的回答后，再看参考解释与核对要点</summary>

**为什么这样理解：**

能否容纳是容量问题；常等数据可能与带宽或访问模式有关，但需测量排除其他因素。即使峰值运算能力高，数据不到位也无法兑现。

**核对要点（原评价标准）：**

- 放不下首先是容量限制。
- 等待数据提示搬运或带宽线索，仍需测量确认。
- 峰值计算能力不能覆盖容量和数据供给。

对应知识卡：card-memory-compute；考点：2.1；相关旧题：Q-ORIGINAL-004、Q-D02-003。

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [NVIDIA GPU Performance Background](https://docs.nvidia.com/deeplearning/performance/dl-performance-gpu-background/index.html) — 架构/性能限制

</details>

### 4. 批处理与等待（英文，可中文答）（英文，可用中文回答）

试用练习ID：`P-D02-04`。

A service batches more requests and finishes more requests per minute, while some users wait longer for a reply. Is this contradictory? Explain throughput and latency separately. You may answer in Chinese.

<details>
<summary>完成自己的回答后，再看参考解释与核对要点与译文</summary>

**题意：** 服务把更多请求凑成批次，每分钟完成的请求更多，但有些用户等待回复更久。这矛盾吗？请分别解释吞吐和延迟。可以用中文回答。

**为什么这样理解：**

吞吐是单位时间完成数量，延迟是单条请求等待。凑批可让设备更忙、总量上升；较早到达的请求可能要等其他请求，因此等待变长。

**核对要点（原评价标准）：**

- 不矛盾；总处理量与单条等待时间是不同指标。
- 凑批可能提高利用率，也可能增加部分请求的排队时间。

对应知识卡：card-latency-throughput；考点：2.1；相关旧题：Q-ORIGINAL-005、Q-D02-004。

- [TensorRT 性能优化](https://docs.nvidia.com/deeplearning/tensorrt/latest/performance/optimization.html) — Batching/吞吐/延迟
- [NVIDIA GPU Performance Background](https://docs.nvidia.com/deeplearning/performance/dl-performance-gpu-background/index.html) — 架构/性能限制

</details>

### 5. 为两类负载选指标

试用练习ID：`P-D02-05`。

虚构服务夜间离线处理历史工单，白天让员工等单条回复。两段工作各优先看什么指标？如果只报告“平均每分钟处理量上升”，还缺什么用户体验证据？

<details>
<summary>完成自己的回答后，再看参考解释与核对要点</summary>

**为什么这样理解：**

批量任务可先看总处理量；交互服务还应测量单条及较慢请求的等待。吞吐上升不说明每个员工都更早得到结果。

**核对要点（原评价标准）：**

- 夜间批量关注总完成量或吞吐，白天交互关注请求延迟。
- 指出平均或尾部等待仍需测量，不能从总量推出用户体验。

对应知识卡：card-latency-throughput；考点：2.1；相关旧题：Q-D02-004、Q-D02-005。

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [TensorRT 性能优化](https://docs.nvidia.com/deeplearning/tensorrt/latest/performance/optimization.html) — Batching/吞吐/延迟

</details>

### 6. 训练与推理资源（英文，可中文答）（英文，可用中文回答）

试用练习ID：`P-D02-06`。

A team updates model parameters using labeled historical tickets, then serves predictions for new tickets. Which stage is training, which is inference, and why should capacity and latency be checked separately? You may answer in Chinese.

<details>
<summary>完成自己的回答后，再看参考解释与核对要点与译文</summary>

**题意：** 团队用带标签的历史工单更新模型参数，然后为新工单提供预测。哪一段是训练、哪一段是推理？为何要分别核查容量与延迟？可以用中文回答。

**为什么这样理解：**

历史标注数据用于更新参数，是训练；新请求用已有参数得到预测，是推理。训练和推理都需核查模型、批次与内存；交互推理还要看单条等待，不能用容量推断延迟。

**核对要点（原评价标准）：**

- 更新参数的是训练；使用已有参数处理新工单的是推理。
- 容量决定模型与工作数据能否容纳，延迟描述一次回复等待；实际要求应按阶段和负载测量。

对应知识卡：card-training-inference、card-memory-compute；考点：1.2、2.1；相关旧题：Q-D02-005、Q-D02-006。

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [NVIDIA GPU Performance Background](https://docs.nvidia.com/deeplearning/performance/dl-performance-gpu-background/index.html) — 架构/性能限制

</details>

### 回答后的反馈

- 结论与题目证据
- 能否用自己的话说明理由
- 条件和未知项
- 英文阅读与概念理解分别记录

- 先保存实际原答，再对照默认折叠的参考分析；参考分析不是自动评分，也不替代针对原答的反馈。
- 区分独立回答、看过中文译文、看过提示后修订与照着讲解复述。一次答对或改对都不记为已掌握。
- 不知道时写下卡住的位置；只针对当前缺口回读一节，再换情境解释。

本课题目与参考分析可能已在对话或页面中出现。再次作答按实际接触情况记录，不当作全新未见题。

### 可选回顾：5–8分钟短诊断

第1、4、5项，英文可换第6项；不是入课门槛。

- 可跳过诊断直接学习主课；先写直觉和理由。
- 若已看过主课、译文或参考分析，按接触过的练习记录，不冒充独立未见题。
- 英文题可中文回答，语言困难与性能概念分开反馈。

## 接到 Day 3：知道硬件能力后，软件还要配合

Day 2 讨论任务和资源。Day 3 会拆开应用、框架、计算库、CUDA、驱动与容器的职责，解释为何同一模型不能无条件在另一台主机运行。

- 带着一项明确任务和一个实际瓶颈问题进入软件栈。
- 不把计算单元、CUDA 软件和驱动混为同一层。
- 性能推断保留负载与测量条件。

<!-- NCA_TEACHING_END -->
