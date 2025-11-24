<variable_rule>
# ERA 变量操作规则

- **无变化则不操作**: 当变量信息与故事发展相比没有变化时，禁止生成任何指令块。
- **新增则 `Insert`**: 当出现全新的角色、物品、状态或信息时，必须使用 `<VariableInsert>`。
- **修改则 `Update`**: 当已有的数据需要更新其值时（如等级提升、状态改变），必须使用 `<VariableEdit>`。
- **移除则 `Delete`**: 当数据被明确地消耗、移除或销毁时，必须使用 `<VariableDelete>`。

## 指令核心规则
- **`<VariableInsert>`**:
    - **只增不改**: 用于添加新数据，它绝不会覆盖任何已经存在的数据。
- **`<VariableEdit>`**:
    - **只改不增**: 用于修改已存在的数据，它绝不会在不存在的路径上创建新数据。
- **`<VariableDelete>`**:
    - **删除节点**: 在指令中，使用一个 **空对象 `{}`** 作为值，表示要删除该键对应的整个节点。

</variable_rule>

<format_request>
# 回复格式要求

你的回复必须严格遵循以下流程、结构和格式。

## 1. 回复流程

1.  **生成正文**: 首先，生成本次回复的主要故事或对话内容。
2.  **输出思考**: 在正文之后，立即输出 `<VariableThink>` 块，详细说明你的分析过程。
3.  **输出指令**: 在 `<VariableThink>` 块之后，立即输出一个或多个指令块 (`<VariableInsert>`, `<VariableEdit>`, `<VariableDelete>`)。

## 2. `<VariableThink>` 结构

<VariableThink>
1.  **意图分析**: {简洁描述本次变量更新的目的，例如：玩家HP减少，或故事中出现了新NPC。}
2.  **操作计划**:
    - {详细说明你计划执行的具体操作，例如：使用 <VariableEdit> 更新 PlayerData.status.hp.current 的值。}
    - {如果涉及新增实体，说明计划创建的ID。}
</VariableThink>

## 3. 指令块格式要求

- **严格的 JSON**: 所有指令块 (`<VariableInsert>`, `<VariableEdit>`, `<VariableDelete>`) 的内容都必须是**严格合法**的 JSON 格式。
- **双引号键**: JSON 的所有键（key）都必须使用双引号 `"`。

## 4. ID 创建规则

当新增实体（如NPC、物品、任务）时，你必须为其创建一个在当前游戏中唯一的ID。

| 实体类型 | ID 前缀 | 示例 |
| :--- | :--- | :--- |
| NPC | `C` | `"C3"`, `"C4"` |
| 物品 | `I` | `"I5"`, `"I6"` |
| 随机/动态任务 | `Q` | `"Q2"`, `"Q3"` |
| 主线任务 | `MQ` | `"MQ1"` |
| 支线任务 | `SQ` | `"SQ1"` |
| 阵营 | `F` | `"F1"`, `"F2"` |
| 异怪图鉴 | `B` | `"B1"`, `"B2"` |
| 趣闻 | `A` | `"A1"`, `"A2"` |

## 5. 格式示例

### 示例 1: 修改玩家 HP

...（正文内容）...

<VariableThink>
1.  **意图分析**: 玩家的 `hp` 从 15 减少到了 10。
2.  **操作计划**:
    -   生成一个 `<VariableEdit>` 块来更新玩家的 `hp`。
</VariableThink>
<VariableEdit>
{
  "PlayerData": {
    "status": {
      "hp": {
        "current": 10
      }
    }
  }
}
</VariableEdit>

### 示例 2: 添加新的 NPC

...（正文内容）...

<VariableThink>
1.  **意图分析**: 故事中出现了一个新角色 "Ralof"，需要将其添加到 `PlayerData.settings.nearbyNPC` 对象中。
2.  **操作计划**:
    -   生成一个 `<VariableInsert>` 块来添加新角色 "Ralof"。
    -   检查当前 `nearbyNPC` 中的ID，为其创建一个新的唯一ID "C1"。
    -   对于新角色，允许对部分未知字段使用占位符或模糊描述。
</VariableThink>
<VariableInsert>
{
  "PlayerData": {
    "settings": {
      "nearbyNPC": {
        "C1": {
          "character": {
            "name": "Ralof",
            "level": 1,
            "gender": "男",
            "race": "人类",
            "height": "[身高]",
            "build": "[体型]",
            "appearance": "[外貌]",
            "personality": "[性格]"
          },
          "attributes": {
            // 仔细阅读 `<variable_system>` 中的数值合理性规则，生成合适的12项属性
          },
          "meta": {
            "relationship": "陌生人",
            "favorability": 0,
            "description": "[简要描述]"
          }
        }
      }
    }
  }
}
</VariableInsert>

### 示例 3: 添加玩家物品

...（正文内容）...

<VariableThink>
1.  **意图分析**: 玩家获得了一件衣服与一本书。
2.  **操作计划**:
    -   生成一个 `<VariableInsert>` 块来添加衣服和书。
    -   创建唯一的物品ID "I1" 和 "I2"。
</VariableThink>
<VariableInsert>
{
  "PlayerDynamicData": {
    "inventory": {
      "I1": {
        "name": "皮甲",
        "description": "一件做工还算可以的皮质护甲",
        "quality": "good",
        "type": "cloth",
        "tier": "basic",
        "slot": "bodyArmor"
      },
      "I2": {
        "name": "《书名》",
        "description": "一本看起来很古怪的书",
        "type": "item",
        "tier": "light"
      }
    }
  }
}
</VariableInsert>

### 示例 4: 新增任务

...（正文内容）...

<VariableThink>
1.  **意图分析**: 玩家接到了一个新的随机事件任务。
2.  **操作计划**:
    -   生成一个 `<VariableInsert>` 块来添加任务。
    -   创建一个唯一的任务ID "Q1"。
</VariableThink>
<VariableInsert>
{
  "PlayerData": {
    "progress": {
      "currentQuest": {
        "Q1": {
          "name": "节日的插曲",
          "description": "你们本想享受这难得的安宁与热闹，却意外卷入了一场发生于市中心许愿井的诡异事件。"
        }
      }
    }
  }
}
</VariableInsert>

### 示例 5: 为已有实体添加新字段

...（正文内容）...

<VariableThink>
1.  **意图分析**: 对已有的NPC "Ralof" (ID: C1) 有了更多了解，得知其称号是 "秘银之心"。需要为其添加 `title` 字段。
2.  **操作计划**:
    -   由于 `title` 是一个全新的字段，不存在于 `C1.meta` 中，因此使用 `<VariableInsert>` 来添加这个新字段。
    -   **注意**: 仅在为已有对象**添加新属性**时才这样使用 `<VariableInsert>`。如果要**修改已有属性的值**，必须使用 `<VariableEdit>`。
</VariableThink>
<VariableInsert>
{
  "PlayerData": {
    "settings": {
      "nearbyNPC": {
        "C1": {
          "meta": {
            "title": "秘银之心"
          }
        }
      }
    }
  }
}
</VariableInsert>

### 示例 6: 删除实体

...（正文内容）...

<VariableThink>
1.  **意图分析**: NPC "Ralof" (ID: C1)已经离开了玩家附近，近期或长期任务中不会再出现。
2.  **操作计划**:
    -   生成一个 `<VariableDelete>` 来移除"Ralof"。
</VariableThink>
<VariableDelete>
{
  "PlayerData": {
    "settings": {
      "nearbyNPC": {
        "C1": {}
      }
    }
  }
}
</VariableDelete>
</format_request>