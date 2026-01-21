// hooks/useQuests.ts
import { computed, ref } from 'vue';

export function useQuests(mvu: any, handleMvuUpdate: any) {
  const currentQuests = computed(() => {
    return mvu.value.progressData.currentQuest;
  });

  const nextQuests = computed(() => {
    return mvu.value.progressData.nextQuest;
  });

  const pendingQuests = computed(() => {
    return mvu.value.progressData.pendingQuest;
  });

  const completedQuests = computed(() => {
    return mvu.value.progressData.completedQuest;
  });

  const activeQuestTab = ref('currentQuests');

  const activeQuest = (questId: string) => {
    const questToActivate = mvu.value.progressData.nextQuest[questId];

    if (questToActivate) {
      const quest = _.cloneDeep(questToActivate);
      toastr.success(`成功激活 ${questToActivate.name} `);
      handleMvuUpdate([
        {
          event: 'insertByPath',
          detail: { path: `progressData.currentQuest.${questId}`, value: quest },
        },
        {
          event: 'deleteByPath',
          detail: { path: `progressData.nextQuest.${questId}` },
        },
      ]);
    }
  };
  const completeQuest = (questId: string) => {
    const questToComplete = mvu.value.progressData.currentQuest[questId];

    if (questToComplete) {
      const quest = _.cloneDeep(questToComplete);
      toastr.success(`成功完成 ${questToComplete.name} `);
      handleMvuUpdate([
        {
          event: 'insertByPath',
          detail: { path: `progressData.completedQuest.${questId}`, value: quest },
        },
        {
          event: 'deleteByPath',
          detail: { path: `progressData.currentQuest.${questId}` },
        },
      ]);
    }
  };

  const deleteQuest = (
    questId: string,
    questType: 'currentQuest' | 'nextQuest' | 'pendingQuest' | 'completedQuest',
  ) => {
    const questToDelete = mvu.value.progressData[questType]?.[questId];
    if (questToDelete) {
      toastr.success(`成功删除 ${questToDelete.name}`);
      handleMvuUpdate([
        {
          event: 'deleteByPath',
          detail: {
            path: `progressData.${questType}.${questId}`,
          },
        },
      ]);
    }
  };

  return {
    currentQuests,
    nextQuests,
    pendingQuests,
    completedQuests,
    activeQuestTab,
    activeQuest,
    completeQuest,
    deleteQuest,
  };
}
