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

<!-- NCA teaching revision: 2026-10-02-day02-batch1 -->

## 本课与原教材：怎样搭配着学

当前主课：用容量、带宽、计算能力以及吞吐/延迟分别判断问题，避免把“更快GPU”当通用结论。

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

<!-- NCA_TEACHING_END -->
