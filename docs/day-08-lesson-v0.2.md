# Day 8｜作业调度、容器编排与GPU虚拟化

状态：第二批可学习内容；非官方课程、非官方真题；不推定学习者已掌握。
建议：20分钟读核心并做3题；45分钟读解释并做6题；60分钟含展开说明与10题。按实际耗时调整，不修改正式学习计划。

## 调度：把有限资源分给合适的任务

**目标：** 把排队和资源分配与监控分开。
**一句话：** 调度决定哪个任务何时在哪些资源上运行；不会凭空增加GPU。

把集群想成共享实验室：任务提出GPU、CPU、内存和时间等需求；调度器结合可用资源、优先级、配额和策略安排运行。有空闲GPU也不保证任意任务立即开始，例如任务需要更多GPU、指定型号或受队列规则约束。观测系统告诉你发生了什么，调度系统负责按规则安排工作。

**英文术语：** Job scheduler / Resource allocation / Queue / Priority / Quota / Fair-share
**相近概念与陷阱：** 资源申请不等于实际一直忙碌；队列等待不一定是硬件故障；公平不等于每个时刻平均分。
**场景：** 示例：还有1张空闲GPU，但任务需要同节点4张。任务等待可能合理；要查看完整资源需求和队列原因。
**进一步理解：** 调度器也不能代替模型算法、CUDA运算库或硬件网络。
**核验说明：** 具体支持依版本与环境；不以课程阅读替代实机验证。
**考点：** 3.2、1.7；**培训讲义物理页：** 151–153

