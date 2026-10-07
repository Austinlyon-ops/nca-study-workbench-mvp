# Day 6｜AI网络、GPU互联与DPU

状态：第二批可学习基础；不是官方课程/真题，也不推定学习者已掌握。

本课包含6张卡和10道原创题。20分钟先读核心并练3题；45分钟多读解释并练6题；60分钟可完成本课并自检。可分次完成，时间是建议。

这是内容单元排序，不自动改动正式14日学习计划。

## AI网络先看流量：计算、存储、管理
卡ID：`card-network-traffic`；考点：2.7, 2.5, 1.2

**目标：** 判断一条流量在做什么，再判断性能和隔离需求。
**一句话：** GPU通信、数据读取、日常管理和带外恢复有不同目标。

计算流量包含训练时的GPU协作与同步；存储流量读数据集、写检查点；带内管理通过运行中的系统路径提供登录、调度等服务。带外管理（OOB）经独立管理控制器和通路，在生产路径或主机系统异常时仍可能可达。大数据搬运看带宽，频繁同步看延迟，也需考虑拥塞、可靠性与隔离。

**英文术语：** Compute fabric / Storage fabric / In-band management / Out-of-band（OOB）/ BMC / Checkpoint
**区别与陷阱：** 这些是职责分类，不是每个集群必须有固定三张或四张物理网络；逻辑/物理划分取决于具体架构。
**场景：** 示例：服务器OS登录失败但BMC和管理网络仍有电、可达，可通过OOB查看状态；整机失电或管理通路也坏时，OOB不保证可用。
**进一步理解：** 带外通路同样需要访问控制；它能帮助恢复，不会自动修好计算网络。
**核验边界：** 不采用固定网络数dump口诀；本课不要求对真实设备执行重启或远程电源控制。
**原讲义位置：** 物理页 40–43

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view)｜每卡另附物理页码；本轮原始文件160页｜第三方教材/笔记
- [同事提供：06-networking-for-ai.pdf](https://drive.google.com/file/d/1JCCAuLW7x_JUVUjmwIfbpsDJJnr_dmT6/view)｜物理第1–9页；全11页文本已读｜第三方教材/笔记
- [NVIDIA DGX BasePOD：网络部署](https://docs.nvidia.com/dgx-basepod/deployment-guide-dgx-basepod/latest/network-overview.html)｜Network Overview / oobmanagementnet / computenet｜官方资料
- [NVIDIA DGX BasePOD：核心组件](https://docs.nvidia.com/dgx-basepod/reference-architecture-infrastructure-foundation-enterprise-ai/latest/core-components.html)｜Compute / Network / Storage / Control Plane｜官方资料

## Ethernet与InfiniBand：网络类型与管理
卡ID：`card-ethernet-infiniband`；考点：2.8, 2.9, 2.7

**目标：** 说明两类网络都能服务AI，以及IB为什么需要SM。
**一句话：** Ethernet和InfiniBand都是互联选择，场景和完整设计比单个速率数字重要。

Ethernet以太网生态广，既用于企业网络，也能承载AI集群。InfiniBand面向高性能互联，提供RDMA等能力，重视低延迟和高带宽。Ethernet可通过RoCE使用RDMA，所以“以太网不支持RDMA”是错的。InfiniBand子网需要Subnet Manager（SM）发现和配置网络；OpenSM是一种实现，SM可以运行在合适主机或受支持交换机上。

**英文术语：** Ethernet / InfiniBand（IB）/ HCA（Host Channel Adapter）/ NIC / Subnet Manager（SM）/ OpenSM
**区别与陷阱：** Ethernet不是TCP/IP的同义词；OpenSM不是训练框架，也不是所有以太网必须安装的组件。
**场景：** 示例：组织已有成熟以太网运维，可评估RoCE方案；通信密集任务也可评估IB。应比较实际端到端表现、软件支持和运维，而不是只比较名义速率。
**进一步理解：** 网络吞吐可能受拥塞和拓扑限制；规格上的Gb/s不保证应用实际同等吞吐。
**核验边界：** 补充SM职责与实现区别；不背讲义中旧速率上限或固定微秒延迟作为普遍事实。
**原讲义位置：** 物理页 47–50、93–94

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view)｜每卡另附物理页码；本轮原始文件160页｜第三方教材/笔记
- [同事提供：06-networking-for-ai.pdf](https://drive.google.com/file/d/1JCCAuLW7x_JUVUjmwIfbpsDJJnr_dmT6/view)｜物理第1–9页；全11页文本已读｜第三方教材/笔记
- [NVIDIA DGX BasePOD：网络部署](https://docs.nvidia.com/dgx-basepod/deployment-guide-dgx-basepod/latest/network-overview.html)｜Network Overview / oobmanagementnet / computenet｜官方资料
- [NVIDIA DOCA：RDMA over Converged Ethernet](https://docs.nvidia.com/doca/sdk/rdma-over-converged-ethernet.pdf)｜PDF物理第3–4页定义/封装；第8页流控｜官方资料
- [NVIDIA：InfiniBand交换机软件管理](https://docs.nvidia.com/networking/display/QM87XX/software-management.pdf)｜InfiniBand Subnet Manager｜官方资料

## RDMA与RoCE：少让CPU搬数据
卡ID：`card-rdma-roce`；考点：2.8, 2.9

**目标：** 区分数据传输能力和承载它的网络。
**一句话：** RDMA是远程内存访问能力；RoCE是在Ethernet上实现RDMA的一类协议。

RDMA是一种由支持它的网络适配器执行的远程内存访问能力。例如应用先准备并授权一块可访问内存，再提交传输请求；适配器把数据经网络写入另一台机器已准备的目标内存，减少CPU逐段复制和部分协议处理。CPU仍参与准备、控制和应用其他工作。InfiniBand原生支持RDMA；RoCE把这类能力带到Ethernet，RoCEv2用UDP/IP封装，可跨IP子网路由。网卡、驱动、应用与网络仍须配合。

**英文术语：** RDMA（Remote Direct Memory Access）/ RoCE（RDMA over Converged Ethernet）/ RoCEv2 / Hardware offload
**区别与陷阱：** CPU少搬数据不等于整个应用不用CPU；RoCE使用UDP封装也不意味着随便丢包都没有代价。
**场景：** 示例：通信开销占用大量CPU且限制数据供给时，团队可评估RDMA；如果真正瓶颈是GPU计算，换协议未必有明显收益。
**进一步理解：** RoCE部署需要按方案处理拥塞/流控和丢包影响，常见设计涉及PFC/ECN；本课不将某种设置写成跨所有产品版本的唯一规则。
**核验边界：** 排除DMA固定CPU百分比和10–100倍加速；区分传输数据路径卸载与初始化/控制工作。
**原讲义位置：** 物理页 49–50、97–99

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view)｜每卡另附物理页码；本轮原始文件160页｜第三方教材/笔记
- [同事提供：06-networking-for-ai.pdf](https://drive.google.com/file/d/1JCCAuLW7x_JUVUjmwIfbpsDJJnr_dmT6/view)｜物理第1–9页；全11页文本已读｜第三方教材/笔记
- [NVIDIA DOCA：RDMA over Converged Ethernet](https://docs.nvidia.com/doca/sdk/rdma-over-converged-ethernet.pdf)｜PDF物理第3–4页定义/封装；第8页流控｜官方资料
- [NVIDIA GPUDirect RDMA文档](https://docs.nvidia.com/cuda/gpudirect-rdma/index.html)｜Overview / Synchronization and Memory Ordering｜官方资料

## NVLink与NVSwitch：GPU紧密协作
卡ID：`card-nvlink-nvswitch`；考点：2.2, 2.9

**目标：** 辨认GPU计算域互联与跨系统网络的关系。
**一句话：** NVLink提供GPU等处理器间高速互联，NVSwitch把多条NVLink组成交换网络。

NVLink是支持的GPU等处理器之间的高速互联技术；NVSwitch是交换芯片，在相关平台中把多个NVLink端点连成交换网络。例如GPU A把计算结果送出，经NVSwitch转发给GPU B，供下一步计算使用。常见多GPU服务器在机内使用这类互联，也有机架级NVLink域；跨域扩展通常还需InfiniBand或Ethernet。范围要看具体拓扑，软件也须安排多GPU通信。

**英文术语：** NVLink / NVSwitch / NVLink domain / Scale-up fabric / Scale-out fabric / PCIe
**区别与陷阱：** NVLink不是网卡型号；NVSwitch不是通用Ethernet交换机；NVLink也不是仅能连接两张GPU的桥。
**场景：** 示例：一个大模型分布在紧密协作的GPU上，域内通信可利用NVLink/NVSwitch；再扩大到更多系统时，需要同时规划域间网络。
**进一步理解：** 连接方式和支持范围按具体平台；不会因为互联更快就让任意应用自动把显存完全合并。
**核验边界：** 不把“只能机内”当定义；不要求背每代NVLink/NVSwitch数量或宣传加速倍数。
**原讲义位置：** 物理页 90–95

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view)｜每卡另附物理页码；本轮原始文件160页｜第三方教材/笔记
- [同事提供：06-networking-for-ai.pdf](https://drive.google.com/file/d/1JCCAuLW7x_JUVUjmwIfbpsDJJnr_dmT6/view)｜物理第1–9页；全11页文本已读｜第三方教材/笔记
- [NVIDIA NVLink：Scale-Up网络](https://developer.nvidia.com/blog/nvidia-nvlink-the-scale-up-network-for-ai-factories/)｜正文：scale-up vs scale-out / domain / GPU communication｜官方资料
- [NVIDIA HGX Platform](https://www.nvidia.com/en-us/data-center/hgx/)｜Platform overview / Partner Systems｜官方资料

## BlueField / DPU：基础设施服务卸载
卡ID：`card-bluefield-dpu`；考点：2.10, 1.6

**目标：** 说明DPU卸载什么，以及与GPU/BMC的区别。
**一句话：** DPU主要卸载、加速和隔离网络、存储、安全等基础设施工作。

DPU（数据处理单元）是一类芯片，集成可编程处理器核心、网络接口和加速引擎，常用于带有处理能力的网卡。BlueField是NVIDIA的相关产品系列。在支持的软件与配置下，原由主机CPU处理的部分网络包解析、转发或加解密可交给DPU，主机CPU因而有机会腾出资源给应用。基础设施服务也可与租户工作负载分离，效果依具体部署而定。DOCA提供开发这些服务的软件能力。

**英文术语：** DPU（Data Processing Unit）/ BlueField / Offload / Accelerate / Isolate / DOCA
**区别与陷阱：** GPU擅长并行计算；DPU偏基础设施数据处理；BMC偏设备管理。DPU不是通用备份系统，也不是空调控制器。
**场景：** 示例：多租户服务器希望隔离并加速网络/安全服务，可评估DPU；不能仅因安装卡片就宣称已解决全部安全问题。
**进一步理解：** 普通NIC与DPU都涉及网络，但DPU强调可编程基础设施服务；BlueField不同模式/产品不能无条件等同。
**核验边界：** 不将DOCA叫操作系统，不把隔离说成任何情况下主机绝不可能影响DPU，不许诺CPU开销完全消失。
**原讲义位置：** 物理页 34–35、67

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view)｜每卡另附物理页码；本轮原始文件160页｜第三方教材/笔记
- [同事提供：06-networking-for-ai.pdf](https://drive.google.com/file/d/1JCCAuLW7x_JUVUjmwIfbpsDJJnr_dmT6/view)｜物理第1–9页；全11页文本已读｜第三方教材/笔记
- [NVIDIA：What Is a DPU?](https://blogs.nvidia.com/blog/whats-a-dpu-data-processing-unit/)｜DPU components / infrastructure offload｜官方资料
- [NVIDIA BlueField Networking Platform](https://www.nvidia.com/en-us/networking/products/data-processing-unit/)｜Network / Storage / Security services｜官方资料

## GPUDirect RDMA与Storage：看数据从哪里来
卡ID：`card-gpudirect-paths`；考点：2.7, 2.9, 2.1

**目标：** 根据端点区分网络直达GPU和存储直达GPU的数据路径。
**一句话：** GPUDirect优化数据路径；RDMA关注网络设备与GPU，Storage关注存储与GPU。

GPUDirect RDMA让支持的网卡等设备直接读写GPU内存，例如把“网卡→主机内存→GPU内存”的接收路径改为“网卡→GPU内存”。GPUDirect Storage（GDS）处理存储与GPU内存之间的读写：应用通过相应软件接口读取文件，支持的存储设备或网卡可把数据送到GPU内存，省去主机内存中转。GDS可涉及本地或远程存储，远程路径也可能使用RDMA；二者不是互斥的网络类型，CPU仍可承担控制工作。

**英文术语：** GPUDirect RDMA / GPUDirect Storage（GDS）/ GPU memory / Bounce buffer（中转缓冲）/ NVMe
**区别与陷阱：** 直达数据路径不等于整个系统不用CPU；GPU、设备拓扑、驱动、存储和应用仍需满足支持条件。
**场景：** 示例：节点间网络交换训练数据，关注GPUDirect RDMA；数据集从兼容存储读入GPU，关注GDS，先确认实际路径是否启用。
**进一步理解：** GDS既可能涉及本地存储，也可能涉及远程存储；不能把讲义中远程RDMA示意图看成所有GDS的唯一结构。
**核验边界：** 讲义100页远程网络图只作示意；不继承“任何存储都自动直达GPU”的泛化。
**原讲义位置：** 物理页 98–100

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view)｜每卡另附物理页码；本轮原始文件160页｜第三方教材/笔记
- [同事提供：06-networking-for-ai.pdf](https://drive.google.com/file/d/1JCCAuLW7x_JUVUjmwIfbpsDJJnr_dmT6/view)｜物理第1–9页；全11页文本已读｜第三方教材/笔记
- [NVIDIA GPUDirect RDMA文档](https://docs.nvidia.com/cuda/gpudirect-rdma/index.html)｜Overview / Synchronization and Memory Ordering｜官方资料
- [NVIDIA GPUDirect Storage Overview](https://docs.nvidia.com/gpudirect-storage/overview-guide/index.html)｜Overview / Direct data path / compatibility｜官方资料

## 原创练习：先作答再看解析

### 1. 哪两组流量与用途的对应正确？（选两项）
题ID：`Q-D06-001`；多选

A. 带外管理流量—每一步训练的梯度计算本身
B. 计算流量—GPU之间交换训练更新
C. 存储流量—把机房供电变成直流
D. 存储流量—读取数据集和保存检查点

### 2. 集中写检查点时，多节点训练变慢；已观察到存储和计算流量争用同一链路。更合理的评估方向是？
题ID：`Q-D06-002`；单选

A. 按流量目标评估带宽、拥塞及逻辑或物理隔离
B. 只把网络命名为计算网络便能避免争用
C. 直接认定所有AI集群必须有四张物理网络
D. 仅看端口峰值速率，不再检查任务实际吞吐

### 3. 关于Ethernet与InfiniBand，哪项最准确？
题ID：`Q-D06-003`；单选

A. Ethernet无法承载任何RDMA流量
B. IB在任意产品组合下都必然拥有更高名义带宽
C. 两者都可用于AI；Ethernet可通过RoCE承载RDMA
D. 二者区别仅在网线颜色

### 4. InfiniBand子网中的Subnet Manager（SM）主要负责什么？
题ID：`Q-D06-004`；单选

A. 替代深度学习框架自动训练模型
B. 发现和配置子网；OpenSM是一种实现
C. 保证所有Ethernet网络无需交换机
D. 给GPU风扇直接供电

### 5. 关于RDMA/RoCE，哪两项正确？（选两项）
题ID：`Q-D06-005`；多选

A. RDMA网卡可减少CPU在数据搬运路径上的开销
B. RoCEv2运行后整个应用不再需要CPU
C. 任意普通网卡都自动支持RDMA
D. RoCE把RDMA能力带到Ethernet，仍需端到端支持

### 6. 团队要让RoCE流量跨IP子网，下面哪项描述有助于判断方案？
题ID：`Q-D06-006`；单选

A. RoCEv2只能在同一根物理线缆上工作
B. RoCE就是NVSwitch的别名
C. RoCEv2使用UDP/IP封装，但仍需规划路由和拥塞控制
D. 使用UDP封装后丢包就不会影响传输性能

### 7. 哪项最能说明NVLink、NVSwitch与IB/Ethernet的关系？
题ID：`Q-D06-007`；单选

A. NVSwitch是任意Ethernet网卡的新名称
B. NVLink保证任意软件自动把所有显存合成一块
C. 有NVLink就完全不需要集群网络
D. NVLink/NVSwitch组织紧密GPU计算域，IB/Ethernet可继续连接更多系统

### 8. 团队希望把部分网络、安全和存储服务从主机CPU卸载，并与租户应用隔离，更直接评估哪类组件？
题ID：`Q-D06-008`；单选

A. PUE比值
B. UPS电池
C. BlueField DPU及其软件服务
D. 只包含模型权重的文件

### 9. 哪两项关于DPU的边界说明正确？（选两项）
题ID：`Q-D06-009`；多选

A. 装上DPU即可保证任何配置都完全安全
B. 它可以帮助卸载基础设施服务，但不是通用GPU替代品
C. DOCA就是冷却液分配设备
D. 隔离与加速效果需要核对具体硬件模式、软件和配置

### 10. 哪项对应最合理？
题ID：`Q-D06-010`；单选

A. GPUDirect RDMA关注网络设备访问GPU内存；GDS关注存储与GPU的数据路径
B. GDS只负责风扇转速，RDMA只负责模型准确率
C. GPUDirect等于把CPU从服务器中物理拆掉
D. 所有NVMe和GPU组合都会自动启用GDS直接路径

## 答案与逐项解析

### 1. B / D
按数据在做什么分类，有助于定位拥塞和选择网络需求。

A：带外偏设备状态和恢复管理，并非模型数学计算。
B：正确：多GPU训练的协作数据属于计算通信。
C：供电变换不是存储网络职责。
D：正确：数据集与检查点都是存储访问。
关联卡：`card-network-traffic`；依据：TRAIN, NOTE06, B2-NETWORK, B2-BASEPOD

### 2. A
计算同步与存储写入可能互相干扰，应依据实际负载和拓扑评估容量与隔离方式。

A：正确：针对已观察到的争用，检查流量需求与实际网络设计。
B：名字不会改变带宽、拥塞或隔离配置。
C：物理和逻辑网络划分依具体架构，不能由固定数量代替设计。
D：名义速率不能反映拥塞下的端到端应用表现。
关联卡：`card-network-traffic`；依据：TRAIN, NOTE06, B2-NETWORK, B2-BASEPOD

### 3. C
选择需要考虑完整软硬件和应用表现，不能靠绝对化口诀。

A：RoCE就是Ethernet上的RDMA方案。
B：代际和配置不同，不能作无条件比较。
C：正确：这是技术关系及使用场景的合理表述。
D：协议、适配器、交换与管理方式都有实质区别。
关联卡：`card-ethernet-infiniband`；依据：TRAIN, NOTE06, B2-NETWORK, B2-ROCE, B2-SM

### 4. B
SM负责InfiniBand子网管理，可运行在受支持交换机或相连主机。

A：训练由框架及计算资源完成。
B：正确：区分管理职责和实现名称。
C：SM不替代以太网交换网络。
D：风扇供电不是子网管理职责。
关联卡：`card-ethernet-infiniband`；依据：TRAIN, NOTE06, B2-NETWORK, B2-ROCE, B2-SM

### 5. A / D
RDMA优化数据路径，能力必须由硬件、驱动、软件和网络设计配合。

A：正确：硬件承担数据搬运是主要收益之一。
B：应用控制、初始化和同步等仍可能使用CPU。
C：普通以太网能力不等于RDMA支持。
D：正确：协议名不是免配置或免兼容的承诺。
关联卡：`card-rdma-roce`；依据：TRAIN, NOTE06, B2-ROCE, B2-GDR

### 6. C
RoCEv2支持IP层路由；能路由不意味着所有网络条件自动合格。

A：IP层能力允许适当配置下跨子网。
B：NVSwitch是NVLink交换组件，概念不同。
C：正确：封装能力与实际网络设计需要一起考虑。
D：丢包仍可能带来重传与性能影响。
关联卡：`card-rdma-roce`；依据：TRAIN, NOTE06, B2-ROCE, B2-GDR

### 7. D
域内紧密协作和系统间扩展是相互配合的层次；现代NVLink域也可能达到机架规模。

A：NVSwitch服务NVLink交换，不是通用网卡。
B：内存使用仍需软件支持。
C：外部节点、存储和管理等仍有互联需要。
D：正确：抓住互补层次，而不是绝对机内/机外口诀。
关联卡：`card-nvlink-nvswitch`；依据：TRAIN, NOTE06, B2-NVLINK, B2-HGX

### 8. C
DPU针对基础设施服务的数据处理与隔离；部署效果仍需验证。

A：PUE是设施能效指标，不是处理器。
B：UPS负责供电保障，不执行这些基础设施服务。
C：正确：这与DPU的职责匹配。
D：权重文件不提供基础设施卸载能力。
关联卡：`card-bluefield-dpu`；依据：TRAIN, NOTE06, B2-DPU, B2-BLUEFIELD

### 9. B / D
产品职责与条件要同时理解，不能把部署组件当作自动完成所有目标。

A：安全不是只由一张卡决定。
B：正确：GPU和DPU侧重不同工作。
C：DOCA提供软件开发能力；CDU才与冷却液分配相关。
D：正确：启用方式和支持能力影响实际结果。
关联卡：`card-bluefield-dpu`；依据：TRAIN, NOTE06, B2-DPU, B2-BLUEFIELD

### 10. A
看数据路径的端点，能分清两类能力；两者均有软硬件支持条件。

A：正确：区分网络设备与存储两个主要入口。
B：二者都不是这些职责。
C：CPU仍有控制、调度和应用等工作。
D：必须核对兼容、驱动、文件系统和实际路径。
关联卡：`card-gpudirect-paths`；依据：TRAIN, NOTE06, B2-GDR, B2-GDS

## 口述自检
用一条训练数据路径串起存储、GPU互联和跨节点网络；再说明BMC、DPU和GPU各负责什么。
口述自检不自动计分；一次答对不是已掌握。20/45/60分钟可分次完成本课。

新增题由AI原创并对照材料；未独立人工二审。学习是否有效要看用户真实作答、猜测/不确定标记、重做和后续回忆，不写入任何预设学习成绩。

<!-- NCA_TEACHING_START -->

<!-- NCA teaching revision: 2026-10-02-day06-batch1 -->

## 本课与原教材：怎样搭配着学

当前主课：按数据端点和流量用途认识协议、访问能力、互联与卸载，先建立路径再记名称。

何时先用主课：先用主课完成一个数据路径的中文解释；脑中画不出位置或箭头时，只选下方对应主题的一组页。能说明端点、搬运动作与CPU仍承担的工作就返回，不把40–100页当连续作业。

原教材：原讲义40–43页网络分层、90–100页互联与RDMA路径、34–35/67页DPU示意，适合看位置与箭头。

具体差异：工作台补足层次区别和支持条件；原材料“绕过CPU”不是完全不需要CPU，“显存池”不等于任意程序自动相加。

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view)：160页培训讲义，物理页 40–43；优先第43页网络职责图
  - 阅读任务：选一条存储、计算或管理箭头，说出它的端点与用途。
  - 停止条件：能解释为什么查看健康信息与交换训练结果要分别核查即可。
  - 来源边界：同事提供的培训讲义，不等于已认证的官方考试教材。产品条件与版本以当前官方说明为准。
- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view)：160页培训讲义，物理页 47–50；需要看RDMA搬运时再选97–99
  - 阅读任务：对照Ethernet/InfiniBand和RDMA说明，区分网络类型、访问能力与RoCE的承载关系。
  - 停止条件：能解释以太网连通为什么不足以证明RoCE可用即可，不背速率、CPU百分比或加速倍数。
  - 来源边界：第48页简化对照不表示Ethernet等于TCP；第97页性能数字不作为普遍保证。
- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view)：160页培训讲义，物理页 90–95
  - 阅读任务：只选一张GPU互联图，找端点、连接与交换位置，描述一次GPU间数据交换。
  - 停止条件：能说明互联负责传数据，而软件仍需安排多GPU计算即可。
  - 来源边界：图示有具体平台边界；不要把机内示意当所有NVLink域的范围，也不要把显存容量相加当程序可运行证明。
- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view)：160页培训讲义，物理页 98–100
  - 阅读任务：沿GPUDirect示意指出数据端点和期望省去的主机内存中转。
  - 停止条件：能区分存储读文件与网卡/GPU交换，并说出CPU仍承担的一项控制工作即可。
  - 来源边界：第100页远程存储图只是GDS的一种场景；本地存储也可能使用GDS，是否直达仍取决于支持条件。
- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view)：160页培训讲义，物理页 34–35、67
  - 阅读任务：选一张DPU示意图，指出主机CPU和DPU各处理什么，举一项可卸载的具体工作。
  - 停止条件：能用网络包处理等动作解释卸载，并保留GPU模型计算的职责即可。
  - 来源边界：同事提供的培训讲义，不等于已认证的官方考试教材。产品条件与版本以当前官方说明为准。

遇到具体型号、版本、指标字段或真实操作时，打开对应知识卡中的官方依据，只查与问题有关的定义/支持条件；不把官方网站全站作为当天作业。

原目录的视频与字幕可作为补讲候选，但当前只完成目录级清点，未逐段核对；本课不指定未经核验的时间码或宣称看完某段即可覆盖考点。

完成这里的基础目标，只说明可以继续本课学习；不代表考试范围已完整覆盖、已掌握或能直接进行生产操作。

## Day 6 主课与理解练习

状态：已批准试用；教学效果待真实使用验证；用户批准日期：2026-09-25。

主课先说明原因，再用情境检查。先完成核心节，选读节留到有需要时；不要求一次做完六项短答。英文两项任选一项，可用中文回答。旧知识卡用于速查，原计分练习保持独立。

### 需要理解到什么程度

- 用端点和用途把问题说具体。
- 先区分是什么网络、具有什么能力、实际是否可用。
- 用拓扑看范围，用软件证据看收益。

## Day 6 主课｜数据从哪里来、到哪里去：读懂 AI 互联

Day 5 解释了为什么扩展会增加协作成本。今天沿数据路径理解网络名称：先看端点和用途，再分清技术层次。不要求配置交换机或背带宽数字。

- 先用中文解释关系，再把英文术语对应上；术语表达不熟与概念错误分别反馈。
- 20分钟可只完成一个核心节及一项短答；45–60分钟以核心关系和两三项回答为目标，卡住时停下补讲，可分多次完成。
- 选读节和原教材用于特定疑问的补充，不是做题前的额外通读作业。
- 分两段：先讲流量、网络与紧密互联；随后讲GPUDirect路径与DPU。后两者属于需要建立的基本关系，配置细节才是选读。

### 同一集群中，数据也有不同旅程（核心）

节点是一台参与任务的计算单元，网卡提供相应网络连接能力；数据路径是数据经过哪些端点与中间环节。带宽关注单位时间可传多少，延迟关注一次传递要等多久；训练检查点是为后续恢复等用途保存的进展信息。

训练节点读取样本，是存储到计算节点的数据供给；不同节点交换计算结果，是计算协作；管理员查看健康状态，是管理通信。先区分这些旅程，才能讨论需要怎样的网络。

网络设计可以为不同流量安排不同逻辑或物理路径，但并不意味着每个系统都固定有三套完全独立的交换机。应从实际架构图确认边界、共享资源和访问方式。

带内管理通常借助主机正常网络与软件路径；带外管理可以使用独立管理入口，例如服务器 BMC。在主机操作系统不可用时，后者可能仍提供状态或控制台，但自身也需要供电和管理网络。

#### “网络慢”先指哪段

若读入训练数据慢，先定位存储路径；若计算完却等待其他节点，关注协作路径；若SSH失联，需区分业务数据路径与管理入口。

这三种现象都含“网络”，却未必是同一个连接或同一个问题。

- 管理网络正常不证明计算网络性能正常。

**这一节带走：** 用端点和用途把问题说具体。

<details>
<summary>依据与选读</summary>

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [同事提供：06-networking-for-ai.pdf](https://drive.google.com/file/d/1JCCAuLW7x_JUVUjmwIfbpsDJJnr_dmT6/view) — 物理第1–9页；全11页文本已读
- [NVIDIA DGX BasePOD：网络部署](https://docs.nvidia.com/dgx-basepod/deployment-guide-dgx-basepod/latest/network-overview.html) — Network Overview / oobmanagementnet / computenet
- [NVIDIA DGX BasePOD：核心组件](https://docs.nvidia.com/dgx-basepod/reference-architecture-infrastructure-foundation-enterprise-ai/latest/core-components.html) — Compute / Network / Storage / Control Plane

培训讲义 TRAIN 物理页 40–43；先看已核对的第43页网络职责图，找出计算、存储与管理各在连接什么。

阅读任务：选一条箭头说出起点、终点和用途；能区分读取样本与交换计算结果，就返回主课，不必把所有网络名称抄一遍。

涉及型号、版本或真实部署时再查本节官方来源的支持条件；本课概念练习不要求执行安装命令。

</details>

### Ethernet、InfiniBand 与 RDMA 的层次不同（核心）

两台训练服务器要交换结果，先得通过适配器、线缆和交换设备连接起来。Ethernet（以太网）和InfiniBand是两种网络技术体系，规定设备如何传递数据，各自需要相应设备和协议支持；它们都可用于AI集群。

再看数据怎样进入对方内存。RDMA（远程直接内存访问）是一种传输能力，由支持它的网络适配器执行。以一次写入为例：应用先准备并授权可访问的内存区域，再提交请求；适配器从本机内存取数据，经网络写到另一台机器已准备的目标内存。这样减少CPU逐段复制和部分协议处理；准备资源、发起工作等控制任务仍可由CPU上的软件承担。

因此，Ethernet/InfiniBand回答“使用哪类网络”，RDMA回答“能否由适配器直接在应用内存之间搬数据”。InfiniBand原生支持RDMA；RoCE是一组让RDMA使用Ethernet的协议。这是能力与承载关系，不是三个同层选项。普通以太网能连通，还不能证明网卡、驱动和应用已能使用RoCE。

InfiniBand子网还需要SM（子网管理器）这类管理软件发现设备并配置网络；OpenSM是一种实现。RoCEv2则将RDMA传输内容放入UDP/IP报文，可跨IP子网路由。第一遍知道这些对象分别负责管理和传输即可，不必学习报文格式或安装命令。

最后才比较效果：设备、拓扑、配置和负载共同影响性能。支持RDMA不等于当前路径已启用，更不保证在任意任务上比另一网络快。

#### 名称不是同一层面的三选一

“Ethernet还是RDMA”这个问题可能把网络体系与访问能力放在同一层比较。先问是否需要RDMA，再看在哪种受支持的网络方案上实现。

以太网上能ping通，只证明一种连通性，不证明RDMA路径配置正确或达到需要的性能。

- 能连通、支持某能力、该负载性能合格，是三项不同证据。

**这一节带走：** 先区分是什么网络、具有什么能力、实际是否可用。

<details>
<summary>依据与选读</summary>

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [同事提供：06-networking-for-ai.pdf](https://drive.google.com/file/d/1JCCAuLW7x_JUVUjmwIfbpsDJJnr_dmT6/view) — 物理第1–9页；全11页文本已读
- [NVIDIA DGX BasePOD：网络部署](https://docs.nvidia.com/dgx-basepod/deployment-guide-dgx-basepod/latest/network-overview.html) — Network Overview / oobmanagementnet / computenet
- [NVIDIA DOCA：RDMA over Converged Ethernet](https://docs.nvidia.com/doca/sdk/rdma-over-converged-ethernet.pdf) — PDF物理第3–4页定义/封装；第8页流控
- [NVIDIA：InfiniBand交换机软件管理](https://docs.nvidia.com/networking/display/QM87XX/software-management.pdf) — InfiniBand Subnet Manager
- [NVIDIA GPUDirect RDMA文档](https://docs.nvidia.com/cuda/gpudirect-rdma/index.html) — Overview / Synchronization and Memory Ordering

培训讲义 TRAIN 物理页 47–50：先看Ethernet/InfiniBand对照，特别留意第48页简化表不能把Ethernet等同于TCP；需要看数据搬运时再选97–99页。

阅读任务：指出网络类型、RDMA能力和RoCE承载关系；能解释“以太网连通仍不足以证明RoCE可用”即可返回。93–94页及具体管理配置按疑问选读，不必连续读完。

涉及型号、版本或真实部署时再查本节官方来源的支持条件；本课概念练习不要求执行安装命令。

</details>

### NVLink 与 NVSwitch：紧密互联中的连接和交换（核心）

先看一台支持NVLink/NVSwitch的多GPU服务器：GPU A完成一部分计算，GPU B的下一步需要这份结果。NVLink是支持的GPU等处理器之间的高速互联技术；NVSwitch是交换芯片，可把从一个NVLink端口收到的数据转发到相应端口，让多个GPU交换数据。它传递结果，模型计算仍由GPU执行。这个过程帮助理解连接与交换，真实拓扑要看平台。

网络范围不能只看机箱外观。某些平台的紧密互联域可以跨越机架级系统；不能把NVLink死记为只连接一台主机内部的两张卡。它也不是所有GPU、所有连接都自带的功能。

高速互联提供了更合适的数据交换条件，软件仍须采用受支持的并行方式。任意程序不会只因插上多张卡就自动获得总显存，也不会自动线性加速。

#### 两块大显存能否直接相加

某模型放不进单卡，增加另一张卡并不能单凭容量之和判断可以运行；需要检查程序如何分布模型、互联与运行条件。

如果应用始终只使用一张卡，另一张卡和互联能力并没有自动被利用。

- 互联能力与软件怎样用它要同时成立。

**这一节带走：** 用拓扑看范围，用软件证据看收益。

<details>
<summary>依据与选读</summary>

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [同事提供：06-networking-for-ai.pdf](https://drive.google.com/file/d/1JCCAuLW7x_JUVUjmwIfbpsDJJnr_dmT6/view) — 物理第1–9页；全11页文本已读
- [NVIDIA NVLink：Scale-Up网络](https://developer.nvidia.com/blog/nvidia-nvlink-the-scale-up-network-for-ai-factories/) — 正文：scale-up vs scale-out / domain / GPU communication
- [NVIDIA HGX Platform](https://www.nvidia.com/en-us/data-center/hgx/) — Platform overview / Partner Systems

培训讲义 TRAIN 物理页 90–95：只选一张GPU互联图，辨认GPU端点、NVLink连接和NVSwitch交换位置。

阅读任务：沿图描述GPU A的结果怎样到GPU B，再说软件仍需安排什么；能解释多卡显存为何不能对任意程序自动相加即可返回，不背各代数量和带宽。

涉及型号、版本或真实部署时再查本节官方来源的支持条件；本课概念练习不要求执行安装命令。

</details>

### GPUDirect：少走哪段路，比名字更关键（核心）

先区分两处内存：主机内存是CPU使用的系统内存，GPU内存是GPU保存计算数据的显存。收到一份将交给GPU的数据时，一种常见路径是先放进主机内存，再复制到GPU内存；这一中转会占用时间和内存带宽。GPUDirect是一组缩短这类数据路径的技术，不是一张新GPU或一个统一加速开关。

GPUDirect RDMA让支持的第三方设备直接访问GPU内存。以跨节点接收数据为例，原来可能走“本机网卡→主机内存→GPU内存”；启用受支持的直接路径后，可走“本机网卡→GPU内存”。网络仍负责把数据从远端送到本机，GPUDirect RDMA优化的是网卡等设备与GPU内存之间这一段。

GPUDirect Storage（GDS）处理存储与GPU内存之间的读写。比如程序要读训练文件，通常先读到主机内存再复制给GPU；使用GDS的软件接口和受支持路径后，存储设备或网卡的搬运引擎可把数据送到GPU内存，省去这次主机内存中转。它既可涉及本地存储，也可涉及远程存储；远程路径可能借助RDMA，所以GDS和RDMA并非互斥选项。

这些箭头是用于理解数据流的简化示意，不是所有平台的固定接线图。CPU上的软件仍可负责发起读写、准备资源和同步；拓扑、驱动、文件系统或应用不支持时，也可能走兼容中转路径。要先确认当前实际路径，再讨论收益。

#### 一次读文件和一次跨节点交换

读训练文件的请求从存储开始，目标是GPU内存，先关注GDS；另一节点算出的结果已在GPU内存中，要经网卡与本机GPU交换，先关注GPUDirect RDMA。

分别画出存储/网卡、主机内存、GPU内存，圈出期望省去的主机内存中转。若GDS读的是远程存储，路径中也可能用到RDMA；按端点分析，不把名称当作互斥选项。

- 技术名含Direct不证明当前程序真的使用了该路径。

**这一节带走：** 识别端点、减少的中转和所需条件。

<details>
<summary>依据与选读</summary>

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [同事提供：06-networking-for-ai.pdf](https://drive.google.com/file/d/1JCCAuLW7x_JUVUjmwIfbpsDJJnr_dmT6/view) — 物理第1–9页；全11页文本已读
- [NVIDIA GPUDirect RDMA文档](https://docs.nvidia.com/cuda/gpudirect-rdma/index.html) — Overview / Synchronization and Memory Ordering
- [NVIDIA GPUDirect Storage Overview](https://docs.nvidia.com/gpudirect-storage/overview-guide/index.html) — Overview / Direct data path / compatibility

培训讲义 TRAIN 物理页 98–100：只看数据路径箭头；第100页远程存储示意只是GDS的一种场景，不代表GDS必须使用远程存储。

阅读任务：指出哪段数据原本经过主机内存、哪段可以省去，以及CPU仍需做的一项工作；能分别解释读文件和跨节点交换即可返回，不背加速倍数。

涉及型号、版本或真实部署时再查本节官方来源的支持条件；本课概念练习不要求执行安装命令。

</details>

### DPU卸载的是哪些工作（核心）

服务器不只做模型计算，还要接收网络包、转发数据、处理存储访问及安全检查。DPU是一类集成可编程处理器核心、网络接口和加速引擎的芯片，常用于带有处理能力的网卡；BlueField是NVIDIA的相关产品系列。它是实际硬件，DOCA则提供开发相关服务的软件能力。

以服务器运行中的网络转发为例：一些数据包原由主机CPU上的虚拟交换软件解析、匹配转发规则，再交给目标工作负载。在受支持的部署中，可将部分处理交给DPU的网络与加速能力；数据包到达后由它按已配置规则处理并转发。把这部分工作从主机CPU移走，就是这里的“卸载”；支持的加解密或存储处理也可采用相似分工。

由此腾出的CPU资源可能用于应用控制或其他工作，GPU继续承担模型的并行计算。DPU与GPU是不同职责，不是“更专业所以可以取代GPU”；BMC则侧重查看硬件状态等设备管理，也不等于DPU。若任务主要受GPU计算限制，卸载网络处理未必明显缩短训练时间。

在支持的部署中，DPU还可帮助将基础设施服务与租户工作负载分离；隔离效果取决于运行模式、软件和配置。先确认移走的是哪项实际工作，再核对路径与效果，不能只凭装卡就保证加速或安全。

#### 比较两种瓶颈

任务甲的GPU一直忙于矩阵计算，CPU有空闲；任务乙的主机CPU忙于解析并转发大量网络包，应用因此等待。对乙，可先核查这部分转发是否受支持、能否卸载给DPU；对甲，不能仅靠这项卸载判断模型会算得更快。

即使乙能够卸载，也要比较实际CPU开销和任务耗时。改由谁处理一项工作，与整个任务能快多少，是两个需要分别说明的问题。

- 安全能力需要配置和验证，不由产品名自动保证。

**这一节带走：** 把DPU放回基础设施服务，不与模型计算混淆。

<details>
<summary>依据与选读</summary>

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [同事提供：06-networking-for-ai.pdf](https://drive.google.com/file/d/1JCCAuLW7x_JUVUjmwIfbpsDJJnr_dmT6/view) — 物理第1–9页；全11页文本已读
- [NVIDIA：What Is a DPU?](https://blogs.nvidia.com/blog/whats-a-dpu-data-processing-unit/) — DPU components / infrastructure offload
- [NVIDIA BlueField Networking Platform](https://www.nvidia.com/en-us/networking/products/data-processing-unit/) — Network / Storage / Security services

培训讲义 TRAIN 物理页 34–35、67：选一张DPU示意图，先找主机CPU、网络接口和DPU的位置，其余产品信息按需选读。

阅读任务：举一项原由主机CPU处理、可交给DPU的工作，并说GPU仍负责什么；能用具体动作解释卸载即可返回，不背宣传中的固定CPU节省比例。

涉及型号、版本或真实部署时再查本节官方来源的支持条件；本课概念练习不要求执行安装命令。

</details>

### 本课关系总结

- 用端点和用途把问题说具体。
- 先区分是什么网络、具有什么能力、实际是否可用。
- 用拓扑看范围，用软件证据看收益。

- 核心关系：同一集群中，数据也有不同旅程；Ethernet、InfiniBand 与 RDMA 的层次不同；NVLink 与 NVSwitch：紧密互联中的连接和交换；GPUDirect：少走哪段路，比名字更关键；DPU卸载的是哪些工作
- 第一遍认识职责与原因；产品全表、命令、支持矩阵和具体参数按需要选读，不把选读当永远跳过基础目标。
- 20分钟可完成一个核心节与一项原答；45–60分钟按实际进度选两三项回答。内容较多可分段完成，未学内容保持待学。

## 理解练习

网页和桌面源码可保存原答、修改稿与点评；本 Markdown 是可读讲义，不采集回答。先学后练，允许看提示；参考解释不等于针对性点评。

### 1. 三种流量

试用练习ID：`P-D06-01`。

读取样本、跨节点交换训练结果、查看服务器健康信息，分别主要属于哪类流量？为什么先区分它们？

<details>
<summary>完成自己的回答后，再看参考解释与核对要点</summary>

**为什么这样理解：**

读取样本是把数据从存储送给计算节点，属于存储流量；跨节点交换训练结果是计算节点之间协作，属于计算通信；查看服务器健康信息是在管理设备，属于管理流量。分类依据是数据为谁服务、从哪里到哪里，不是看它们是否都经过网线。

先分清用途，才能知道该检查哪段路径。例如读取样本慢要看存储供给，结果同步等待要看节点间通信；管理入口可用并不能证明这两段正常。这些用途可以共享部分设备，不能由三种用途推断一定有三套物理网络。

**核对要点（原评价标准）：**

- 分别识别存储、计算协作、管理。
- 不同端点和用途对应不同核查路径。

对应知识卡：card-network-traffic；考点：2.7、2.5、1.2；相关旧题：Q-D06-001、Q-D06-002。

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [同事提供：06-networking-for-ai.pdf](https://drive.google.com/file/d/1JCCAuLW7x_JUVUjmwIfbpsDJJnr_dmT6/view) — 物理第1–9页；全11页文本已读
- [NVIDIA DGX BasePOD：网络部署](https://docs.nvidia.com/dgx-basepod/deployment-guide-dgx-basepod/latest/network-overview.html) — Network Overview / oobmanagementnet / computenet
- [NVIDIA DGX BasePOD：核心组件](https://docs.nvidia.com/dgx-basepod/reference-architecture-infrastructure-foundation-enterprise-ai/latest/core-components.html) — Compute / Network / Storage / Control Plane

</details>

### 2. 英文：技术层次（英文，可用中文回答）

试用练习ID：`P-D06-02`。

An Ethernet network is reachable. Does this prove that a working RoCE path is available? Explain one missing check.

<details>
<summary>完成自己的回答后，再看参考解释与核对要点与译文</summary>

**题意：** 以太网可以连通，是否证明RoCE路径可用？说出仍需核查的一项。

**为什么这样理解：**

不能证明。reachable说明以太网的某种连通性成立；working RoCE path要求RDMA数据能经这条以太网路径传输。以太网是承载网络，RoCE是让RDMA使用它的协议，连通证据还没有检查RDMA能力。

可以回答一项具体缺口：例如两端网卡是否支持RoCE，或者驱动和应用是否能使用对应路径。随后还需端到端配置与实际传输核验，但本题只要求解释一项缺少的检查，不要求列全配置清单。

**核对要点（原评价标准）：**

- 普通连通性不证明RDMA能力已可用。
- 还需硬件、软件和网络配置支持核查。

对应知识卡：card-ethernet-infiniband、card-rdma-roce；考点：2.8、2.9、2.7；相关旧题：Q-D06-003、Q-D06-004、Q-D06-005、Q-D06-006。

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [同事提供：06-networking-for-ai.pdf](https://drive.google.com/file/d/1JCCAuLW7x_JUVUjmwIfbpsDJJnr_dmT6/view) — 物理第1–9页；全11页文本已读
- [NVIDIA DGX BasePOD：网络部署](https://docs.nvidia.com/dgx-basepod/deployment-guide-dgx-basepod/latest/network-overview.html) — Network Overview / oobmanagementnet / computenet
- [NVIDIA DOCA：RDMA over Converged Ethernet](https://docs.nvidia.com/doca/sdk/rdma-over-converged-ethernet.pdf) — PDF物理第3–4页定义/封装；第8页流控
- [NVIDIA：InfiniBand交换机软件管理](https://docs.nvidia.com/networking/display/QM87XX/software-management.pdf) — InfiniBand Subnet Manager
- [NVIDIA GPUDirect RDMA文档](https://docs.nvidia.com/cuda/gpudirect-rdma/index.html) — Overview / Synchronization and Memory Ordering

</details>

### 3. 多卡与软件

试用练习ID：`P-D06-03`。

模型装不进一张卡，为什么不能只把两张卡的显存相加就宣布能运行？

<details>
<summary>完成自己的回答后，再看参考解释与核对要点</summary>

**为什么这样理解：**

两张卡首先是两个各有显存的计算设备。若程序仍把整个模型只放在第一张卡，第二张卡的空闲显存不会自动替它存下溢出的部分；因此只加总容量，尚未说明程序如何使用它们。

要运行跨卡模型，软件需采用受支持的方式分布模型或计算，并安排必要的数据交换。NVLink/NVSwitch可改善支持平台上的通信条件，不能替软件决定模型怎样分布。即使容量看起来够，也要核查实际运行方式及通信条件。

**核对要点（原评价标准）：**

- 需要模型/计算分布的软件支持与通信条件。
- 互联和容量并不保证任意程序自动利用。

对应知识卡：card-nvlink-nvswitch；考点：2.2、2.9；相关旧题：Q-D06-007。

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [同事提供：06-networking-for-ai.pdf](https://drive.google.com/file/d/1JCCAuLW7x_JUVUjmwIfbpsDJJnr_dmT6/view) — 物理第1–9页；全11页文本已读
- [NVIDIA NVLink：Scale-Up网络](https://developer.nvidia.com/blog/nvidia-nvlink-the-scale-up-network-for-ai-factories/) — 正文：scale-up vs scale-out / domain / GPU communication
- [NVIDIA HGX Platform](https://www.nvidia.com/en-us/data-center/hgx/) — Platform overview / Partner Systems

</details>

### 4. 英文：CPU职责（英文，可用中文回答）

试用练习ID：`P-D06-04`。

A data-transfer path reduces CPU involvement. Does the application no longer need a CPU? Explain.

<details>
<summary>完成自己的回答后，再看参考解释与核对要点与译文</summary>

**题意：** 数据传输路径减少CPU参与，是否意味着整个应用不再需要CPU？

**为什么这样理解：**

不能。reduces CPU involvement限定的是数据搬运过程：例如让网卡直接把数据送到GPU内存，省去主机内存中转。它没有说整个应用的所有CPU工作都消失。

CPU上的软件仍可准备资源、提交读写请求或协调后续工作。以GDS读取训练文件为例，CPU上的文件系统驱动参与建立直接路径，实际数据搬运才由支持的设备完成。把“谁发起和控制”与“谁搬数据”分开，就能解释为何减少CPU开销仍需要CPU。

**核对要点（原评价标准）：**

- 减少搬运参与不等于移除控制及应用其他CPU任务。
- 结论应限定到具体传输路径。

对应知识卡：card-ethernet-infiniband、card-rdma-roce、card-gpudirect-paths；考点：2.8、2.9、2.7、2.1；相关旧题：Q-D06-003、Q-D06-004、Q-D06-005、Q-D06-006、Q-D06-010。

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [同事提供：06-networking-for-ai.pdf](https://drive.google.com/file/d/1JCCAuLW7x_JUVUjmwIfbpsDJJnr_dmT6/view) — 物理第1–9页；全11页文本已读
- [NVIDIA DGX BasePOD：网络部署](https://docs.nvidia.com/dgx-basepod/deployment-guide-dgx-basepod/latest/network-overview.html) — Network Overview / oobmanagementnet / computenet
- [NVIDIA DOCA：RDMA over Converged Ethernet](https://docs.nvidia.com/doca/sdk/rdma-over-converged-ethernet.pdf) — PDF物理第3–4页定义/封装；第8页流控
- [NVIDIA：InfiniBand交换机软件管理](https://docs.nvidia.com/networking/display/QM87XX/software-management.pdf) — InfiniBand Subnet Manager
- [NVIDIA GPUDirect RDMA文档](https://docs.nvidia.com/cuda/gpudirect-rdma/index.html) — Overview / Synchronization and Memory Ordering
- [NVIDIA GPUDirect Storage Overview](https://docs.nvidia.com/gpudirect-storage/overview-guide/index.html) — Overview / Direct data path / compatibility

</details>

### 5. 识别数据端点

试用练习ID：`P-D06-05`。

读取存储中的训练样本，与跨节点GPU交换数据，分别为什么会关注不同的GPUDirect路径？

<details>
<summary>完成自己的回答后，再看参考解释与核对要点</summary>

**为什么这样理解：**

读取训练样本时，需求是把存储中的文件内容送入GPU内存，因此关注GDS的存储读写路径。跨节点交换GPU计算结果时，数据需经过网络；GPUDirect RDMA让支持的网卡直接访问GPU内存，减少网卡与GPU之间的主机内存中转。

这是按起点、终点与用途区分，不能变成“有存储就不用RDMA”：远程存储的GDS路径也可能使用RDMA。两种场景都还要核查设备、软件及实际启用路径，名称本身不能证明加速已经发生。

**核对要点（原评价标准）：**

- 以存储→GPU和网络设备/GPU通信端点区分。
- 不从名称直接推断当前已经启用或必然加速。

对应知识卡：card-gpudirect-paths；考点：2.7、2.9、2.1；相关旧题：Q-D06-010。

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [同事提供：06-networking-for-ai.pdf](https://drive.google.com/file/d/1JCCAuLW7x_JUVUjmwIfbpsDJJnr_dmT6/view) — 物理第1–9页；全11页文本已读
- [NVIDIA GPUDirect RDMA文档](https://docs.nvidia.com/cuda/gpudirect-rdma/index.html) — Overview / Synchronization and Memory Ordering
- [NVIDIA GPUDirect Storage Overview](https://docs.nvidia.com/gpudirect-storage/overview-guide/index.html) — Overview / Direct data path / compatibility

</details>

### 6. 换情境：解释卸载

试用练习ID：`P-D06-06`。

同事说“DPU更专业，所以能替代GPU训练模型”。你会怎样按职责解释？

<details>
<summary>完成自己的回答后，再看参考解释与核对要点</summary>

**为什么这样理解：**

“更专业”必须指明专业于哪项工作。DPU可接手受支持的网络、存储或安全处理，例如按规则解析并转发网络包；GPU则承担模型训练中的大量并行计算。这两项工作都帮助训练系统运行，却不是同一职责。

将包处理交给DPU，可能减少主机CPU开销，让应用少等待；它不因此获得替代GPU训练模型的结论。是否缩短整个任务，还取决于原先是不是这项基础设施工作在限制速度。

**核对要点（原评价标准）：**

- DPU侧重基础设施网络存储安全等服务。
- GPU模型计算是不同任务；系统整体收益依工作负载。

对应知识卡：card-bluefield-dpu；考点：2.10、1.6；相关旧题：Q-D06-008、Q-D06-009。

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [同事提供：06-networking-for-ai.pdf](https://drive.google.com/file/d/1JCCAuLW7x_JUVUjmwIfbpsDJJnr_dmT6/view) — 物理第1–9页；全11页文本已读
- [NVIDIA：What Is a DPU?](https://blogs.nvidia.com/blog/whats-a-dpu-data-processing-unit/) — DPU components / infrastructure offload
- [NVIDIA BlueField Networking Platform](https://www.nvidia.com/en-us/networking/products/data-processing-unit/) — Network / Storage / Security services

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
