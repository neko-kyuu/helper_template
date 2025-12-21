// hooks/useMvuData.ts
import _ from 'lodash';
import { ref, watch } from 'vue';
import { MvuData } from '../types';

// 默认的 MVU 数据结构
const defaultMvuData: MvuData = {
  playerData: {
    character: {
      name: '',
      level: 1,
      gender: '男',
      race: '',
      height: '',
      build: '',
      appearance: '',
      personality: '',
    },
    status: {
      health: {
        current: 12,
        max: 12,
      },
      mood: {
        current: 0,
        max: 100,
      },
      arousal: {
        current: 50,
        max: 100,
      },
      experience: {
        current: 0,
        max: 100,
      },
    },
    attributes: {
      shooting: 0,
      melee: 0,
      construction: 0,
      mining: 0,
      cooking: 0,
      planting: 0,
      animals: 0,
      crafting: 0,
      artistic: 0,
      medical: 0,
      social: 0,
      intellectual: 0,
    },
    equipment: {
      leftHand: 'none',
      rightHand: 'none',
      outfitContent: 'none',
    },
  },
  playerDynamicData: {
    inventory: {},
    gold: 100,
  },
  followerNPCData: {},
  wardrobe: {
    ownedOutfits: {},
  },
  archivedData: {
    factionPrestige: {},
    bestiary: {},
    anecdotes: {},
    outfitIds: {
      F0: 'none',
    },
    inventory: {},
    worldNPC: {},
  },
  system: {
    mainStoryMode: true,
  },
  worldInfo: {
    date: '',
    time: '',
    weather: '',
    currentRegion: '',
    currentLocation: '',
    nearbyNPC: {},
    factionPrestige: {},
    bestiary: {},
    anecdotes: {},
  },
  progressData: {
    questPhase: '',
    partyAttrPoints: {},
    currentQuest: {},
    nextQuest: {},
    pendingQuest: {},
    completedQuest: {},
  },
};

const ERA_EVENT = {
  insertByObject: 'era:insertByObject',
  updateByObject: 'era:updateByObject',
  insertByPath: 'era:insertByPath',
  updateByPath: 'era:updateByPath',
  deleteByObject: 'era:deleteByObject',
  deleteByPath: 'era:deleteByPath',
};
interface Command {
  event: string;
  detail: any;
}

const rawMvuData = ref<any | null>(null);
const currentMessageId = ref(0);
const mvu = ref(_.cloneDeep(defaultMvuData));

/**
 * 刷新 MVU 数据
 * @param messageId 消息楼层 ID
 */
const refreshMvuData = async (messageId?: number | 'latest') => {
  try {
    eventEmit('era:requestWriteDone');
  } catch (error) {
    console.error(`获取楼层 ${messageId} 的 MVU 数据失败:`, error);
    rawMvuData.value = null;
  }
};

// 处理MVU更新
const handleMvuUpdate = async (commands: Command[], successCallback?: () => void) => {
  if (!rawMvuData.value) {
    console.warn('无法修改 MVU 数据, 因为旧数据不存在');
    toastr.error('无法执行操作: 关键数据缺失');
    return;
  }
  try {
    commands.forEach((command: Command) => {
      const event = command.event;
      if (event in ERA_EVENT) {
        // 触发事件，并传递解析出的 detail 对象
        eventEmit(ERA_EVENT[event as keyof typeof ERA_EVENT], command.detail);
      } else {
        console.warn(`Invalid ERA event received: ${event}`);
      }
    });

    // await refreshMvuData('latest');
    successCallback?.();
  } catch (error) {
    console.error('修改 MVU 数据失败:', error);
    toastr.error('操作失败: 保存数据时出错');
  }
};

// 侦听原始 MVU 数据的变化, 并更新用于 UI
watch(rawMvuData, newData => {
  if (!newData) {
    mvu.value = _.cloneDeep(defaultMvuData);
    console.warn('MVU 数据无效或为空, 已重置为默认值');
    return;
  }
  // 更新状态: 将新数据合并到默认结构的深拷贝
  const baseState = _.cloneDeep(defaultMvuData);
  mvu.value = _.merge(baseState, newData);
});