来源（正文为原创转述与教学示例）：
- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view)｜第三方材料｜本卡所列物理页
- [社区学习笔记08：编排、调度与虚拟化](https://drive.google.com/file/d/1jDIcg23sQjWXr7fNKxdNx483-FydD-uz/view)｜第三方材料｜12页；全文文本已读
- [SchedMD Slurm Overview](https://slurm.schedmd.com/overview.html)｜官方｜三项职责 / Architecture / User tools
- [SchedMD Slurm GRES Scheduling](https://slurm.schedmd.com/gres.html)｜官方｜GPU资源请求 / MIG Management

## Slurm与Kubernetes：工作方式有侧重

**目标：** 根据批作业和服务管理需求理解两者。
**一句话：** Slurm侧重集群资源与作业队列；Kubernetes侧重容器化工作负载及生命周期。

Slurm常用于批处理和多节点计算：提交任务、排队、分配资源、启动并跟踪任务。Kubernetes用Pod等对象组织容器化工作负载，支持调度、服务访问、扩缩和故障恢复，也能运行批处理任务。训练/推理是AI工作阶段，不是两套平台的硬性使用边界。实际选型还要看软件生态、运维和工作负载需求。

**英文术语：** Slurm / sbatch / squeue / Kubernetes / Pod / Deployment / Service / Job
**相近概念与陷阱：** 不能背“训练只用Slurm，推理只用Kubernetes”。Kubernetes具备调度能力，Slurm也能运行容器化任务。
**场景：** 示例：实验室有许多限时批作业，适合先评估作业队列；持续提供容器化API则重点考虑服务与副本管理。
**进一步理解：** sbatch用于提交批作业，squeue查看队列；认识职责即可，本课不要求部署真实集群。
**核验说明：** 将教材和笔记的训练/推理对比视为典型场景，不视为排他规则。
**考点：** 3.2；**培训讲义物理页：** 151–154

来源（正文为原创转述与教学示例）：
- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view)｜第三方材料｜本卡所列物理页
- [社区学习笔记08：编排、调度与虚拟化](https://drive.google.com/file/d/1jDIcg23sQjWXr7fNKxdNx483-FydD-uz/view)｜第三方材料｜12页；全文文本已读
- [SchedMD Slurm Overview](https://slurm.schedmd.com/overview.html)｜官方｜三项职责 / Architecture / User tools
- [Kubernetes Overview](https://kubernetes.io/docs/concepts/overview/)｜官方｜编排 / 调度 / 服务 / 批处理

## Kubernetes怎样看见GPU

**目标：** 区分GPU软件准备、资源发布和任务调度。
**一句话：** 节点有GPU硬件，还需要合适的驱动、运行配置与资源发布机制。

以常见Device Plugin方式为例：节点先具备可用驱动和容器GPU运行支持；设备插件是节点上的软件，向Kubernetes报告GPU资源；容器在Pod中声明GPU需求，再由调度器选择合适节点。NVIDIA GPU Operator是管理配套软件的控制器，按配置部署和维护驱动、Container Toolkit、设备插件、标签和DCGM监控等组件。设备插件是它可管理的组件之一；Operator本身不是根据所有应用的实时GPU利用率自动搬任务的通用调度器。

**英文术语：** Device Plugin / nvidia.com/gpu / GPU Operator / Container Toolkit / kube-scheduler
**相近概念与陷阱：** 有Docker或有GPU Operator名称都不能证明GPU应用已经可用；Operator管理组件，调度器安排工作负载。
**场景：** 示例：节点有GPU但Pod找不到可用GPU资源，检查驱动、设备插件报告、资源请求和节点约束，比直接判GPU损坏更有依据。
**进一步理解：** 当前生态也有其他资源分配机制；本课用官方Device Plugin教程讲基础流程，不宣称这是永久唯一方案。
**核验说明：** 排除讲义“GPU Operator按GPU利用率自动重平衡工作负载”的泛化说法。
**考点：** 3.2、1.1、1.6；**培训讲义物理页：** 154

来源（正文为原创转述与教学示例）：
- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view)｜第三方材料｜本卡所列物理页
- [社区学习笔记08：编排、调度与虚拟化](https://drive.google.com/file/d/1jDIcg23sQjWXr7fNKxdNx483-FydD-uz/view)｜第三方材料｜12页；全文文本已读
- [Kubernetes Schedule GPUs](https://kubernetes.io/docs/tasks/manage-gpus/scheduling-gpus/)｜官方｜驱动、device plugin及GPU资源请求
- [NVIDIA GPU Operator](https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/latest/overview.html)｜官方｜Overview

## MIG：把支持的GPU分成硬件实例

**目标：** 理解硬件隔离、容量约束与型号支持。
**一句话：** MIG在支持的GPU上划分计算和显存等资源；各实例仍受自身容量与支持条件限制。

MIG是支持的GPU上的硬件资源划分能力：按资源规格（profile）创建实例，为实例分配一定的计算、显存及相关内存通路，再供工作负载使用。像把大房间隔成有各自资源的小房间，类比的是资源边界；实例没有因此变成带独立操作系统的虚拟机。它适合需要隔离、单个任务又用不满整卡的场景。实例数量、大小及组合依型号和profile；A100/H100部分支持型号最大7个，A30最大4个，不能把“7”当全部GPU的固定规则。

**英文术语：** Multi-Instance GPU / GPU Instance / Compute Instance / MIG profile / Hardware isolation
**相近概念与陷阱：** MIG不是复制出多张满性能GPU；分成小实例后，每份可用显存也变小；普通时间切片不等于MIG硬件分区。
**场景：** 示例：多个小模型各自所需显存都能放入对应profile，可考虑MIG；一个模型装不进单个实例，不能靠增加实例数自动解决。
**进一步理解：** 先查GPU支持表、驱动和应用通信要求。MIG可用于裸机、容器或支持的虚拟化配置；是否重置、P2P等限制随架构与版本变化。
**核验说明：** 已核验讲义116页将L40S列入MIG支持为错误；官方L40S规格明确不支持MIG。
**考点：** 3.4；**培训讲义物理页：** 105、108–116

来源（正文为原创转述与教学示例）：
- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view)｜第三方材料｜本卡所列物理页
- [社区学习笔记08：编排、调度与虚拟化](https://drive.google.com/file/d/1jDIcg23sQjWXr7fNKxdNx483-FydD-uz/view)｜第三方材料｜12页；全文文本已读
- [NVIDIA MIG Introduction](https://docs.nvidia.com/datacenter/tesla/mig-user-guide/introduction.html)｜官方｜硬件分区 / 内存路径 / 部署场景
- [NVIDIA MIG Supported GPUs](https://docs.nvidia.com/datacenter/tesla/mig-user-guide/supported-gpus.html)｜官方｜Table 1 支持产品与最大实例数
- [NVIDIA MIG Deployment Considerations](https://docs.nvidia.com/datacenter/tesla/mig-user-guide/deployment-considerations.html)｜官方｜System / Application considerations
- [NVIDIA Getting Started with MIG](https://docs.nvidia.com/datacenter/tesla/mig-user-guide/getting-started-with-mig.html)｜官方｜MIG mode / GPU reset on Hopper+ / instance management
- [NVIDIA L40S Specifications](https://www.nvidia.com/en-in/data-center/l40s/)｜官方｜MIG support: No；vGPU software support: Yes

## vGPU、MIG与虚拟机如何配合

**目标：** 按虚拟机需求、隔离和兼容性选择共享方式。
**一句话：** vGPU向虚拟机提供GPU能力；可有时间切片或MIG支持的配置，并非与MIG互斥。

虚拟机有各自的操作系统环境；vGPU是提供给虚拟机使用的虚拟GPU设备，背后由物理GPU和配套软件提供能力。宿主侧管理组件与虚拟机内来宾驱动需要配合，GPU、hypervisor、配置及授权也须匹配。时间切片让多个负载轮流使用GPU执行资源；支持的MIG配合vGPU方案则可先划分硬件实例，再把相应资源提供给虚拟机。虚拟化提高共享灵活性，但不保证每个负载都达到整卡性能或自动满足所有隔离要求。

**英文术语：** Virtual GPU / Virtual machine / Hypervisor / Guest driver / Time slicing / MIG-backed vGPU / Pass-through
**相近概念与陷阱：** 整卡直通、时间切片和MIG分区不是同一机制；MIG不是只能用于容器，vGPU也不只用于虚拟桌面。
**场景：** 示例：企业要求在虚拟机内运行AI应用，先核对vGPU和平台支持；若还需要更可预测的计算/显存资源，再评估支持的MIG配置。
**进一步理解：** 核对显存profile、性能、互联功能、运维及授权；迁移等功能须逐版本验证。此课不规定必须虚拟化，也不承诺无开销。
**核验说明：** 保留硬件分区与软件管理的区别；不沿用“vGPU永远64份/MIG-backed vGPU永远7份”的通用数值。
**考点：** 3.4；**培训讲义物理页：** 108–116

来源（正文为原创转述与教学示例）：
- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view)｜第三方材料｜本卡所列物理页
- [社区学习笔记08：编排、调度与虚拟化](https://drive.google.com/file/d/1jDIcg23sQjWXr7fNKxdNx483-FydD-uz/view)｜第三方材料｜12页；全文文本已读
- [NVIDIA vGPU Introduction](https://docs.nvidia.com/vgpu/latest/grid-vgpu-user-guide/grid-vgpu-introduction.html)｜官方｜GPU Instance Support / 软件与hypervisor支持
- [NVIDIA MIG Introduction](https://docs.nvidia.com/datacenter/tesla/mig-user-guide/introduction.html)｜官方｜硬件分区 / 内存路径 / 部署场景
- [NVIDIA MIG Deployment Considerations](https://docs.nvidia.com/datacenter/tesla/mig-user-guide/deployment-considerations.html)｜官方｜System / Application considerations

## 练习与逐项解析

以下10题为本轮原创，不来自官方真题。先在Study Desk完成作答并标记猜测/不确定，再查看解析；此Markdown备份包含答案。

### Q-D08-001｜单选

任务申请同一节点4张GPU，目前仅空闲1张。为什么仍可能排队？

- A．调度器应把1张GPU自动变成4张
- B．可用资源尚不满足该任务完整要求
- C．只要有1张空闲，就说明调度器故障
- D．监控仪表盘会自动完成模型训练

**答案：B。** 调度按任务要求和资源约束分配，不能凭空增加硬件。

- A：资源不能靠调度复制。
- B：正确，还应结合队列策略查看等待原因。
- C：空闲资源不足以满足本任务不一定是故障。
- D：监控负责观察，不替代模型计算。

回到知识卡：card-job-scheduling；考点：3.2。来源与该卡一致。

### Q-D08-002｜单选

哪项正确描述Slurm和Kubernetes？

- A．Slurm只能训练、Kubernetes只能推理
- B．Kubernetes没有调度能力
- C．两者有工作方式侧重，Kubernetes也能运行批作业
- D．Slurm就是一种GPU互联硬件

**答案：C。** 典型场景不能变成使用的硬性二分。

- A：把常见用途误当唯一用途。
- B：Kubernetes具有工作负载调度能力。
- C：正确，Kubernetes官方还明确支持批处理执行。
- D：Slurm是软件工作负载管理器。

回到知识卡：card-slurm-kubernetes；考点：3.2。来源与该卡一致。

### Q-D08-003｜单选

多个小模型需要相对独立的计算和显存资源，GPU型号确认支持MIG且profile容量足够。最直接应评估哪项？

- A．仅换一个监控图表颜色
- B．把MIG实例当成无限显存
- C．仅把时间片数改大就获得同等硬件隔离
- D．采用合适MIG实例配置

**答案：D。** 题干需要的是资源分区与隔离，而不只是轮流使用。

- A：图表样式不改变资源划分。
- B：每个实例容量仍有限。
- C：时间共享不等于MIG的硬件资源分区。
- D：正确，但仍需验证应用、驱动和配置条件。

回到知识卡：card-mig；考点：3.4。来源与该卡一致。

### Q-D08-004｜单选

作业调度与监控的区别，哪项合理？

- A．调度安排任务使用资源；监控收集运行状态
- B．调度能自动增加物理GPU数量
- C．监控只要发现利用率低就必然知道唯一根因
- D．调度器必须忽略优先级和配额

**答案：A。** 调度做资源安排，观测支持理解状态，两者可以配合。

- A：正确，职责不同但可集成。
- B：调度不能创造硬件。
- C：单指标一般不足以定唯一根因。
- D：策略可包括优先级和配额。

回到知识卡：card-job-scheduling；考点：3.2。来源与该卡一致。

### Q-D08-005｜多选

在常见Device Plugin方式下，GPU容器运行和调度需要考虑哪些？（多选）

- A．合适的节点驱动与GPU容器运行支持
- B．只要Pod名字含GPU就能自动使用
- C．设备插件报告GPU资源，Pod正确提出需求
- D．GPU Operator自动证明所有应用已达到性能目标

**答案：A、C。** 软件准备和资源发布/请求都要正确，部署组件并不是应用验收。

- A：正确，是设备可用的基础。
- B：名称不是资源声明或驱动。
- C：正确，资源必须能被系统识别和申请。
- D：Operator管理组件，不能替代工作负载效果验证。

回到知识卡：card-k8s-gpu-operator；考点：3.2。来源与该卡一致。

### Q-D08-006｜单选

下列哪项对MIG实例数的理解正确？

- A．所有NVIDIA GPU都能切7份
- B．型号和profile决定上限，例如A30最大4个实例
- C．实例越多，每份显存都会自动变大
- D．不支持MIG的GPU升级一个任意驱动就一定能支持

**答案：B。** 应查支持表和profile，不能把某型号数字泛化。

- A：不是所有GPU支持MIG，上限也不相同。
- B：正确，是已核验的型号差异示例。
- C：分区不会凭空增加总显存。
- D：硬件支持是必要条件，不能这样保证。

回到知识卡：card-mig；考点：3.4。来源与该卡一致。

### Q-D08-007｜多选

企业需要在虚拟机里共享GPU，关于vGPU与MIG，选出两项正确描述。

- A．用了vGPU就绝不可能使用MIG
- B．需核查GPU、hypervisor、驱动、profile和授权支持
- C．所有vGPU配置都有完全相同的隔离和性能
- D．支持的配置可把MIG实例用于vGPU

**答案：B、D。** 虚拟化软件管理和硬件分区可以组合，支持条件仍要匹配。

- A：官方有MIG支持的vGPU配置。
- B：正确，这是部署前必要的支持关系核对。
- C：时间切片与硬件分区等机制不同，不能一概而论。
- D：正确，二者不互斥。

回到知识卡：card-vgpu；考点：3.4。来源与该卡一致。

### Q-D08-008｜单选

NVIDIA GPU Operator最直接负责哪项？

- A．根据每个模型准确率自动改写训练数据
- B．自动把所有低GPU利用率任务迁移到另一台机器
- C．管理驱动、Toolkit、设备插件和GPU监控等组件
- D．替代Kubernetes的全部控制平面

**答案：C。** Operator自动化GPU软件组件管理，不是通用实时利用率调度器。

- A：不是数据治理或模型训练职责。
- B：不能从其组件管理职责推出这种通用保证。
- C：正确，对应官方概述。
- D：它使用Kubernetes Operator机制，而不是替换整个系统。

回到知识卡：card-k8s-gpu-operator；考点：3.2。来源与该卡一致。

### Q-D08-009｜单选

管理员想看Slurm中正在排队和运行的任务，最直接的命令是？

- A．squeue
- B．nvidia-smi --query-gpu
- C．dcgm-exporter
- D．sbatch

**答案：A。** squeue查看作业队列；提交作业与查看队列是不同操作。

- A：正确，对应队列状态查看。
- B：可查询GPU，但不直接提供Slurm队列状态。
- C：输出GPU指标，不是Slurm队列命令。
- D：sbatch用于提交批作业，不是这里的查看操作。

回到知识卡：card-slurm-kubernetes；考点：3.2。来源与该卡一致。

### Q-D08-010｜单选

旧讲义把L40S列为MIG支持型号，但当前官方规格明确MIG Support为No。应怎样形成学习结论？

- A．沿用旧讲义，因为文件名包含NVIDIA
- B．删除原讲义并假装从未有过差异
- C．把vGPU支持为Yes自动解释为MIG也支持
- D．保留原来源，并在学习内容中按官方规格纠正

**答案：D。** MIG与vGPU支持是不同字段；来源冲突应留痕处理。

- A：文件名和培训品牌不证明每条陈述都正确。
- B：会丢失来源与纠错依据。
- C：二者支持条件不同，不能互推。
- D：正确，既保留原始材料又防止错误进入正式题集。

回到知识卡：card-mig；考点：3.4。来源与该卡一致。

## 做完以后

有空闲GPU为什么任务仍会排队？MIG与vGPU为什么可以配合而不是二选一？

口述自检不自动计分；延迟回忆和陌生场景迁移需要后续真实作答证据。
若有不懂的地方，反馈具体卡ID/题ID、你的原答案、自评和理由；不要用看完解析后的重答覆盖首次表现。

<!-- NCA_TEACHING_START -->

<!-- NCA teaching revision: 2026-10-02-day08-batch1 -->

## 本课与原教材：怎样搭配着学

当前主课：把资源需求、调度、GPU组件准备、硬件分区和虚拟机使用分开，靠情境解释“有卡为何仍不能运行”。

何时先用主课：先按主课理解关系，再按卡住的位置只选下面一项：排队、组件准备、MIG或vGPU。能解释相应关系就返回作答；型号、profile组合和迁移条件留到具体问题出现时核查。

原教材：原讲义151–154页平台对比和105/108–116页虚拟化示意帮助构建关系，但包含已核对的过度简化与错误。

具体差异：原116页把L40S列入MIG支持、固定七份，以及154页Operator按利用率重平衡不能采纳；训练/推理与Slurm/Kubernetes也非排他绑定。

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view)：160页培训讲义，物理页 151–153（仅排队与平台侧重疑问时选读）
  - 阅读任务：带着“任务提出什么要求、系统怎样安排资源”查看平台对比，不把训练/推理当成互斥使用规则。
  - 停止条件：能解释同节点四卡为何不能由四个节点的单卡自动满足，就返回主课。
  - 来源边界：同事提供的培训讲义，不等于已认证的官方考试教材。产品条件与版本以当前官方说明为准。
- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view)：160页培训讲义，物理页 154（仅GPU组件关系疑问时选读）
  - 阅读任务：找出GPU Operator与设备插件的关系，再对照本课的组件准备、资源报告、Pod请求与调度。
  - 停止条件：能分别说出谁准备组件、谁报告资源、谁选择节点就返回，不继续扩展安装步骤。
  - 来源边界：此页将Operator泛化为按利用率重平衡工作负载的说法不采用，按OPERATOR官方组件职责理解。
- [NVIDIA MIG Introduction](https://docs.nvidia.com/datacenter/tesla/mig-user-guide/introduction.html)：Introduction：硬件分区 / 内存路径 / 部署场景
  - 阅读任务：只辨认一张物理GPU怎样提供多个受限定实例，以及实例拥有各自资源边界的含义。
  - 停止条件：能解释增加相同小实例为什么不会自动扩大单实例显存，就返回。
  - 来源边界：具体实例数应查支持表；不采用原讲义116页的L40S支持错误，也不把某型号的实例数推广到全部GPU。
- [NVIDIA vGPU Introduction](https://docs.nvidia.com/vgpu/latest/grid-vgpu-user-guide/grid-vgpu-introduction.html)：GPU Instance Support / 软件与hypervisor支持
  - 阅读任务：只查看MIG实例与vGPU配合的关系，说明物理资源怎样提供给虚拟机；暂不展开版本矩阵。
  - 停止条件：能说清MIG与vGPU不必二选一、又需要支持条件，就返回。
  - 来源边界：示意关系不保证任意GPU、虚拟化平台或来宾系统都支持该组合。

遇到具体型号、版本、指标字段或真实操作时，打开对应知识卡中的官方依据，只查与问题有关的定义/支持条件；不把官方网站全站作为当天作业。

原目录的视频与字幕可作为补讲候选，但当前只完成目录级清点，未逐段核对；本课不指定未经核验的时间码或宣称看完某段即可覆盖考点。

完成这里的基础目标，只说明可以继续本课学习；不代表考试范围已完整覆盖、已掌握或能直接进行生产操作。

## Day 8 主课与理解练习

状态：已批准试用；教学效果待真实使用验证；用户批准日期：2026-09-25。

主课先说明原因，再用情境检查。先完成核心节，选读节留到有需要时；不要求一次做完六项短答。英文两项任选一项，可用中文回答。旧知识卡用于速查，原计分练习保持独立。

### 需要理解到什么程度

- 可用资源必须匹配需求与策略。
- 用批任务与持续服务解释平台侧重。
- 组件准备、资源发布、任务调度分别核对。
- 先查支持，再匹配单任务需求与实例容量。

## Day 8 主课｜让多个任务共享 GPU：分配、准备和隔离

Day 7 帮你看见资源状态。今天问另一个问题：谁可以使用哪些资源、何时使用，以及不同任务如何共享？先用排队与资源需求讲清机制，再认识平台名称。

- 先用中文解释关系，再把英文术语对应上；术语表达不熟与概念错误分别反馈。
- 20分钟可只完成一个核心节及一项短答；45–60分钟以核心关系和两三项回答为目标，卡住时停下补讲，可分多次完成。
- 选读节和原教材用于特定疑问的补充，不是做题前的额外通读作业。
- 可分成“排队、平台与GPU准备”和“MIG、vGPU共享”两段；两段基础关系都需要学习，命令、profile组合及迁移配置按需选读。

### 有空闲资源，任务为什么还会排队（核心）

作业是交给系统执行的一项任务，例如执行一份训练脚本并保存模型；资源申请描述它需要什么；队列保存等待安排的任务。调度器是执行分配规则的软件组件，不是监控图上的利用率数字。

提交任务时，用户说明GPU数量或类型、CPU、内存和运行时间等需求。调度器把需求与可用资源、优先级、队列和配额比较：条件满足时安排资源，条件不满足时任务可能继续等待。资源申请是需求说明，不保证任务得到资源后每一刻都充分利用它。

假设任务需要同一节点的四张GPU，而系统只有分散在不同节点的四张空闲卡。数量之和满足，不代表位置和协作条件满足。等待可能是合理约束，不必然是设备故障。

公平分配也不等于每个时刻平均分给每个人；策略可能考虑排队时间、使用历史和业务优先级。要解释等待，先查看任务完整要求和排队原因，不只盯着一张空闲卡。

#### 图上空闲，任务仍不启动

核对请求是否指定型号、同节点、内存、配额或某队列，接着看系统给出的等待原因。

没有证据时不要把等待自动写成调度器故障，也不要直接取消他人任务来“测试”。

- 监控报告状态，调度安排资源；二者合作但不是同一职责。

**这一节带走：** 可用资源必须匹配需求与策略。

<details>
<summary>依据与选读</summary>

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [社区学习笔记08：编排、调度与虚拟化](https://drive.google.com/file/d/1jDIcg23sQjWXr7fNKxdNx483-FydD-uz/view) — 12页；全文文本已读
- [SchedMD Slurm Overview](https://slurm.schedmd.com/overview.html) — 三项职责 / Architecture / User tools
- [SchedMD Slurm GRES Scheduling](https://slurm.schedmd.com/gres.html) — GPU资源请求 / MIG Management

培训讲义 TRAIN 物理页 151–153：对照本节主题的原表格/示意，不必连读整份PDF。

阅读任务：用自己的话说明“可用资源必须匹配需求与策略。”；能说明后即可返回主课。

涉及型号、版本或真实部署时再查本节官方来源的支持条件；本课概念练习不要求执行安装命令。

</details>

### Slurm 与 Kubernetes：从工作方式理解（核心）

Slurm与Kubernetes都是管理集群工作的软件系统。批作业通常提交后排队、运行到完成并产出结果：在Slurm中可提交训练脚本和资源要求，获分配后启动并跟踪作业。服务型工作负载则常需要持续接收请求；在Kubernetes中可声明运行几个容器副本，由相应控制器持续检查并尝试维持目标状态。这些准备、启动、维护和结束的工作构成工作负载的生命周期管理。

这只是侧重点，不是训练与推理的硬边界。Kubernetes也可以运行批处理任务，Slurm环境也可能运行容器。先说明要管理的工作方式，再比较平台能力与运维条件。

Pod是Kubernetes的基本部署对象，把一个或多个共同运行的容器组织在一起；例如一个模型服务容器可以放在一个Pod中。调度器为待安排的Pod选择合适节点，节点上的运行组件再启动容器；调度器不会凭空增加GPU。即使管理平台可自动重试，任务软件、数据与资源条件仍需成立。

#### 两种工作，不同关注点

夜间提交一次大计算，希望排队后完成；白天持续提供工单API，希望访问和副本受管理。两者关注点不同，仍应按实际生态评估。

不能只看到“训练”就自动判Slurm、看到“推理”就自动判Kubernetes。

- 容器编排包含调度，但不等于只会做资源排队。

**这一节带走：** 用批任务与持续服务解释平台侧重。

<details>
<summary>依据与选读</summary>

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [社区学习笔记08：编排、调度与虚拟化](https://drive.google.com/file/d/1jDIcg23sQjWXr7fNKxdNx483-FydD-uz/view) — 12页；全文文本已读
- [SchedMD Slurm Overview](https://slurm.schedmd.com/overview.html) — 三项职责 / Architecture / User tools
- [Kubernetes Overview](https://kubernetes.io/docs/concepts/overview/) — 编排 / 调度 / 服务 / 批处理

培训讲义 TRAIN 物理页 151–154：对照本节主题的原表格/示意，不必连读整份PDF。

阅读任务：用自己的话说明“用批任务与持续服务解释平台侧重。”；能说明后即可返回主课。

涉及型号、版本或真实部署时再查本节官方来源的支持条件；本课概念练习不要求执行安装命令。

</details>

### 看见硬件、发布资源与安排任务是三件事（核心）

节点装有GPU，仅说明硬件存在。应用还需要合适驱动及容器运行支持。以常见Device Plugin方式为例，设备插件是运行在节点上的软件，把可提供的GPU资源报告给Kubernetes；容器在Pod的资源声明中提出GPU需求，调度器再寻找满足条件的节点。这是把硬件变成可申请资源的过程，不是把实时GPU-Util读数当成可用卡数。

GPU Operator是在Kubernetes中管理GPU配套软件的控制器，按配置部署和维护驱动、Container Toolkit、设备插件与相关监控等组件。可以把它与设备插件的关系理解为“负责准备一组组件，其中包括负责报告资源的插件”。它解决的是组件准备和管理，不等于一个根据任意应用利用率自动把任务搬来搬去的通用调度器。

如果任务找不到GPU资源，应沿依赖关系检查：设备与驱动是否可用、资源是否正确发布、请求是否匹配、节点约束是否满足。不同失败点需要不同证据，不能一上来判硬件坏。

#### 节点有卡，Pod仍等待

假设机箱有一张GPU，设备插件尚未正常报告资源，调度器就可能找不到Pod申请的GPU；若资源已经报告，也可能因卡已被分配、申请类型或节点约束不匹配而等待。分别查看设备/驱动、资源报告和Pod等待原因，才能区分失败点。

本课只说明排查顺序，不要求部署集群或执行生产变更。

- Device Plugin是本课采用的一条基础路径，不声称是永久唯一机制。

**这一节带走：** 组件准备、资源发布、任务调度分别核对。

<details>
<summary>依据与选读</summary>

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [社区学习笔记08：编排、调度与虚拟化](https://drive.google.com/file/d/1jDIcg23sQjWXr7fNKxdNx483-FydD-uz/view) — 12页；全文文本已读
- [Kubernetes Schedule GPUs](https://kubernetes.io/docs/tasks/manage-gpus/scheduling-gpus/) — 驱动、device plugin及GPU资源请求
- [NVIDIA GPU Operator](https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/latest/overview.html) — GPU软件组件管理

培训讲义 TRAIN 物理页 154：对照本节主题的原表格/示意，不必连读整份PDF。

阅读任务：用自己的话说明“组件准备、资源发布、任务调度分别核对。”；能说明后即可返回主课。

涉及型号、版本或真实部署时再查本节官方来源的支持条件；本课概念练习不要求执行安装命令。

</details>

### MIG把资源分小，也把每份容量限定了（核心）

MIG是部分GPU支持的硬件资源划分能力。在支持的配置中，管理员选择资源规格（profile）并创建实例，把一定的计算资源、显存及相关内存通路分给各实例，再把实例分配给工作负载使用。这里的实例是同一张物理GPU内受限定的一份资源，不是复制出的满规格GPU，也不是自带操作系统的虚拟机。

把大房间隔成小房间的类比可以帮助理解容量：每间有自己的空间，但放不进小房间的物件，不会因为隔了更多房间就自动放得下。类似地，一个模型需要的显存若超过单个实例容量，就必须重新评估配置或软件分布方案。

实例组合、数量和支持条件随GPU型号与配置变化。教材把L40S列入MIG支持是已核对的错误；不能背“所有新GPU都支持”或“永远七份”。真实配置需查当前支持表与部署限制。

#### 多个小任务与一个大任务

多个各自能装进支持实例的小模型可以评估MIG；一个任务装不进实例，增加更多同样小的实例不会自动修复其容量需求。

隔离改善资源可预测性，但每份仍有上限，也不能保证任意任务都与整卡性能一样。

- 硬件分区与普通轮流使用资源并不是同一机制。

**这一节带走：** 先查支持，再匹配单任务需求与实例容量。

<details>
<summary>依据与选读</summary>

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [社区学习笔记08：编排、调度与虚拟化](https://drive.google.com/file/d/1jDIcg23sQjWXr7fNKxdNx483-FydD-uz/view) — 12页；全文文本已读
- [NVIDIA MIG Introduction](https://docs.nvidia.com/datacenter/tesla/mig-user-guide/introduction.html) — 硬件分区 / 内存路径 / 部署场景
- [NVIDIA MIG Supported GPUs](https://docs.nvidia.com/datacenter/tesla/mig-user-guide/supported-gpus.html) — Table 1 支持产品与最大实例数
- [NVIDIA MIG Deployment Considerations](https://docs.nvidia.com/datacenter/tesla/mig-user-guide/deployment-considerations.html) — System / Application considerations
- [NVIDIA Getting Started with MIG](https://docs.nvidia.com/datacenter/tesla/mig-user-guide/getting-started-with-mig.html) — MIG mode / GPU reset on Hopper+ / instance management
- [NVIDIA L40S Specifications](https://www.nvidia.com/en-in/data-center/l40s/) — MIG support: No；vGPU software support: Yes

培训讲义 TRAIN 物理页 105、108–116：对照本节主题的原表格/示意，不必连读整份PDF。

阅读任务：用自己的话说明“先查支持，再匹配单任务需求与实例容量。”；能说明后即可返回主课。

涉及型号、版本或真实部署时再查本节官方来源的支持条件；本课概念练习不要求执行安装命令。

</details>

### vGPU把能力交给虚拟机：和MIG如何关联（核心）

虚拟机有各自的操作系统环境，由虚拟化平台组织运行。vGPU是呈现给虚拟机使用的虚拟GPU设备，背后由物理GPU及配套软件提供能力。典型部署中，宿主侧的vGPU管理组件与虚拟机内的来宾驱动配合，让虚拟机中的应用使用获分配的GPU资源；因此要核对GPU、宿主平台、来宾驱动、配置及使用条件。

时间切片让多个负载轮流使用共享的GPU执行资源；MIG先建立硬件资源分区。在支持的MIG配合vGPU方案中，先在物理GPU上划出实例，再把相应资源通过vGPU提供给虚拟机。因此MIG说明资源怎样划分，vGPU说明虚拟机怎样取得GPU能力，二者不是绝对互斥，也不能把vGPU简单记成只服务虚拟桌面。

整卡直通、时间切片、MIG及相关vGPU组合，满足的共享与隔离需求不同。今天先问是否需要虚拟机、资源边界是什么、单任务需要多大容量；具体授权、迁移和互联兼容留给真实方案核查。

#### 业务要求每组使用自己的虚拟机

先明确虚拟机使用需求，再看支持的平台和GPU共享机制。若还要求更清晰的计算与显存边界，可进一步核对支持的MIG组合。

不能从“虚拟化”三个字推断任何任务都无性能影响、完全隔离或支持任意迁移。

- MIG不是只能用于容器，vGPU也不是自动拥有全部兼容功能。

**这一节带走：** 把运行环境、共享方式和资源容量分开比较。

<details>
<summary>依据与选读</summary>

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [社区学习笔记08：编排、调度与虚拟化](https://drive.google.com/file/d/1jDIcg23sQjWXr7fNKxdNx483-FydD-uz/view) — 12页；全文文本已读
- [NVIDIA vGPU Introduction](https://docs.nvidia.com/vgpu/latest/grid-vgpu-user-guide/grid-vgpu-introduction.html) — GPU Instance Support / 软件与hypervisor支持
- [NVIDIA MIG Introduction](https://docs.nvidia.com/datacenter/tesla/mig-user-guide/introduction.html) — 硬件分区 / 内存路径 / 部署场景
- [NVIDIA MIG Deployment Considerations](https://docs.nvidia.com/datacenter/tesla/mig-user-guide/deployment-considerations.html) — System / Application considerations

培训讲义 TRAIN 物理页 108–116：对照本节主题的原表格/示意，不必连读整份PDF。

阅读任务：用自己的话说明“把运行环境、共享方式和资源容量分开比较。”；能说明后即可返回主课。

涉及型号、版本或真实部署时再查本节官方来源的支持条件；本课概念练习不要求执行安装命令。

</details>

### 本课关系总结

- 可用资源必须匹配需求与策略。
- 用批任务与持续服务解释平台侧重。
- 组件准备、资源发布、任务调度分别核对。
- 先查支持，再匹配单任务需求与实例容量。

- 核心关系：有空闲资源，任务为什么还会排队；Slurm 与 Kubernetes：从工作方式理解；看见硬件、发布资源与安排任务是三件事；MIG把资源分小，也把每份容量限定了；vGPU把能力交给虚拟机：和MIG如何关联
- 第一遍认识职责与原因；产品全表、命令、支持矩阵和具体参数按需要选读，不把选读当永远跳过基础目标。
- 20分钟可完成一个核心节与一项原答；45–60分钟按实际进度选两三项回答。内容较多可分段完成，未学内容保持待学。

## 理解练习

网页和桌面源码可保存原答、修改稿与点评；本 Markdown 是可读讲义，不采集回答。先学后练，允许看提示；参考解释不等于针对性点评。

### 1. 数量够，为什么仍等待

试用练习ID：`P-D08-01`。

任务需要同节点四张GPU，四张空闲卡却分布在四个节点。仅凭总数量能判断应立即运行吗？

<details>
<summary>完成自己的回答后，再看参考解释与核对要点</summary>

**为什么这样理解：**

不能。题目要求的是“同一节点内有四张可用GPU”，而目前每个节点只有一张空闲卡；四个节点的数量相加，不能满足这条位置条件。调度器因此让任务等待，可以是正确执行请求。

应查看完整资源申请和排队原因。只有任务本身支持跨节点运行且请求相应调整时，分散的卡才可能成为另一种安排；不能仅凭总量够就把当前等待认定为故障。

**核对要点（原评价标准）：**

- 不能；需满足拓扑/位置等完整约束。
- 排队不自动证明硬件或调度器故障。

对应知识卡：card-job-scheduling；考点：3.2、1.7；相关旧题：Q-D08-001、Q-D08-004。

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [社区学习笔记08：编排、调度与虚拟化](https://drive.google.com/file/d/1jDIcg23sQjWXr7fNKxdNx483-FydD-uz/view) — 12页；全文文本已读
- [SchedMD Slurm Overview](https://slurm.schedmd.com/overview.html) — 三项职责 / Architecture / User tools
- [SchedMD Slurm GRES Scheduling](https://slurm.schedmd.com/gres.html) — GPU资源请求 / MIG Management

</details>

### 2. 英文：平台边界（英文，可用中文回答）

试用练习ID：`P-D08-02`。

A team runs a batch training job on Kubernetes. Is this inherently contradictory? Explain.

<details>
<summary>完成自己的回答后，再看参考解释与核对要点与译文</summary>

**题意：** 团队在Kubernetes运行批量训练任务，本身矛盾吗？请解释。

**为什么这样理解：**

不矛盾。batch training job表示提交后运行到完成的训练任务；Kubernetes也能管理这类批任务，并非只能维持长期在线服务。Slurm常用于作业队列、Kubernetes常用于容器工作负载管理，只是常见侧重点。

训练或推理描述AI任务在做什么，平台描述怎样组织和运行任务，两者不是一一绑定的关系。具体是否合适还要看资源、软件和运维条件；题目本身没有给出无法运行的矛盾。

**核对要点（原评价标准）：**

- 不矛盾，Kubernetes也支持批任务。
- 训练/推理不是与平台一一绑定的排他规则。

对应知识卡：card-slurm-kubernetes；考点：3.2；相关旧题：Q-D08-002、Q-D08-009。

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [社区学习笔记08：编排、调度与虚拟化](https://drive.google.com/file/d/1jDIcg23sQjWXr7fNKxdNx483-FydD-uz/view) — 12页；全文文本已读
- [SchedMD Slurm Overview](https://slurm.schedmd.com/overview.html) — 三项职责 / Architecture / User tools
- [Kubernetes Overview](https://kubernetes.io/docs/concepts/overview/) — 编排 / 调度 / 服务 / 批处理

</details>

### 3. 硬件存在与资源可用

试用练习ID：`P-D08-03`。

节点有GPU，但工作负载申请不到GPU资源。请按依赖顺序说出三类应检查的条件。

<details>
<summary>完成自己的回答后，再看参考解释与核对要点</summary>

**为什么这样理解：**

可按三类条件核查：先看设备驱动及容器GPU运行支持是否可用；再看设备插件等机制是否正常把GPU资源报告给Kubernetes；最后核对工作负载的资源请求、剩余可分配资源和节点约束是否匹配。前一类是能否使用设备，中间是系统是否知道能分配什么，后一类是这次请求能否得到分配。

例如驱动可用但插件未正常报告资源，说明硬件可见还没有变成可申请资源；资源已报告但被其他任务占用，则要查看分配情况。GPU Operator管理配套组件、调度器选择节点可帮助理解这些环节，但本题只要求说清三类核查条件，不要求额外展开这两个职责。

**核对要点（原评价标准）：**

- 驱动/运行支持、资源发布、请求与节点条件。
- Operator组件管理与调度职责的区别可作补讲；题面只问核查条件，不因未主动讲这个区别判回答缺失。

对应知识卡：card-k8s-gpu-operator；考点：3.2、1.1、1.6；相关旧题：Q-D08-005、Q-D08-008。

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [社区学习笔记08：编排、调度与虚拟化](https://drive.google.com/file/d/1jDIcg23sQjWXr7fNKxdNx483-FydD-uz/view) — 12页；全文文本已读
- [Kubernetes Schedule GPUs](https://kubernetes.io/docs/tasks/manage-gpus/scheduling-gpus/) — 驱动、device plugin及GPU资源请求
- [NVIDIA GPU Operator](https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/latest/overview.html) — GPU软件组件管理

</details>

### 4. 英文：容量限制（英文，可用中文回答）

试用练习ID：`P-D08-04`。

A model does not fit into one MIG instance. Does creating more identical instances automatically solve this? Explain.

<details>
<summary>完成自己的回答后，再看参考解释与核对要点与译文</summary>

**题意：** 模型装不进一个MIG实例，多建几个相同实例就会自动解决吗？

**为什么这样理解：**

不能自动解决。每个MIG实例都有自己的显存容量边界；多建几个相同实例，并不会把它们自动合成一个更大的、可供该模型直接使用的显存空间。

例如仅作容量示意，一个任务需要12个单位的显存，而每个实例只有10个单位，再加一个10单位实例仍没有改变单实例的上限。应评估支持的更大profile，或确实能把任务拆分运行的软件方案，并核对相应支持条件；实例数量增加本身不是解决方案。

**核对要点（原评价标准）：**

- 不能自动解决单实例容量需求。
- 需匹配profile或软件分布等实际条件。

对应知识卡：card-mig；考点：3.4；相关旧题：Q-D08-003、Q-D08-006、Q-D08-010。

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [社区学习笔记08：编排、调度与虚拟化](https://drive.google.com/file/d/1jDIcg23sQjWXr7fNKxdNx483-FydD-uz/view) — 12页；全文文本已读
- [NVIDIA MIG Introduction](https://docs.nvidia.com/datacenter/tesla/mig-user-guide/introduction.html) — 硬件分区 / 内存路径 / 部署场景
- [NVIDIA MIG Supported GPUs](https://docs.nvidia.com/datacenter/tesla/mig-user-guide/supported-gpus.html) — Table 1 支持产品与最大实例数
- [NVIDIA MIG Deployment Considerations](https://docs.nvidia.com/datacenter/tesla/mig-user-guide/deployment-considerations.html) — System / Application considerations
- [NVIDIA Getting Started with MIG](https://docs.nvidia.com/datacenter/tesla/mig-user-guide/getting-started-with-mig.html) — MIG mode / GPU reset on Hopper+ / instance management
- [NVIDIA L40S Specifications](https://www.nvidia.com/en-in/data-center/l40s/) — MIG support: No；vGPU software support: Yes

</details>

### 5. MIG与vGPU是否互斥

试用练习ID：`P-D08-05`。

某方案要求虚拟机环境又希望资源边界更清楚。为什么不能简单说vGPU和MIG必须二选一？

<details>
<summary>完成自己的回答后，再看参考解释与核对要点</summary>

**为什么这样理解：**

MIG与vGPU回答不同问题：MIG把物理GPU的一部分计算和显存资源划成实例；vGPU让虚拟机获得GPU能力。在支持的方案中，可以先创建MIG实例，再通过vGPU把相应资源提供给虚拟机，所以不是必须二选一。

这不是说任意组合都能运行。仍需核对GPU与虚拟化平台是否支持、软件版本和配置是否匹配，以及每台虚拟机内任务所需容量是否能放入分配的资源。

**核对要点（原评价标准）：**

- 支持条件下可有MIG配合vGPU的方案。
- 核查硬件、平台、配置与单任务需求，不能泛化。

对应知识卡：card-vgpu；考点：3.4；相关旧题：Q-D08-007。

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [社区学习笔记08：编排、调度与虚拟化](https://drive.google.com/file/d/1jDIcg23sQjWXr7fNKxdNx483-FydD-uz/view) — 12页；全文文本已读
- [NVIDIA vGPU Introduction](https://docs.nvidia.com/vgpu/latest/grid-vgpu-user-guide/grid-vgpu-introduction.html) — GPU Instance Support / 软件与hypervisor支持
- [NVIDIA MIG Introduction](https://docs.nvidia.com/datacenter/tesla/mig-user-guide/introduction.html) — 硬件分区 / 内存路径 / 部署场景
- [NVIDIA MIG Deployment Considerations](https://docs.nvidia.com/datacenter/tesla/mig-user-guide/deployment-considerations.html) — System / Application considerations

</details>

### 6. 综合说明：没有万能开关

试用练习ID：`P-D08-06`。

同事希望“装GPU Operator、启用MIG，就能让所有排队任务自动快起来”。请分别解释组件管理、资源分配与任务容量的作用。

<details>
<summary>完成自己的回答后，再看参考解释与核对要点</summary>

**为什么这样理解：**

GPU Operator负责部署和维护驱动、容器支持、设备插件等配套组件，使GPU具备被工作负载使用的条件；资源分配仍要由调度机制按申请、可用量和策略安排，安装组件不会自动消除排队原因。

MIG把已有资源划成较小实例，可能适合多个能放入实例的小任务，但不会增加整张GPU的总资源。若任务需要的显存超过单实例容量，划得更小反而不满足需求。因此应分别判断组件是否准备好、资源能否分配、任务是否放得下，再用实际任务表现验证是否变快。

**核对要点（原评价标准）：**

- Operator准备组件；调度受需求和策略约束；MIG划分而非创造资源。
- 性能依任务与路径，不由安装或分区自动保证。

对应知识卡：card-job-scheduling、card-slurm-kubernetes、card-k8s-gpu-operator、card-mig、card-vgpu；考点：3.2、1.7、1.1、1.6、3.4；相关旧题：Q-D08-001、Q-D08-002、Q-D08-003、Q-D08-004、Q-D08-005、Q-D08-006、Q-D08-007、Q-D08-008、Q-D08-009、Q-D08-010。

- [同事提供：NVIDIA Training NCA - AIIO.pdf](https://drive.google.com/file/d/1tdZ1BczaM8FsbGnn0KeVlAZ5t_ikvcva/view) — 每卡另附物理页码；本轮原始文件160页
- [社区学习笔记08：编排、调度与虚拟化](https://drive.google.com/file/d/1jDIcg23sQjWXr7fNKxdNx483-FydD-uz/view) — 12页；全文文本已读
- [SchedMD Slurm Overview](https://slurm.schedmd.com/overview.html) — 三项职责 / Architecture / User tools
- [SchedMD Slurm GRES Scheduling](https://slurm.schedmd.com/gres.html) — GPU资源请求 / MIG Management
- [Kubernetes Overview](https://kubernetes.io/docs/concepts/overview/) — 编排 / 调度 / 服务 / 批处理
- [Kubernetes Schedule GPUs](https://kubernetes.io/docs/tasks/manage-gpus/scheduling-gpus/) — 驱动、device plugin及GPU资源请求
- [NVIDIA GPU Operator](https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/latest/overview.html) — GPU软件组件管理
- [NVIDIA MIG Introduction](https://docs.nvidia.com/datacenter/tesla/mig-user-guide/introduction.html) — 硬件分区 / 内存路径 / 部署场景
- [NVIDIA MIG Supported GPUs](https://docs.nvidia.com/datacenter/tesla/mig-user-guide/supported-gpus.html) — Table 1 支持产品与最大实例数
- [NVIDIA MIG Deployment Considerations](https://docs.nvidia.com/datacenter/tesla/mig-user-guide/deployment-considerations.html) — System / Application considerations
- [NVIDIA Getting Started with MIG](https://docs.nvidia.com/datacenter/tesla/mig-user-guide/getting-started-with-mig.html) — MIG mode / GPU reset on Hopper+ / instance management
- [NVIDIA L40S Specifications](https://www.nvidia.com/en-in/data-center/l40s/) — MIG support: No；vGPU software support: Yes
- [NVIDIA vGPU Introduction](https://docs.nvidia.com/vgpu/latest/grid-vgpu-user-guide/grid-vgpu-introduction.html) — GPU Instance Support / 软件与hypervisor支持

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

## 回到实际薄弱点

后续按真实原答、延迟回顾与新情境表现选择复习，不以完成本课推定考试准备就绪。

- 保存原答和疑问。
- 根据实际点评决定补哪一节，而不是把所有链接再读一遍。

<!-- NCA_TEACHING_END -->
