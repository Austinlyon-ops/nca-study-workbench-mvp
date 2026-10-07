# Day 5｜AI集群扩展、设施与部署选择

状态：第二批可学习基础；不是官方课程/真题，也不推定学习者已掌握。

本课包含6张卡和10道原创题。20分钟先读核心并练3题；45分钟多读解释并练6题；60分钟可完成本课并自检。可分次完成，时间是建议。

这是内容单元排序，不自动改动正式14日学习计划。

## AI集群：GPU之外还需要什么
卡ID：`card-cluster-components`；考点：2.1, 2.5, 1.6

**目标：** 说清计算、存储、网络和管理怎样共同完成任务。
**一句话：** AI集群是一组计算节点与网络、存储、管理软件共同工作的系统。

把集群看成多间协作厨房：GPU计算节点负责做菜，存储提供食材和保存成果，网络负责运输，管理节点与调度软件负责安排任务。CPU仍承担数据处理和控制；显存装模型和中间数据，系统内存、存储也不能忽略。训练数据读得太慢时，即使GPU算力很强，也会等待。DGX是NVIDIA的整套AI系统/平台家族；HGX是供合作伙伴集成系统的加速计算平台；BasePOD、SuperPOD则给出集群级组件组合。

**英文术语：** Compute node（计算节点）/ Storage（存储）/ Fabric（互联网络）/ Control plane（控制平面）/ DGX / HGX
**区别与陷阱：** GPU是组件，服务器是节点，集群由多个节点及配套系统组成；DGX、HGX、SuperPOD不是三个GPU型号。
**场景：** 示例：训练不断停下来等图片，先看数据读取、预处理与存储网络；不能仅凭GPU不忙就追加GPU。
**进一步理解：** 选配置先列模型与中间数据所需显存、数据供给速度、节点通信及服务目标，再核对运行软件支持。
**核验边界：** 保留职责关系；不采用笔记对DGX/HGX固定GPU/NIC数量或所有任务必选某型号的绝对表述。
**原讲义位置：** 物理页 17、38、53、64–65、79

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view)｜每卡另附物理页码；本轮原始文件160页｜第三方教材/笔记
- [同事提供：04-ai-hardware-and-scaling.pdf](https://drive.google.com/file/d/1nruFbzkvcdguADvzntWdbCHMNhqaWnBK/view)｜物理第2、5–8页；全10页文本已读｜第三方教材/笔记
- [NVIDIA DGX BasePOD：核心组件](https://docs.nvidia.com/dgx-basepod/reference-architecture-infrastructure-foundation-enterprise-ai/latest/core-components.html)｜Compute / Network / Storage / Control Plane｜官方资料
- [NVIDIA HGX Platform](https://www.nvidia.com/en-us/data-center/hgx/)｜Platform overview / Partner Systems｜官方资料
- [NVIDIA DGX Platform 文档](https://docs.nvidia.com/dgx/)｜DGX systems / BasePOD / SuperPOD｜官方资料

## 扩展GPU：Scale Up与Scale Out
卡ID：`card-scale-up-out`；考点：2.1, 2.2, 1.2

**目标：** 区分扩大紧密互联计算域和连接更多计算节点。
**一句话：** 增加GPU必须连同通信、数据供给和程序并行方式一起考虑。

Scale up常见于增强一个系统，或扩大紧密互联的GPU计算域；Scale out把多个系统用网络连成更大集群。今天的scale-up域也可能跨到机架规模，不能死记为单台机箱。数据并行通常让多个GPU处理不同数据并交流更新；模型并行把模型计算或参数分到多个GPU。加GPU能增加资源，但通信、串行部分和存储等待都可能吃掉收益。

**英文术语：** Scale up / Scale out / Data parallelism（数据并行）/ Model parallelism（模型并行）/ Scaling efficiency（扩展效率）
**区别与陷阱：** 扩容数量不等于等比例提速；多张卡的显存也不会让所有单GPU程序自动看到一块连续大显存。
**场景：** 示例：模型在一张卡放不下，先核对可用并行策略、每卡显存和互联；若跨节点，再验证网络带宽/延迟及框架支持。
**进一步理解：** 通过代表性任务比较运行时间、通信等待和资源利用率；先辨认瓶颈再决定扩容。
**核验边界：** 用官方scale-up domain概念补充“scale up永远等于机内”；不许诺线性扩展。
**原讲义位置：** 物理页 64–65、79–82、90–99

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view)｜每卡另附物理页码；本轮原始文件160页｜第三方教材/笔记
- [同事提供：04-ai-hardware-and-scaling.pdf](https://drive.google.com/file/d/1nruFbzkvcdguADvzntWdbCHMNhqaWnBK/view)｜物理第2、5–8页；全10页文本已读｜第三方教材/笔记
- [NVIDIA NVLink：Scale-Up网络](https://developer.nvidia.com/blog/nvidia-nvlink-the-scale-up-network-for-ai-factories/)｜正文：scale-up vs scale-out / domain / GPU communication｜官方资料
- [NVIDIA NCCL](https://developer.nvidia.com/nccl)｜多GPU/多节点通信｜官方资料
- [NVIDIA DGX BasePOD：核心组件](https://docs.nvidia.com/dgx-basepod/reference-architecture-infrastructure-foundation-enterprise-ai/latest/core-components.html)｜Compute / Network / Storage / Control Plane｜官方资料

## 供电与散热：能开机还不够
卡ID：`card-power-cooling`；考点：2.3, 2.6

**目标：** 解释机架用电、热负载与冗余的关系。
**一句话：** 电要送得进来，热要带得出去，还要按设计应对故障。

kW是某时刻用电功率，kWh是持续一段时间累计的能量。规划不能只加GPU标称功耗，还要算CPU、内存、网卡、存储、交换机等，并按设备和设施要求留出运行/冗余能力。PDU给机架分配电力；UPS在供电异常时提供短时保障。冷却系统要匹配设备热负载；冷热通道分离是为了减少热风回到服务器进风口。

**英文术语：** Power（功率，kW）/ Energy（能量，kWh）/ PDU / UPS / Heat load（热负载）/ Redundancy（冗余）
**区别与陷阱：** UPS不是制冷设备；冷却容量和电路容量需要分别核验。双电源也不自动代表上游两路供电真正独立。
**场景：** 示例：机架还有空U位，但新增GPU服务器会超过已有供电或冷却能力，此时不能只因“放得下”就部署。
**进一步理解：** 风冷通过气流带走热量；液冷可通过冷板和冷却液回路带走部分热量。方法取决于系统设计和场地，不能用一个通用kW阈值替代设计核验。
**核验边界：** 排除笔记“超过30kW必选某冷却方式”等固定口诀；本课是概念练习，不要求改电气或GPU功率设置。
**原讲义位置：** 物理页 18–21

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view)｜每卡另附物理页码；本轮原始文件160页｜第三方教材/笔记
- [同事提供：05-datacenter-power-cooling-facility.pdf](https://drive.google.com/file/d/1nIpHguc2PoUAQyLSRcw5evK99_ZNgmwq/view)｜物理第1–6页；全8页文本已读｜第三方教材/笔记
- [NVIDIA DGX SuperPOD：供电规划](https://docs.nvidia.com/dgx-superpod/design-guides/dgx-superpod-data-center-design-h100/latest/electrical.html)｜Power Redundancy / Power Connections / rPDU / Phase Balancing｜官方资料
- [NVIDIA DGX SuperPOD：散热和气流](https://docs.nvidia.com/dgx-superpod/design-guides/dgx-superpod-data-center-design-h100/latest/cooling.html)｜Full heat load / Aisle Containment / Cooling Oversubscription｜官方资料

## PUE：设施能效不等于GPU效率
卡ID：`card-pue`；考点：2.3

**目标：** 算出PUE并解释它没有告诉我们的事。
**一句话：** PUE＝同一统计范围和时段的设施总能耗÷IT设备能耗。

总能耗包含IT设备以及制冷、配电损耗、照明等配套能耗。假设同一时段总用电120kWh、IT用电100kWh，PUE就是1.2，配套部分为20kWh。相同边界下，PUE越接近1，非IT开销相对越小。PUE为2.0表示总能耗是IT的两倍，非IT部分与IT相等。它不能说明模型质量、GPU忙不忙或每个任务用了多少电。

**英文术语：** PUE（Power Usage Effectiveness）/ Total facility energy / IT equipment energy
**区别与陷阱：** PUE的分母是IT设备能耗，不是全部能耗；PUE不是百分比，也不是“GPU利用率”。
**场景：** 示例：甲机房PUE低，乙机房任务少、总能耗也少；只看PUE不能断定甲的总电费更低。
**进一步理解：** 比较时先对齐统计时段、设备边界和负载条件。理想下界为1；实际还需关心有用计算产出和总能耗。
**核验边界：** 纠正笔记PUE≥2时“非IT耗能是IT两倍”的错误；不采纳PUE>3就是造假的无依据判断。
**原讲义位置：** 物理页 21

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view)｜每卡另附物理页码；本轮原始文件160页｜第三方教材/笔记
- [同事提供：05-datacenter-power-cooling-facility.pdf](https://drive.google.com/file/d/1nIpHguc2PoUAQyLSRcw5evK99_ZNgmwq/view)｜物理第1–6页；全8页文本已读｜第三方教材/笔记
- [NVIDIA：数据中心能效指标的边界](https://blogs.nvidia.com/blog/datacenter-efficiency-metrics-isc/)｜PUE compares total energy to computing infrastructure energy｜官方资料

## 数据中心设施：空间、承重与布线
卡ID：`card-facility`；考点：2.6, 2.3, 2.2

**目标：** 识别装得下之外的部署条件。
**一句话：** 设施要同时容纳设备重量、供电、散热、布线和维修通道。

U位只是机架高度单位；设备还受深度、导轨、重量和进出风方向限制。地板及搬运路线要承受设备、机柜和运输工具的总重量；电缆需要合适走线和长度，不能挡住通风或维修。未来扩展还要预留空间、配电与冷却能力。物理访问控制等设施要求也应与实际部署一起考虑。

**英文术语：** Rack（机架）/ Rack unit（U）/ Floor loading（地板承重）/ Cable routing（走线）/ Clearance（维护净空）
**区别与陷阱：** 空U位不等于可用部署容量；CPU/GPU的算力规格不能代替设施承载条件。
**场景：** 示例：把机架拉远可以缓解局部散热压力，但会增加走线长度；应同时检查光模块/线缆的支持距离和布局。
**进一步理解：** 学习时只需要会列出核验维度；不背某一参考架构的承重、环境温湿度或消防参数作为普遍标准。
**核验边界：** 官方设施文档为具体H100部署，提取原则并保留版本条件；不继承第三方无来源的消防/承重数值。
**原讲义位置：** 物理页 18–21

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view)｜每卡另附物理页码；本轮原始文件160页｜第三方教材/笔记
- [同事提供：05-datacenter-power-cooling-facility.pdf](https://drive.google.com/file/d/1nIpHguc2PoUAQyLSRcw5evK99_ZNgmwq/view)｜物理第1–6页；全8页文本已读｜第三方教材/笔记
- [NVIDIA DGX SuperPOD：设施空间](https://docs.nvidia.com/dgx-superpod/design-guides/dgx-superpod-data-center-design-h100/latest/infrastructure.html)｜Space Planning / Air Flow / Static Weight and Point Load｜官方资料
- [NVIDIA DGX SuperPOD：散热和气流](https://docs.nvidia.com/dgx-superpod/design-guides/dgx-superpod-data-center-design-h100/latest/cooling.html)｜Full heat load / Aisle Containment / Cooling Oversubscription｜官方资料

## 本地、云与混合：按约束选择
卡ID：`card-onprem-cloud`；考点：2.4, 2.1

**目标：** 用利用率、数据控制和运维能力解释部署选择。
**一句话：** 本地偏自主控制，云偏按需取得资源；没有永远更便宜的一方。

On-premises是自建或自己负责的本地基础设施，需要承担采购、机房和运维。Cloud按服务使用GPU资源，通常降低一次性购置门槛，并提供扩缩能力，但可用容量、计费、数据传输和管理责任都要核对。Hybrid混合两者。数据在哪里、谁能访问、如何备份/加密是具体设计问题；选择本地不会自动安全合规，选择云也不等于放弃数据控制。

**英文术语：** On-premises / Cloud / Hybrid / CapEx（资本支出）/ OpEx（运营支出）/ Data residency（数据驻留）
**区别与陷阱：** 低入门成本不等于长期总成本最低；云的弹性也不等于任何时刻都有无限GPU。
**场景：** 示例：两周试验且没有机房可先评估云；长时间稳定高利用率且有运维团队，可比较本地的完整成本。两者都要先核对数据要求。
**进一步理解：** 成本比较至少含设备/租用、供电散热、人员、闲置率和数据移动；这是判断框架，不提供采购报价或合规结论。
**核验边界：** 已渲染讲义56页确认Cloud/On-Prem图文关系，避免PDF文本提取次序造成标签互换；归档官方部署页仅用于概念。
**原讲义位置：** 物理页 55–56、79

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view)｜每卡另附物理页码；本轮原始文件160页｜第三方教材/笔记
- [同事提供：05-datacenter-power-cooling-facility.pdf](https://drive.google.com/file/d/1nIpHguc2PoUAQyLSRcw5evK99_ZNgmwq/view)｜物理第1–6页；全8页文本已读｜第三方教材/笔记
- [NVIDIA AI Enterprise：部署选择（归档版）](https://archive.docs.nvidia.com/ai-enterprise/release-4/latest/getting-started/deployment-guide.html)｜Deployment options：Public Cloud / On-Premises Bare Metal｜官方资料
- [NVIDIA：企业控制环境中的模型部署](https://docs.nvidia.com/enterprise-reference-architectures/deploying-proprietary-models-confidential-compute-self-hosted-kubernetes/latest/introduction.html)｜Enterprise-controlled environments｜官方资料

## 原创练习：先作答再看解析

### 1. 一组训练GPU经常等待读取图片，计算时却足够快。优先检查哪一组环节最有针对性？
题ID：`Q-D05-001`；单选

A. 显示器分辨率与桌面主题
B. 数据预处理、存储及数据传输路径
C. 把所有训练任务改称推理
D. 只比较GPU总数量

### 2. 哪两项属于合理的GPU扩展判断？（选两项）
题ID：`Q-D05-002`；多选

A. GPU数量加倍就保证训练时间减半
B. 所有单GPU应用会自动使用多卡总显存
C. 扩大紧密互联计算域时仍要检查程序并行支持
D. 连接更多节点时需要评估通信与存储供给

### 3. 模型在单卡显存中放不下，团队拟用多GPU分担模型。最完整的下一步是？
题ID：`Q-D05-003`；单选

A. 只求多张卡显存相加够大，程序无需改动
B. 换成云部署就不需要检查每卡显存
C. 检查模型划分策略、每卡内存需求和GPU互联
D. 只增加共享磁盘容量即可保证解决

### 4. 机架还有空位，但现有散热能力接近上限。应怎样判断是否加服务器？
题ID：`Q-D05-004`；单选

A. 核对新增总热负载和供电，再评估散热/布局改造
B. 只要能插上电源就可以长期满负载
C. 有UPS便不需要增加冷却能力
D. 把空U位当作完整可用容量

### 5. 同一统计时段，机房总用电150kWh，IT设备用电100kWh。PUE及非IT用电分别是多少？
题ID：`Q-D05-005`；单选

A. 0.67和50kWh
B. 1.5和150kWh
C. 1.5和50kWh
D. 50%和100kWh

### 6. 两个机房PUE分别为1.2和1.6。仅凭这两个数字，最可靠的结论是？
题ID：`Q-D05-006`；单选

A. 1.2机房的GPU利用率一定更高
B. 1.2机房的年度总电费一定更低
C. 1.2机房训练出的模型一定更准
D. 在可比统计条件下，1.2的非IT开销相对IT更小

### 7. 规划高密度GPU机架时，哪两项确实属于设施核验？（选两项）
题ID：`Q-D05-007`；多选

A. 承重、搬运路径及维修净空
B. 只确认训练框架名称
C. 仅统计模型分类标签数量
D. 配电、冷却、走线与进出风方向

### 8. 团队只需进行两周GPU实验，没有现成机房，希望减少最初一次性设备采购。哪种判断最合理？
题ID：`Q-D05-008`；单选

A. 先评估按需云GPU，并核对容量、数据要求和完整费用
B. 云GPU对任何期限都保证总成本最低
C. 本地部署不需要运维人员
D. 混合部署可以忽略数据传输

### 9. 哪两项对本地与云部署的比较成立？（选两项）
题ID：`Q-D05-009`；多选

A. 只要本地部署就自动满足所有安全要求
B. 本地可增加控制，同时承担采购及运维责任
C. 云的弹性仍受可用资源和服务条款约束
D. 租用云GPU后应用与数据治理不再需要负责

### 10. 采购讨论中把GPU、HGX、DGX和SuperPOD都叫成“GPU型号”。哪项纠正更准确？
题ID：`Q-D05-010`；单选

A. 它们只是同一芯片的不同营销名称
B. SuperPOD只是单张GPU上的计算核心
C. HGX与DGX都只提供文件存储
D. GPU是组件；HGX/DGX涉及系统平台，SuperPOD涉及集群级基础设施

## 答案与逐项解析

### 1. B
题干给出的线索是数据供给等待，应检查产生等待的链路，再决定是否扩容。

A：与数据供给瓶颈无直接关系。
B：正确：数据准备、读取和传输都可能让GPU等输入。
C：改名字不会改变工作负载或瓶颈。
D：数量不能说明供给速度；继续加GPU可能仍在等待。
关联卡：`card-cluster-components`；依据：TRAIN, NOTE04, B2-BASEPOD, B2-HGX, B2-DGX

### 2. C / D
扩展效果依赖程序能否并行及计算之外的供给和通信。

A：通信、串行步骤和等待会限制收益。
B：多卡内存利用取决于软件分片/并行设计，并非自动合并。
C：正确：互联硬件不能代替程序支持。
D：正确：跨节点同步和数据供给可能成为瓶颈。
关联卡：`card-scale-up-out`；依据：TRAIN, NOTE04, B2-NVLINK, NCCL, B2-BASEPOD

### 3. C
模型并行需要软件真正把计算和数据分布出去，通信及每卡资源也要匹配。

A：总和够大是候选条件，不能保证程序能有效使用。
B：云仍有具体硬件和程序约束。
C：正确：同时考虑容量、并行实现和通信。
D：磁盘容量与GPU工作显存是不同资源。
关联卡：`card-scale-up-out`；依据：TRAIN, NOTE04, B2-NVLINK, NCCL, B2-BASEPOD

### 4. A
空间、电力和散热是同时存在的限制，不能互相替代。

A：正确：需要按整机/机架负载和设施能力核验。
B：短时能通电不证明长期负载条件满足。
C：UPS服务供电保障，不负责带走热量。
D：U位只表达高度空间，不包括电热约束。
关联卡：`card-power-cooling`；依据：TRAIN, NOTE05, B2-POWER, B2-COOLING

### 5. C
150÷100＝1.5；非IT部分＝150－100＝50kWh。

A：把PUE分子分母倒置了。
B：PUE对，但非IT不是总能耗。
C：正确：比例和差额都来自相同统计边界。
D：PUE是比值，不按此处百分比定义。
关联卡：`card-pue`；依据：TRAIN, NOTE05, B2-PUE

### 6. D
PUE说明设施能耗比例，不直接测量计算产出、总电量或模型效果。

A：GPU利用率不是PUE的定义。
B：还缺总用电和电价等信息。
C：能耗比例不能推定模型准确率。
D：正确：这是PUE能支持的有限结论。
关联卡：`card-pue`；依据：TRAIN, NOTE05, B2-PUE

### 7. A / D
设备可安全部署和持续运行需要物理设施条件配合。

A：正确：重量和搬运/维护路径影响能否安装与维护。
B：框架是软件要求，不能代替设施核验。
C：模型类别不是机房承载条件。
D：正确：这些共同决定机架能否稳定运行。
关联卡：`card-facility`；依据：TRAIN, NOTE05, B2-FACILITY, B2-COOLING

### 8. A
按需云资源可降低初始采购门槛；题干不足以证明长期总成本或数据适配。

A：正确：建议由明确约束驱动并保留条件。
B：长期成本受利用率、价格和传输等因素影响。
C：本地仍要承担硬件与软件运维。
D：混合架构仍需规划数据流和费用。
关联卡：`card-onprem-cloud`；依据：TRAIN, NOTE05, B2-DEPLOY, B2-CONTROL

### 9. B / C
部署位置影响责任和控制方式，但不免除实际设计与运行责任。

A：安全取决于具体设计、访问和治理。
B：正确：自主控制伴随设施和运维责任。
C：正确：弹性不是无限、无条件的资源保证。
D：应用、数据和权限等责任仍需按服务边界落实。
关联卡：`card-onprem-cloud`；依据：TRAIN, NOTE05, B2-DEPLOY, B2-CONTROL

### 10. D
辨认组件、系统与集群层次，才不会把品牌名当作同一类硬件来比较。

A：产品层次和用途不同。
B：SuperPOD不是芯片内计算单元。
C：平台涉及GPU计算及配套系统。
D：正确：抓住层次，不强记单一代际数量。
关联卡：`card-cluster-components`；依据：TRAIN, NOTE04, B2-BASEPOD, B2-HGX, B2-DGX

## 口述自检
GPU增加后训练没更快，怎样依次检查数据供给、通信和设施约束？PUE低能证明什么、不能证明什么？
口述自检不自动计分；一次答对不是已掌握。20/45/60分钟可分次完成本课。

新增题由AI原创并对照材料；未独立人工二审。学习是否有效要看用户真实作答、猜测/不确定标记、重做和后续回忆，不写入任何预设学习成绩。

<!-- NCA_TEACHING_START -->

<!-- NCA teaching revision: 2026-10-02-day05-batch1 -->

## 本课与原教材：怎样搭配着学

当前主课：沿计算等待、扩展成本、设施约束和能耗定义讲清关系，用教学数字检验PUE理解。

何时先用主课：能解释GPU为何等待、扩展为何有开销、PUE不能代表任务效率，可先停在本课基础目标。想看组成与约束的位置关系时回原图。

原教材：原讲义18–21页的设施约束、64–65/79–82页平台图，以及55–56页云/本地对照能提供空间与系统视角。

具体差异：工作台补充PUE低但总能耗更高的反例；原云/本地优势表是概括，不保证云一定便宜或本地一定合规。

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view)：160页培训讲义，物理页 64–65 或 79（组成图）；79–82（扩展图景）
  - 阅读任务：第一、二节仍有疑问时选一张图，指出计算、存储、互联与管理，并说清增加节点后要交换什么。
  - 停止条件：能解释一个等待点与一种协作开销即可返回练习 01、02，不背 DGX 代际规格。
  - 来源边界：同事提供的培训讲义，不等于已认证的官方考试教材。产品条件与版本以当前官方说明为准。
- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view)：物理页 18–21（设施约束）；21（PUE）
  - 阅读任务：第三节按需列出供电、散热、空间承重条件；第四节只看第21页核对 PUE 的分子分母。
  - 停止条件：能解释空位不代表部署条件齐全，或能解释 PUE 比值与总量的区别，即可回对应练习；综合练习 06 回看第一至三节。
  - 来源边界：设施数值需按真实设备与场地核验，课堂例子不构成部署设计。
- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view)：物理页 55–56（第五节云与本地对照）
  - 阅读任务：用临时试验或全年服务检验图中一种优势成立需要哪些条件。
  - 停止条件：能指出一个会改变选择的约束及原因即可返回练习 05，不要求一次读完全部入口。
  - 来源边界：同事提供的培训讲义，不等于已认证的官方考试教材。产品条件与版本以当前官方说明为准。

遇到具体型号、版本、指标字段或真实操作时，打开对应知识卡中的官方依据，只查与问题有关的定义/支持条件；不把官方网站全站作为当天作业。

原目录的视频与字幕可作为补讲候选，但当前只完成目录级清点，未逐段核对；本课不指定未经核验的时间码或宣称看完某段即可覆盖考点。

完成这里的基础目标，只说明可以继续本课学习；不代表考试范围已完整覆盖、已掌握或能直接进行生产操作。

## Day 5 主课与理解练习

状态：已批准试用；教学效果待真实使用验证；用户批准日期：2026-09-25。

主课先说明原因，再用情境检查。先完成核心节，选读节留到有需要时；不要求一次做完六项短答。英文两项任选一项，可用中文回答。旧知识卡用于速查，原计分练习保持独立。

### 需要理解到什么程度

- 围绕工作流找等待点，不从最贵部件推断瓶颈。
- 扩展收益取决于可并行工作和新增协作开销。
- 上架前核对承载条件，运行后还需观测实际表现。
- PUE用于看设施能耗关系，不能替代任务能效。

## Day 5 主课｜增加 GPU 之前，先看整个系统能否跟上

从一台服务器到一组机器，需要把计算、数据供给和设施放在一起看。今天不设计真实机房，只练习解释：为什么算力增加了，工作却不一定同样加快？

- 先用中文解释关系，再把英文术语对应上；术语表达不熟与概念错误分别反馈。
- 20分钟可只完成一个核心节及一项短答；45–60分钟以核心关系和两三项回答为目标，卡住时停下补讲，可分多次完成。
- 选读节和原教材用于特定疑问的补充，不是做题前的额外通读作业。
- 前半段学组成与扩展，后半段学设施、PUE和部署选择；产品代际规格留作速查。

### 集群是合作系统，不是 GPU 数量表（核心）

先看实际组成：GPU 是服务器里的计算部件；一台配有 CPU、内存和 GPU 的计算服务器可作为一个节点；多个节点通过网络连接，并配合存储和管理软件协作，形成集群。节点的具体形态会随平台变化。

例如一次工单训练：从存储读取数据，CPU 参与准备输入，GPU 执行计算；任务分到多个节点时，还可能经网络交换结果，最后保存模型。管理与调度软件安排任务使用哪些资源，供电与散热支持设备持续运行。这是简化过程，实际步骤可重叠执行。

沿这个过程区分三种“不够用”：工作数据装不进显存，是容量问题；数据准备好了仍算得慢，是计算与实现问题；GPU 等下一批输入，是供给问题。某个部件等待另一个部件时，增加等待方的数量未必解决瓶颈。

DGX 提供 NVIDIA 的整套 AI 系统，HGX 是供系统厂商集成的加速计算平台；BasePOD 等参考架构则说明怎样组合计算、网络、存储和管理。第一遍先分清“系统里有什么”与“多个系统怎样配合”，不背某代型号固定的 GPU 数量。

#### 数据来不及供给

假设 GPU 经常等待读取工单训练数据。增加 GPU 后，存储供给没有变，每张卡分到的数据可能更少。应先对齐任务阶段、数据读入与计算时间，再决定哪里要改。

相反，如果数据及时送达而计算长期成为主要耗时，增加合适计算资源才可能有帮助；仍需软件能利用。

- 空闲计算资源可能是在等待，不必然是硬件损坏。

**这一节带走：** 围绕工作流找等待点，不从最贵部件推断瓶颈。

<details>
<summary>依据与选读</summary>

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [同事提供：04-ai-hardware-and-scaling.pdf](https://drive.google.com/file/d/1nruFbzkvcdguADvzntWdbCHMNhqaWnBK/view) — 物理第2、5–8页；全10页文本已读
- [NVIDIA DGX BasePOD：核心组件](https://docs.nvidia.com/dgx-basepod/reference-architecture-infrastructure-foundation-enterprise-ai/latest/core-components.html) — Compute / Network / Storage / Control Plane
- [NVIDIA HGX Platform](https://www.nvidia.com/en-us/data-center/hgx/) — Platform overview / Partner Systems
- [NVIDIA DGX Platform 文档](https://docs.nvidia.com/dgx/) — DGX systems / BasePOD / SuperPOD

需要平台图时，先从培训讲义 TRAIN 物理页 64–65 或 79 选一张；这些是已有卡片定位中的平台图入口。

阅读任务：在图上指出计算、存储、互联和管理各负责什么，沿数据到计算的路径找一种可能等待；能说明即可返回练习 01，不必连读全部型号页。

涉及型号、版本或真实部署时再查本节官方来源的支持条件；本课概念练习不要求执行安装命令。

</details>

### Scale Up 与 Scale Out：扩展也会增加协作成本（核心）

先用常见场景区分：选择一个有更多紧密互联 GPU 的系统来增加计算资源，是 Scale Up 的典型思路；再增加一台服务器，让任务跨节点通过网络协作，是 Scale Out 的典型思路。前者扩大紧密互联的计算域，后者把更多系统连起来。实际 Scale Up 域也可能跨到机架规模，因此不能只按是否在同一机箱内判断。

以数据并行为例，两张 GPU 分别处理一部分训练数据，再交流更新所需的结果；算自己的部分可以同时进行，等待彼此结果却会增加协作时间。假设原来计算需10个时间单位，拆成两份后各需5个，再同步2个，总耗时为7。这些教学数字假设两份计算同时完成、同步与计算不重叠，其他开销暂不计；真实任务要按实际执行过程测量。

多卡显存也不等于任何程序都能当作一块大显存。软件必须采用合适的分布方式，互联和内存访问条件也要满足。先问任务是否可拆、结果怎样交换，再讨论扩展。

#### 多加一台之后反而不划算

两台节点承担部分计算，但每一步都要传较多结果。若等待通信占比变大，增加节点可能只带来小幅收益。

可以对比同任务的计算与通信耗时；没有这些数据，不能只按 GPU 总数计算预计加速倍数。

- Scale Up/Out是理解扩展关系的入口，实际拓扑需看所选平台。

**这一节带走：** 扩展收益取决于可并行工作和新增协作开销。

<details>
<summary>依据与选读</summary>

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [同事提供：04-ai-hardware-and-scaling.pdf](https://drive.google.com/file/d/1nruFbzkvcdguADvzntWdbCHMNhqaWnBK/view) — 物理第2、5–8页；全10页文本已读
- [NVIDIA NVLink：Scale-Up网络](https://developer.nvidia.com/blog/nvidia-nvlink-the-scale-up-network-for-ai-factories/) — 正文：scale-up vs scale-out / domain / GPU communication
- [NVIDIA NCCL](https://developer.nvidia.com/nccl) — 多GPU/多节点通信
- [NVIDIA DGX BasePOD：核心组件](https://docs.nvidia.com/dgx-basepod/reference-architecture-infrastructure-foundation-enterprise-ai/latest/core-components.html) — Compute / Network / Storage / Control Plane

需要扩展图景时，选读培训讲义 TRAIN 物理页 79–82；90–99 的网络细节留到 Day 6 有相应疑问时。

阅读任务：沿平台图说明增加资源后哪些工作可分担、哪些结果还需交换；能解释计算收益与协作开销即可返回练习 02。

涉及型号、版本或真实部署时再查本节官方来源的支持条件；本课概念练习不要求执行安装命令。

</details>

### 供电、散热与空间是部署条件（核心）

功率是某一时刻用能的速率，能量是一定时间累计使用的量。理解机柜供电能力与周期能耗时，先分清这两个量；不能只用瞬时功率判断完成任务的总能耗。

设备有位置放，不等于该位置能承载它运行。机柜、地板承重、可用电力、供电冗余、散热能力和布线维护空间都要核查。它们限制的是可部署与可持续运行的能力。

电力进入系统后大量转化为热。高密度设备把更多热集中在较小空间，如果热不能有效排出，设备可能受温度限制而降低性能，或触发保护。散热方案需匹配设备规格、环境与设施，不是简单“风扇越多越好”。

冗余用于降低部分故障导致服务中断的风险，但仍需按方案验证实际路径与容量。能开机的一次短测，不能证明高负载、某一路供电故障或维护期间都能持续运行。

#### 空机柜并不代表可以立即上架

新机柜有足够空位，但电力容量与冷却条件未核实。合理结论是部署条件尚不完整，而不是设备一定能用或一定不能用。

课堂只识别需要哪些资料，不以示例数字代替真实电气、承重或散热设计。

- 本课不提供现场电气施工、承重或生产设备变更指令。

**这一节带走：** 上架前核对承载条件，运行后还需观测实际表现。

<details>
<summary>依据与选读</summary>

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [同事提供：05-datacenter-power-cooling-facility.pdf](https://drive.google.com/file/d/1nIpHguc2PoUAQyLSRcw5evK99_ZNgmwq/view) — 物理第1–6页；全8页文本已读
- [NVIDIA DGX SuperPOD：供电规划](https://docs.nvidia.com/dgx-superpod/design-guides/dgx-superpod-data-center-design-h100/latest/electrical.html) — Power Redundancy / Power Connections / rPDU / Phase Balancing
- [NVIDIA DGX SuperPOD：散热和气流](https://docs.nvidia.com/dgx-superpod/design-guides/dgx-superpod-data-center-design-h100/latest/cooling.html) — Full heat load / Aisle Containment / Cooling Oversubscription
- [NVIDIA DGX SuperPOD：设施空间](https://docs.nvidia.com/dgx-superpod/design-guides/dgx-superpod-data-center-design-h100/latest/infrastructure.html) — Space Planning / Air Flow / Static Weight and Point Load

培训讲义 TRAIN 物理页 18–21：对照本节主题的原表格/示意，不必连读整份PDF。

阅读任务：找出供电、散热和空间承重各一项约束；能解释空位为何不足以决定部署即可返回练习 03。练习 06 综合第一至三节，分开检查性能收益与设施条件。

涉及型号、版本或真实部署时再查本节官方来源的支持条件；本课概念练习不要求执行安装命令。

</details>

### PUE 的分子分母各说明什么（核心）

PUE 等于设施总能耗除以 IT 设备能耗。分子包含 IT 设备及冷却、供配电等设施开销；分母是 IT 设备能耗。比较时需要统一时间范围与计量边界。

假设同一周期 IT 设备耗能100，设施总耗能150，PUE为1.5。这说明总能耗是 IT 能耗的1.5倍，并不说明 GPU 有50%的计算效率，也不说明完成了多少有效工作。

再看两个教学案例：A的IT能耗100、总能耗120，PUE1.2；B的IT能耗50、总能耗70，PUE1.4。A的比值更低，但总能耗更高。要比较同一种任务的能效，还需看完成的工作和条件；比较电费还需价格等信息。

#### “PUE更低，所以一定更省钱”缺了什么

这句话把设施开销比例、总用能和费用混在了一起。先确认想比较哪个量，再找相应证据。

读懂分母之后，就知道不能把PUE当作GPU利用率或任务完成效率。

- 比值改善不保证总量下降；总量下降也不直接证明同等工作更高效。

**这一节带走：** PUE用于看设施能耗关系，不能替代任务能效。

<details>
<summary>依据与选读</summary>

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [同事提供：05-datacenter-power-cooling-facility.pdf](https://drive.google.com/file/d/1nIpHguc2PoUAQyLSRcw5evK99_ZNgmwq/view) — 物理第1–6页；全8页文本已读
- [NVIDIA：数据中心能效指标的边界](https://blogs.nvidia.com/blog/datacenter-efficiency-metrics-isc/) — PUE compares total energy to computing infrastructure energy

培训讲义 TRAIN 物理页 21：对照本节主题的原表格/示意，不必连读整份PDF。

阅读任务：指出分子包含什么、分母是什么，再用本课 A/B 数字解释比值与总量的差别；能说明即可返回练习 04。

涉及型号、版本或真实部署时再查本节官方来源的支持条件；本课概念练习不要求执行安装命令。

</details>

### 本地与云：把约束写出来再选（核心）

本地部署通常需要自己或合作方准备设备与设施，能对环境进行更多直接控制；云提供可租用的计算资源，便于按服务条件获取和调整资源，但仍有容量、数据传输、权限与费用等约束。

比较时先明确数据能放在哪里、负载是长期稳定还是短期波动、资源是否可获得、谁负责运维以及总体成本。按量计费不等于任何项目都更便宜，本地部署也不自动等于安全或合规。

混合方式可以让不同任务位于不同环境，但增加了数据同步、身份和运维协作问题。今天只会解释取舍，不为真实采购给出固定答案。

#### 一个长期任务和一个短期试验

长期稳定任务可比较设备投入与持续运维，短期试验可关注获取资源的速度和试验结束后能否释放。

若资料不允许离开指定环境，先确认这一约束；不能只按每小时价格选择。

- 控制权、责任、资源弹性和成本要一起看。

**这一节带走：** 部署选择是约束问题，不是“云必胜”或“本地必胜”。

<details>
<summary>依据与选读</summary>

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [同事提供：05-datacenter-power-cooling-facility.pdf](https://drive.google.com/file/d/1nIpHguc2PoUAQyLSRcw5evK99_ZNgmwq/view) — 物理第1–6页；全8页文本已读
- [NVIDIA AI Enterprise：部署选择（归档版）](https://archive.docs.nvidia.com/ai-enterprise/release-4/latest/getting-started/deployment-guide.html) — Deployment options：Public Cloud / On-Premises Bare Metal
- [NVIDIA：企业控制环境中的模型部署](https://docs.nvidia.com/enterprise-reference-architectures/deploying-proprietary-models-confidential-compute-self-hosted-kubernetes/latest/introduction.html) — Enterprise-controlled environments

需要云与本地对照时，只看培训讲义 TRAIN 物理页 55–56；本节不要求回读平台规格页。

阅读任务：给临时试验与全年服务各找一项会改变选择的约束，并解释原因；能说明即可返回练习 05。

涉及型号、版本或真实部署时再查本节官方来源的支持条件；本课概念练习不要求执行安装命令。

</details>

### 本课关系总结

- 围绕工作流找等待点，不从最贵部件推断瓶颈。
- 扩展收益取决于可并行工作和新增协作开销。
- 上架前核对承载条件，运行后还需观测实际表现。
- PUE用于看设施能耗关系，不能替代任务能效。

- 核心关系：集群是合作系统，不是 GPU 数量表；Scale Up 与 Scale Out：扩展也会增加协作成本；供电、散热与空间是部署条件；PUE 的分子分母各说明什么；本地与云：把约束写出来再选
- 第一遍认识职责与原因；产品全表、命令、支持矩阵和具体参数按需要选读，不把选读当永远跳过基础目标。
- 20分钟可完成一个核心节与一项原答；45–60分钟按实际进度选两三项回答。内容较多可分段完成，未学内容保持待学。

## 理解练习

网页和桌面源码可保存原答、修改稿与点评；本 Markdown 是可读讲义，不采集回答。先学后练，允许看提示；参考解释不等于针对性点评。

### 1. 找等待点

试用练习ID：`P-D05-01`。

增加 GPU 后训练几乎没加快，同时读数据等待较长。你会先核对哪类证据？为什么 GPU 数量本身不能证明加速？

<details>
<summary>完成自己的回答后，再看参考解释与核对要点</summary>

**为什么这样理解：**

先对照同一任务的数据读取、准备和 GPU 计算耗时，确认 GPU 是否主要在等下一批输入。如果输入送不来，多出的 GPU 也只能一起等待。

因此卡数只说明增加了计算资源，不能说明整个任务更快。题目提示供给可能是限制，但还需阶段耗时来核对，不能仅凭等待现象断定是哪一个部件故障。

**核对要点（原评价标准）：**

- 查看同任务的数据读取与计算阶段耗时。
- 资源需协作，数据供给可能限制计算，但仅凭描述不直接确诊。

对应知识卡：card-cluster-components；考点：2.1、2.5、1.6；相关旧题：Q-D05-001、Q-D05-010。

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [同事提供：04-ai-hardware-and-scaling.pdf](https://drive.google.com/file/d/1nruFbzkvcdguADvzntWdbCHMNhqaWnBK/view) — 物理第2、5–8页；全10页文本已读
- [NVIDIA DGX BasePOD：核心组件](https://docs.nvidia.com/dgx-basepod/reference-architecture-infrastructure-foundation-enterprise-ai/latest/core-components.html) — Compute / Network / Storage / Control Plane
- [NVIDIA HGX Platform](https://www.nvidia.com/en-us/data-center/hgx/) — Platform overview / Partner Systems
- [NVIDIA DGX Platform 文档](https://docs.nvidia.com/dgx/) — DGX systems / BasePOD / SuperPOD

</details>

### 2. 英文：扩展成本（英文，可用中文回答）

试用练习ID：`P-D05-02`。

Adding more nodes reduces computation time but increases synchronization time. Why may total training time improve only slightly?

<details>
<summary>完成自己的回答后，再看参考解释与核对要点与译文</summary>

**题意：** 更多节点减少计算时间但增加同步时间。为什么总训练时间可能只小幅改善？

**为什么这样理解：**

节点各自算得更快，只减少了计算这一段；如果下一步必须等节点交换或合并结果，新增同步等待也会延长任务。

例如在计算与同步不重叠的教学条件下，计算从10降到6个时间单位，同步却从1增到4，总耗时只从11降到10。收益要看整个过程。

**核对要点（原评价标准）：**

- 总耗时包括计算与协作等待。
- 新增同步成本可能抵消部分计算收益。

对应知识卡：card-scale-up-out；考点：2.1、2.2、1.2；相关旧题：Q-D05-002、Q-D05-003。

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [同事提供：04-ai-hardware-and-scaling.pdf](https://drive.google.com/file/d/1nruFbzkvcdguADvzntWdbCHMNhqaWnBK/view) — 物理第2、5–8页；全10页文本已读
- [NVIDIA NVLink：Scale-Up网络](https://developer.nvidia.com/blog/nvidia-nvlink-the-scale-up-network-for-ai-factories/) — 正文：scale-up vs scale-out / domain / GPU communication
- [NVIDIA NCCL](https://developer.nvidia.com/nccl) — 多GPU/多节点通信
- [NVIDIA DGX BasePOD：核心组件](https://docs.nvidia.com/dgx-basepod/reference-architecture-infrastructure-foundation-enterprise-ai/latest/core-components.html) — Compute / Network / Storage / Control Plane

</details>

### 3. 列部署条件

试用练习ID：`P-D05-03`。

机柜还有空位，是否足以决定再部署两台高密度 GPU 服务器？说明至少三类需核对的条件。

<details>
<summary>完成自己的回答后，再看参考解释与核对要点</summary>

**为什么这样理解：**

空位只说明有一部分空间。还需核对至少三类运行条件：电力能否供给新增负载、冷却能否带走热量、机柜与地板能否承重；设备深度、布线和维护空间也是合理条件。

这些条件分别约束设备能否放稳、供得上电和持续排热；高负载或某一路供电异常时的承载能力，也不能由一次开机证明。

**核对要点（原评价标准）：**

- 核对电力、散热、承重、空间布线等。
- 空位不能证明高负载条件与冗余已满足。

对应知识卡：card-power-cooling、card-facility；考点：2.3、2.6、2.2；相关旧题：Q-D05-004、Q-D05-007。

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [同事提供：05-datacenter-power-cooling-facility.pdf](https://drive.google.com/file/d/1nIpHguc2PoUAQyLSRcw5evK99_ZNgmwq/view) — 物理第1–6页；全8页文本已读
- [NVIDIA DGX SuperPOD：供电规划](https://docs.nvidia.com/dgx-superpod/design-guides/dgx-superpod-data-center-design-h100/latest/electrical.html) — Power Redundancy / Power Connections / rPDU / Phase Balancing
- [NVIDIA DGX SuperPOD：散热和气流](https://docs.nvidia.com/dgx-superpod/design-guides/dgx-superpod-data-center-design-h100/latest/cooling.html) — Full heat load / Aisle Containment / Cooling Oversubscription
- [NVIDIA DGX SuperPOD：设施空间](https://docs.nvidia.com/dgx-superpod/design-guides/dgx-superpod-data-center-design-h100/latest/infrastructure.html) — Space Planning / Air Flow / Static Weight and Point Load

</details>

### 4. 英文：读懂能耗指标（英文，可用中文回答）

试用练习ID：`P-D05-04`。

Facility A has a lower PUE than B. Does this alone prove A uses less total energy? Explain.

<details>
<summary>完成自己的回答后，再看参考解释与核对要点与译文</summary>

**题意：** 设施A的PUE低于B。仅凭这一点能证明A总能耗更少吗？

**为什么这样理解：**

不能证明。PUE＝设施总能耗÷IT设备能耗，比值较小并未告诉我们 IT 用能的绝对大小。

在计量边界和时段一致的教学例子中，A 总能耗120、IT能耗100，PUE为1.2；B总能耗70、IT能耗50，PUE为1.4。A 的 PUE 较低，但总能耗仍更高。

**核对要点（原评价标准）：**

- 不证明；PUE是比值。
- 还要看IT能耗、总量和计量范围。

对应知识卡：card-pue；考点：2.3；相关旧题：Q-D05-005、Q-D05-006。

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [同事提供：05-datacenter-power-cooling-facility.pdf](https://drive.google.com/file/d/1nIpHguc2PoUAQyLSRcw5evK99_ZNgmwq/view) — 物理第1–6页；全8页文本已读
- [NVIDIA：数据中心能效指标的边界](https://blogs.nvidia.com/blog/datacenter-efficiency-metrics-isc/) — PUE compares total energy to computing infrastructure energy

</details>

### 5. 先比较约束

试用练习ID：`P-D05-05`。

一个月的临时试验和全年运行的服务，为什么不能只按同一张 GPU 小时价表选择云或本地？

<details>
<summary>完成自己的回答后，再看参考解释与核对要点</summary>

**为什么这样理解：**

小时价只覆盖部分费用。一个月试验还要考虑能否及时取得资源、结束后能否释放；全年服务则要把长期利用率、设备或租用投入、供电散热和人员运维一起计算。

两种任务的数据位置与访问要求也可能不同。运行时间、责任和约束改变了完整成本及可行性，因此同一张单价表不足以决定云或本地。

**核对要点（原评价标准）：**

- 持续时间、数据、运维、可得性及总成本不同。
- 不能从单价直接推出整体最优。

对应知识卡：card-onprem-cloud；考点：2.4、2.1；相关旧题：Q-D05-008、Q-D05-009。

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [同事提供：05-datacenter-power-cooling-facility.pdf](https://drive.google.com/file/d/1nIpHguc2PoUAQyLSRcw5evK99_ZNgmwq/view) — 物理第1–6页；全8页文本已读
- [NVIDIA AI Enterprise：部署选择（归档版）](https://archive.docs.nvidia.com/ai-enterprise/release-4/latest/getting-started/deployment-guide.html) — Deployment options：Public Cloud / On-Premises Bare Metal
- [NVIDIA：企业控制环境中的模型部署](https://docs.nvidia.com/enterprise-reference-architectures/deploying-proprietary-models-confidential-compute-self-hosted-kubernetes/latest/introduction.html) — Enterprise-controlled environments

</details>

### 6. 换情境：系统性解释

试用练习ID：`P-D05-06`。

假设多卡任务等待通信，同时拟放入新机柜。请分开说明性能收益与设施可部署性需要哪些不同证据。

<details>
<summary>完成自己的回答后，再看参考解释与核对要点</summary>

**为什么这样理解：**

性能问题先对照同任务的计算、数据供给和通信等待，核对软件如何分配任务、互联是否满足需要；增加资源是否值得，要看总耗时能否改善。

新机柜能否部署则需要供电、散热、承重和空间资料。前一组证据回答任务能否更快，后一组回答设备能否在该位置持续运行；即使通信改善，也不能据此认定机柜条件已满足。

**核对要点（原评价标准）：**

- 性能看计算/数据/通信及软件条件。
- 设施看电力、散热、空间承重。PUE或部署方式只在回答混淆时补讲，不是题目要求的必答项。

对应知识卡：card-cluster-components、card-scale-up-out、card-power-cooling、card-facility、card-pue、card-onprem-cloud；考点：2.1、2.5、1.6、2.2、1.2、2.3、2.6、2.4；相关旧题：Q-D05-001、Q-D05-002、Q-D05-003、Q-D05-004、Q-D05-005、Q-D05-006、Q-D05-007、Q-D05-008、Q-D05-009、Q-D05-010。

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [同事提供：04-ai-hardware-and-scaling.pdf](https://drive.google.com/file/d/1nruFbzkvcdguADvzntWdbCHMNhqaWnBK/view) — 物理第2、5–8页；全10页文本已读
- [NVIDIA DGX BasePOD：核心组件](https://docs.nvidia.com/dgx-basepod/reference-architecture-infrastructure-foundation-enterprise-ai/latest/core-components.html) — Compute / Network / Storage / Control Plane
- [NVIDIA HGX Platform](https://www.nvidia.com/en-us/data-center/hgx/) — Platform overview / Partner Systems
- [NVIDIA DGX Platform 文档](https://docs.nvidia.com/dgx/) — DGX systems / BasePOD / SuperPOD
- [NVIDIA NVLink：Scale-Up网络](https://developer.nvidia.com/blog/nvidia-nvlink-the-scale-up-network-for-ai-factories/) — 正文：scale-up vs scale-out / domain / GPU communication
- [NVIDIA NCCL](https://developer.nvidia.com/nccl) — 多GPU/多节点通信
- [同事提供：05-datacenter-power-cooling-facility.pdf](https://drive.google.com/file/d/1nIpHguc2PoUAQyLSRcw5evK99_ZNgmwq/view) — 物理第1–6页；全8页文本已读
- [NVIDIA DGX SuperPOD：供电规划](https://docs.nvidia.com/dgx-superpod/design-guides/dgx-superpod-data-center-design-h100/latest/electrical.html) — Power Redundancy / Power Connections / rPDU / Phase Balancing
- [NVIDIA DGX SuperPOD：散热和气流](https://docs.nvidia.com/dgx-superpod/design-guides/dgx-superpod-data-center-design-h100/latest/cooling.html) — Full heat load / Aisle Containment / Cooling Oversubscription
- [NVIDIA DGX SuperPOD：设施空间](https://docs.nvidia.com/dgx-superpod/design-guides/dgx-superpod-data-center-design-h100/latest/infrastructure.html) — Space Planning / Air Flow / Static Weight and Point Load
- [NVIDIA：数据中心能效指标的边界](https://blogs.nvidia.com/blog/datacenter-efficiency-metrics-isc/) — PUE compares total energy to computing infrastructure energy
- [NVIDIA AI Enterprise：部署选择（归档版）](https://archive.docs.nvidia.com/ai-enterprise/release-4/latest/getting-started/deployment-guide.html) — Deployment options：Public Cloud / On-Premises Bare Metal
- [NVIDIA：企业控制环境中的模型部署](https://docs.nvidia.com/enterprise-reference-architectures/deploying-proprietary-models-confidential-compute-self-hosted-kubernetes/latest/introduction.html) — Enterprise-controlled environments

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
