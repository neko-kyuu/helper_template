import { ref, Ref } from 'vue';
import { MvuData, NpcData, WithId } from '../types';

export function useWorld(mvu: Ref<MvuData>, handleMvuUpdate: Function, emit: (event: 'open-map') => void) {
  const selectedNpc = ref<WithId<NpcData> | null>(null);

  function selectNpc(npc: NpcData | null, index: string) {
    if (selectedNpc.value?.id === index) {
      selectedNpc.value = null;
    } else {
      selectedNpc.value = npc
        ? {
            ...npc,
            id: index,
          }
        : null;
    }
  }

  const openWorldMap = () => {
    emit('open-map');
  };

  const getPrestigeDescription = (prestige: number): string => {
    if (prestige <= -75) return '死敌';
    if (prestige <= -25) return '敌对';
    if (prestige < 25) return '中立';
    if (prestige < 75) return '友善';
    return '盟友';
  };

  const getPrestigeColor = (prestige: number): string => {
    if (prestige <= -75) return '#c00';
    if (prestige <= -25) return '#f44336';
    if (prestige < 25) return '#9e9e9e';
    if (prestige < 75) return '#4caf50';
    return '#8bc34a';
  };

  const deleteNPC = (npcKey: string) => {
    const itemToDelete = mvu.value.PlayerData.settings.nearbyNPC[npcKey];
    if (selectedNpc.value && itemToDelete && selectedNpc.value.character.name === itemToDelete.character.name) {
      selectNpc(null, '');
    }
    handleMvuUpdate([
      {
        event: 'deleteByObject',
        detail: {
          PlayerData: {
            settings: {
              nearbyNPC: {
                [npcKey]: {},
              },
            },
          },
        },
      },
    ]);
  };

  return {
    selectedNpc,
    selectNpc,
    openWorldMap,
    getPrestigeDescription,
    getPrestigeColor,
    deleteNPC,
  };
}
