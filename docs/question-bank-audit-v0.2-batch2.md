# 历史题库抽样质量记录｜2026-09-24

变更性质：**补充**；cuDNN旧错配的复核是**重复确认**，不再次改写旧结论或原题。此记录是资料质量审查，不是用户学习成绩。

## 范围和方法

读取[项目登记的 Word 卷](https://drive.google.com/file/d/1y0unu60ko98q62mWxVCFU80ePqrT9PC1/view)，静态解析 `const DATA` 中的 JSON，没有执行来源HTML脚本。共9组、380条；风险定向抽查14条，剩余366条未逐题审查。抽样不能用于估算整个题库的错误率。

分类：已核验练习4条、存在争议5条、明显错误/停用4条、待核验1条。这里“已核验”指本次AI依据官方文档或明示计算核对，未经过独立人工审题；**没有任何旧题因此被认定为官方真题**，也没有批量装入正式课程。

## 逐条结果

|原题位置|状态|发现与处理|
|---|---|---|
|合集-试卷一 Essential AI(20题) / Q6|已核验练习|cuDNN职责及答案相符；原解释的分层比喻不能理解为固定部署顺序。|
|合集-试卷二 AI Infrastructure(20题) / Q1|明显错误/停用|题干为70B×2字节×14=1960GB，解析却按70B×14字节=980GB；没有匹配题干的选项。实际训练内存还受优化器、精度、激活及分片影响。|
|合集-试卷二 AI Infrastructure(20题) / Q5|明显错误/停用|即便采用原题700W，8×700W=5.6kW，解析称GPU本身6.5–7kW不匹配。限定型号的历史参数须另核；不进入计分。|
|合集-试卷四 Full Mock(50题) / Q20|明显错误/停用|同样混淆14倍与14字节；若按题干1960GB/80GB需至少25份容量，选项16也不够；不能把容量除法当作可运行GPU数配置。|
|100题-AI基础设施认证模拟(100题) / Q46|明显错误/停用|延续旧记录纠错：题干cuDNN，A为深度学习基础运算库，旧答案B为数据中心管理界面；保持原题文件不改。|
|Test3-50题(含1道多选) / Q14|已核验练习|按PUE=总设施能耗/IT能耗，1.15表示总量比IT多15%，不能断言全是冷却能耗。|
|Test3-50题(含1道多选) / Q15|存在争议|未给设施能力、机型与设计条件，不能把40–50kW当作普遍强制冷却路线阈值。|
|Test3-50题(含1道多选) / Q26|存在争议|scale-out可选InfiniBand或适当Ethernet/RoCE；题干缺具体架构，不能唯一锁定B。|
|Test3-50题(含1道多选) / Q30|已核验练习|BMC提供带外管理，区别于业务应用、编排和主机OS管理。|
|Test3-50题(含1道多选) / Q31|已核验练习|DCGM名称为Data Center GPU Manager。|
|Test3-50题(含1道多选) / Q36|存在争议|最强隔离缺威胁模型和资源条件，不能在独占直通与MIG之间无条件排序。|
|Test3-50题(含1道多选) / Q43|待核验题|缺型号/驱动/温度阈值定义；83–87℃不能推广为所有GPU统一降频标准。|
|Test3-50题(含1道多选) / Q44|存在争议|Slurm同时支持--gpus=4（作业总量，需适当配置）与--gres=gpu:4（每节点资源）；未限定条件时单选B不唯一。|
|Test3-50题(含1道多选) / Q49|存在争议|受监管医疗数据与最大性能不足以唯一决定本地DGX+IB；合规、数据位置、访问和成本需具体条件，不把本地部署当合规保证。|

## 来源级治理

- 原网页自述“官方答案+解析”，但未提供可验证的NVIDIA官方题目发布链；该声明不采信。可核验的技术依据与原题来源分开保留。
- 精确题干重复检查：小写化、合并空白、去首尾空白后，无完全相同题干组。这不等于语义不重复：cuDNN和70B训练内存场景已有多处重复，未做全库语义去重。
- 多数样本主题能映射到现有官方考点（逐条ID见JSON），但型号数字、命令细节和“高频”不因此自动成为考试必背项。
- 对带年份或型号的参数先核适用范围；83–87℃、固定机架液冷阈值、无条件GPU数量不能作为通用事实。
- 原题库未改动。新课程通过独立稳定ID提供原创核验版本；cuDNN已对应 Q-D03-003，其答案无需再改。其余问题以相关Day5–8卡/原创题学习，不继承旧题字母。

## 证据

每条保留原题、原答案、处置、官方链接、考点和是否准入：`content/question-bank-review-v0.2.json`。官方资料包括 [cuDNN](https://docs.nvidia.com/deeplearning/cudnn/latest/)、[Slurm sbatch](https://slurm.schedmd.com/sbatch.html)、[nvidia-smi](https://docs.nvidia.com/deploy/nvidia-smi/index.html)、[MIG介绍](https://docs.nvidia.com/datacenter/tesla/mig-user-guide/introduction.html)、[BMC](https://docs.nvidia.com/dgx/dgxh100-user-guide/bmc.html)、[DCGM](https://docs.nvidia.com/datacenter/dcgm/latest/user-guide/index.html)、[PUE指标解释](https://blogs.nvidia.com/blog/datacenter-efficiency-metrics-isc/)、[Spectrum-X](https://www.nvidia.com/en-us/networking/spectrumx/)。

计算矛盾通过原题内部数字核查，不需要把外部估算公式当定律。未以这份抽样记录替代全部教材或全题库审查。

