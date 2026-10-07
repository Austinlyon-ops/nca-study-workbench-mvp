# 教学完善执行记录｜2026-09-25 trial3

分类：新增后续主课、补充逐日教材导读、修正Day3教学关系与练习要求、修正Day7指标卡标题。用户已授权写入并要求NVIDIA L&E审核，当前任务继续实施。

## 教学分工

主课承担初次解释，知识卡用于复习速查，原答练习暴露具体缺口，NVIDIA L&E以6 Pro给针对性反馈；Codex负责材料准备、实现、来源核对和反馈回收。原教材用于补图、查证与扩展，核心理解不依赖用户另行加工整个官网。

## 本轮修改

|单元|本次成果|
|---|---|
|Day1–2|保留已有课程及聊天学习记录；补各自的原教材差异和阅读指引，不宣称已把聊天主课完整迁入应用。|
|Day3|完整主课经NVIDIA L&E第一轮审核后修订：模型/应用/环境，编译/训练/推理，两个Toolkit，构建与容器封装两条维度，AllReduce结果归属，兼容条件变化后的不同核查方向。|
|Day4|从模型计算到服务交付：接口与请求、质量与速度、执行与服务、资源入口与企业支持、持续运行。|
|Day5|从容量/计算/供给问题到系统扩展、通信开销、设施约束、PUE及部署取舍。|
|Day6|从数据端点与流量到Ethernet/InfiniBand、RDMA/RoCE、NVLink、GPUDirect和DPU；可分两段，核心关系不因靠后而省略。|
|Day7|先学指标再认识工具；区分活动比例、容量、带宽与时间线，连接观测、告警和管理入口。|
|Day8|资源需求与排队、平台工作方式、组件准备和资源发布、MIG与vGPU共享；高级配置另层选读。|

Day3–8共36项可保存原答的讲后练习，每次精选少量，英文两项任选一项且可中文回答。不是新增36道必须一次完成的考试题，不冒充独立未见迁移。Day3两项题面的范围调整随teachingRevision保留版本边界，旧原答不追溯改判。

Day1–8的“本课与原教材”提供当前课程作用、原材料额外价值、具体差异、进入条件、物理页/阅读任务和停止条件。完整主课下方的原知识卡默认折叠为学后速查；按问题定位卡片和返回完整讲解仍保留。

## 审核与原教材证据

- 第一轮：向指定对话提供Day3 trial2完整数据、Day4–8旧卡正文及已知来源限制；6 Pro返回[教学审核原文](teaching-review-chatgpt-2026-09-25.md)。它没有直接遍历本地项目，审核范围是实际交付的材料。
- 第二轮：将Day4–8新增主课正文、例子、题干/rubric和教材导读再次交给同一6 Pro做有边界的终审。最终处置见本文后续记录。
- 原教材：本地缓存 `tmp/sources/training-aiio.pdf` 共160物理页，使用其带物理页标记的抽取文本核对主题位置；重点细读18/21、34/40/49/55/64/79/90/98、105/116、129–137相关页及140/143/146/149/151–154/157–160；补查软件分层122–127、设施和互联图文等位置。抽取无文字的图页不冒称已完成本轮逐图视觉核验。
- 原目录维持78文件历史清单，其中17个MP4、28个SRT。第一轮发包将视频误写成28个，第二轮已向ChatGPT纠正。未逐段观看、未核准时间码，不把视频目录映射当作内容已精读。
- 实时复核官方定义：[nvidia-smi Utilization](https://docs.nvidia.com/deploy/nvidia-smi/index.html#utilization)、[GPU Operator职责](https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/latest/overview.html)、[MIG入门](https://docs.nvidia.com/datacenter/tesla/mig-user-guide/introduction.html)、[Triton模型服务](https://docs.nvidia.com/deeplearning/triton-inference-server/user-guide/docs/index.html)、[PUE边界](https://blogs.nvidia.com/blog/datacenter-efficiency-metrics-isc/)、[NVLink互联域](https://developer.nvidia.com/blog/nvidia-nvlink-the-scale-up-network-for-ai-factories/)、[GPUDirect RDMA](https://docs.nvidia.com/cuda/gpudirect-rdma/index.html)、[Kubernetes GPU资源](https://kubernetes.io/docs/tasks/manage-gpus/scheduling-gpus/)、[Slurm概览](https://slurm.schedmd.com/overview.html)。其余来源沿用项目既有核对记录，不宣称本轮全部重新认证。

## 第二轮终审处置

同一6 Pro已完整读取Day4–8新主课、30项练习和导读，返回[实稿终审](teaching-final-review-2026-09-25.md)，结论为主线可保留、局部修正。以下均已落实：

- Day4的API题改问需核查的服务/访问条件，不预设“没有开发接口”；补后端定义，权益说明不作未问必答项。
- Day5并行耗时例子明确计算并行、同步不重叠及其他开销暂不计；综合题不额外要求PUE。
- Day6补回已有基础卡对应的SM/OpenSM、RoCEv2 UDP/IP封装和DPU隔离职责，并核对既有官方来源，避免与原计分题出现教学跳步。
- Day7收准GPU-Util定义，补ECC和采集/存储/展示分工，将显存/利用率综合练习移到对应节并收窄引用，不挂在BMC/BCM后。
- Day8核查条件题不强制回答题面未要求的Operator职责；选读节练习同步标“选做”。

终审没有重新验证原PDF全部图表、英文译文显示、浏览器或自动反馈链；Day3终审输入为修改回执，第一轮才是完整实稿审核。本记录不把这些边界写成已验收。

## 技术验证及边界

35项自动检查通过，并通过22考点、40卡、80题、网页/桌面生成一致性及旧状态兼容检查。新增检查覆盖各日导读引用、讲解先于作答、题目只出现一次、请求只包含当前课的答案。原80道计分题、预算、正式路径、来源及兼容别名保持原值；40卡仅 `card-gpu-util-memory` 标题和解释说明有有据修正。

共享JSON生成网页、桌面源码与课程Markdown。没有重打包或替换已安装EXE，没有写入用户浏览器学习记录、旧成绩或测试笔记。前一轮构造样本的6 Pro真实点评与隔离HTTP回收通过，只是局部联调；真实Chrome页面和Windows UIA完整流程仍未验收。

技术检查、模型内容审核和用户实际学习有效是不同状态。新增主课已写入，能否在用户45–60分钟内学懂，仍应以真实原答与补讲反馈验证。

最终构建复核：12个生成文件连续构建前后SHA256一致。对应网页、桌面内容模块/渲染脚本、Day1–8课程Markdown和考点覆盖表。两轮局部修正后的35项测试再次通过。
