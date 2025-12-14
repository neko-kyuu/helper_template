// hooks/useQuests.ts
import { computed, ref } from 'vue';

export function useQuests(mvu: any, handleMvuUpdate: any) {
  const currentQuests = computed(() => {
    return mvu.value.PlayerData.progress.currentQuest;
  });

  const nextQuests = computed(() => {
    return mvu.value.PlayerData.progress.nextQuest;
  });

  const pendingQuests = computed(() => {
    return mvu.value.PlayerData.progress.pendingQuest;
  });

  const completedQuests = computed(() => {
    return mvu.value.PlayerData.progress.completedQuest;
  });

  const activeQuestTab = ref('currentQuests');

  const activeQuest = (questId: string) => {
    const questToActivate = mvu.value.PlayerData.progress.nextQuest[questId];

    if (questToActivate) {
      const quest = _.cloneDeep(questToActivate);
      toastr.success(`成功激活 ${questToActivate.name} `);
      handleMvuUpdate([
        {
          event: 'insertByObject',
          detail: {
            PlayerData: {
              progress: {
                currentQuest: {
                  [questId]: quest,
                },
              },
            },
          },
        },
      ]);
      handleMvuUpdate([
        {
          event: 'deleteByObject',
          detail: {
            PlayerData: {
              progress: {
                nextQuest: {
                  [questId]: {},
                },
              },
            },
          },
        },
      ]);
    }
  };

  const deleteQuest = (
    questId: string,
    questType: 'currentQuest' | 'nextQuest' | 'pendingQuest' | 'completedQuest',
  ) => {
    const questToDelete = mvu.value.PlayerData.progress[questType]?.[questId];
    if (questToDelete) {
      toastr.success(`成功删除 ${questToDelete.name}`);
      handleMvuUpdate([
        {
          event: 'deleteByObject',
          detail: {
            PlayerData: {
              progress: {
                [questType]: {
                  [questId]: {},
                },
              },
            },
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
