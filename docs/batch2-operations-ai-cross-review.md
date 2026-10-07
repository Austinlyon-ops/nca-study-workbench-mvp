# Day 7–8独立AI交叉复核

日期：2026-09-24。审阅者：独立于Day7–8内容编写任务的AI子任务。范围：batch2-operations.json中的10张卡、20道题与各选项解析；这是AI复核，**不是人工审题或用户实际学习验收**。

## 结果

未发现需阻止接入的技术事实或答案错配。检查了每个题干条件、正确选项、其他选项解释是否一致，并重点在线核对容易被旧教材误导的定义。

|检查点|相关卡/题|核验结果|
|---|---|---|
|nvidia-smi全称、循环查询、N/A含义|card-monitor-tools、Q-D07-001/004/010|与官方说明一致：可循环查询；不支持的字段可显示N/A，不能当0|
|GPU-Util、memory utilization、显存已用量|card-gpu-util-memory、Q-D07-002/005|区分空间占用和采样时段活动比例正确；100%不等于全部计算单元达到峰值|
|GPU Operator职责|card-k8s-gpu-operator、Q-D08-005/008|管理驱动、Toolkit、设备插件、标签、监控等组件；不能据此推出通用利用率重调度|
|MIG型号限制与A30示例|card-mig、Q-D08-003/006|官方支持表列A30最大4个实例；不能泛化所有GPU固定7份|
|L40S的MIG与vGPU字段|card-mig、Q-D08-010|官方L40S页MIG Support为No、vGPU软件支持为Yes，课程已正确分开|
|Slurm/Kubernetes职责|card-job-scheduling、card-slurm-kubernetes、Q-D08-001/002/004/009|资源调度、批作业及队列命令关系正确；没有把训练/推理写成排他边界|
|MIG与vGPU组合|card-vgpu、Q-D08-007|兼容组合存在，保留型号、驱动、profile和平台条件正确|
|Xid/温度/功耗与根因关系|card-gpu-health、Q-D07-003/007|课程保持调查线索与根因判断的区别，没有用单指标宣判硬件损坏|

官方核验：

- [nvidia-smi文档](https://docs.nvidia.com/deploy/nvidia-smi/index.html)：Description、loop、N/A、Utilization。
- [DCGM功能说明](https://docs.nvidia.com/datacenter/dcgm/latest/user-guide/feature-overview.html)：监控/诊断职责与profiling指标。
- [GPU Operator概述](https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/latest/overview.html)、[Kubernetes GPU调度](https://kubernetes.io/docs/tasks/manage-gpus/scheduling-gpus/)：设备资源准备、声明和调度。
- [MIG支持表](https://docs.nvidia.com/datacenter/tesla/mig-user-guide/supported-gpus.html)、[L40S规格](https://www.nvidia.com/en-us/data-center/l40s/)：型号事实。
- [Slurm概述](https://slurm.schedmd.com/overview.html)、[vGPU介绍](https://docs.nvidia.com/vgpu/latest/grid-vgpu-user-guide/grid-vgpu-introduction.html)：平台和共享机制。

## 已交主任务处理的有限改进

1. 跨课去重：初稿Q-D06-002与Q-D07-008场景近重复。基础设施子任务已把自己的Q6-002改成计算/存储流量争用问题；Day7题保留。已更新片段、Day6课程和证据记录，运行时由主任务同步。
2. Q-D07-005的B选项建议更精确表述为：“采样时段中有至少一个内核运行的时间比例接近100%，仍需其他指标判断效率。”这是措辞改善，不改变原正确答案B；是否同步到运行时以主任务最终内容为准。

多选type必须为运行时支持的`multiple`，这是结构适配问题，主任务已发现并统一处理；本复核不把结构校验等同上述技术语义复核。

边界：未逐项复现任何真实GPU集群配置；没有执行GPU重置、调功率、部署或修改真实学习状态。尚未有独立人工审题和学习效果证据。
