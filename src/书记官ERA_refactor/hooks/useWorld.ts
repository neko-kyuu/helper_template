import { ref, Ref } from 'vue';
import { MvuData, NpcData, WithId } from '../types';

export function useWorld(mvu: Ref<MvuData>, handleMvuUpdate: Function, emit: (event: 'open-map') => void) {
  const selectedNpc = ref<WithId<NpcData> | null>(null);

  const archivedFlag = ref(false);
  function selectNpc(npc: NpcData | null, index: string, archived: boolean = false) {
    archivedFlag.value = archived;
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
    const itemToDelete = mvu.value.WorldInfo.nearbyNPC[npcKey];
    if (selectedNpc.value && itemToDelete && selectedNpc.value.character.name === itemToDelete.character.name) {
      selectNpc(null, '');
    }
    handleMvuUpdate([
      {
        event: 'deleteByPath',
        detail: {
          path: `WorldInfo.nearbyNPC.${npcKey}`,
        },
      },
    ]);
    handleMvuUpdate([
      {
        event: 'insertByPath',
        detail: {
          path: `ArchivedData.worldNPC.${npcKey}`,
          value: itemToDelete,
        },
      },
    ]);
  };

  const openNPC = (npcKey: string) => {
    const itemToDelete = mvu.value.ArchivedData.worldNPC[npcKey];
    if (selectedNpc.value && itemToDelete && selectedNpc.value.character.name === itemToDelete.character.name) {
      selectNpc(null, '');
    }
    handleMvuUpdate([
      {
        event: 'deleteByPath',
        detail: {
          path: `ArchivedData.worldNPC.${npcKey}`,
        },
      },
    ]);
    handleMvuUpdate([
      {
        event: 'insertByPath',
        detail: {
          path: `WorldInfo.nearbyNPC.${npcKey}`,
          value: itemToDelete,
        },
      },
    ]);
  };

  const getNPCNameByKey = (npcKey: string): string => {
    const npc = mvu.value.WorldInfo.nearbyNPC;
    const party = mvu.value.FollowerNPCData;
    return npc[npcKey] ? npc[npcKey].character.name : party[npcKey] ? party[npcKey].character.name : '';
  };

  return {
    archivedFlag,
    selectedNpc,
    selectNpc,
    openWorldMap,
    getPrestigeDescription,
    getPrestigeColor,
    deleteNPC,
    openNPC,
    getNPCNameByKey,
  };
}
