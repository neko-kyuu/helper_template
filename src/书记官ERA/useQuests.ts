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
    console.log(questId);
    const questToActivate = mvu.value.PlayerData.progress.nextQuest[questId];
    console.log(questToActivate);

    if (questToActivate) {
      const quest = _.cloneDeep(questToActivate);
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

  return {
    currentQuests,
    nextQuests,
    pendingQuests,
    completedQuests,
    activeQuestTab,
    activeQuest,
  };
}