// 监护: 角色随从变化时, 确保属性点数据同步更新
watch(
  () => rawMvuData.value?.followerNPCData,
  (newFollowers, oldFollowers) => {
    if (!rawMvuData.value && !newFollowers && !oldFollowers) return;
    if (Object.keys(newFollowers).length === Object.keys(oldFollowers || {}).length) return;

    const followerNpcKeys = Object.keys(newFollowers || {});
    const allPartyKeys = ['F0', ...followerNpcKeys]; // F0 是玩家
    const attrPoints = rawMvuData.value.progressData?.partyAttrPoints || {};
    const commandsToSync: Command[] = [];

    for (const partyKey of allPartyKeys) {
      if (!(partyKey in attrPoints)) {
        commandsToSync.push({
          event: 'insertByPath',
          detail: { path: `progressData.partyAttrPoints.${partyKey}`, value: 0 },
        });
      }
    }

    if (commandsToSync.length > 0) {
      handleMvuUpdate(commandsToSync);
    }
  },
  { deep: true },
);

const initialize = async () => {
  try {
    currentMessageId.value = getCurrentMessageId();
    refreshMvuData();
  } catch (error) {
    console.error('组件初始化失败:', error);
  }
};

eventOn('era:writeDone', detail => {
  // 如果这次更新是由 API 写入触发的，并且你不想重复响应，可以在这里返回。
  // if (detail.actions.apiWrite) {
  //   console.log('本次更新由 API 写入触发，UI 可能已同步，跳过某些逻辑。');
  //   // return;
  // }
  if (!detail || !detail.statWithoutMeta) return;

  // 使用 statWithoutMeta 来更新 UI，它是不包含 ERA 内部字段的纯净数据
  rawMvuData.value = detail.statWithoutMeta;
  // 处理世界书蓝绿灯
  const currentRegion = rawMvuData.value?.worldInfo?.currentRegion;
  let currentQuests: string[] = [];

  if (rawMvuData.value?.system?.mainStoryMode) {
    const quest = rawMvuData.value?.progressData?.currentQuest || {};
    // const currentQuests:string[] = Object.values(quest)
    //   .filter((item:any) => item.name)
    //   .map((item:any) => item.name);
    currentQuests = Object.keys(quest);
  }

  updateWorldbookWith('奥弗萨斯', worldbook => {
    const MAP_KEYWORD = '地图';
    const QUEST_KEYWORDS = ['主线', '支线'];
    const STRATEGY_TYPE = {
      CONSTANT: 'constant' as const,
      SELECTIVE: 'selective' as const,
    };

    return worldbook.map(entry => {
      const isQuestEntry = QUEST_KEYWORDS.some(keyword => entry.name.includes(keyword));
      const isMapEntry = entry.name.includes(MAP_KEYWORD);

      // 如果不是地图或任务条目或缺少 strategy 属性，则直接返回原始条目，不做任何修改
      if ((!isMapEntry && !isQuestEntry) || !entry.strategy) {
        return entry;
      }

      // 判断需要激活的条目是否处于激活状态
      const isQuestActive = currentQuests.some(quest => entry.strategy.keys.includes(quest));
      const isMapActive = entry.strategy.keys.includes(currentRegion);
      const newStrategyType = isQuestActive || isMapActive ? STRATEGY_TYPE.CONSTANT : STRATEGY_TYPE.SELECTIVE;

      // 如果策略类型无需改变，则直接返回原始条目，避免不必要的对象创建
      if (entry.strategy.type === newStrategyType) {
        return entry;
      }

      // 返回一个新的条目对象，其中包含更新后的 strategy
      return {
        ...entry,
        strategy: {
          ...entry.strategy, // 复制 strategy 的所有现有属性
          type: newStrategyType, // 仅覆盖 type 属性
        },
      };
    });
  });
});

export function useMvuData() {
  return {
    mvu,
    rawMvuData,
    currentMessageId,
    refreshMvuData,
    handleMvuUpdate,
    initialize,
  };
}
