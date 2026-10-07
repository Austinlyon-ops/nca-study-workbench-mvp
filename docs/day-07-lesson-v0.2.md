# Day 7｜GPU监控、健康指标与运维工具

状态：第二批可学习内容；非官方课程、非官方真题；不推定学习者已掌握。
建议：20分钟读核心并做3题；45分钟读解释并做6题；60分钟含展开说明与10题。按实际耗时调整，不修改正式学习计划。

## nvidia-smi 与 DCGM：先看状态，再做持续管理

**目标：** 按需要选择快速查询、健康检查与监控集成。
**一句话：** nvidia-smi适合快速查询；DCGM提供GPU管理、健康检查与指标接口。

nvidia-smi是NVIDIA System Management Interface命令行程序：提出查询后，通过管理接口取得GPU、显存、功耗、温度和进程等信息；它也有会改变配置的管理命令。DCGM是一组GPU管理软件与接口，可采集指标、检查健康和执行诊断；可在单节点运行，也可通过Exporter等集成成集群监控。两者有能力重叠，不是必须先运行nvidia-smi再运行DCGM。

**英文术语：** nvidia-smi / NVIDIA System Management Interface / NVML / Data Center GPU Manager / dcgmi
**相近概念与陷阱：** 监控工具不是作业调度器；一次查询不是历史趋势，也不是完整硬件诊断。
**场景：** 示例：管理员先查看一台服务器的GPU状态；团队还需多节点趋势和健康事件时，设计DCGM与监控平台集成。
**进一步理解：** 只辨认读数和工具职责；本课不要求修改功率上限、清错误计数或执行GPU reset。
**核验说明：** 更正讲义“Manual only”：nvidia-smi支持循环查询；其全称不是Single System Management Interface。
**考点：** 3.1、1.1、1.6；**培训讲义物理页：** 129–133、137

