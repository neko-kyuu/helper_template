// hooks/useMvuData.ts
import _ from 'lodash';
import { ref, watch } from 'vue';


const ERA_EVENT = {
  insertByObject: 'era:insertByObject',
  updateByObject: 'era:updateByObject',
  insertByPath: 'era:insertByPath',
  updateByPath: 'era:updateByPath',
  deleteByObject: 'era:deleteByObject',
  deleteByPath: 'era:deleteByPath'
}
interface Command {
  event:string
  detail:any
}

export function useMvuData(defaultMvuData: any) {
  const rawMvuData = ref<any | null>(null);
  const currentMessageId = ref(0);
  const mvu = ref(_.cloneDeep(defaultMvuData));

  /**
   * 刷新 MVU 数据
   * @param messageId 消息楼层 ID
   */
  const refreshMvuData = async (messageId?: number | 'latest') => {
    try {
      console.log('Requesting initial ERA variables...');
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
        console.log('---era parse command', command);
        const event = command.event;
        if (event in ERA_EVENT) {
          // 触发事件，并传递解析出的 detail 对象
          eventEmit(ERA_EVENT[event as keyof typeof ERA_EVENT], command.detail);
        }
        else {
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
      console.log('MVU 数据无效或为空, 已重置为默认值');
      return;
    }

    // 更新状态: 将新数据合并到默认结构的深拷贝
    const baseState = _.cloneDeep(defaultMvuData);
    mvu.value = _.merge(baseState, newData);
    console.log(`已更新楼层 ${currentMessageId.value} 的变量:`, mvu.value);
  });

  const initialize = async () => {
    try {
      currentMessageId.value = getCurrentMessageId();
      refreshMvuData()
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

    console.log('ERA:writeDone event received:', detail);
    // 使用 statWithoutMeta 来更新 UI，它是不包含 ERA 内部字段的纯净数据
    if (detail && detail.statWithoutMeta) {
      // updateUI(detail.statWithoutMeta);
      rawMvuData.value = detail.statWithoutMeta;

      // 处理世界书
      const quest = rawMvuData.value?.PlayerData?.progress?.currentQuest || {}
      // const currentQuests:string[] = Object.values(quest)
      //   .filter((item:any) => item.name)
      //   .map((item:any) => item.name);
      const currentQuests:string[] = Object.keys(quest)

      console.log('----开始处理世界书蓝绿灯，当前任务:',currentQuests)
      updateWorldbookWith('奥弗萨斯', worldbook => {
        const QUEST_KEYWORDS = ['主线', '支线'];
        const STRATEGY_TYPE = {
          CONSTANT: 'constant' as const,
          SELECTIVE: 'selective' as const,
        };
      
        return worldbook.map(entry => {
          const isQuestEntry = QUEST_KEYWORDS.some(keyword => entry.name.includes(keyword));
      
          // 如果不是任务条目或缺少 strategy 属性，则直接返回原始条目，不做任何修改
          if (!isQuestEntry || !entry.strategy) {
            return entry;
          }
      
          // 判断当前任务是否处于激活状态
          const isQuestActive = currentQuests.some(quest => entry.strategy.keys.includes(quest));
          const newStrategyType = isQuestActive ? STRATEGY_TYPE.CONSTANT : STRATEGY_TYPE.SELECTIVE;
      
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
    }
  });

  return {
    mvu,
    rawMvuData,
    currentMessageId,
    refreshMvuData,
    handleMvuUpdate,
    initialize,
  };
}
