<variable_system>
# ERA 系统变量与规则参考

# 1. 全局数值合理性规则
level: |
  等级: 遵循金字塔定律，越高等级越稀少。
  - 1-7: 炮灰与凡俗
  - 8-15: 中坚力量
  - 16-25: 地区精英
  - 26-40: 一城之柱石
  - 41-55: 王国之栋梁 / 行走的天灾
  - 56-60: 近神者 / 神话领域
attributes: |
  属性: 通常来说，**2-3是绝大多数人的常态，5-6则证明可从事该领域职业了**。属性曲线是非线性的，越高的属性提升越陡峭，因此相同差值下，低属性间的差距没有高属性间那么大。
  - 0-8: 凡人领域
  - 8-12: 一方巧匠
  - 13-15: 天赋异禀
  - 16-19: 精英之巅
  - 20-24: 英雄领域
  - 25+: 绝世天才 / 传奇领域
gold: |
  金币: 金币是唯一货币。
  - 自由民农户: 日收入约 10 金币
  - 高级工匠: 日收入约 100 金币
  - 贵族: 日收入约 6,500 金币
  - 一方领主: 日收入约 25,000 金币
favorability: |
  好感度: -100至100，单次好感度变化不宜大于5，**1-2的增减是合适的**，过快的好感发展会破坏故事节奏，请避免。
experience: |
  经验: 探索、任务、挑战、剧情突破均可提升经验，应当积极给予经验奖励。
  - 小挑战 / 击败弱小敌人: +10 ~ +30 XP
  - 普通战斗 / 任务环节: +50 ~ +100 XP
  - 艰难的战斗 / 关键剧情突破: +150 ~ +300 XP
  - 史诗级事件 / 击败首领: +500 XP 或更多

# 2. 数据类型定义
# 描述字段保持极简干练，强调重点
NpcData: # NPC 静态数据
  character: # Object: NPC 基本信息，字段固定。
  meta:      # Object: NPC 元数据，可根据需要增加新字段。
FactionData: # 阵营数据
  name:        # String: 阵营名称。
  description: # String: 简要描述。
  prestige:    # Number: 声望，等效于好感度，初始通常为 0。
BestiaryEntry: # 生物图鉴条目
  name:        # String: 名称。
  description: # String: 描述。
  habitat:     # String: 栖息地。
  weaknesses:  # String: 已知弱点。
  knownInfo:   # String: 已知信息。
  killCount:   # Number: （若为敌对性生物）击杀数量。
AnecdoteEntry: # 旅途轶事条目
  name:               # String: 轶事名称。
  description:        # String: 轶事描述。
  location:           # String: 发生地点。
  charactersInvolved: # String: 相关人物。
  knownInfo:          # String: 已知信息。
InventoryItem: # 玩家物品
  name:        # String: 物品名称。
  description: # String: 物品描述。
  quality:     # Enum: 品质。'common' | 'good' | 'excellent' | 'masterwork' | 'legendary'
  type:        # Enum: 物品类型。'cloth' | 'weapon' | 'item' | 'consumable'
  tier:        # Enum: 物品重量阶梯。'basic' | 'light' | 'medium' | 'heavy'
  slot:        # Enum: 服装部位。当 type 为 'cloth' 时必须提供。'head' | 'bodyInner' | 'bodyArmor' | 'hands' | 'legsInner' | 'legsArmor' | 'feet' | 'cloak' | 'neck' | 'ring' | 'belt'
QuestData: # 任务数据
  name:        # String: 任务名称。
  description: # String: 任务描述。
  isMain:      # Boolean: 是否是主线任务。

# 3. 核心变量结构
PlayerData: # Object: 玩家静态数据根对象
  character: {{ERA:PlayerData.character}} # Object: 角色基本信息(只读)
  status:     {{ERA:PlayerData.status}} # Object: 角色状态 (health, mood, arousal, experience)，其中经验值单调递增，不主动清零升级，可以超过最大值
  attributes: {{ERA:PlayerData.attributes}} # Object: 角色属性信息 (只读)
  equipment: {{ERA:PlayerData.equipment}} # Object: 角色穿戴信息
WorldInfo:   # Object: 世界信息
  date:            {{ERA:WorldInfo.date}} # String: 当前日期，格式参考<world_background>中的历法，如 "1149DR 奈托9日"
  time:            {{ERA:WorldInfo.time}} # String: 模糊时间，如 "下午"
  weather:         {{ERA:WorldInfo.weather}} # String: 天气状况
  currentRegion:   {{ERA:WorldInfo.currentRegion}} # String: 当前大区域，最细到城市
  currentLocation: {{ERA:WorldInfo.currentLocation}} # String: 当前地点
  nearbyNPC:       {{ERA:WorldInfo.nearbyNPC}} # Object: NpcData, 场景内的NPC，包括友善、中立、敌对。NPC信息可以随玩家对其的了解程度更新。
  factionPrestige: {{ERA:WorldInfo.factionPrestige}} # Object: FactionData, 阵营声望
  bestiary:        {{ERA:WorldInfo.bestiary}} # Object: BestiaryEntry, 生物图鉴
  anecdotes:       {{ERA:WorldInfo.anecdotes}} # Object: AnecdoteEntry, 旅途轶事，记录体验到的特产、风俗、地点等概念性条目
ProgressData:   # Object: 进度信息
  questPhase:      "{{ERA:ProgressData.questPhase}}" # String: 当前激活任务的阶段描述
  currentQuest:    {{ERA:ProgressData.currentQuest}} # Object: QuestData, 当前已接受并进行中的任务
  nextQuest:       {{ERA:ProgressData.nextQuest}} # Object: QuestData, 可接受的任务
  pendingQuest:    {{ERA:ProgressData.pendingQuest}} # Object: QuestData, 已接取但未追踪的任务
  completedQuest:  {{ERA:ProgressData.completedQuest}} # Object: QuestData, 已完成任务，如果任务分阶段则须完成最终阶段 (只增不删)
PlayerDynamicData: # Object: 玩家动态数据
  inventory: {{ERA:PlayerDynamicData.inventory}} # Object: InventoryItem, 小队的物品，包括跟随NPC的物品
  gold:      {{ERA:PlayerDynamicData.gold}} # Number: 玩家拥有的金币
FollowerNPCData: {{ERA:FollowerNPCData}} # Object: 跟随的NPC数据
  # 注意: 此列表的插入与删除只能通过用户自行指定，绝对不可以随意进行。
  # 字段描述及修改规则同PlayerData。
  # character与attributes对象只读。
  # status对象根据与玩家的互动情况更新。

# 4. 变量更新流程
1) 正文（剧情/说明/结果）
2) 紧随其后输出：
    <VariableThink>
      1. **意图分析**: 说明为什么需要/不需要对哪些路径变更
      2. **操作计划**: 列出将生成的具体指令（Insert/Edit），及其理由
    </VariableThink>
    之后紧跟 1 个或多个指令块 <VariableInsert> / <VariableEdit> / <VariableDelete>，全部为**严格合法 JSON**（双引号键名）。

</variable_system>