来源（正文为原创转述与教学示例）：
- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view)｜第三方材料｜本卡所列物理页
- [社区学习笔记07：数据中心管理与监控](https://drive.google.com/file/d/1KsminMP_--vyYJrYQRIurt0KEcI_4gES/view)｜第三方材料｜9页；全文文本已读
- [NVIDIA System Management Interface](https://docs.nvidia.com/deploy/nvidia-smi/index.html)｜官方｜Description / Query / Utilization / Memory / Power / ECC
- [NVIDIA DCGM Feature Overview](https://docs.nvidia.com/datacenter/dcgm/latest/user-guide/feature-overview.html)｜官方｜Health and Diagnostics / Profiling Metrics

## GPU有多忙、显存占多少、显存读写有多活跃

**目标：** 读懂几个常见指标的不同含义。
**一句话：** GPU利用率、显存容量占用和显存读写忙碌程度是不同问题。

nvidia-smi的GPU利用率大致表示采样期间有内核执行的时间比例。显存已用量表示占了多少存储空间；utilization.memory描述采样期间显存读写活跃的时间比例。三者不能互换。100% GPU-Util也不能证明所有计算单元达到理论峰值；低利用率可能与任务阶段、CPU供给、存储、网络通信或任务太小有关，需要结合时间线检查。 特别区分：nvidia-smi的Memory利用率表示采样期内显存读写活动的时间比例，不是GB/s带宽读数，也不是容量占用百分比。

排除社区笔记“90%以上即接近算力饱和”和GPU-Util=SM_ACTIVE的等同写法。 2026-09-25教学审核补充区分utilization.memory与带宽、容量；按官方Utilization定义核对。

**英文术语：** GPU utilization / memory.used / memory utilization / sampling interval / bottleneck
**相近概念与陷阱：** 显存占用90%不等于GPU算力用到90%；DCGM PROF_SM_ACTIVE是跨SM平均的活动指标，不能直接等同nvidia-smi GPU-Util。
**场景：** 示例：模型先占用20GB显存，然后等待数据文件。此时显存仍高、GPU-Util却低，两项读数可以同时正确。
**进一步理解：** N/A表示该字段不可用或不支持，不能当成0或健康。先确认型号、驱动和采样口径，再比较节点。
**核验说明：** 排除社区笔记“90%以上即接近算力饱和”和GPU-Util=SM_ACTIVE的等同写法。
**考点：** 3.3；**培训讲义物理页：** 131–134

来源（正文为原创转述与教学示例）：
- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view)｜第三方材料｜本卡所列物理页
- [社区学习笔记07：数据中心管理与监控](https://drive.google.com/file/d/1KsminMP_--vyYJrYQRIurt0KEcI_4gES/view)｜第三方材料｜9页；全文文本已读
- [NVIDIA System Management Interface](https://docs.nvidia.com/deploy/nvidia-smi/index.html)｜官方｜Description / Query / Utilization / Memory / Power / ECC
- [NVIDIA DCGM Feature Overview](https://docs.nvidia.com/datacenter/dcgm/latest/user-guide/feature-overview.html)｜官方｜Health and Diagnostics / Profiling Metrics

## 温度、功耗、频率与错误：组合看证据

**目标：** 从异常读数提出可验证的检查方向。
**一句话：** 异常指标提示要调查；单个温度或错误码通常不足以判定硬件根因。

功耗用W、温度用℃、频率常用MHz；还要看功率限制、降频原因和任务表现。温度高且降频可能关联散热，但告警阈值应按型号和环境要求设定。ECC记录可纠正或不可纠正的存储错误，Xid是驱动报告的错误线索；Xid可能涉及应用、软件或硬件。保留时间、设备标识和上下文，比把一次读数直接写成“GPU坏了”更有帮助。

**英文术语：** Power draw / Power limit / Temperature / Clock / Throttling / ECC / Xid
**相近概念与陷阱：** 功率上限不是实际功耗；出现错误不等于已知根因；DCGM后台健康检查和主动诊断不是同一种操作。
**场景：** 示例：一个任务突然变慢，先比对温度、频率、降频原因和错误时间线；若要跑主动诊断，另行安排适合的维护条件。
**进一步理解：** 看增长趋势和错误类型；不把历史累计错误数当成本次新故障，也不从“诊断通过”推出全部硬件永久正常。
**核验说明：** 不采用统一85℃故障线；主动诊断可能占用或干扰GPU，不能冒充无影响监控。
**考点：** 3.3、3.1；**培训讲义物理页：** 130–134

来源（正文为原创转述与教学示例）：
- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view)｜第三方材料｜本卡所列物理页
- [社区学习笔记07：数据中心管理与监控](https://drive.google.com/file/d/1KsminMP_--vyYJrYQRIurt0KEcI_4gES/view)｜第三方材料｜9页；全文文本已读
- [NVIDIA System Management Interface](https://docs.nvidia.com/deploy/nvidia-smi/index.html)｜官方｜Description / Query / Utilization / Memory / Power / ECC
- [NVIDIA DCGM Feature Overview](https://docs.nvidia.com/datacenter/dcgm/latest/user-guide/feature-overview.html)｜官方｜Health and Diagnostics / Profiling Metrics
- [NVIDIA Xid Errors](https://docs.nvidia.com/deploy/xid-errors/introduction.html)｜官方｜What is an Xid Message / How to Use

## 从GPU读数到趋势和告警

**目标：** 区分采集、保存、展示与告警。
**一句话：** Exporter输出指标，监控系统保存与展示；能看到图还要确认采样和设备对应。

DCGM Exporter是把GPU指标提供给其他系统的软件程序，可作为独立容器或在Kubernetes GPU节点运行。在一种常见组合中，它通过DCGM取数并提供HTTP指标接口；Prometheus定期读取，将数值、时间和设备标签存成时间序列；Grafana查询这些记录来画趋势图。这个信息流不代表Exporter把所有历史主动推送给每个组件。告警还需要明确规则和通知链路，不同节点、GPU或MIG实例的标签要对应正确。

**英文术语：** Telemetry / DCGM Exporter / Prometheus / Grafana / time series / label / alert
**相近概念与陷阱：** 单张截图没有前后趋势；Exporter不是长久存储库；有仪表盘不代表通知和处置已经验证。
**场景：** 示例：训练每天同一时段变慢，用同一任务时间段的GPU与存储/网络趋势寻找相关性，然后再验证原因。
**进一步理解：** 指标采样缺失、字段不支持、时区错位或设备标签错配，都可能让看似漂亮的图得出错误结论。
**核验说明：** 具体支持依版本与环境；不以课程阅读替代实机验证。
**考点：** 3.1、3.3、1.7；**培训讲义物理页：** 133–137

来源（正文为原创转述与教学示例）：
- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view)｜第三方材料｜本卡所列物理页
- [社区学习笔记07：数据中心管理与监控](https://drive.google.com/file/d/1KsminMP_--vyYJrYQRIurt0KEcI_4gES/view)｜第三方材料｜9页；全文文本已读
- [NVIDIA DCGM Exporter](https://docs.nvidia.com/datacenter/cloud-native/gpu-telemetry/latest/dcgm-exporter.html)｜官方｜Introduction / Running / MIG support

## BMC、BCM与GPU工具各管什么

**目标：** 区分板级管理入口与集群管理软件。
**一句话：** BMC管服务器硬件入口；BCM管集群部署和运维；名称相像但职责不同。

BMC是Baseboard Management Controller，可提供硬件传感器、远程控制台和电源控制等带外能力。在其管理网络和供电正常时，即使主机操作系统不可用，仍可能通过BMC查看状态。BCM是Base Command Manager，帮助部署、配置和管理集群节点，并集成监控及工作负载管理工具。nvidia-smi/DCGM则重点提供GPU相关观测与管理。

**英文术语：** Baseboard Management Controller / Out-of-band / Base Command Manager / Provisioning
**相近概念与陷阱：** BMC不是BCM；带外管理不等于断电后仍能工作，也不是任何故障都能自动修复。
**场景：** 示例：主机SSH无响应时可检查BMC控制台；批量给新节点准备软件镜像是集群部署问题，可由BCM等平台组织。
**进一步理解：** 学习只识别管理路径，不在生产设备执行开关机、固件更新或重新部署。
**核验说明：** 不采纳“BMC是唯一恢复办法”“BCM必有额外付费”等无条件结论。
**考点：** 3.1、1.6；**培训讲义物理页：** 134–137

来源（正文为原创转述与教学示例）：
- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view)｜第三方材料｜本卡所列物理页
- [社区学习笔记07：数据中心管理与监控](https://drive.google.com/file/d/1KsminMP_--vyYJrYQRIurt0KEcI_4gES/view)｜第三方材料｜9页；全文文本已读
- [NVIDIA DGX H100/H200：BMC](https://docs.nvidia.com/dgx/dgxh100-user-guide/bmc.html)｜官方｜硬件管理、远程控制台、传感器和电源
- [NVIDIA Base Command Manager](https://www.nvidia.com/en-us/data-center/base-command-manager/)｜官方｜Provision / Monitor / Cluster management

## 练习与逐项解析

以下10题为本轮原创，不来自官方真题。先在Study Desk完成作答并标记猜测/不确定，再查看解析；此Markdown备份包含答案。

### Q-D07-001｜单选

想快速查看一台服务器当前GPU温度、显存占用和进程，哪个工具最直接？

- A．nvidia-smi
- B．NCCL
- C．Slurm作业优先级规则
- D．TensorRT

**答案：A。** nvidia-smi可在命令行直接查询GPU状态。

- A：正确，对应当前设备状态查询。
- B：它是集合通信库，不是这种状态查询入口。
- C：调度策略安排任务，不直接替代GPU状态查询。
- D：它优化推理执行，不是通用GPU监控工具。

回到知识卡：card-monitor-tools；考点：3.1。来源与该卡一致。

### Q-D07-002｜单选

GPU已占用大部分显存，但GPU-Util很低。哪项解释最合理？

- A．两项读数必有一项错误
- B．显存中可保留模型，任务此刻可能等待数据
- C．已占显存等于全部计算核心正在工作
- D．只要再增加显存就能确定消除等待

**答案：B。** 空间占用与采样期间是否计算是不同维度。

- A：二者衡量不同维度，可以同时正确。
- B：正确，这是可能场景，还需查任务时间线。
- C：显存保存数据，不代表计算一直活跃。
- D：没有确定瓶颈，不能保证增加显存有用。

回到知识卡：card-gpu-util-memory；考点：3.3。来源与该卡一致。

### Q-D07-003｜单选

GPU任务变慢且出现一次Xid错误。下一步哪项最有证据基础？

- A．把错误直接归为GPU硬件损坏
- B．立即清空全部错误计数
- C．保存时间和设备信息，结合任务与驱动日志调查
- D．只比较GPU价格

**答案：C。** Xid是调查起点，可能涉及应用、软件或硬件。

- A：错误码本身通常不足以判根因。
- B：会失去线索，也没有先确定适用处置。
- C：正确，需要上下文和关联证据。
- D：价格不能解释本次异常。

回到知识卡：card-gpu-health；考点：3.3。来源与该卡一致。

### Q-D07-004｜多选

关于nvidia-smi和DCGM，选出两项正确描述。

- A．DCGM必须超过10台GPU节点才可用
- B．nvidia-smi支持循环查询GPU状态
- C．DCGM本身就是替用户训练模型的框架
- D．DCGM可提供健康检查并集成监控系统

**答案：B、D。** 两者职责有重叠，但不是按固定节点数强制划分。

- A：没有这个固定门槛；可在单节点运行。
- B：正确，可循环查询，不仅是一次手动截图。
- C：DCGM负责管理和观测，不执行模型训练逻辑。
- D：正确，是其核心用途之一。

回到知识卡：card-monitor-tools；考点：3.1。来源与该卡一致。

### Q-D07-005｜单选

nvidia-smi的GPU-Util显示100%，最稳妥结论是？

- A．所有CUDA Core必然达到理论峰值
- B．采样时段中有至少一个内核运行的时间比例接近100%，仍需其他指标判断效率
- C．显存容量一定全部占满
- D．GPU一定没有通信或内存瓶颈

**答案：B。** 忙碌时间不等于全部算力被充分使用。

- A：该指标不直接测量每个计算单元的峰值利用。
- B：正确，采样和实际效率必须区分。
- C：显存容量占用是另一指标。
- D：忙碌并不能排除其他资源限制。

回到知识卡：card-gpu-util-memory；考点：3.3。来源与该卡一致。

### Q-D07-006｜单选

要回看多节点GPU的历史趋势，下列哪条职责链合理？

- A．Grafana执行GPU内核，nvidia-smi训练模型
- B．DCGM Exporter输出指标，Prometheus保存时序，Grafana展示
- C．DCGM Exporter自动决定所有作业排队顺序
- D．只截一张当前状态图就拥有完整历史

**答案：B。** 采集接口、时序保存和展示是可分开的环节。

- A：混淆监控工具与计算/训练。
- B：正确，是常见监控集成方式。
- C：它提供指标，不是通用作业调度器。
- D：一张截图不能记录整个时间过程。

回到知识卡：card-telemetry-pipeline；考点：3.1。来源与该卡一致。

### Q-D07-007｜多选

关于温度、功耗和错误，哪些判断合理？（多选）

- A．功率上限就是当前实际功耗
- B．所有GPU都用统一85℃作为损坏判据
- C．需结合温度、频率、降频原因和任务表现
- D．应区分历史累计错误与本时段新增错误

**答案：C、D。** 要结合型号要求、趋势和上下文，避免单值定因。

- A：上限是约束，实际功耗可明显更低。
- B：阈值因产品和条件不同；达到某温度也不是根因结论。
- C：正确，多项证据能缩小检查方向。
- D：正确，否则可能误把旧事件归到新任务。

回到知识卡：card-gpu-health；考点：3.3。来源与该卡一致。

### Q-D07-008｜单选

主机OS无响应，但BMC供电和管理网络正常。带外管理最可能提供什么帮助？

- A．从远程控制台或传感器查看硬件状态
- B．自动重训全部模型并提高准确率
- C．证明主机硬件没有故障
- D．使断开的所有电源自动恢复

**答案：A。** BMC提供独立于主机OS的一些硬件管理入口。

- A：正确，是带外管理的重要用途。
- B：BMC不负责模型训练。
- C：能访问BMC不证明其他部件正常。
- D：管理能力仍依赖供电和连接条件。

回到知识卡：card-bmc-bcm；考点：3.1。来源与该卡一致。

### Q-D07-009｜单选

为一批新GPU节点组织操作系统镜像部署和集群运维，最直接对应哪个产品职责？

- A．cuDNN提供深度学习算子
- B．BMC就是集群作业队列
- C．NVLink存放操作系统镜像
- D．Base Command Manager进行集群部署与管理

**答案：D。** BCM与板级BMC不是同一产品。

- A：算子库不组织集群节点部署。
- B：BMC是硬件管理控制器。
- C：NVLink是互联技术，不是镜像管理软件。
- D：正确，匹配集群部署和日常管理。

回到知识卡：card-bmc-bcm；考点：3.1。来源与该卡一致。

### Q-D07-010｜单选

监控面板某指标是N/A，而另一节点显示0。应该怎样处理？

- A．把N/A统一当0，两台都完全正常
- B．将N/A直接当硬件损坏
- C．先核查字段支持、采样与设备条件，再比较
- D．删除这两条记录以免影响平均值

**答案：C。** 缺失或不支持的数据不能冒充测得的零。

- A：没有测得与测得为零不是一回事。
- B：字段不可用并不等于硬件坏。
- C：正确，先确认数据口径和可用性。
- D：无依据删除会丢失观测边界。

回到知识卡：card-gpu-util-memory；考点：3.3。来源与该卡一致。

## 做完以后

GPU显存占用很高但利用率低，为什么不能直接判定GPU损坏？你还会看哪两类证据？

口述自检不自动计分；首次、猜对、不确定和重做继续分别保存，不据本课完成推定掌握。
若有不懂的地方，反馈具体卡ID/题ID、你的原答案、自评和理由；不要用看完解析后的重答覆盖首次表现。

<!-- NCA_TEACHING_START -->

<!-- NCA teaching revision: 2026-10-02-day07-batch1 -->

## 本课与原教材：怎样搭配着学

当前主课：从指标定义、时间线与任务影响组织证据，分别记录观察、假设和待补证据。

何时先用主课：先学页内主课。只有分不清某个字段、两种工具或监控链某一步时，才选择下面对应的一项阅读；每次解决一个疑问后返回，不要求连读129–137页。

原教材：原讲义129–137页提供工具对照和指标概览，适合理解工具覆盖范围；具体字段需要官方定义。

具体差异：原讲义132页“不能持续监控”和137页nvidia-smi全称有误；工作台按官方文档修正，旧图保留但不照背。

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view)：160页培训讲义，物理页 131–134（仅指标疑问时选读）
  - 阅读任务：只找与疑问字段对应的图或说明，把它归为活动时间、容量占用或其他读数；字段的准确含义以SMI官方Utilization / Memory为准。
  - 停止条件：能说明该字段测什么，以及为什么不能由单值确认根因后返回，不背完整字段表。
  - 来源边界：同事提供的培训讲义，不等于已认证的官方考试教材。产品条件与版本以当前官方说明为准。
- [NVIDIA System Management Interface](https://docs.nvidia.com/deploy/nvidia-smi/index.html)：Description / Query / Utilization / Memory（只选与当前问题有关的一小节）
  - 阅读任务：工具问题查Description / Query；利用率问题查Utilization；容量问题查Memory。注意循环查询能力，以及利用率的时间比例定义。
  - 停止条件：能将一个字段或工具动作对应回本课例子就停止，不继续阅读修改设备配置的命令。
  - 来源边界：字段支持随型号和环境变化；N/A不是0。原讲义132页的持续监控说法与137页的全称不照背。
- [NVIDIA DCGM Exporter](https://docs.nvidia.com/datacenter/cloud-native/gpu-telemetry/latest/dcgm-exporter.html)：Introduction / Running（仅监控链疑问时选读）
  - 阅读任务：只辨认Exporter的HTTP指标输出与Prometheus取数这一步，再回本课区分历史保存、图表和通知。
  - 停止条件：能说清取到指标为何还不等于收到告警就返回，不执行部署命令。
  - 来源边界：文档中的运行示例不等于本课要求安装软件，也不证明现有环境已配置完整监控。

遇到具体型号、版本、指标字段或真实操作时，打开对应知识卡中的官方依据，只查与问题有关的定义/支持条件；不把官方网站全站作为当天作业。

原目录的视频与字幕可作为补讲候选，但当前只完成目录级清点，未逐段核对；本课不指定未经核验的时间码或宣称看完某段即可覆盖考点。

完成这里的基础目标，只说明可以继续本课学习；不代表考试范围已完整覆盖、已掌握或能直接进行生产操作。

## Day 7 主课与理解练习

状态：已批准试用；教学效果待真实使用验证；用户批准日期：2026-09-25。

主课先说明原因，再用情境检查。先完成核心节，选读节留到有需要时；不要求一次做完六项短答。英文两项任选一项，可用中文回答。旧知识卡用于速查，原计分练习保持独立。

### 需要理解到什么程度

- 按问题需要组织观测，保留时间与设备身份。
- 先解释指标测什么，再说它不能证明什么。
- 用组合证据缩小范围，不用单值宣布根因。

## Day 7 主课｜看见一个指标之后，怎样形成有依据的判断

今天练的是从读数到判断。重点不是记住每个监控工具的功能表，而是知道一项证据能证明什么、还缺什么。所有数据情境都是教学假设。

- 先用中文解释关系，再把英文术语对应上；术语表达不熟与概念错误分别反馈。
- 20分钟可只完成一个核心节及一项短答；45–60分钟以核心关系和两三项回答为目标，卡住时停下补讲，可分多次完成。
- 选读节和原教材用于特定疑问的补充，不是做题前的额外通读作业。

### 忙碌、显存占用与带宽不是一个量（核心）

采样时段是这次读数概括的时间范围。GPU kernel指GPU上执行的计算代码，不是操作系统内核。先分清“占着多少空间”与“这一段时间有多活跃”，再认识工具名称。

本课的nvidia-smi GPU-Util表示采样期内至少一个GPU内核运行的时间比例，不能直接当作达到理论最大计算能力的百分比。一个GPU持续有内核运行，也可能因访存或其他限制而未充分利用所有计算能力。

特别注意：nvidia-smi的Memory利用率（utilization.memory）表示采样期内设备显存发生读写的时间比例，不是GB/s传输速度，也不是已占用显存百分比。它与显存带宽、容量占用分别理解，不能凭同一个“memory”混用。

显存占用描述已经分配或使用了多少存储空间；显存带宽描述数据搬运速度相关能力或活动。容量像“能放多少”，带宽像“搬得多快”。占满很多空间，不表示每一刻都在高速搬运，也不表示计算一定饱和。

某个工具的GPU-Util与另一个计数器的SM Activity可能有不同定义和采样方式。比较之前要看单位、采样间隔、设备标签和字段含义；无支持或无数据不能当零。

#### 两条读数能否直接下结论

假设程序已把模型放进GPU的20GB显存，随后等待下一批图片从存储读入；等待时模型数据没有被释放，所以显存占用仍高，而GPU上暂时少有计算内核运行，GPU-Util就可能较低。容量与活动描述不同方面，两条读数可以同时正确。截图本身不能证明程序确实正在等图片，还需对照任务与数据读取的时间线。

反过来GPU忙碌时间高，也要结合任务吞吐、时延和其他资源，才能判断是否存在优化空间。

- 读数定义、观察事实、原因假设要分开。

**这一节带走：** 先解释指标测什么，再说它不能证明什么。

<details>
<summary>依据与选读</summary>

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [社区学习笔记07：数据中心管理与监控](https://drive.google.com/file/d/1KsminMP_--vyYJrYQRIurt0KEcI_4gES/view) — 9页；全文文本已读
- [NVIDIA System Management Interface](https://docs.nvidia.com/deploy/nvidia-smi/index.html) — Description / Query / Utilization / Memory / Power / ECC
- [NVIDIA DCGM Feature Overview](https://docs.nvidia.com/datacenter/dcgm/latest/user-guide/feature-overview.html) — Health and Diagnostics / Profiling Metrics

培训讲义 TRAIN 物理页 131–134：对照本节主题的原表格/示意，不必连读整份PDF。

阅读任务：用自己的话说明“先解释指标测什么，再说它不能证明什么。”；能说明后即可返回主课。

涉及型号、版本或真实部署时再查本节官方来源的支持条件；本课概念练习不要求执行安装命令。

</details>

### 当前状态与长期趋势，需要不同组织方式（核心）

nvidia-smi是可在终端运行的命令行程序：你提出查询，它通过NVIDIA管理接口取得设备读数，再输出GPU、显存、功耗等状态；部分管理命令还能改变配置。它支持循环查询，因此不能记成“只允许手动看一次”。不过在终端连续看到读数，不等于历史保存、告警通知和处置流程都已建立。

DCGM是一组GPU管理软件与接口，提供指标采集、健康检查和诊断能力，也能在单节点使用。监控系统可以调用它取得GPU信息，再交给后续保存和展示组件；它与nvidia-smi有观测能力上的重叠，不是必须先运行nvidia-smi才可运行DCGM。选择工具时先问：是核对当下某台设备，还是持续采集多个设备？数据要保留多久？谁接收异常？

主动诊断与读取监控值不同，可能使用GPU资源并影响任务。学习工具职责不意味着应该在正在工作的服务器直接运行所有诊断。先了解环境与影响，再安排实际操作。

#### “昨晚为何变慢”不是当前截图能回答的

今天nvidia-smi显示正常，只说明当前所观察条件。要解释昨晚，应对齐当时任务、设备、时间范围和历史指标。

没有历史数据时应明确证据缺口，不把今天正常写成昨晚没有故障。

- 工具有功能，不代表这台设备与当前版本支持每个字段。

**这一节带走：** 按问题需要组织观测，保留时间与设备身份。

<details>
<summary>依据与选读</summary>

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [社区学习笔记07：数据中心管理与监控](https://drive.google.com/file/d/1KsminMP_--vyYJrYQRIurt0KEcI_4gES/view) — 9页；全文文本已读
- [NVIDIA System Management Interface](https://docs.nvidia.com/deploy/nvidia-smi/index.html) — Description / Query / Utilization / Memory / Power / ECC
- [NVIDIA DCGM Feature Overview](https://docs.nvidia.com/datacenter/dcgm/latest/user-guide/feature-overview.html) — Health and Diagnostics / Profiling Metrics

培训讲义 TRAIN 物理页 129–133、137：对照本节主题的原表格/示意，不必连读整份PDF。

阅读任务：用自己的话说明“按问题需要组织观测，保留时间与设备身份。”；能说明后即可返回主课。

涉及型号、版本或真实部署时再查本节官方来源的支持条件；本课概念练习不要求执行安装命令。

</details>

### 温度、功耗、频率与错误要放在同一时间线上（核心）

负载增加可能让功耗和温度上升；设备策略与条件又可能影响工作频率。要判断异常，需要对照型号支持、环境、持续时间和任务表现，不能把一个温度值当作全部GPU通用的故障线。

ECC用于检测并纠正部分存储错误，需要区分可纠正与不可纠正错误；不是出现任何计数就代表同一种严重程度。

ECC相关信息需要区分错误类型、累计值与本次新增趋势。Xid是值得调查的错误线索，但不同代码、上下文和软件硬件条件需要分别分析，不能把出现一个错误码直接翻译成“GPU已坏”。

一个有用的初步报告应写：什么时间、哪台设备、什么任务、观察到什么变化、用户感受到什么影响、还缺哪些证据。它让下一步核查有方向，同时保留不确定性。

#### 性能下降与温度变化同时发生

把同一时间窗口的频率、功耗、温度、限制原因与任务速度放在一起看，才可能支持进一步判断。

同时变化仍不自动证明因果；还要考虑负载变化、数据供给等解释，并按允许范围验证。

- 诊断通过只约束当次测试，不证明永久无故障。

**这一节带走：** 用组合证据缩小范围，不用单值宣布根因。

<details>
<summary>依据与选读</summary>

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [社区学习笔记07：数据中心管理与监控](https://drive.google.com/file/d/1KsminMP_--vyYJrYQRIurt0KEcI_4gES/view) — 9页；全文文本已读
- [NVIDIA System Management Interface](https://docs.nvidia.com/deploy/nvidia-smi/index.html) — Description / Query / Utilization / Memory / Power / ECC
- [NVIDIA DCGM Feature Overview](https://docs.nvidia.com/datacenter/dcgm/latest/user-guide/feature-overview.html) — Health and Diagnostics / Profiling Metrics
- [NVIDIA Xid Errors](https://docs.nvidia.com/deploy/xid-errors/introduction.html) — What is an Xid Message / How to Use

培训讲义 TRAIN 物理页 130–134：对照本节主题的原表格/示意，不必连读整份PDF。

阅读任务：用自己的话说明“用组合证据缩小范围，不用单值宣布根因。”；能说明后即可返回主课。

涉及型号、版本或真实部署时再查本节官方来源的支持条件；本课概念练习不要求执行安装命令。

</details>

### 从采集到告警：每一步都可能缺环节（选读）

把监控链看成一条信息流。在常见组合中，DCGM Exporter是提供GPU指标的软件程序：它通过DCGM取数，并把指标放在HTTP接口上，供Prometheus定期读取。Prometheus把数值与时间、GPU标签一起保存成时间序列；Grafana查询这些记录，画出一段时间内的趋势。这些是相互配合的组件，不是同一个软件的几个名字。

Exporter将指标提供出来，不能因此断言它已经永久保存全部历史。图表能画出来，也不能证明告警规则合理、通知送达或有人处理。需要逐环节确认。

设备标签错配、采样中断或时区不一致会造成误读。先确定图上的曲线对应哪台GPU和哪个任务时间，再把曲线关联到问题，否则可能研究了另一台设备。

#### 有红色曲线却没人收到告警

先核对是否真的配置了告警规则、规则何时触发以及通知链路，而不是假定“有仪表盘就有告警”。

如果曲线一段缺失，应标注缺测，不能用补成零的曲线证明那段设备空闲。

- 采集成功、保存成功、展示正确、通知有效是不同验收点。

**这一节带走：** 从问题所需证据反查监控链是否完整。

<details>
<summary>依据与选读</summary>

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [社区学习笔记07：数据中心管理与监控](https://drive.google.com/file/d/1KsminMP_--vyYJrYQRIurt0KEcI_4gES/view) — 9页；全文文本已读
- [NVIDIA DCGM Exporter](https://docs.nvidia.com/datacenter/cloud-native/gpu-telemetry/latest/dcgm-exporter.html) — Introduction / Running / MIG support

培训讲义 TRAIN 物理页 133–137：对照本节主题的原表格/示意，不必连读整份PDF。

阅读任务：用自己的话说明“从问题所需证据反查监控链是否完整。”；能说明后即可返回主课。

涉及型号、版本或真实部署时再查本节官方来源的支持条件；本课概念练习不要求执行安装命令。

</details>

### BMC 与 BCM：一个字母之差，作用范围不同（选读）

BMC是服务器上的基板管理控制器，是运行管理固件的硬件控制器，常提供硬件传感器、远程控制台及电源相关管理。管理员通过它的管理入口可查看风扇、温度或控制台画面，不必先进入主机操作系统；这就是本节所说的带外管理。它依赖自己的管理路径与必要供电，在主机操作系统故障时仍可能有用。

BCM是Base Command Manager，属于集群部署与管理软件。例如给一批新节点选定软件镜像和配置，再由它组织节点部署与后续监控，减少逐台准备的工作。它不是每台服务器里那块BMC控制器，两者可以在一套系统里配合。

当SSH无响应时，问题是如何取得另一条观测路径；当要给许多新节点准备环境时，问题是怎样组织批量部署。按任务与范围区分，比背两个相似缩写更稳。

#### 主机连不上，下一步先保留证据

如果已获授权且管理条件存在，可通过BMC查看状态或控制台。但能操作电源不等于应该立刻重启，重启可能改变正在调查的状态。

课堂只辨认入口；真实处置仍需根据业务影响安排。

- 带外路径也可能故障，不能称为任何情况下唯一可用入口。

**这一节带走：** 按单机硬件入口与集群软件管理区分。

<details>
<summary>依据与选读</summary>

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [社区学习笔记07：数据中心管理与监控](https://drive.google.com/file/d/1KsminMP_--vyYJrYQRIurt0KEcI_4gES/view) — 9页；全文文本已读
- [NVIDIA DGX H100/H200：BMC](https://docs.nvidia.com/dgx/dgxh100-user-guide/bmc.html) — 硬件管理、远程控制台、传感器和电源
- [NVIDIA Base Command Manager](https://www.nvidia.com/en-us/data-center/base-command-manager/) — Provision / Monitor / Cluster management

培训讲义 TRAIN 物理页 134–137：对照本节主题的原表格/示意，不必连读整份PDF。

阅读任务：用自己的话说明“按单机硬件入口与集群软件管理区分。”；能说明后即可返回主课。

涉及型号、版本或真实部署时再查本节官方来源的支持条件；本课概念练习不要求执行安装命令。

</details>

### 本课关系总结

- 按问题需要组织观测，保留时间与设备身份。
- 先解释指标测什么，再说它不能证明什么。
- 用组合证据缩小范围，不用单值宣布根因。

- 核心关系：忙碌、显存占用与带宽不是一个量；当前状态与长期趋势，需要不同组织方式；温度、功耗、频率与错误要放在同一时间线上
- 第一遍认识职责与原因；产品全表、命令、支持矩阵和具体参数按需要选读，不把选读当永远跳过基础目标。
- 20分钟可完成一个核心节与一项原答；45–60分钟按实际进度选两三项回答。内容较多可分段完成，未学内容保持待学。

## 理解练习

网页和桌面源码可保存原答、修改稿与点评；本 Markdown 是可读讲义，不采集回答。先学后练，允许看提示；参考解释不等于针对性点评。

### 1. 历史问题需要什么

试用练习ID：`P-D07-01`。

今天设备读数正常，能否证明昨晚的训练变慢与设备无关？你还需要什么证据？

<details>
<summary>完成自己的回答后，再看参考解释与核对要点</summary>

**为什么这样理解：**

不能证明。今天正常描述的是今天这一段采样；昨晚可能出现过短暂异常，也可能是数据读取等其他环节拖慢任务，当前截图无法区分。

应找到昨晚那次训练使用的设备和起止时间，再把当时的GPU指标、任务速度和相关日志放到同一时间线上比较。例如GPU活动下降是否同时伴随输入等待，可以作为核查方向；若历史记录没有保存，就明确写缺少证据，不能用今天的读数补成昨晚的结论。

**核对要点（原评价标准）：**

- 当前快照不能替代历史时段。
- 需要同任务同设备的时间线、指标与事件。

对应知识卡：card-monitor-tools；考点：3.1、1.1、1.6；相关旧题：Q-D07-001、Q-D07-004。

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [社区学习笔记07：数据中心管理与监控](https://drive.google.com/file/d/1KsminMP_--vyYJrYQRIurt0KEcI_4gES/view) — 9页；全文文本已读
- [NVIDIA System Management Interface](https://docs.nvidia.com/deploy/nvidia-smi/index.html) — Description / Query / Utilization / Memory / Power / ECC
- [NVIDIA DCGM Feature Overview](https://docs.nvidia.com/datacenter/dcgm/latest/user-guide/feature-overview.html) — Health and Diagnostics / Profiling Metrics

</details>

### 2. 英文：busy不等于efficient（英文，可用中文回答）

试用练习ID：`P-D07-02`。

A GPU reports high utilization. Does this prove the workload reaches the GPU peak compute performance? Explain.

<details>
<summary>完成自己的回答后，再看参考解释与核对要点与译文</summary>

**题意：** GPU报告高利用率，是否证明任务达到GPU峰值计算性能？

**为什么这样理解：**

不能。若这里的utilization指本课的nvidia-smi GPU-Util，它回答的是“采样期间有多少时间至少有一个内核在运行”，没有直接回答“所有计算单元每秒完成了多少计算”。

例如内核持续运行，却经常等待显存中的数据，忙碌时间仍可很高，而计算能力未充分发挥。先确认字段定义，再结合任务吞吐、时延及其他限制判断；high utilization本身不是达到peak compute performance的证据。

**核对要点（原评价标准）：**

- 忙碌时间不等于达到峰值计算性能。
- 需看指标定义与任务实际表现、其他限制。

对应知识卡：card-gpu-util-memory；考点：3.3；相关旧题：Q-D07-002、Q-D07-005、Q-D07-010。

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [社区学习笔记07：数据中心管理与监控](https://drive.google.com/file/d/1KsminMP_--vyYJrYQRIurt0KEcI_4gES/view) — 9页；全文文本已读
- [NVIDIA System Management Interface](https://docs.nvidia.com/deploy/nvidia-smi/index.html) — Description / Query / Utilization / Memory / Power / ECC
- [NVIDIA DCGM Feature Overview](https://docs.nvidia.com/datacenter/dcgm/latest/user-guide/feature-overview.html) — Health and Diagnostics / Profiling Metrics

</details>

### 3. 不要跳到根因

试用练习ID：`P-D07-03`。

出现一个错误码，同时用户说任务变慢。请写出一条观察事实、一条待验证假设和一项还需取得的证据。

<details>
<summary>完成自己的回答后，再看参考解释与核对要点</summary>

**为什么这样理解：**

一种合适写法是：观察事实——记录到了某个错误码，用户同时报告任务变慢；待验证假设——该错误可能影响了这次任务；待补证据——取得错误的具体代码、时间和设备标识，再与该任务的运行日志或速度变化对齐。其他有依据的假设和证据也可以。

这样把“看到了什么”与“可能为什么”分开。即使二者发生在相近时间，也还要核对是不是同一设备、同一任务，并按错误码含义继续分析；目前不能把假设写成GPU硬件损坏的确定结论。

**核对要点（原评价标准）：**

- 错误与影响分别记录。
- 假设不冒充根因，证据需对齐设备时间及上下文。

对应知识卡：card-gpu-health；考点：3.3、3.1；相关旧题：Q-D07-003、Q-D07-007。

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [社区学习笔记07：数据中心管理与监控](https://drive.google.com/file/d/1KsminMP_--vyYJrYQRIurt0KEcI_4gES/view) — 9页；全文文本已读
- [NVIDIA System Management Interface](https://docs.nvidia.com/deploy/nvidia-smi/index.html) — Description / Query / Utilization / Memory / Power / ECC
- [NVIDIA DCGM Feature Overview](https://docs.nvidia.com/datacenter/dcgm/latest/user-guide/feature-overview.html) — Health and Diagnostics / Profiling Metrics
- [NVIDIA Xid Errors](https://docs.nvidia.com/deploy/xid-errors/introduction.html) — What is an Xid Message / How to Use

</details>

### 4. 英文：采集与告警（选做）（英文，可用中文回答）

试用练习ID：`P-D07-04`。

Metrics are visible on a dashboard, but no alert was received. Which parts of the monitoring chain still need checking?

<details>
<summary>完成自己的回答后，再看参考解释与核对要点与译文</summary>

**题意：** 仪表盘可看到指标，但没有收到告警。还需核查监控链的哪些部分？

**为什么这样理解：**

仪表盘显示指标，只说明有数据能被查询和展示。告警还要有规则：检查是否配置了规则，数据是否满足阈值及持续时间要求，规则是否实际触发。曲线颜色本身不等于规则已经触发。

若规则已触发，再检查通知送往哪里、接收渠道是否可用、是否送达指定人员，以及收到后是否有处理安排。沿“数据→规则判断→通知→处理”逐步核对，才能知道缺的是哪一环。

**核对要点（原评价标准）：**

- 检查规则、触发条件、通知及处置链。
- 图表显示不证明告警有效。

对应知识卡：card-telemetry-pipeline；考点：3.1、3.3、1.7；相关旧题：Q-D07-006。

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [社区学习笔记07：数据中心管理与监控](https://drive.google.com/file/d/1KsminMP_--vyYJrYQRIurt0KEcI_4gES/view) — 9页；全文文本已读
- [NVIDIA DCGM Exporter](https://docs.nvidia.com/datacenter/cloud-native/gpu-telemetry/latest/dcgm-exporter.html) — Introduction / Running / MIG support

</details>

### 5. 选择观测入口（选做）

试用练习ID：`P-D07-05`。

SSH无响应与批量准备新节点分别更接近BMC还是BCM的职责？说明理由，不提出实际重启操作。

<details>
<summary>完成自己的回答后，再看参考解释与核对要点</summary>

**为什么这样理解：**

SSH无响应时，BMC更接近所需的另一条观测入口：它是服务器上的管理控制器，在管理网络与必要供电正常时，可能仍能提供传感器状态和远程控制台。SSH失败不等于BMC一定可达，也不直接说明故障原因。

批量准备新节点更接近BCM：它是部署和管理集群的软件，可组织多台机器的软件镜像与配置。两者分别对应单机硬件管理入口和跨节点软件管理；辨认入口并不要求执行重启。

**核对要点（原评价标准）：**

- BMC提供硬件管理及带外入口，BCM组织集群管理。
- 不把可以远程控制推成应立即断电重启。

对应知识卡：card-bmc-bcm；考点：3.1、1.6；相关旧题：Q-D07-008、Q-D07-009。

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [社区学习笔记07：数据中心管理与监控](https://drive.google.com/file/d/1KsminMP_--vyYJrYQRIurt0KEcI_4gES/view) — 9页；全文文本已读
- [NVIDIA DGX H100/H200：BMC](https://docs.nvidia.com/dgx/dgxh100-user-guide/bmc.html) — 硬件管理、远程控制台、传感器和电源
- [NVIDIA Base Command Manager](https://www.nvidia.com/en-us/data-center/base-command-manager/) — Provision / Monitor / Cluster management

</details>

### 6. 换情境：说明证据边界

试用练习ID：`P-D07-06`。

一张截图显示显存占用高、GPU利用率低。请给出一个可能解释，并说明为什么还不能下确定结论。

<details>
<summary>完成自己的回答后，再看参考解释与核对要点</summary>

**为什么这样理解：**

一个可能解释是：模型已经占用显存，但程序正在等下一批输入，因此暂时很少启动GPU计算。显存占用回答“数据占了多少空间”，GPU-Util回答“采样期内多长时间有内核运行”，两者同时一高一低并不矛盾。

这只是可能解释。单张截图没有告诉我们任务所处阶段、前后趋势和其他资源状态，也可能只是正常间歇。需要补任务日志和同一时段的数据供给等证据，才有条件缩小原因范围。

**核对要点（原评价标准）：**

- 可提出保留模型但等待数据等假设。
- 单快照缺少时间、任务与其他资源上下文，不足确诊。

对应知识卡：card-gpu-util-memory；考点：3.3；相关旧题：Q-D07-002、Q-D07-005、Q-D07-010。

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [社区学习笔记07：数据中心管理与监控](https://drive.google.com/file/d/1KsminMP_--vyYJrYQRIurt0KEcI_4gES/view) — 9页；全文文本已读
- [NVIDIA System Management Interface](https://docs.nvidia.com/deploy/nvidia-smi/index.html) — Description / Query / Utilization / Memory / Power / ECC
- [NVIDIA DCGM Feature Overview](https://docs.nvidia.com/datacenter/dcgm/latest/user-guide/feature-overview.html) — Health and Diagnostics / Profiling Metrics

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
