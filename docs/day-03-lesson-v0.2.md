# Day 3｜驱动、CUDA、计算库与容器

状态：首批可学习内容；非官方课程、非官方真题；不推定学习者已掌握。
建议：20分钟读核心并做3题；45分钟读解释并做6题；60分钟含展开说明与10题。时间为建议，按实际耗时调整。

## 从应用到GPU的软件分层
**目标：** 把应用、框架、库、驱动与硬件串起来。
**一句话：** 驱动连接GPU与系统，上层框架和库共同组织计算。

讲义从应用、框架/库、CUDA、驱动向下连接硬件。操作系统管理系统资源，驱动提供与设备交互的能力，框架组织模型和训练过程。层次用于理解职责，不表示所有程序都经过完全相同的调用链。

**术语：** Application / Framework / Library / GPU Driver / Operating System
**易混淆：** 驱动不是模型或cuDNN；DGX OS也不是所有GPU服务器唯一可用的操作系统。
**场景：** 示例：主机看到GPU而应用不能用，仍需核对依赖与兼容，不能只凭此判断硬件坏。
**进一步理解：** 只认职责，不做生产安装或重启。
**考点关联：** 1.1, 1.7
**讲义位置：** 104–106、122
**核验/补充说明：** 讲义“最新2025”版本不作为当前考试固定要求。
- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view)｜每卡另附物理页码；本轮原始文件160页｜第三方教材
- [CUDA Linux Installation Guide](https://docs.nvidia.com/cuda/cuda-installation-guide-linux/index.html)｜Introduction/Toolkit/system requirements｜官方
- [GPU容器前置要求](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html)｜Prerequisites/Configuration｜官方

## CUDA、Toolkit与运行时
**目标：** 区分平台、开发工具与运行依赖。
**一句话：** CUDA是并行计算平台/编程模型；Toolkit是开发工具与库集合。

CUDA让程序表达GPU并行任务。Toolkit提供编译、调试、分析工具及相关库。运行时支持应用调用GPU能力。编译新程序与运行已构建应用所需的依赖并不完全相同。

**术语：** CUDA / CUDA Toolkit / Runtime / Compiler / nvcc
**易混淆：** 安装驱动不等于装齐开发工具；没有编译器也不自动证明不能运行预构建应用。
**场景：** 示例：编译CUDA程序需要核对工具链；运行现成GPU容器需核对主机驱动与运行依赖。
**进一步理解：** 本轮不背命令；先知道每种工具在解决哪一层问题。
**考点关联：** 1.1
**讲义位置：** 122–124
**核验/补充说明：** 以下官方依据为概念核对与必要扩展，不将整理文字冒充官方原文。
- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view)｜每卡另附物理页码；本轮原始文件160页｜第三方教材
- [CUDA Linux Installation Guide](https://docs.nvidia.com/cuda/cuda-installation-guide-linux/index.html)｜Introduction/Toolkit/system requirements｜官方
- [CUDA Compatibility](https://docs.nvidia.com/deploy/cuda-compatibility/why-cuda-compatibility.html)｜驱动与CUDA软件兼容｜官方

## cuDNN、cuBLAS、NCCL各做什么
**目标：** 由任务辨别对应库。
**一句话：** cuDNN偏深度学习算子，cuBLAS偏线性代数，NCCL偏GPU通信。

cuDNN提供深度神经网络相关高性能基础运算；cuBLAS提供GPU线性代数；NCCL提供多GPU和多节点的集合通信。这些库可被框架调用，不是互相替代的整套应用。

**术语：** cuDNN / cuBLAS / NCCL / All-reduce
**易混淆：** NCCL是软件通信库，NVLink是互联技术；cuDNN不是数据中心管理界面。
**场景：** 示例：协同训练汇总GPU计算结果会涉及NCCL；矩阵运算可涉及cuBLAS，而不是让DCGM取代计算库。
**进一步理解：** 社区题库的cuDNN答案错配单独留证，不将错答案导入本课程。
**考点关联：** 1.1
**讲义位置：** 122、125–127、149
**核验/补充说明：** 以下官方依据为概念核对与必要扩展，不将整理文字冒充官方原文。
- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view)｜每卡另附物理页码；本轮原始文件160页｜第三方教材
- [同事提供：02-nvidia-software-stack.pdf](https://drive.google.com/file/d/1ab3ilujbrSpsYd_4M3pNxNaUHz84qpRH/view)｜第3–8页｜第三方教材
- [NVIDIA cuDNN](https://docs.nvidia.com/deeplearning/cudnn/latest/)｜深度神经网络基础算子｜官方
- [NVIDIA cuBLAS](https://developer.nvidia.com/cublas)｜GPU线性代数库｜官方
- [NVIDIA NCCL](https://developer.nvidia.com/nccl)｜多GPU/多节点通信｜官方

## 容器怎样使用GPU
**目标：** 区分打包依赖与访问设备。
**一句话：** 容器组织应用依赖，GPU访问仍需要兼容主机驱动和运行配置。

NVIDIA Container Toolkit提供构建和运行GPU加速容器的工具。镜像可携带框架和用户态依赖，但真实GPU不在镜像里面。官方前置要求包括主机驱动、支持的容器引擎以及相应配置。

**术语：** Container / Image / Host / NVIDIA Container Toolkit
**易混淆：** 有Docker不等于任何容器自动看到GPU；有镜像不等于可以忽略主机兼容性。
**场景：** 示例：主机工具能看GPU而容器看不到，应考虑设备暴露、运行时和版本配置，尚不能唯一定位故障。
**进一步理解：** 只做分层判断，不在生产设备执行配置。
**考点关联：** 1.1, 1.7
**讲义位置：** 141（集成示意）
**核验/补充说明：** 以下官方依据为概念核对与必要扩展，不将整理文字冒充官方原文。
- [同事提供：02-nvidia-software-stack.pdf](https://drive.google.com/file/d/1ab3ilujbrSpsYd_4M3pNxNaUHz84qpRH/view)｜第3–8页｜第三方教材
- [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/index.html)｜Overview｜官方
- [GPU容器前置要求](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html)｜Prerequisites/Configuration｜官方

## 兼容性不是全部装最新
**目标：** 知道该核对哪些条件。
**一句话：** GPU、系统、驱动、CUDA和上层库需要匹配支持关系。

官方安装与兼容文档列出GPU、OS、编译环境和驱动等条件。不同组件不必版本数字一致，也不能任意搭配。应按实际应用的要求核对，而不是只用最新或相同数字作判断。

**术语：** Compatibility / Driver / Toolkit / Framework / Support matrix
**易混淆：** 能看到GPU不证明全部应用依赖正确；版本不同也不必然不兼容。
**场景：** 示例：新镜像启动失败，先核对镜像、GPU和驱动条件，而不是直接升级客户生产驱动。
**进一步理解：** 仅解释原则，不提供具体升级版本推荐。
**考点关联：** 1.1, 1.7
**讲义位置：** 106、122–124
**核验/补充说明：** 以下官方依据为概念核对与必要扩展，不将整理文字冒充官方原文。
- [CUDA Linux Installation Guide](https://docs.nvidia.com/cuda/cuda-installation-guide-linux/index.html)｜Introduction/Toolkit/system requirements｜官方
- [CUDA Compatibility](https://docs.nvidia.com/deploy/cuda-compatibility/why-cuda-compatibility.html)｜驱动与CUDA软件兼容｜官方
- [GPU容器前置要求](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html)｜Prerequisites/Configuration｜官方

## 原创练习（先作答再看解析）

### 1. 软件栈中，哪个组件直接支持操作系统与GPU设备交互？（单选）
题目ID：`Q-D03-001`
A. NGC资源目录
B. GPU驱动
C. 模型训练框架
D. 模型权重

### 2. CUDA最准确属于哪类？（单选）
题目ID：`Q-D03-002`
A. GPU集群监控平台
B. 模型服务调度器
C. 并行计算平台与编程模型
D. 多GPU集合通信库

### 3. cuDNN是什么？（单选）
题目ID：`Q-D03-003`
A. GPU加速的深度神经网络基础运算库
B. 数据中心管理用户界面
C. 容器编排集群
D. 多GPU集合通信库

### 4. GPU基础线性代数运算最直接关联哪个？（单选）
题目ID：`Q-D03-004`
A. NGC
B. DCGM
C. cuBLAS
D. BMC

### 5. 训练任务需要在多个GPU之间执行All-reduce等集合通信，最直接用到哪个？（单选）
题目ID：`Q-D03-005`
A. cuBLAS
B. NCCL
C. cuDNN
D. TensorRT

### 6. 哪两组对应正确？（多选）
题目ID：`Q-D03-006`
A. NCCL—通信软件库
B. cuDNN—管理界面
C. NVLink—互联技术
D. CUDA Toolkit—GPU芯片

### 7. GPU容器的正确理解是？（单选）
题目ID：`Q-D03-007`
A. 镜像内有真实GPU
B. 容器消除兼容问题
C. 装Docker就保证任意容器看到GPU
D. 仍需兼容主机驱动及运行配置

### 8. 同一主机在主机端能使用GPU，但某个容器不能。优先核查哪项最有依据？（单选）
题目ID：`Q-D03-008`
A. 直接判定GPU硬件损坏
B. 容器GPU访问配置、镜像依赖与驱动兼容性
C. 直接增加模型训练轮次
D. 把所有容器统一改成更大批次

### 9. 上线前选择驱动、CUDA软件和应用组合，最合理的原则是？（单选）
题目ID：`Q-D03-009`
A. 所有组件都升到最新即视为兼容
B. 所有组件版本数字相同即视为兼容
C. 按支持矩阵核对GPU、OS、驱动与应用要求
D. 镜像已经打包便无需核查主机

### 10. 编译CUDA程序与运行预构建应用有什么区别？（单选）
题目ID：`Q-D03-010`
A. 工具依赖一定完全相同
B. 运行必需源代码
C. 装驱动就是装齐开发工具
D. 应分别核对编译工具与运行依赖

## 答案与解析

### 1. B
驱动是系统与设备交互的基础组件。
A：NGC提供资源目录。
B：正确：驱动连接操作系统与硬件。
C：框架通过下层组件组织计算。
D：权重是模型参数。
关联卡：`card-stack-driver`；依据：TRAIN, CUDA, CONTAINER-INSTALL

### 2. C
CUDA服务于表达和执行并行计算。
A：监控不是CUDA的主要定义。
B：不能把CUDA等同服务调度。
C：正确。
D：这一职责更直接对应NCCL。
关联卡：`card-cuda-toolkit`；依据：TRAIN, CUDA, COMPAT

### 3. A
cuDNN不是管理界面，不能沿用第三方错配答案。
A：正确：不是管理界面。
B：这是原题库中需要纠正的错配选项。
C：不是容器编排器。
D：NCCL主要处理集合通信。
关联卡：`card-cuda-libraries`；依据：TRAIN, NOTE02, CUDNN, CUBLAS, NCCL

### 4. C
cuBLAS提供线性代数能力。
A：资源目录。
B：GPU管理。
C：正确。
D：带外管理组件。
关联卡：`card-cuda-libraries`；依据：TRAIN, NOTE02, CUDNN, CUBLAS, NCCL

### 5. B
NCCL提供GPU间通信操作。
A：线性代数运算库。
B：正确：集合通信软件库。
C：神经网络基础运算库。
D：推理优化与运行。
关联卡：`card-cuda-libraries`；依据：TRAIN, NOTE02, CUDNN, CUBLAS, NCCL

### 6. A / C
区分软件库、互联与开发工具。
A：正确。
B：cuDNN是计算库。
C：正确。
D：Toolkit是软件。
关联卡：`card-cuda-libraries`；依据：TRAIN, NOTE02, CUDNN, CUBLAS, NCCL

### 7. D
打包依赖不能替代硬件与驱动。
A：硬件不在镜像内。
B：兼容仍重要。
C：设备暴露需配置。
D：正确。
关联卡：`card-gpu-containers`；依据：NOTE02, CONTAINER, CONTAINER-INSTALL

### 8. B
这是分层线索，不直接决定唯一原因。
A：现有信息不足以判定硬件损坏。
B：正确：先检查容器与主机之间的访问/兼容条件。
C：训练轮次不能解决设备可见性。
D：批次不解决容器设备访问。
关联卡：`card-gpu-containers`；依据：NOTE02, CONTAINER, CONTAINER-INSTALL

### 9. C
兼容性由支持条件决定。
A：最新不保证相互支持。
B：不同组件版本号不必一致。
C：正确。
D：镜像不消除主机依赖。
关联卡：`card-compatibility`；依据：CUDA, COMPAT, CONTAINER-INSTALL

### 10. D
开发和运行依赖不同。
A：未必。
B：许多产物已构建。
C：驱动职责不同。
D：正确。
关联卡：`card-cuda-toolkit`；依据：TRAIN, CUDA, COMPAT

## 口述自检
框架、计算库、CUDA、驱动和容器各在解决哪一层问题？
口述自检不自动计分；答后讲解不能冒充独立首次作答。

本批新增问题由AI按上述材料编制并对照；没有独立人工二审。和此前聊天内容重合不代表未见新题。历史首次成绩继续保留，不在这里导入或改写。

<!-- NCA_TEACHING_START -->

<!-- NCA teaching revision: 2026-10-02-day03-batch1 -->

## 本课与原教材：怎样搭配着学

当前主课：先学驱动、框架、工具、运行依赖、库与容器的职责，再用短答验证；外链不是学懂本课的前提。

何时先用主课：如果能说明构建与运行的条件不同、容器为何仍需主机支持、计算与通信为何不同，本轮可先完成主课练习。仍说不清关系时，先请求补讲再选一张原图。

原教材：原讲义物理104–106、122–127、141、149页帮助看到软件分层与集成图；主课把图中箭头展开成因果解释。

具体差异：当前课程补了源码/编译/运行时的先备解释和兼容反例；原讲义不是完整兼容支持矩阵。

- [CUDA Compatibility](https://docs.nvidia.com/deploy/cuda-compatibility/why-cuda-compatibility.html)：CUDA Compatibility → Why CUDA Compatibility，开头应用、Toolkit与驱动关系
  - 阅读任务：仍分不清构建与运行条件时对照第二节；先看主课照片程序例子。
  - 停止条件：能说明当前是构建源码还是运行已有应用即可返回，不进入真实版本安装。
  - 来源边界：官方文档用于核对本问题；不用阅读整份指南或执行其中命令。
- [NVIDIA NCCL](https://developer.nvidia.com/nccl)：NCCL产品页 → 集合通信（collective communication）介绍
  - 阅读任务：只核对交换/合并结果与本地计算的区别，回第三节的2与3求和例子。
  - 停止条件：能说明为何各卡算完还需要通信即可返回，不读编程接口。
  - 来源边界：官方文档用于核对本问题；不用阅读整份指南或执行其中命令。
- [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/index.html)：NVIDIA Container Toolkit → Overview；需要时看安装页Prerequisites
  - 阅读任务：只核对容器工具的用途和主机还需提供什么，对应第四、五节。
  - 停止条件：列清镜像内软件与主机条件即可返回，不执行安装命令。
  - 来源边界：官方文档用于核对本问题；不用阅读整份指南或执行其中命令。

遇到具体型号、版本、指标字段或真实操作时，打开对应知识卡中的官方依据，只查与问题有关的定义/支持条件；不把官方网站全站作为当天作业。

原目录的视频与字幕可作为补讲候选，但当前只完成目录级清点，未逐段核对；本课不指定未经核验的时间码或宣称看完某段即可覆盖考点。

完成这里的基础目标，只说明可以继续本课学习；不代表考试范围已完整覆盖、已掌握或能直接进行生产操作。

## Day 3 主课与理解练习：把软件职责讲清楚

状态：已批准试用；学习效果待验证；用户批准日期：2026-09-25。

先读完整主课，再精选少量理解练习输入自己的回答；原知识卡用于复习速查，官方链接用于依据追溯和选读。短诊断可选，不作为开始学习的门槛；参考要点支持回答后的对照，不能替代针对实际回答的反馈。

### 需要理解到什么程度

- 沿着工单分类案例理解软件栈的前置词义，用自己的话说明应用、框架、库、运行依赖、驱动与硬件如何分工。
- 通过构建和运行两种交付情境，解释源码、编译器与预构建应用的区别，再区分 CUDA、Toolkit 和驱动。
- 先看实际工作，再辨认计算库与通信库的典型用途；不只把产品名配对。
- 说清镜像内的软件与主机提供的条件，理解 GPU 容器能解决什么、还不能保证什么。
- 读懂简化支持条件后写出自己的判断和理由，并通过反馈明确尚未理解之处，不以题目全对替代解释。

## Day 3 主课｜一个 GPU 应用为什么需要这么多软件

今天沿着一个维修工单分类应用，把软件栈中的角色讲清楚。你不需要先读完官方文档，也不需要会写 CUDA 程序；先用下面五节正文建立关系，再输入少量自己的解释。原知识卡用于学后速查，来源链接用于查证和选读。本课的设备与故障情境都是教学假设。

- 先回接 Day 2：模型已经训练完成，用它给新工单分类属于推理。本课研究这次计算怎样在 GPU 上运行；模型是否准确、服务是否够快，是另一些需要验证的问题。
- 先分清对象：模型包含处理输入的结构与学到的参数；应用组织接收工单、准备输入、调用模型与显示类别；运行环境是应用执行所需的软件和硬件条件。有模型文件、有可用应用、有合适环境，是三件事。
- 概念地图分三层：任务过程是“接收→整理→计算→返回”；软件分工说明谁承担什么；交付条件说明是否需要构建、是否用镜像及主机需提供什么。过程图不是所有软件必须经过的固定调用链。
- 今天抓住五个问题：谁组织应用？程序如何从源码变成可运行的东西？库解决哪类计算？容器打包了什么？不同组件怎样才算兼容？
- 先学中文含义，再对应英文名称。遇到术语时先问它负责什么，不要求一遍记住所有缩写。
- 可直接开始主课。短诊断只在你想检查旧印象时选做；不会答不影响继续学习，也不把做完诊断当成入课条件。

### 一、先认识软件栈：同一个任务，为什么需要不同角色（核心）

假设同事提交一条“服务器间歇性断网”的工单，应用返回一个待人工核对的类别。我们关心的是：这段文字怎样变成计算，再怎样得到结果。GPU 提供计算能力，但它并不知道工单业务规则；模型权重保存学到的参数，也不会自己接收工单、准备输入并展示答案。

应用（Application）围绕用户目标组织工作，例如接收文字、检查格式、调用模型并显示类别。框架（Framework）提供组织模型与计算的通用能力，开发者不用从零实现每个环节。框架可支持训练，也可支持推理；不能因为叫“训练框架”，就以为它不能运行已有模型。

库（Library）是一组可以由其他软件调用的现成能力。假设许多程序都要做矩阵计算，让每个团队各写一套既费力又容易出错；把经过优化的实现放进库，应用或框架就可以复用。框架与库的分工可先理解为“组织模型怎样算”和“提供某些具体运算”，但实际产品能力可能交叉，不能按名称强行划出绝对边界。

操作系统管理程序与资源。程序使用GPU时，需要使用设备内存、安排数据、发起计算并取得结果，由运行时、驱动、操作系统与硬件配合。GPU驱动提供系统使用设备的基础支持；框架组织模型计算，库提供相关运算实现。先区分“模型怎样算”和“系统怎样使用设备”，不要求追踪底层调用，也不把所有动作归给驱动。

这些角色合在一起，被称为软件栈（Software stack）。画层次图是为了看清职责和依赖，不是宣称每个应用都必须按“框架→某一个库→某一个运行时”的同一条路线执行。有的程序经框架调用库，有的直接使用 CUDA 能力；本课先理解关系，不追踪真实程序的每一次函数调用。

#### 沿着工单走一遍

第一步，应用接收工单并把它整理成模型能处理的输入；这是业务流程与输入处理。第二步，已有模型进行计算，框架和相关库可以帮助组织与执行这些运算；这是模型计算。

第三步，程序通过所需的软件支持使用 GPU，主机的驱动与硬件参与完成设备侧工作。第四步，应用把计算结果整理成人能看懂的类别。CPU 仍可参与输入处理、控制和结果整理，不会因为使用 GPU 就消失。

如果应用根本没有读到工单文件，检查模型计算库通常不是第一步；如果环境不满足 GPU 使用条件，仅换一份模型权重也不能保证解决。先说清失败发生在哪类工作，才能选对核查方向。

- “装了驱动”与“训练好了模型”解决不同问题；前者不证明后者已经发生。
- “框架可调用库”不等于“每个模型都一定调用同一个库”；具体实现需要具体证据。
- 一个阶段成功，只证明该次路径的一部分条件成立，不证明应用全流程或全部硬件永远正常。

**这一节带走：** 先用动词认角色：应用组织业务，框架组织模型计算，库提供可复用能力，驱动支持系统使用设备。能说明各自为何存在，比背一串名称更重要。

<details>
<summary>依据与选读</summary>

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [CUDA Linux Installation Guide](https://docs.nvidia.com/cuda/cuda-installation-guide-linux/index.html) — Introduction/Toolkit/system requirements
- [CUDA Compatibility](https://docs.nvidia.com/deploy/cuda-compatibility/why-cuda-compatibility.html) — 驱动与CUDA软件兼容

CUDA Installation Guide for Linux → “1. Overview”：只看 CUDA 平台与 Toolkit 的总览，回答“平台与具体工具是什么关系”；不用进入安装命令。

CUDA Compatibility → “Why CUDA Compatibility”：看开头关于 Toolkit、应用与驱动的说明，回答“构建程序和运行程序分别依赖什么”。

培训讲义（TRAIN）保留为主题组织来源，本节不布置额外原文阅读；当前技术条件用上述官方资料查证。

</details>

### 二、源码、编译与运行：拿到的东西不同，所需工具也不同（核心）

先看你拿到什么。甲拿到的是一个 GPU 照片处理程序的源码，还需要把它做成可用的程序；乙拿到的是别人已经构建好的照片处理应用，只想打开一张照片并加上模糊效果。两人都可能使用 GPU，但眼前要完成的工作不同，所以不能只问一句“装了 CUDA 没有”。

甲的过程是“源码 → 构建工具处理 → 可交付的程序产物”。编译是构建中的一种转换：编译工具读取源码，把它转换为后续可执行或继续构建的形式。对 CUDA 源码，甲要检查相应的编译工具和开发依赖；CUDA Toolkit 通常提供这类工具、相关库以及调试分析工具。这里先认清工具负责哪一步，不要求写代码或背命令。

乙的过程是“已构建应用 + 它所需的运行条件 → 启动 → 处理照片”。预构建（prebuilt）只表示交付前已做过构建工作，不表示乙的电脑什么软件都不用准备。应用仍可能需要某些库、可配合的驱动和 GPU；缺了它实际要用的一项，照样可能启动或计算失败。

CUDA Runtime 是供程序调用的一组现成 CUDA 功能，由 cudart 软件库实现，并随 CUDA Toolkit 提供。它不是一块硬件，也不是泛指“运行需要的一切”。看一个具体动作：本例照片应用准备把照片交给 GPU 处理时，可以调用 Runtime 提供的 cudaMalloc 函数，请求“在 GPU 显存里留出这么大一块空间”；Runtime 库通过底层驱动支持完成这项设备内存分配。程序还可调用相应的 Runtime 函数搬运数据、发起 GPU 计算。不必背函数名，先理解它是程序实际会调用的软件组件。

把三个常被混在一起的动作放回过程：编译处理程序源码；训练用数据调整模型参数；推理用已有模型处理新输入。一个已经构建好的应用可以执行训练，也可以执行推理；“程序已经构建”不等于“模型已经训练好”。是否在做训练或推理，要看应用实际怎样使用模型，不能仅凭有没有编译器判断。

再看名字相近的东西。CUDA 是让开发者表达和组织 NVIDIA GPU 并行计算的平台与编程模型；CUDA Toolkit 是能取得编译工具、库等具体软件的工具集合；CUDA Core 是 GPU 内部的硬件计算单元。说“用 CUDA”可能在说编程方式，问“有没有编译工具”则要核查实际工具，两者不是同一件东西。

编译工具与 CUDA Runtime 职责不同，却并不互斥：Toolkit 既提供把源码转换成程序产物的编译工具，也提供程序运行时会调用的 Runtime 库。甲在同一台电脑上开发并试运行照片程序，就可能同时需要两者。交付给乙时，Runtime 库可以被合入程序，也可以作为单独的库文件随应用提供；因此乙没有安装整套 Toolkit 或编译器，不等于应用没有 Runtime。运行 CUDA 功能仍需要兼容驱动，Runtime 不能替代驱动，驱动也不能自动补齐应用缺少的库。

用两张清单判断更稳妥：要从源码制作，检查编译工具与开发依赖；要运行已有应用，检查它实际要求的库、驱动和硬件。两张清单可以重叠，但不能相互代替。本课先解释职责，具体版本和安装方式再按应用要求与官方支持说明核查。

#### 同一个照片程序：开发者改程序，使用者换照片

先看典型过程。甲写好“给照片加模糊效果”的 CUDA 源码，用编译工具配合开发依赖构建应用，再试运行。若甲修改了处理像素的程序逻辑，就需要重新构建相应程序产物；缺少编译工具时，可能卡在这一步。

乙安装甲交付的应用，打开一张照片，点击“模糊”。应用按已有程序逻辑申请 GPU 显存、准备图像数据并发起计算，驱动与 GPU 参与完成设备侧工作，最后显示处理后的照片。乙换另一张照片只是换了输入，通常不需要亲自重新编译整个程序。这说明为什么同一开发机可能既有编译器又有 Runtime，而使用者可以只具备该应用实际需要的运行组件。

只改变一个条件：假设这份应用依赖单独提供的 Runtime 库文件，但安装时漏了这个文件。即使乙的驱动仍兼容，应用也可能启动失败。此时应核查缺失的库，不能只凭“装了驱动”认定软件齐全，也不能把编译器当成这个库的替代品。

理解典型过程后，再看例外：某些应用会在运行中编译一部分 GPU 代码或扩展，驱动也可能按实际硬件进一步编译所交付的中间代码。因此“预构建”不保证运行中完全没有编译；具体需要哪些编译组件，要看应用要求。这样的编译工作，与 CUDA Runtime 提供内存申请等调用的职责不同。

- 没有编译器，不足以证明预构建应用不能运行；有编译器，也不足以证明所有运行依赖已经满足。
- 源码编译、模型训练是不同过程：前者处理程序表达，后者通过数据学习模型参数。
- CUDA Core 是硬件；CUDA 是平台/编程模型；Toolkit 是工具与库集合。读到 CUDA 一词时要结合上下文。

**这一节带走：** 先问“这次要构建程序，还是使用已有程序”，再分别列开发条件与运行条件。不要用一张安装清单回答所有问题。

<details>
<summary>依据与选读</summary>

- [CUDA Linux Installation Guide](https://docs.nvidia.com/cuda/cuda-installation-guide-linux/index.html) — Introduction/Toolkit/system requirements
- [CUDA Compatibility](https://docs.nvidia.com/deploy/cuda-compatibility/why-cuda-compatibility.html) — 驱动与CUDA软件兼容
- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页

CUDA Installation Guide for Linux → “3.3. Verify the System Has gcc Installed”与“3.5. Download the NVIDIA CUDA Toolkit”：分别看开发/运行的区别和 Toolkit 包含什么；只读说明，不执行命令。

CUDA Compatibility → “Why CUDA Compatibility”：看前两段，回答“运行预构建应用为什么仍可能需要兼容驱动与适当的库”。

培训讲义（TRAIN）仅作本课主题线索；本节的编译与运行区别已在正文展开，不要求另读整份讲义。

</details>

### 三、计算库与通信库：把名称对应到真实工作（核心）

模型处理工单时，文字需要先表示成数值，后续包含很多数值运算。你现在不用学矩阵公式；先把矩阵理解为按行列组织的一组数，矩阵运算则按规定组合这些数。GPU 可以加速其中适合并行的工作，软件库负责提供可调用的运算实现。

cuBLAS 提供 GPU 加速的基础线性代数能力，例如向量和矩阵运算。cuDNN 面向深度神经网络中的基础运算，例如卷积、归一化等。“算子”可以先理解为模型计算中的一种基本操作；本课不要求展开这些操作的数学定义。认清它们都是计算能力，就不会把 cuDNN 误认成数据中心管理界面。

cuBLAS 与 cuDNN 的功能范围并非毫无交集：神经网络中也大量使用矩阵运算，cuDNN 本身也支持相关运算。学习“偏线性代数”和“偏神经网络基础运算”是帮助识别典型职责，不是规定每一次矩阵计算只能由一个固定库完成。

如果任务使用多个 GPU，仅让各自算得快还不够；某些阶段需要交换或合并各自结果。NCCL 是提供多 GPU、多节点通信操作的软件库。集合通信表示一组参与者共同完成一次数据交换或归并，而不是某一张卡独自算完所有事情。

用最简单的数字理解 All-reduce：假设两张 GPU 分别有一个数 2 和 3，本次约定做求和；完成后，两边都得到 5。这只是说明“合并结果并让参与者获得结果”的教学例子，不是在教授真实训练的全部算法。计算本地结果和组织跨 GPU 合作，因此是可区分的工作。

上例包含两项工作：将2和3合成5，以及让双方都得到5。本地计算并不会自动让各参与者知道合并结果。多GPU任务因此既需要运算，也可能需要通信；先理解为何需要交换，再把NCCL对应到这一类能力。

通信软件还要利用真实互联传送数据。NCCL 是软件能力，NVLink 等是互联技术；好比有运输通道还需要安排怎么交接数据。这个类比不表示 NCCL 只支持 NVLink，也不表示多 GPU 任务必定选用某个唯一通信库。

#### 先单卡分类，再理解多卡协作

在原来的单 GPU 工单分类案例中，框架可以使用相关运算实现完成模型计算。仅从“采用 GPU”这件事，不能推出应用必定用了 cuDNN、cuBLAS 和 NCCL 的全部能力。

为了学习协作，再增加一个独立的教学分支：团队训练同类模型，让两张 GPU 各处理不同数据，随后合并需要共享的更新。各卡先完成本地计算，之后进行通信与合并；后一个阶段可能使用 NCCL 的集合通信能力。

如果本地计算已经完成而程序在等待交换结果，只把“矩阵运算库”换个名称，并没有解释通信为何等待。我们先区分工作类别；具体性能原因仍需任务与运行证据。

- cuDNN 是计算库，不是完整训练框架或运维管理界面；框架可能调用它，但两者不是同一角色。
- NCCL 提供通信操作，不等于网络线缆或互联硬件；它也不替代本地全部数值计算。
- 识别典型职责不等于写死内部实现；不要从产品名称直接推断一段程序实际调用了什么。

**这一节带走：** 先说工作：本地做数值运算，还是让多卡交换、合并结果；再把 cuBLAS、cuDNN、NCCL 放回相应职责。

<details>
<summary>依据与选读</summary>

- [NVIDIA cuBLAS](https://developer.nvidia.com/cublas) — GPU线性代数库
- [NVIDIA cuDNN](https://docs.nvidia.com/deeplearning/cudnn/latest/) — 深度神经网络基础算子
- [NVIDIA NCCL](https://developer.nvidia.com/nccl) — 多GPU/多节点通信

cuBLAS → “Basic Linear Algebra on NVIDIA GPUs”：看开头与“cuBLAS Host API”，确认向量/矩阵运算属于哪类能力，不必阅读后续 API 变体。

NVIDIA cuDNN 首页 → “NVIDIA cuDNN”：看定义及其后的运算示例，确认它是神经网络基础运算库，并留意列表也包含矩阵乘法。

NCCL → “How NCCL Works”：看集合通信操作及可使用的互联，回答“合并各卡结果与单卡做矩阵计算有什么不同”。

</details>

### 四、容器打包了软件，为什么还要看主机（核心）

团队在开发机上把分类应用跑通后，想交给另一位同事使用。困难在于：对方机器上的框架、库和配置可能不同。容器帮助把应用及其一组软件依赖组织起来，减少“每个人手工准备一遍环境”的差异，但它没有把使用条件全部消除。

镜像（Image）可以理解为用于创建容器的软件打包模板，包含文件、依赖及启动所需的信息；容器（Container）是由镜像创建并运行的实例。主机（Host）是承载这个容器环境的机器。本课讨论常见 GPU 容器的职责，不把容器当成镜像里复制出的一台真实 GPU 服务器。

镜像可携带应用、框架和用户态库。“用户态”在这里先理解为应用进程所使用的软件部分，与主机内核及驱动所承担的底层工作区分。真实 GPU、设备访问以及主机侧驱动条件仍需环境提供；软件包不能代替这块硬件。

NVIDIA Container Toolkit 提供让容器使用 NVIDIA GPU 的相关工具与支持。官方配置流程需要合适的主机 GPU 驱动、受支持的容器引擎和相应配置。因此“安装了 Docker”只说明有一种容器工具，不能单独推出某个 GPU 应用已获得设备并具备兼容依赖。

两个Toolkit负责不同问题：CUDA Toolkit主要提供CUDA开发工具和相关库；NVIDIA Container Toolkit帮助容器环境使用NVIDIA GPU。名称相似，不意味着能相互替代。

“预构建”和“镜像”也不是互斥分类：镜像可以包含已构建应用，也可以包含开发工具。是否需要构建源码是一条维度，是否采用容器封装是另一条维度。拿到镜像仍要看装了什么、启动时做什么、主机需提供什么。

这里要分开两个问题：第一，容器有没有正确取得所需 GPU 访问能力；第二，它携带的软件与主机条件是否匹配。第一项满足后，第二项仍可能有问题。把二者都叫成“容器没装好”，会让下一步核查失去方向。

#### 把同一镜像交给另一台机器

开发机上应用成功运行。接收方拿到相同镜像，这保留了一部分软件条件；但接收方的 GPU、驱动和容器运行配置不一定与开发机相同。

若容器没获得所需设备访问，镜像里即使有框架，也不能凭空使用主机 GPU。若设备访问已经满足，但应用所需软件与驱动支持条件不匹配，仍可能无法完成计算。

所以容器的价值是更方便地组织、交付和复用环境，不是保证任意主机零检查运行。要检查的是镜像内的软件要求与镜像外的运行条件之间能否配合。

- 镜像是软件打包模板，运行中的容器是实例；二者都不是新造出的物理 GPU。
- “容器看见设备”与“目标模型完整运行成功”是不同层次的证据。
- 容器能减少环境差异，不会取消驱动、设备访问和应用兼容条件。

**这一节带走：** 用“镜像里带了什么，主机还要提供什么”来解释 GPU 容器。遇到失败时，再区分访问条件和软件支持条件。

<details>
<summary>依据与选读</summary>

- [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/index.html) — Overview
- [GPU容器前置要求](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html) — Prerequisites/Configuration
- [CUDA Compatibility](https://docs.nvidia.com/deploy/cuda-compatibility/why-cuda-compatibility.html) — 驱动与CUDA软件兼容

NVIDIA Container Toolkit → “Overview”：只看工具集的用途，回答“它帮助容器获得哪类能力”，不必背组件列表。

“Installing the NVIDIA Container Toolkit”→“Installation / Prerequisites”及“Configuration / Prerequisites”：分别确认主机驱动、容器引擎与 Toolkit 的条件；只读条件，不执行安装或重启命令。

CUDA Compatibility → “Why CUDA Compatibility”：看运行应用的条件，思考“镜像带上软件后，为什么主机侧条件仍不能省略”。

</details>

### 五、兼容性：按支持条件判断，而不是凭最新或同号猜测（核心）

兼容（Compatibility）表示特定组件在规定条件下能够配合工作。它是一种关系，不能只看某个组件自己是不是“最新”。应用可能对 GPU 能力、操作系统、驱动以及所需库提出要求；读支持说明就是把这些条件与实际环境逐项对应。

支持矩阵（Support matrix）把被支持的组件组合列成表。不同组件的版本号有各自的含义，相同数字不是通用兼容证明；数字不同也不一定冲突。例如 CUDA 与驱动存在有条件的兼容机制，本课只理解为什么需要核对，不背真实版本表。

实际核查时先确定交付物：这次是否需要从源码构建、是否以容器方式交付？再列出这份交付物要求的条件和主机已知条件，寻找不一致或尚未确认的项。应用错误信息与运行日志可帮助判断它实际停在哪一步；不能用“应该差不多”代替证据。

一个组合不在支持范围内，是需要进一步核查的重要线索，但不自动证明它是所有现象的唯一原因。反过来，列在支持范围内也不等于应用输入、配置或资源都已经正确。兼容核查回答的是部分条件是否满足，完整验收还需要实际任务的结果。

#### 先跟着分析一个例子，再做自己的练习

教学假设：软件包甲支持驱动系列 R1 和 R2，软件包乙只支持 R2；当前主机使用 R1。这里的名称和系列完全虚构，不对应任何真实安装版本。即使甲在主机上成功运行，也不能由此推出乙必定能运行。

按已知条件，乙与当前 R1 不在给定支持组合中，应优先核对乙的要求及具体失败信息。现在还不能说 GPU 硬件损坏，也不能保证把某个组件更换后所有问题都会消失；那需要进一步证据。

再改变一个条件：如果乙的全部已核实条件都匹配，仍出现错误，就继续看错误信息、应用输入与资源等线索。不要为了坚持原来的猜测，忽略新的证据。

轮到你时，先完成下方新情境题，再写一段自己的职责解释；可以回到对应小节补学。若看过例子后再答，属于有讲解后的练习，本课不会把它包装成从未见过题型的独立测试。

改变一个关键条件：教学应用支持R2/R3，当前主机是R2，但启动信息提示缺少配置文件。给定的版本条件已经符合，下一步应核对配置文件及路径；不能只因GPU应用失败就继续认定驱动不匹配。这里R2/R3仍为虚构标签，不是真实版本推荐。

- “所有组件升到最新”没有逐项回答应用需要什么，不能作为兼容检查的替代品。
- “版本数字一样”不是兼容规则；“数字不一样”也不是故障结论。
- 成功运行一个任务、发现一项不支持条件，都应限定在已有证据范围内，不扩写成唯一根因或完全掌握。

**这一节带走：** 先列事实与要求，再对照支持条件；把“有线索”和“已经证明原因”分开。知道该看什么，比背一个随版本变化的数字组合更有用。

<details>
<summary>依据与选读</summary>

- [CUDA Linux Installation Guide](https://docs.nvidia.com/cuda/cuda-installation-guide-linux/index.html) — Introduction/Toolkit/system requirements
- [CUDA Compatibility](https://docs.nvidia.com/deploy/cuda-compatibility/why-cuda-compatibility.html) — 驱动与CUDA软件兼容
- [GPU容器前置要求](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html) — Prerequisites/Configuration

CUDA Compatibility → “Why CUDA Compatibility”：看应用、驱动和库的关系及兼容类别说明，回答“为什么版本数字不必全相同”；本课不要求记真实版本组合。

CUDA Installation Guide for Linux → “3. Pre-installation Actions”：看 GPU、系统与工具条件清单，练习把“一个最新版本”改写为“多项分别核对的条件”。

“Installing the NVIDIA Container Toolkit”→“Installation / Prerequisites”及“Configuration / Prerequisites”：核对容器案例还涉及哪些主机与运行环境条件，不把支持组合当成唯一故障原因。

</details>

### 本课关系总结

- 应用、框架、库与驱动承担不同职责。用自己的话解释它们如何帮助完成工单分类，不必背一条唯一调用链。
- 编译源码和运行预构建应用需要的条件不同。Toolkit、运行依赖和驱动不是同义词；按具体应用核对。
- 把计算与协作分开：cuBLAS/cuDNN 提供典型计算能力，NCCL 提供通信能力；具体程序不一定用齐它们。
- 镜像可打包依赖，GPU 与主机运行条件仍要核查；设备访问成立不等于全部应用兼容性都成立。
- 主课后先输入少量真实回答，再对照要点说明还不清楚的地方。选择题全对、看懂解释和能独立解释，是不同的学习证据。

- 前半段：软件角色、构建与运行、计算与通信。每节复述一两句，可只选一项短答。
- 后半段：容器、兼容性与综合解释。可在另一次学习继续，保留已经写下的疑问。
- 45–60分钟是安排参考，不是已验证的个人完成时长。到自然停止点保存回答；不需要同时重做全部旧选择题。
- 第一次中文解释，随后英文两题选一题、可中文回答。看过译文后是语言练习，不冒充独立未见题。

## 理解练习

网页和桌面源码可保存原答、修改稿与点评；本 Markdown 是可读讲义，不采集回答。先学后练，允许看提示；参考解释不等于针对性点评。

### 1. 基础识别：系统如何与设备交互

试用练习ID：`P-D03-01`。

操作系统需要与 GPU 设备交互，主要由哪一层组件提供支持？再用一句话说明：它与训练框架的职责有什么区别？

<details>
<summary>完成自己的回答后，再看参考解释与核对要点</summary>

**为什么这样理解：**

驱动是支持系统使用GPU设备的软件。框架则帮助组织模型与计算：比如规定各层怎样组合、怎样使用输入得到预测。知道模型怎样算，并不等于已经具备让目标机器使用GPU的设备支持，这就是两种职责需要区分的原因。

可以用“框架组织计算，驱动支持使用设备”说明核心关系；不必背一条固定调用链。真实程序还会涉及运行时、库与硬件协作，这些补充帮助理解，不是原题新增的必答名称。

**核对要点（原评价标准）：**

- 能识别 GPU 驱动提供系统与设备交互能力。
- 能把框架组织模型或训练过程的职责与驱动区分；不要求背一条固定调用顺序。

对应知识卡：card-stack-driver；考点：1.1、1.7；相关旧题：Q-D03-001。

- [CUDA Linux Installation Guide](https://docs.nvidia.com/cuda/cuda-installation-guide-linux/index.html) — Introduction/Toolkit/system requirements
- [GPU容器前置要求](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html) — Prerequisites/Configuration

</details>

### 2. 基础识别：编译需要什么（英文，可中文答）（英文，可用中文回答）

试用练习ID：`P-D03-02`。

A team needs to compile a CUDA program from source. What kind of tool should it check for, and which software package normally provides it? You may answer in Chinese.

<details>
<summary>完成自己的回答后，再看参考解释与核对要点与译文</summary>

**题意：** 团队需要从源码编译一个 CUDA 程序。应核查哪一类工具，通常由哪个软件包提供？可以用中文回答。

**为什么这样理解：**

题目里的 from source 表示团队拿到的是程序源码，还没有完成这次构建；compile 问的是把源码转换为后续可用程序产物所需的工具。先找编译工具和相应开发依赖，通常在 CUDA Toolkit 提供的开发工具中核查。

驱动负责让系统与 GPU 设备配合，GPU 是硬件，模型权重是训练得到的数据；它们各有用途，却不能替代把 CUDA 源码编译成程序产物所需的工具。回答时说清“正在制作程序，所以查编译工具与 Toolkit”即可，不要求背命令或版本号。

**核对要点（原评价标准）：**

- 能说出需要核对编译工具等开发依赖，CUDA Toolkit 提供相关开发工具与库。
- 不把模型权重、GPU 硬件或单独安装驱动当成完整开发工具链；不要求命令或真实版本号。
- 将 compile、from source 等阅读困难与技术概念理解分开反馈。

对应知识卡：card-cuda-toolkit；考点：1.1；相关旧题：Q-D03-002、Q-D03-010。

- [CUDA Linux Installation Guide](https://docs.nvidia.com/cuda/cuda-installation-guide-linux/index.html) — Introduction/Toolkit/system requirements
- [CUDA Compatibility](https://docs.nvidia.com/deploy/cuda-compatibility/why-cuda-compatibility.html) — 驱动与CUDA软件兼容

</details>

### 3. 相近概念辨析：计算与结果合并

试用练习ID：`P-D03-03`。

一个训练任务有两项工作：① 在 GPU 上完成矩阵计算；② 把多个 GPU 各自算出的结果合并。请分别说明这两项工作需要什么能力，可各举一个支持这项工作的软件库，并说明它们的作用。

<details>
<summary>完成自己的回答后，再看参考解释与核对要点</summary>

**为什么这样理解：**

矩阵计算需要数值运算能力，cuBLAS是可调用的线性代数软件库。多卡各自计算后，结果仍分散在各自位置；把它们合并并让参与者获得结果，需要通信与归约能力，可对应NCCL。例如各卡有2和3，按求和合并后都拿到5，既发生了运算，也发生了数据交换。

cuDNN提供神经网络基础运算，不能因为名字含神经网络就认为它负责所有跨卡通信。这里用典型职责帮助选对能力，实际框架可能调用不同实现，不要求每项任务用齐这些库或由人手动调用。

**核对要点（原评价标准）：**

- 能区分进行数值计算与在多个 GPU 间通信、归约或合并结果。
- 可用 cuBLAS 对应线性代数能力、NCCL 对应集合通信能力；若提到 cuDNN，需说明它偏神经网络基础运算，不能据此替代通信职责。
- 这些是可由框架使用的不同软件能力，不是每个任务必须手工调用或必须用齐的固定清单。

对应知识卡：card-cuda-libraries；考点：1.1；相关旧题：Q-D03-003、Q-D03-004、Q-D03-005、Q-D03-006。

- [NVIDIA cuBLAS](https://developer.nvidia.com/cublas) — GPU线性代数库
- [NVIDIA NCCL](https://developer.nvidia.com/nccl) — 多GPU/多节点通信
- [NVIDIA cuDNN](https://docs.nvidia.com/deeplearning/cudnn/latest/) — 深度神经网络基础算子

</details>

### 4. 相近概念辨析：运行与编译（英文，可中文答）（英文，可用中文回答）

试用练习ID：`P-D03-04`。

A host has a compatible GPU driver. A prebuilt GPU application runs successfully, but a CUDA compiler is not installed. Is this contradictory? Explain why or why not. You may answer in Chinese.

<details>
<summary>完成自己的回答后，再看参考解释与核对要点与译文</summary>

**题意：** 主机装有兼容的 GPU 驱动，一个预构建 GPU 应用能成功运行，但没有安装 CUDA 编译器。这矛盾吗？解释原因。可以用中文回答。

**为什么这样理解：**

不矛盾。prebuilt 表示应用在交付前已经完成了构建；本题观察到它运行成功，说明这次运行所需条件已满足。编译器处理源码，既然这次只运行已经构建好的应用，就不能从“没有编译器”推断运行必定失败。

结论只针对题目给出的这次成功运行。别反过来推断驱动可以替代全部库，也别推广成任何预构建应用都永远不用编译工具：有的应用运行时仍会编译扩展。关键是先分清“现在要构建”还是“现在要运行”，再看该应用具体要求。

**核对要点（原评价标准）：**

- 能解释这并不矛盾：运行预构建应用与从源码编译程序所需的依赖并不完全相同。
- 缺少编译器不能单独证明已有应用不能运行；兼容驱动也不等于提供全部应用依赖。
- 若不理解 prebuilt 或 compiler，先标记语言困难；查看译文后的回答属于辅助作答。

对应知识卡：card-cuda-toolkit、card-stack-driver；考点：1.1；相关旧题：Q-D03-001、Q-D03-010。

- [CUDA Linux Installation Guide](https://docs.nvidia.com/cuda/cuda-installation-guide-linux/index.html) — Introduction/Toolkit/system requirements
- [CUDA Compatibility](https://docs.nvidia.com/deploy/cuda-compatibility/why-cuda-compatibility.html) — 驱动与CUDA软件兼容

</details>

### 5. 讲后近似练习：容器支持条件

试用练习ID：`P-D03-05`。

使用下方教学假设表：同一主机、同一GPU，容器A能完成计算，B启动失败；当前驱动为D1，且A/B均已正确获得GPU访问。指出B的哪项已知条件不满足，并解释为什么A成功不足以证明B可用。

教学假设：镜像与驱动支持关系

|镜像|本题假设支持的驱动系列|
|---|---|
|A|D1、D2|
|B|D2|

A/B、D1/D2 均为虚构教学标签，不对应真实产品版本；不得据此安装或升级。

<details>
<summary>完成自己的回答后，再看参考解释与核对要点</summary>

**为什么这样理解：**

按题内假设表，B只支持D2，当前D1不满足这项条件；A支持D1、D2，所以A在D1成功并不能替B证明兼容。就像同一主机上的两个程序可以有不同依赖，镜像名称不同，要求也可能不同。

题目已说明A/B都获得GPU访问，因此先比较给定的驱动支持条件即可。找出这一处不匹配，不等于证明全部故障只有一个原因；实际处理还应结合错误信息。本段是进一步解释，不因原答未主动展开全部边界而增加扣分要求。

**核对要点（原评价标准）：**

- 从表中指出B支持D2、当前D1不满足该项支持条件。
- A与B的软件要求不同，A成功只证明A本次路径可用；不要求固定列两项未知。
- 若原答把这项不满足直接说成唯一根因或主张立即升级，再追问错误信息与完整依赖；不把未主动展开边界判作错误。

对应知识卡：card-gpu-containers、card-compatibility、card-stack-driver；考点：1.1、1.7；相关旧题：Q-D03-007、Q-D03-008、Q-D03-009。

- [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/index.html) — Overview
- [GPU容器前置要求](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html) — Prerequisites/Configuration
- [CUDA Compatibility](https://docs.nvidia.com/deploy/cuda-compatibility/why-cuda-compatibility.html) — 驱动与CUDA软件兼容

</details>

### 6. 口述解释：把职责串起来

试用练习ID：`P-D03-06`。

团队拿到一个使用已有模型的 GPU 工单分类应用及其容器镜像。为什么不能保证它在任意 GPU 主机上都能运行？用自己的话从应用到硬件串起各层职责，并说出还要确认的条件。可以画图，可用几句话或分段解释，不照读卡片。

<details>
<summary>完成自己的回答后，再看参考解释与核对要点</summary>

**为什么这样理解：**

可以跟着一次工单处理走：应用收取并整理文字，已有模型在框架及相关计算库帮助下产生类别，运行依赖、驱动和硬件共同支持GPU计算，应用再显示结果。镜像可以带上应用及一些依赖，却不能带来另一台主机的真实GPU，也不能取消设备访问与驱动支持要求。

所以需要将镜像里软件的要求，与目标主机可提供的GPU、设备访问、驱动等条件相对照。题面没有要求从源码构建，不必硬加编译步骤；用自己的话解释职责和容器内外关系即可，不要求全部术语出现，更不把这段参考文字作为新的评分清单。

**核对要点（原评价标准）：**

- 能说明应用或框架组织模型计算，相关库提供计算或通信能力，运行依赖与驱动支持程序使用 GPU 硬件。
- 能解释容器打包应用依赖，但设备访问、主机驱动与软件支持条件仍要匹配。
- 题面没有要求从源码构建，不因未提编译工具就认定解释缺失；关注应用职责、容器内外及运行条件。不要求所有名称都出现或成为固定调用链。
- 若只能列名称却说不清职责与关系，反馈为关系仍需巩固；术语表达不熟与概念错误分开说明。

对应知识卡：card-stack-driver、card-cuda-toolkit、card-cuda-libraries、card-gpu-containers、card-compatibility；考点：1.1、1.7；相关旧题：Q-D03-001、Q-D03-002、Q-D03-003、Q-D03-007、Q-D03-009、Q-D03-010。

- [CUDA Linux Installation Guide](https://docs.nvidia.com/cuda/cuda-installation-guide-linux/index.html) — Introduction/Toolkit/system requirements
- [NVIDIA cuDNN](https://docs.nvidia.com/deeplearning/cudnn/latest/) — 深度神经网络基础算子
- [NVIDIA cuBLAS](https://developer.nvidia.com/cublas) — GPU线性代数库
- [NVIDIA NCCL](https://developer.nvidia.com/nccl) — 多GPU/多节点通信
- [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/index.html) — Overview
- [GPU容器前置要求](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html) — Prerequisites/Configuration
- [CUDA Compatibility](https://docs.nvidia.com/deploy/cuda-compatibility/why-cuda-compatibility.html) — 驱动与CUDA软件兼容

</details>

### 回答后的反馈

- 结论是否符合题目证据
- 能否独立说明理由和职责关系
- 是否保留未知与适用条件
- 英文阅读与技术理解分别反馈

- 先保留学习者实际回答，再对照参考要点；只评价本次表现，不把参考答案写成学习记录。
- 区分独立回答、看译文后回答、提示后修正和照着讲解复述。
- 理由不完整时只补最关键的一处，再换一个小情境检查；不通过一次修正宣布已掌握。
- 先输入实际回答，再按要点自查；自查不是自动判分，也不等于已获得逐句教学评阅。需要进一步反馈时，连同是否看过提示一起交给教学对话；延迟回忆与陌生场景迁移仍需后续真实作答证据。

这些题干与设计曾在讨论中展示；是否看过参考要点也应按实际说明。同题再次作答可用于复习，不能冒充未见题的独立测量。

### 可选回顾：5–8分钟短诊断

第6、5、2项，英文可换第4项；不是入课门槛。

- 这是可选的旧知识检查，可以直接跳过并先学主课。若选择诊断，尝试口述、新情境和一道英文短题即可，不必一次做完六项。
- 若想检查独立回忆，先收起讲解、译文和参考要点；若已经阅读主课，就按有讲解后的练习理解本次表现。英文题可以用中文回答。
- 用自己的话说出理由；不知道时说明卡在哪里，不用猜成完整答案。
- 如果已经看过某题题干、译文或要点，说明看过哪些内容；这次表现按复习或辅助作答理解，不当成全新独立测量。

## 接到 Day 4：能运行以后，还差什么

同一个工单分类模型，即使在目标主机上能返回结果，也还没有证明它能成为持续可用的服务。Day 4 沿这个案例区分数据、训练、可选优化、部署与运行反馈。

- 说清 Day 3 已检查的是软件与硬件运行条件，不是模型效果或服务容量。
- 进入 Day 4 后区分模型执行优化与对外接收请求的服务职责。
- 用准确性、响应、吞吐和运行反馈提出下一步验证问题，不把返回一次正确结果当成上线完成。

<!-- NCA_TEACHING_END -->
