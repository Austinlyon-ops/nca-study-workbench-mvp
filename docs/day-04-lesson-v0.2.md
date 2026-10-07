# Day 4｜软件用途与AI开发部署生命周期

状态：首批可学习内容；非官方课程、非官方真题；不推定学习者已掌握。
建议：20分钟读核心并做3题；45分钟读解释并做6题；60分钟含展开说明与10题。时间为建议，按实际耗时调整。

## 开发到上线的四步
**目标：** 把工具放回数据、训练、优化和部署的位置。
**一句话：** 数据准备→训练→优化→部署，是讲义的入门主线。

讲义将RAPIDS对应数据处理，PyTorch/TensorFlow对应训练，TensorRT对应优化，Triton对应推理部署。这是典型组合，不代表必须用齐。上线后仍需要跟踪版本、效果和运行状态，MLOps组织这些持续工作。

**术语：** Data preparation / Training / Optimization / Deployment / MLOps
**易混淆：** 训练成功不等于服务可用；部署不能自动修好数据质量问题。
**场景：** 示例：告警分类先整理数据并训练评估，再优化部署，后续运行反馈再进入改进。
**进一步理解：** 只是参考工作流，不改动既定14日学习计划。
**考点关联：** 1.7
**讲义位置：** 146–149、157–160
**核验/补充说明：** 以下官方依据为概念核对与必要扩展，不将整理文字冒充官方原文。
- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view)｜每卡另附物理页码；本轮原始文件160页｜第三方教材
- [NVIDIA 数据科学文档](https://docs.nvidia.com/datascience/)｜RAPIDS与数据科学｜官方
- [NVIDIA TensorRT](https://docs.nvidia.com/deeplearning/tensorrt/latest/)｜推理优化和运行｜官方
- [Dynamo-Triton（原Triton Inference Server）](https://developer.nvidia.com/dynamo-triton)｜模型部署与服务｜官方

## TensorRT与Triton不是一回事
**目标：** 区分执行优化与模型服务。
**一句话：** TensorRT偏推理优化/运行；Triton偏部署和服务模型。

TensorRT为推理优化和运行提供能力。Triton服务多个框架的模型，支持批处理和并发，可使用TensorRT后端。两者可以配合，不是一个训练、另一个推理的互斥关系。

**术语：** TensorRT / Triton Inference Server / Backend / Dynamic batching
**易混淆：** 优化一个模型不等于已经实现接口、模型管理等全部服务功能。
**场景：** 示例：优化模型执行考虑TensorRT；统一对外提供多个模型的推理接口可考虑Triton。
**进一步理解：** 当前官方入口也称Dynamo-Triton；保留教材名称并注明别名，不推断考试更名。
**考点关联：** 1.1, 1.6, 1.7
**讲义位置：** 146
**核验/补充说明：** 以下官方依据为概念核对与必要扩展，不将整理文字冒充官方原文。
- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view)｜每卡另附物理页码；本轮原始文件160页｜第三方教材
- [NVIDIA TensorRT](https://docs.nvidia.com/deeplearning/tensorrt/latest/)｜推理优化和运行｜官方
- [Dynamo-Triton（原Triton Inference Server）](https://developer.nvidia.com/dynamo-triton)｜模型部署与服务｜官方

## NIM、NGC与AI Enterprise
**目标：** 从部署、获取资源与企业支持分清产品。
**一句话：** NIM是微服务，NGC是目录入口，AI Enterprise是企业软件套件。

NIM将优化推理能力包装为容器和接口。NGC帮助发现与取得优化容器、模型等资源。AI Enterprise整合软件、企业支持、安全与生命周期等生产要求。这三者可以一起使用。

**术语：** NIM / NGC Catalog / NVIDIA AI Enterprise
**易混淆：** NGC不是GPU或单一引擎；AI Enterprise不是替代Linux的操作系统；NIM不是训练一切模型的平台。
**场景：** 示例：从目录取得资源，选择推理微服务，再评估生产支持需求；下载容器不等于已获得所有企业权益。
**进一步理解：** 讲义“operating system”只作生态类比，不能当OS定义；不背未验证速度倍数。
**考点关联：** 1.1, 1.6, 1.7
**讲义位置：** 140、143
**核验/补充说明：** 以下官方依据为概念核对与必要扩展，不将整理文字冒充官方原文。
- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view)｜每卡另附物理页码；本轮原始文件160页｜第三方教材
- [同事提供：02-nvidia-software-stack.pdf](https://drive.google.com/file/d/1ab3ilujbrSpsYd_4M3pNxNaUHz84qpRH/view)｜第3–8页｜第三方教材
- [NVIDIA NIM说明](https://investor.nvidia.com/news/press-release-details/2024/NVIDIA-Launches-Generative-AI-Microservices-for-Developers-to-Create-and-Deploy-Generative-AI-Copilots-Across-NVIDIA-CUDA-GPU-Installed-Base/default.aspx)｜NIM Inference Microservices｜官方
- [NVIDIA NGC](https://www.nvidia.cn/gpu-cloud/)｜容器/模型资源目录｜官方
- [NVIDIA AI Enterprise](https://www.nvidia.com/en-us/data-center/products/ai-enterprise/)｜Overview/企业支持/NeMo｜官方

## 按用途辨认NVIDIA方案
**目标：** 按任务辨产品，不背无限品牌表。
**一句话：** 数据科学、语音、推荐、模型定制与医疗属于不同用例。

本轮代表性对应：RAPIDS用于GPU数据科学；Riva用于语音AI；Merlin用于推荐；NeMo涵盖模型训练、定制、评估等生成式AI开发；讲义以Clara说明医疗与生命科学方案。

**术语：** RAPIDS / Riva / Merlin / NeMo / Clara
**易混淆：** 行业标签不是排他关系；医疗也可使用通用模型和基础计算库。
**场景：** 示例：语音转写与商品推荐选择不同方向工具，但可共享部分底层GPU计算能力。
**进一步理解：** 1.6仍需后续DGX/HGX、网络/DPU等硬件方案补充，不称穷尽覆盖。
**考点关联：** 1.5, 1.6
**讲义位置：** 140、146
**核验/补充说明：** 以下官方依据为概念核对与必要扩展，不将整理文字冒充官方原文。
- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view)｜每卡另附物理页码；本轮原始文件160页｜第三方教材
- [同事提供：02-nvidia-software-stack.pdf](https://drive.google.com/file/d/1ab3ilujbrSpsYd_4M3pNxNaUHz84qpRH/view)｜第3–8页｜第三方教材
- [NVIDIA 数据科学文档](https://docs.nvidia.com/datascience/)｜RAPIDS与数据科学｜官方
- [NVIDIA Riva](https://developer.nvidia.com/topics/ai/generative-ai/riva)｜语音AI｜官方
- [NVIDIA Merlin](https://developer.nvidia.com/merlin)｜推荐系统｜官方
- [NVIDIA AI Enterprise](https://www.nvidia.com/en-us/data-center/products/ai-enterprise/)｜Overview/企业支持/NeMo｜官方

## 原创练习（先作答再看解析）

### 1. 按讲义的入门AI工作流，下列典型顺序最合理的是？（单选）
题目ID：`Q-D04-001`
A. 数据准备→模型训练→推理优化→部署服务
B. 模型训练→数据准备→部署服务→推理优化
C. 数据准备→部署服务→模型训练→推理优化
D. 推理优化→数据准备→部署服务→模型训练

### 2. 已有一个训练好的模型，目标是优化其推理执行，首先关注哪个组件？（单选）
题目ID：`Q-D04-002`
A. NGC
B. TensorRT
C. NCCL
D. DCGM

### 3. 已有多种框架导出的模型，想统一接收推理请求、组织批处理和并发执行，更直接对应哪个？（单选）
题目ID：`Q-D04-003`
A. cuBLAS
B. CUDA Toolkit
C. Triton Inference Server
D. NCCL

### 4. 团队既要优化模型执行，又要对外提供推理接口。TensorRT和Triton的关系应怎样理解？（单选）
题目ID：`Q-D04-004`
A. TensorRT训练模型，Triton只存模型文件
B. 选Triton就必须排除TensorRT后端
C. 二者都是相同用途的资源下载目录
D. TensorRT负责优化运行，Triton可在服务侧配合使用

### 5. 希望以预构建、GPU优化的推理微服务减少部署工作，更直接对应NVIDIA哪类能力？（单选）
题目ID：`Q-D04-005`
A. NIM
B. NCCL
C. cuBLAS
D. GPU驱动

### 6. 团队要取得GPU优化容器和模型资源，先访问哪个目录型入口？（单选）
题目ID：`Q-D04-006`
A. NIM运行实例
B. NGC
C. TensorRT引擎文件
D. 本机DCGM指标

### 7. 对NVIDIA AI Enterprise的理解，哪项最合适？（单选）
题目ID：`Q-D04-007`
A. 专门替代Linux内核的操作系统
B. 只提供容器下载、不涉及生产支持的目录
C. 面向企业生产的AI软件套件及支持
D. 只负责矩阵乘法的基础计算库

### 8. 哪两组方案与典型用途对应正确？（多选）
题目ID：`Q-D04-008`
A. Merlin—推荐系统
B. Riva—GPU集群监控
C. RAPIDS—GPU数据科学
D. cuBLAS—语音微服务平台

### 9. 需要语音识别与语音合成，哪个方案最直接匹配？（单选）
题目ID：`Q-D04-009`
A. Merlin
B. Riva
C. RAPIDS
D. NCCL

### 10. 模型训练达到预定指标，距离可持续运行的生产服务还需要考虑什么？（单选）
题目ID：`Q-D04-010`
A. 只需把训练正确率直接作为上线后的全部监控指标
B. 只要导出模型文件就完成后续生命周期
C. 优化工具能自动代替所有部署和运行验证
D. 部署验证、运行监控与版本/效果管理

## 答案与解析

### 1. A
四步按任务目标组织，实际项目可以迭代。
A：正确：实际流程可迭代，但这是本课顺序。
B：训练依赖准备好的数据。
C：服务上线不应替代训练与验证。
D：优化通常针对已有模型。
关联卡：`card-ai-lifecycle`；依据：TRAIN, RAPIDS, TRT, TRITON

### 2. B
TensorRT面向推理优化与运行。
A：资源目录不直接等于推理优化器。
B：正确。
C：集合通信库。
D：GPU监控/管理。
关联卡：`card-inference-tools`；依据：TRAIN, TRT, TRITON

### 3. C
Triton可组织模型服务并使用不同后端。
A：基础计算库不包办模型服务。
B：开发工具集合不等于模型服务器。
C：正确。
D：负责集合通信。
关联卡：`card-inference-tools`；依据：TRAIN, TRT, TRITON

### 4. D
不同职责可以在推理流程中组合。
A：TensorRT面向推理；Triton不是单纯文件库。
B：Triton可配合TensorRT。
C：NGC才是本课资源目录入口。
D：正确。
关联卡：`card-inference-tools`；依据：TRAIN, TRT, TRITON

### 5. A
包装推理服务不取消环境与效果验证。
A：正确。
B：通信库不等同推理微服务。
C：线性代数库不等同部署封装。
D：驱动支持硬件访问，职责不同。
关联卡：`card-nim-ngc-enterprise`；依据：TRAIN, NOTE02, NIM, NGC, AIE

### 6. B
NGC提供资源发现与取得入口。
A：运行实例提供服务，不等同资源目录。
B：正确。
C：引擎文件是运行产物，不是资源目录。
D：指标不是模型下载入口。
关联卡：`card-nim-ngc-enterprise`；依据：TRAIN, NOTE02, NIM, NGC, AIE

### 7. C
它组织企业AI软件与生产支持。
A：讲义OS说法是类比。
B：不能把它等同NGC目录。
C：正确。
D：不是cuBLAS一类的底层算子库。
关联卡：`card-nim-ngc-enterprise`；依据：TRAIN, NOTE02, NIM, NGC, AIE

### 8. A / C
按工具用途选择。
A：正确。
B：Riva主要面向语音AI。
C：正确。
D：cuBLAS主要面向线性代数。
关联卡：`card-solutions`；依据：TRAIN, NOTE02, RAPIDS, RIVA, MERLIN, AIE

### 9. B
Riva对应语音AI。
A：面向推荐系统。
B：正确。
C：面向数据科学。
D：面向集合通信。
关联卡：`card-solutions`；依据：TRAIN, NOTE02, RAPIDS, RIVA, MERLIN, AIE

### 10. D
训练是生命周期一部分。
A：训练指标不能替代全部运行指标。
B：导出不是完整服务。
C：优化工具不包办所有运维。
D：正确。
关联卡：`card-ai-lifecycle`；依据：TRAIN, RAPIDS, TRT, TRITON

## 口述自检
数据、训练、优化、部署怎样串起来？NGC、NIM和AI Enterprise各在哪里？
口述自检不自动计分；答后讲解不能冒充独立首次作答。

本批新增问题由AI按上述材料编制并对照；没有独立人工二审。和此前聊天内容重合不代表未见新题。历史首次成绩继续保留，不在这里导入或改写。

<!-- NCA_TEACHING_START -->

<!-- NCA teaching revision: 2026-10-02-day04-batch1 -->

## 本课与原教材：怎样搭配着学

当前主课：按数据、模型质量、执行、服务与持续运行组织因果；品牌放到对应任务，而不要求先背产品表。

何时先用主课：能区分模型计算正确、服务可访问与上线后质量，且能解释优化/服务职责，本课基础练习先用主课即可。产品关系仍混淆时再读对应两三页。

原教材：原讲义146页是流程图，140/143页是生态用途，157–160页介绍MLOps。适合在理解后补图景。

具体差异：原图的典型产品对应不等于每个项目必须全部采用；“操作系统”比喻与自动保证可信结果的表述不能照字面理解。

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view)：160页培训讲义，物理页 146（第一、二节按需补图）
  - 阅读任务：在流程图指出模型从训练产物到推理服务的去向，并区分 TensorRT 执行与 Triton 服务职责。
  - 停止条件：能说明交付物和服务条件即可；已有模型是否重训对应练习 04，服务访问对应练习 01、02。
  - 来源边界：同事提供的培训讲义，不等于已认证的官方考试教材。产品条件与版本以当前官方说明为准。
- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view)：物理页 140、143（第三节资源与企业软件选读）；140、146（第四节用途选读）
  - 阅读任务：只在资源入口、推理微服务、企业支持或某一业务用途仍混淆时找对应名称。
  - 停止条件：能用当前需求解释一组职责关系即可，不背整张产品表。
  - 来源边界：产品图是用途概括；不能据此推定所有项目都必须用齐。
- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view)：物理页 157–160（第五节 MLOps 选读）
  - 阅读任务：找出一项上线后持续工作，并说明为什么需要模型、数据或评估记录。
  - 停止条件：能解释在线状态为何不能代替质量证据即可返回练习 06，不要求一次读完所有选读入口。
  - 来源边界：同事提供的培训讲义，不等于已认证的官方考试教材。产品条件与版本以当前官方说明为准。

遇到具体型号、版本、指标字段或真实操作时，打开对应知识卡中的官方依据，只查与问题有关的定义/支持条件；不把官方网站全站作为当天作业。

原目录的视频与字幕可作为补讲候选，但当前只完成目录级清点，未逐段核对；本课不指定未经核验的时间码或宣称看完某段即可覆盖考点。

完成这里的基础目标，只说明可以继续本课学习；不代表考试范围已完整覆盖、已掌握或能直接进行生产操作。

## Day 4 主课与理解练习

状态：已批准试用；教学效果待真实使用验证；用户批准日期：2026-09-25。

主课先说明原因，再用情境检查。先完成核心节，选读节留到有需要时；不要求一次做完六项短答。英文两项任选一项，可用中文回答。旧知识卡用于速查，原计分练习保持独立。

### 需要理解到什么程度

- 先区分模型计算、服务交付和业务使用，产品名称随后再记。
- 先说目标和证据，再判断需要优化执行还是组织服务。
- 把一次交付变成可追溯的持续运行。

## Day 4 主课｜从一个能算的模型，到同事真正能用的服务

Day 3 解决了软件怎样配合 GPU。今天继续处理工单分类：模型能在开发机上给出结果之后，为什么还不能宣布上线完成？先走通数据、评估、服务和运行反馈，再把产品名称放到对应位置。

- 先用中文解释关系，再把英文术语对应上；术语表达不熟与概念错误分别反馈。
- 20分钟可只完成一个核心节及一项短答；45–60分钟以核心关系和两三项回答为目标，卡住时停下补讲，可分多次完成。
- 选读节和原教材用于特定疑问的补充，不是做题前的额外通读作业。

### 先看交付物：模型文件不是完整业务服务（核心）

请求是使用者提交给系统的一次输入；接口规定怎样提交与取得结果；部署是把程序及所需条件准备到运行环境。模型服务围绕请求组织计算与返回，让使用者能调用模型。先理解这些动作，再认识后端、微服务和产品名。

设想你把训练完成的模型文件交给同事。模型参数保存了学到的规律，但同事还需要知道：输入格式是什么、从哪里提交、多久能拿到结果、失败时怎样处理。把模型放进实际业务流程，才谈得上部署与服务。

数据准备、训练、评估、部署有不同的输出。数据准备产出可用的数据；训练形成模型参数；评估检查它在合适的检验数据上表现怎样；部署准备让使用者调用的运行环境和接口。推理则是模型针对一次新输入进行计算，是服务过程中的一环。

如果直接采用已有模型，可以不在本项目重新训练，但仍要验证它是否适合当前工单、输入是否正确和服务是否可用。这条路径解释了为什么“没自己训练”也可以部署 AI 应用。

#### 工单分类的交接

开发者给了一份模型和一段演示程序。演示能处理一条工单，只证明这次输入走通了；还没有证明多人访问、异常输入和持续运行都已处理。

上线目标先写成可检查的行为：同事能提交约定格式、获得可解释的类别；不确定结果能交给人工。随后分别验证模型表现与服务条件。

- 模型预测正确与接口能被访问是两个检查；不能用其中一项替代另一项。

**这一节带走：** 先区分模型计算、服务交付和业务使用，产品名称随后再记。

<details>
<summary>依据与选读</summary>

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [NVIDIA 数据科学文档](https://docs.nvidia.com/datascience/) — RAPIDS与数据科学
- [NVIDIA TensorRT](https://docs.nvidia.com/deeplearning/tensorrt/latest/) — 推理优化和运行
- [Dynamo-Triton（原Triton Inference Server）](https://developer.nvidia.com/dynamo-triton) — 模型部署与服务

需要流程图时，只看培训讲义 TRAIN 物理页 146；MLOps 留到第五节再读。

阅读任务：指出训练产出的模型怎样进入推理部署，并说出服务还需检查的一项条件；能说明即可返回。练习 01 检查服务条件，练习 04 检查采用已有模型时是否必须重训。

涉及型号、版本或真实部署时再查本节官方来源的支持条件；本课概念练习不要求执行安装命令。

</details>

### 质量与速度分开验证：优化会改变什么（核心）

评估不能只看模型在训练资料上的表现，因为它可能记住旧例子却不善于处理新工单。需要用适当的独立检验数据，明确你关心的是哪些类别、哪些错误最重要。这里先理解检验目的，不展开统计方法。

推理优化关注模型如何执行，可能改变表示方式或执行策略，以改善时延、吞吐或资源占用。TensorRT 是一套用于推理优化和运行的软件开发工具与库：开发者把受支持的已训练模型交给它，构建适合 GPU 执行的推理引擎，再由运行库使用该引擎计算结果。引擎在这里是软件执行产物，不是另一块硬件。优化后仍要验证任务质量和实际性能。

Triton Inference Server 是运行在服务器上的模型服务软件；后端是它调用的模型执行组件。例如应用提交整理好的工单输入 → Triton 接收并安排请求 → TensorRT 后端执行模型 → Triton 返回结果。Triton 也可使用其他后端，这只是可选组合。两者分别承担执行与服务职责，优化模型不会自动完成接口访问、异常处理等全部上线条件。

#### 快了，但是否更好

假设优化后同样一批工单处理更快，但某类关键故障的分类变差。不能只报告速度提升；应一起比较质量、等待时间和资源条件。

另一种情况是模型本身很快，但请求在队列里等待很久。应查看服务负载与排队，而不是直接推断模型计算太慢。

教学数字：一次请求总耗时100毫秒，其中模型计算20、其他步骤80。把计算降到10，其他条件不变，总耗时是90，不会自动减半。优化某段与改善端到端响应要分开验证。

- 训练、推理优化、服务部署不是必须分别对应三个互斥产品。

**这一节带走：** 先说目标和证据，再判断需要优化执行还是组织服务。

<details>
<summary>依据与选读</summary>

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [NVIDIA 数据科学文档](https://docs.nvidia.com/datascience/) — RAPIDS与数据科学
- [NVIDIA TensorRT](https://docs.nvidia.com/deeplearning/tensorrt/latest/) — 推理优化和运行
- [Dynamo-Triton（原Triton Inference Server）](https://developer.nvidia.com/dynamo-triton) — 模型部署与服务

仍分不清执行与服务时，看培训讲义 TRAIN 物理页 146 的 TensorRT 与 Triton 对应位置。

阅读任务：用一条请求说明谁执行模型、谁组织服务；能说明即可返回练习 02，不必连读生命周期和 MLOps 页。

涉及型号、版本或真实部署时再查本节官方来源的支持条件；本课概念练习不要求执行安装命令。

</details>

### 把入口、交付形式和企业支持分开（核心）

本节说的 NGC 主要指 NGC Catalog：一个可浏览和获取模型、容器等资源的在线目录。找到并下载资源，解决的是“拿到什么”；能否在你的环境运行，还取决于模型、硬件、驱动及许可等具体条件。

NIM 是一组以容器形式交付的推理微服务。容器里封装了服务接口、推理引擎和相关软件；在受支持的环境启动后，应用可通过接口发送输入、取得模型输出。这里的微服务是一项承担明确功能的服务，例如提供某个模型的推理；它并不包办整个工单网页，也不是训练所有模型的框架。

AI Enterprise 是包含 NIM 等 AI 软件组件及企业支持的商业软件套件，关注受支持的软件组合、更新维护和生命周期。一个项目可以从 NGC 取得资源、运行 NIM 服务，再按所用组件核对 AI Enterprise 的支持范围。教材称其为企业 AI 的“操作系统”是比喻，不是替代主机 Linux 内核。

#### 一张采购清单为什么不能代替上线检查

团队从 NGC 找到资源、采用一个 NIM 交付模型推理，再根据需要核对企业支持范围。每一步都应问：获得了什么能力，还缺哪些运行或使用条件？

“下载成功”不等于“服务已可用”，也不自动证明获得了所有支持权益。

- 资源目录不是计算硬件，企业套件不是主机内核，推理微服务不是训练所有模型的框架。

**这一节带走：** 用获取、交付、支持三个问题辨认职责。

<details>
<summary>依据与选读</summary>

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [同事提供：02-nvidia-software-stack.pdf](https://drive.google.com/file/d/1ab3ilujbrSpsYd_4M3pNxNaUHz84qpRH/view) — 第3–8页
- [NVIDIA NIM说明](https://investor.nvidia.com/news/press-release-details/2024/NVIDIA-Launches-Generative-AI-Microservices-for-Developers-to-Create-and-Deploy-Generative-AI-Copilots-Across-NVIDIA-CUDA-GPU-Installed-Base/default.aspx) — NIM Inference Microservices
- [NVIDIA NGC](https://www.nvidia.cn/gpu-cloud/) — 容器/模型资源目录
- [NVIDIA AI Enterprise](https://www.nvidia.com/en-us/data-center/products/ai-enterprise/) — Overview/企业支持/NeMo

培训讲义 TRAIN 物理页 140、143：对照本节主题的原表格/示意，不必连读整份PDF。

阅读任务：把图中的名称分别放回取得资源、运行服务、获得企业支持三个问题；能解释它们为何可共用即可返回练习 03。

涉及型号、版本或真实部署时再查本节官方来源的支持条件；本课概念练习不要求执行安装命令。

</details>

### 按任务认识生态，不把品牌表当主线（选读）

看到一串产品名时，先把真实需求翻译成动作：整理表格数据、识别语音、生成推荐、定制模型，还是处理医疗影像。你只有先说清动作，才知道应该比较哪类能力。

教材以 RAPIDS 对应 GPU 数据科学，以 Riva 对应语音能力，以 Merlin 对应推荐系统，以 NeMo 对应模型开发和定制，以 Clara 介绍医疗生命科学方向。这里用它们认识任务类别；具体产品范围和支持状态应以当前官方文档为准。

这些名称之间可能有依赖或能力重叠。一个语音应用也要处理数据、运行模型并部署服务；不能因为用了一个语音产品，就推断不再需要软件栈、数据质量和服务管理。第一遍能把需求放回正确阶段即可。

#### 工单系统增加语音输入

如果同事希望口述工单，新增的是语音输入相关能力，不是简单把分类模型换成更强 GPU。先确认语音怎样变成可处理输入，再检查分类与服务链路。

只需要分类文本时，不必为了“学全生态”同时研究所有语音、医疗和推荐工具。

- 第一遍不背产品全家桶、许可和性能倍数；遇到对应需求再选读。

**这一节带走：** 按业务动作找能力，再查具体产品。

<details>
<summary>依据与选读</summary>

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [同事提供：02-nvidia-software-stack.pdf](https://drive.google.com/file/d/1ab3ilujbrSpsYd_4M3pNxNaUHz84qpRH/view) — 第3–8页
- [NVIDIA 数据科学文档](https://docs.nvidia.com/datascience/) — RAPIDS与数据科学
- [NVIDIA Riva](https://developer.nvidia.com/topics/ai/generative-ai/riva) — 语音AI
- [NVIDIA Merlin](https://developer.nvidia.com/merlin) — 推荐系统
- [NVIDIA AI Enterprise](https://www.nvidia.com/en-us/data-center/products/ai-enterprise/) — Overview/企业支持/NeMo

培训讲义 TRAIN 物理页 140、146：对照本节主题的原表格/示意，不必连读整份PDF。

阅读任务：只找与当前疑问相关的一类用途，例如语音输入对应什么能力；能说明即可返回选做练习 05，不需逐个背品牌。

涉及型号、版本或真实部署时再查本节官方来源的支持条件；本课概念练习不要求执行安装命令。

</details>

### 上线后还会变化：为什么需要持续管理（核心）

上线后的输入可能与开发时不同：工单出现新术语、新设备或不同书写习惯。服务仍然有响应，不代表分类质量没有变化；因此需要同时观察运行状态和业务效果。

MLOps 是管理机器学习开发与运行的一组工程实践，可由不同软件工具支持。例如每次上线记录模型版本、使用的数据、检验结果和部署时间；出现问题时，团队才能找回对应版本比较。它组织评估、部署与更新过程，自动化可以减少重复操作，但不会自动保证准确或安全。

发现问题后先保留证据，再判断原因。如果输入字段变化，应先核对接口与预处理；如果某类工单长期判断错误，要核对任务与模型评估；如果高峰排队，检查负载与服务资源。新数据出现也不等于必须立即自动训练并上线。

#### 同事说“新版更差了”

先确认上线版本、对照样本和时间范围，再区分质量下降、接口故障或速度变化。没有这些证据，反复换模型或重装驱动可能不能解释问题。

能追溯旧版本并比较表现，才有依据决定回退、补数据或调整服务。

- 持续监控提供发现问题的机会，不是永不出错的保证。

**这一节带走：** 把一次交付变成可追溯的持续运行。

<details>
<summary>依据与选读</summary>

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [NVIDIA 数据科学文档](https://docs.nvidia.com/datascience/) — RAPIDS与数据科学
- [NVIDIA TensorRT](https://docs.nvidia.com/deeplearning/tensorrt/latest/) — 推理优化和运行
- [Dynamo-Triton（原Triton Inference Server）](https://developer.nvidia.com/dynamo-triton) — 模型部署与服务

想看持续管理的全貌时，选读培训讲义 TRAIN 物理页 157–160 的 MLOps 内容。

阅读任务：找出一项上线后仍要持续做的工作，并说明要留下什么记录；能说明即可返回练习 06，不必回读产品生态页。

涉及型号、版本或真实部署时再查本节官方来源的支持条件；本课概念练习不要求执行安装命令。

</details>

### 本课关系总结

- 先区分模型计算、服务交付和业务使用，产品名称随后再记。
- 先说目标和证据，再判断需要优化执行还是组织服务。
- 把一次交付变成可追溯的持续运行。

- 核心关系：先看交付物：模型文件不是完整业务服务；质量与速度分开验证：优化会改变什么；把入口、交付形式和企业支持分开；上线后还会变化：为什么需要持续管理
- 第一遍认识职责与原因；产品全表、命令、支持矩阵和具体参数按需要选读，不把选读当永远跳过基础目标。
- 20分钟可完成一个核心节与一项原答；45–60分钟按实际进度选两三项回答。内容较多可分段完成，未学内容保持待学。

## 理解练习

网页和桌面源码可保存原答、修改稿与点评；本 Markdown 是可读讲义，不采集回答。先学后练，允许看提示；参考解释不等于针对性点评。

### 1. 解释缺少的环节

试用练习ID：`P-D04-01`。

已有一个能在开发机正确分类工单的模型，为什么还不能说同事已经能通过网页稳定使用？请说明两个需要另查的条件。

<details>
<summary>完成自己的回答后，再看参考解释与核对要点</summary>

**为什么这样理解：**

模型在开发机分对工单，只验证了那次模型计算；网页能持续使用，还需要请求进得来、结果回得去，并能应对实际使用条件。

例如先查网页提交的字段能否被服务正确读取，再查多人同时提交时服务是否仍能正常响应。输入处理与并发是两类条件；异常处理或服务运行环境也是合理核查方向。

**核对要点（原评价标准）：**

- 分开模型计算正确、访问接口及持续运行条件。
- 举出输入处理、异常处理、并发或服务环境中至少两类合理条件。

对应知识卡：card-ai-lifecycle；考点：1.7；相关旧题：Q-D04-001、Q-D04-010。

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [NVIDIA 数据科学文档](https://docs.nvidia.com/datascience/) — RAPIDS与数据科学
- [NVIDIA TensorRT](https://docs.nvidia.com/deeplearning/tensorrt/latest/) — 推理优化和运行
- [Dynamo-Triton（原Triton Inference Server）](https://developer.nvidia.com/dynamo-triton) — 模型部署与服务

</details>

### 2. 英文题意：优化与服务（英文，可用中文回答）

试用练习ID：`P-D04-02`。

A model runs faster after optimization, but users still cannot access it through an API. Which service or access conditions should the team check? You may answer in Chinese.

<details>
<summary>完成自己的回答后，再看参考解释与核对要点与译文</summary>

**题意：** 模型优化后运行更快，但用户仍无法通过API访问。团队应核查哪些服务或访问条件？可用中文回答。

**为什么这样理解：**

优化让模型计算更快，但请求必须先到达服务，模型结果才能交给用户。可以核对服务是否启动、接口地址和请求格式是否正确、运行环境或访问条件是否满足。

题目只给出访问失败，尚不能判断究竟缺少接口、服务未运行，还是访问受阻；先核查这些条件，再按证据定位。

**核对要点（原评价标准）：**

- 速度优化不能证明服务或访问条件已满足。
- 接受接口、部署、运行环境或访问条件的合理核查；访问失败不证明接口尚未开发，不预设唯一原因。

对应知识卡：card-ai-lifecycle、card-inference-tools；考点：1.7、1.1、1.6；相关旧题：Q-D04-001、Q-D04-002、Q-D04-003、Q-D04-004、Q-D04-010。

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [NVIDIA 数据科学文档](https://docs.nvidia.com/datascience/) — RAPIDS与数据科学
- [NVIDIA TensorRT](https://docs.nvidia.com/deeplearning/tensorrt/latest/) — 推理优化和运行
- [Dynamo-Triton（原Triton Inference Server）](https://developer.nvidia.com/dynamo-triton) — 模型部署与服务

</details>

### 3. 区分不同层面

试用练习ID：`P-D04-03`。

同一个方案里同时出现 NGC、NIM 和 AI Enterprise 是否矛盾？用“取得资源、交付服务、企业支持”说明你的理解。

<details>
<summary>完成自己的回答后，再看参考解释与核对要点</summary>

**为什么这样理解：**

不矛盾。NGC Catalog 提供取得模型和容器的入口，NIM 把模型推理以可调用的服务形式交给应用，AI Enterprise 提供软件套件和企业支持。

例如团队从目录取得一个 NIM 容器，在合适环境启动推理服务，同时使用适用的企业支持。三者回答的是不同问题，所以可以出现在同一个方案中。

**核对要点（原评价标准）：**

- 三者职责层面不同，可共同出现。
- 若原答混淆取得资源、部署可用与支持权益，可补讲边界；题面未要求权益，不因没提而判缺失。

对应知识卡：card-nim-ngc-enterprise；考点：1.1、1.6、1.7；相关旧题：Q-D04-005、Q-D04-006、Q-D04-007。

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [同事提供：02-nvidia-software-stack.pdf](https://drive.google.com/file/d/1ab3ilujbrSpsYd_4M3pNxNaUHz84qpRH/view) — 第3–8页
- [NVIDIA NIM说明](https://investor.nvidia.com/news/press-release-details/2024/NVIDIA-Launches-Generative-AI-Microservices-for-Developers-to-Create-and-Deploy-Generative-AI-Copilots-Across-NVIDIA-CUDA-GPU-Installed-Base/default.aspx) — NIM Inference Microservices
- [NVIDIA NGC](https://www.nvidia.cn/gpu-cloud/) — 容器/模型资源目录
- [NVIDIA AI Enterprise](https://www.nvidia.com/en-us/data-center/products/ai-enterprise/) — Overview/企业支持/NeMo

</details>

### 4. 英文题意：已有模型（英文，可用中文回答）

试用练习ID：`P-D04-04`。

A team uses a pretrained model for a new ticket-classification service. Must it train a new model before deployment? State one check it still needs.

<details>
<summary>完成自己的回答后，再看参考解释与核对要点与译文</summary>

**题意：** 团队用预训练模型建立新工单分类服务。部署前一定要训练新模型吗？说出仍需进行的一项检查。

**为什么这样理解：**

不一定。预训练模型已经有学到的参数，如果它适合当前任务，就可以评估后用于推理，不必为了“建立新服务”一律重新训练。

仍可检查它对本项目工单的分类质量：已有能力是否适合新任务，需要当前数据验证。检查输入格式或部署环境是否受支持也属于合理的一项检查。

**核对要点（原评价标准）：**

- 不必无条件重新训练。
- 仍需检验任务适配、质量或部署条件。

对应知识卡：card-ai-lifecycle、card-inference-tools；考点：1.7、1.1、1.6；相关旧题：Q-D04-001、Q-D04-002、Q-D04-003、Q-D04-004、Q-D04-010。

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [NVIDIA 数据科学文档](https://docs.nvidia.com/datascience/) — RAPIDS与数据科学
- [NVIDIA TensorRT](https://docs.nvidia.com/deeplearning/tensorrt/latest/) — 推理优化和运行
- [Dynamo-Triton（原Triton Inference Server）](https://developer.nvidia.com/dynamo-triton) — 模型部署与服务

</details>

### 5. 新增需求先问什么（选做）

试用练习ID：`P-D04-05`。

工单系统要增加口述输入。请先说明新增的任务，再说为什么不能只把 GPU 换快一点。

<details>
<summary>完成自己的回答后，再看参考解释与核对要点</summary>

**为什么这样理解：**

在已有文本分类流程中，口述输入需要先处理声音，例如把语音识别成文本，再交给分类模型和服务。

更快 GPU 可能加快已有软件的计算，但不会自行添加语音识别程序或把音频接入原来的文本接口，因此先确认缺少哪一步能力。

**核对要点（原评价标准）：**

- 新增语音输入/识别等能力需要合适软件与流程。
- 更快硬件不自动增加应用所缺能力。

对应知识卡：card-solutions；考点：1.5、1.6；相关旧题：Q-D04-008、Q-D04-009。

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [同事提供：02-nvidia-software-stack.pdf](https://drive.google.com/file/d/1ab3ilujbrSpsYd_4M3pNxNaUHz84qpRH/view) — 第3–8页
- [NVIDIA 数据科学文档](https://docs.nvidia.com/datascience/) — RAPIDS与数据科学
- [NVIDIA Riva](https://developer.nvidia.com/topics/ai/generative-ai/riva) — 语音AI
- [NVIDIA Merlin](https://developer.nvidia.com/merlin) — 推荐系统
- [NVIDIA AI Enterprise](https://www.nvidia.com/en-us/data-center/products/ai-enterprise/) — Overview/企业支持/NeMo

</details>

### 6. 换情境：上线后的证据

试用练习ID：`P-D04-06`。

服务一直在线，但用户说新设备相关工单常被分错。你先核对什么？为什么不能仅凭在线状态证明模型有效？

<details>
<summary>完成自己的回答后，再看参考解释与核对要点</summary>

**为什么这样理解：**

先保留新设备工单的输入和分类结果，对照应有类别、当前模型及相关数据版本，确认错误集中在哪里、何时出现。

在线说明服务还能够响应；即使每次都及时返回错误类别，它也可能一直在线。是否需要补数据、调整输入处理或更新模型，要由这些质量证据决定。

**核对要点（原评价标准）：**

- 对照实际输入、类别表现、模型/数据版本。
- 运行可用性与任务质量不同；依据证据选择更新，不自动归因硬件。

对应知识卡：card-ai-lifecycle；考点：1.7；相关旧题：Q-D04-001、Q-D04-010。

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [NVIDIA 数据科学文档](https://docs.nvidia.com/datascience/) — RAPIDS与数据科学
- [NVIDIA TensorRT](https://docs.nvidia.com/deeplearning/tensorrt/latest/) — 推理优化和运行
- [Dynamo-Triton（原Triton Inference Server）](https://developer.nvidia.com/dynamo-triton) — 模型部署与服务

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

### 可选回顾：约5–8分钟短诊断

第1、2、6项，英文可换第4项；不是入课门槛。

- 短诊断可选，仅在学过后回顾使用；综合解释较慢可另分一次。
- 原答先保存，再看统一参考；不清楚可直接说明。

## 下一课怎样接上

保留本次说不清的关系，下一课需要时再回看。

- 保存原答和疑问。
- 根据实际点评决定补哪一节，而不是把所有链接再读一遍。

<!-- NCA_TEACHING_END -->
