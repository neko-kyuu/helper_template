// hooks/useQuests.ts
import { computed, ref } from 'vue';

export function useQuests(mvu: any, handleMvuUpdate: any) {
  const currentQuests = computed(() => {
    return mvu.value.ProgressData.currentQuest;
  });

  const nextQuests = computed(() => {
    return mvu.value.ProgressData.nextQuest;
  });

  const pendingQuests = computed(() => {
    return mvu.value.ProgressData.pendingQuest;
  });

  const completedQuests = computed(() => {
    return mvu.value.ProgressData.completedQuest;
  });

  const activeQuestTab = ref('currentQuests');

  const activeQuest = (questId: string) => {
    const questToActivate = mvu.value.ProgressData.nextQuest[questId];

    if (questToActivate) {
      const quest = _.cloneDeep(questToActivate);
      toastr.success(`成功激活 ${questToActivate.name} `);
      handleMvuUpdate([
        {
          event: 'insertByPath',
          detail: { path: `ProgressData.currentQuest.${questId}`, value: quest },
        },
        {
          event: 'deleteByPath',
          detail: { path: `ProgressData.nextQuest.${questId}` },
        },
      ]);
    }
  };

  const deleteQuest = (
    questId: string,
    questType: 'currentQuest' | 'nextQuest' | 'pendingQuest' | 'completedQuest',
  ) => {
    const questToDelete = mvu.value.ProgressData[questType]?.[questId];
    if (questToDelete) {
      toastr.success(`成功删除 ${questToDelete.name}`);
      handleMvuUpdate([
        {
          event: 'deleteByPath',
          detail: {
            path: `ProgressData.${questType}.${questId}`,
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
    deleteQuest,
  };
}
