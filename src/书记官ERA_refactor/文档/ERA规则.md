<variable_rule>
# ERA 变量操作规则

- **无变化不操作**: 变量无变化时，不生成指令。
- **新增用 `Insert`**: 添加新角色、物品、状态或信息。
- **修改用 `Edit`**: 更新已有数据的值（如等级提升、状态改变）。
- **移除用 `Delete`**: 移除被消耗、移除或销毁的数据。
- **移动用 `Delete` + `Insert`**: 从一个列表/对象移动到另一个时，先删除原位置，再插入到新位置。

## 指令核心规则
- **`<VariableInsert>`**: **只增不改**，用于添加新数据，绝不覆盖已有数据。
- **`<VariableEdit>`**: **只改不增**，用于修改已有数据，绝不在不存在的路径上创建新数据。
- **`<VariableDelete>`**: **删除节点**，使用空对象 `{}` 作为值，删除该键对应的整个节点。

</variable_rule>

<format_request>
# 回复格式要求

严格遵循以下流程、结构和格式。

## 1. 回复流程
1.  **生成正文**: 先生成本次回复的故事正文。
2.  **输出思考**: 紧接着输出 `<VariableThink>` 块，说明分析过程。
3.  **输出指令**: 最后输出一个或多个指令块 (`<VariableInsert>`, `<VariableEdit>`, `<VariableDelete>`)。

## 2. `<VariableThink>` 结构
<VariableThink>
1.  **意图分析**: {简洁描述变量更新目的，如：玩家HP减少，出现新NPC。}
2.  **操作计划**:
    - {说明具体操作，如：用 `<VariableEdit>` 更新 `playerData.status.hp.current`。}
    - {若新增实体，说明计划创建的ID。}
</VariableThink>

## 3. 指令块格式
- **严格 JSON**: 所有指令块内容必须是严格合法的 JSON。
- **双引号键**: JSON 的所有键都必须用双引号 `"`。

## 4. ID 创建规则
新增实体（NPC、物品、任务等）时，必须创建唯一ID。

| 类型 | 前缀 | 示例 |
| :--- | :--- | :--- |
| NPC | `C` | `"C3"`, `"C4"` |
| 物品 | `I` | `"I5"`, `"I6"` |
| 随机/动态任务 | `Q` | `"Q2"`, `"Q3"` |
| 主线任务 | `MQ` | `"MQ1"` |
| 支线任务 | `SQ` | `"SQ1"` |
| 阵营 | `F` | `"F1"`, `"F2"` |
| 生物图鉴 | `B` | `"B1"`, `"B2"` |
| 趣闻 | `A` | `"A1"`, `"A2"` |
**注意**: 生成任务时，如果为已知信息任务（已有ID与描述），直接使用原始信息。否则，为避免出现任务ID冲突，只能使用**Q**前缀。

## 5. 格式示例

### 示例 1: 修改玩家 HP
...（正文）...
<VariableThink>
1.  **意图分析**: 玩家 `hp` 从 15 降到 10。
2.  **操作计划**: - 用 `<VariableEdit>` 更新 `hp`。
</VariableThink>
<VariableEdit>
{
  "playerData": {
    "status": {
      "hp": {
        "current": 10
      }
    }
  }
}
</VariableEdit>

### 示例 2: 添加新 NPC
...（正文）...
<VariableThink>
1.  **意图分析**: 新角色 "Ralof" 出现，需加入 `worldInfo.nearbyNPC`。
2.  **操作计划**: - 用 `<VariableInsert>` 添加，并创建新ID "C1"。
</VariableThink>
<VariableInsert>
{
  "worldInfo": {
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
          "favorabilityTowardsNPCs": {
            "Hadvar": -10
          },
          "description": "[简要描述]"
        }
      }
    }
  }
}
</VariableInsert>

### 示例 3: 添加玩家物品
...（正文）...
<VariableThink>
1.  **意图分析**: 玩家获得衣服和书。
2.  **操作计划**: - 用 `<VariableInsert>` 添加，并创建ID "I1" 和 "I2"。
</VariableThink>
<VariableInsert>
{
  "playerDynamicData": {
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
...（正文）...
<VariableThink>
1.  **意图分析**: 玩家接到新随机任务。
2.  **操作计划**: - 用 `<VariableInsert>` 添加，并创建ID "Q1"。
</VariableThink>
<VariableInsert>
{
  "progressData": {
    "currentQuest": {
      "Q1": {
        "name": "任务名",
        "description": "20字左右极简描述任务。"
      }
    }
  }
}
</VariableInsert>

### 示例 5: 为已有实体添加新字段
...（正文）...
<VariableThink>
1.  **意图分析**: 为NPC "Ralof" (ID: C1) 添加新称号 "秘银之心"。
2.  **操作计划**: - 因 `title` 是全新字段，用 `<VariableInsert>` 添加。**注意**: 此法仅用于为已有对象**添加新属性**，修改已有值必须用 `<VariableEdit>`。
</VariableThink>
<VariableInsert>
{
  "worldInfo": {
    "nearbyNPC": {
      "C1": {
        "meta": {
          "title": "秘银之心"
        }
      }
    }
  }
}
</VariableInsert>

### 示例 6: 删除实体
...（正文）...
<VariableThink>
1.  **意图分析**: NPC "Ralof" (ID: C1) 离开，需移除。
2.  **操作计划**: - 用 `<VariableDelete>` 移除 "Ralof"。
</VariableThink>
<VariableDelete>
{
  "worldInfo": {
    "nearbyNPC": {
      "C1": {}
    }
  }
}
</VariableDelete>

### 示例 7: 移动任务状态 (重要)
...（正文）...
<VariableThink>
1.  **意图分析**: 玩家完成了任务 "随机任务1" (ID: Q1)，需要将其从 `currentQuest` 移动到 `completedQuest`。
2.  **操作计划**:
    - **核心**: 实体在不同对象间的移动，必须通过 `Delete` 和 `Insert` 组合完成，严禁使用 `Edit`。
    - 1. 生成 `<VariableDelete>`，从 `currentQuest` 中删除 "Q1"。
    - 2. 生成 `<VariableInsert>`，将 "Q1" 添加到 `completedQuest` 中。
</VariableThink>
<VariableDelete>
{
  "progressData": {
    "currentQuest": {
      "Q1": {}
    }
  }
}
</VariableDelete>
<VariableInsert>
{
  "progressData": {
    "completedQuest": {
      "Q1": {
        "name": "随机任务1",
        "description": "随机任务1的描述"
      }
    }
  }
}
</VariableInsert>
</format_request>