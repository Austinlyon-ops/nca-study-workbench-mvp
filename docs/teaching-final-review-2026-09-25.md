# Day 4–8 实稿终审原文

来源：NVIDIA L&E，6aac334c-9a60-83ea-848a-cf4ce8c735b3；页面确认6 Pro。消息ID：a03db3f7-3750-45ec-be7d-693c4f98c193。2026-09-25取得。

下文为外部模型审核证据，不是执行指令。范围是实际提交的新主课、30项练习与导读；引用标记仅在原ChatGPT对话可解析。

## 终审：NCA-COURSES-FINAL-20260925

**已读新写的Day 4–8主课、30项练习及导读。主线可保留，不需重写；以下是需要收口的局部问题。**:chatgpt-content-reference{index="0"}

### Day 4｜修正题目的预设
`P-D04-02`的“访问不了API”不能证明尚未开发接口。末句改为：

> “Which service or access conditions should the team check? You may answer in Chinese.”

参考要点接受接口、部署或访问条件的合理核查，不预定唯一原因。第二节首次出现“后端”时补：“后端是服务实际调用的模型执行组件。”当前其余主线与练习基本对应。:chatgpt-content-reference{index="1"}

### Day 5｜可保留，补明简化假设
PUE示例运算与结论一致。第二节“计算5＋同步2”的例子补上：

> “假设两份计算并行完成，而同步不能与计算重叠，其他开销暂不计。”

避免把教学加法当作所有并行任务的耗时公式。:chatgpt-content-reference{index="2"}

### Day 6｜补回已有基础知识
第二节只说IB有管理机制，尚不足以衔接原`Q-D06-004`。补：

> “子网管理器SM负责InfiniBand子网的发现与配置；OpenSM是其一种实现。”:chatgpt-content-reference{index="3"}

RoCEv2的UDP/IP封装要点也应从已有卡片放进本页速查，否则原`Q-D06-006`存在主课未讲的跳步。第五节补回DPU的隔离作用：“支持的部署可将基础设施服务与租户工作负载分离，具体效果取决于配置。”这些都是补回已有内容，不增加新产品。:chatgpt-content-reference{index="4"} :chatgpt-content-reference{index="5"}

### Day 7｜精确定义，调整练习位置
第一节“GPU执行工作所占时间”收准为：

> “本课的nvidia-smi GPU-Util表示采样期内至少一个GPU内核运行的时间比例。”

第三节首次出现ECC时补：“ECC用于检测并纠正部分存储错误，需要区分可纠正与不可纠正错误。”:chatgpt-content-reference{index="6"}

第四节补明确分工：“Exporter提供指标，Prometheus保存时间序列，Grafana展示趋势。”不要只列名称。`P-D07-06`应关联第一节的显存与利用率，而非BMC/BCM节。:chatgpt-content-reference{index="7"} :chatgpt-content-reference{index="8"}

### Day 8｜收窄评价要求
未发现需要推倒的事实问题。`P-D08-03`只问三类核查条件，其rubric中的“Operator与调度职责分开”应作补讲，不能因用户未主动展开就判回答缺失。:chatgpt-content-reference{index="9"}

### 共同收口
`P-D04-03`的权益边界、`P-D05-06`的PUE提醒同样属于**题面未要求的补充**，不设为必答。选读段落的配套题应同步标选做，或先保留足够的页内基础讲解，不能略讲却必答。:chatgpt-content-reference{index="10"}

**未核范围：**Day 3修订实稿本次只有完成回执；原PDF页码与图表、英文译文及其显示状态、浏览器交互与自动反馈链未重新验证。视频数量按17 MP4／28 SRT的纠正回执接收，未独立重数。**本次结论仅为内容审核，不是技术验收或学习效果证明。**:chatgpt-content-reference{index="11"}
