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

  const getNextId = (obj: Record<string, any> | undefined, prefix: string): string => {
    if (!obj) return `${prefix}1`;
    const keys = Object.keys(obj);
    const ids = keys
      .map(k => {
        const match = k.match(new RegExp(`^${prefix}(\\d+)$`));
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(id => !isNaN(id));
    const maxId = ids.length > 0 ? Math.max(...ids) : 0;
    return `${prefix}${maxId + 1}`;
  };

  const archiveNPC = (npcKey: string) => {
    const itemToDelete = mvu.value.worldInfo.nearbyNPC[npcKey];
    if (selectedNpc.value && itemToDelete && selectedNpc.value.character.name === itemToDelete.character.name) {
      selectNpc(null, '');
    }
    const newKey = getNextId(mvu.value.archivedData.worldNPC, 'AC');
    handleMvuUpdate([
      {
        event: 'deleteByPath',
        detail: {
          path: `worldInfo.nearbyNPC.${npcKey}`,
        },
      },
    ]);
    handleMvuUpdate([
      {
        event: 'insertByPath',
        detail: {
          path: `archivedData.worldNPC.${newKey}`,
          value: itemToDelete,
        },
      },
    ]);
  };
  const archiveFaction = (factionKey: string) => {
    const itemToDelete = mvu.value.worldInfo.factionPrestige[factionKey];
    handleMvuUpdate([
      {
        event: 'deleteByPath',
        detail: {
          path: `worldInfo.factionPrestige.${factionKey}`,
        },
      },
    ]);
    handleMvuUpdate([
      {
        event: 'insertByPath',
        detail: {
          path: `archivedData.factionPrestige.${factionKey}`,
          value: itemToDelete,
        },
      },
    ]);
  };

  const openNPC = (npcKey: string) => {
    const itemToDelete = mvu.value.archivedData.worldNPC[npcKey];
    if (selectedNpc.value && itemToDelete && selectedNpc.value.character.name === itemToDelete.character.name) {
      selectNpc(null, '');
    }
    const newKey = getNextId(mvu.value.worldInfo.nearbyNPC, 'C');
    handleMvuUpdate([
      {
        event: 'deleteByPath',
        detail: {
          path: `archivedData.worldNPC.${npcKey}`,
        },
      },
    ]);
    handleMvuUpdate([
      {
        event: 'insertByPath',
        detail: {
          path: `worldInfo.nearbyNPC.${newKey}`,
          value: itemToDelete,
        },
      },
    ]);
  };
  const openFaction = (factionKey: string) => {
    const itemToDelete = mvu.value.archivedData.factionPrestige[factionKey];
    handleMvuUpdate([
      {
        event: 'deleteByPath',
        detail: {
          path: `archivedData.factionPrestige.${factionKey}`,
        },
      },
    ]);
    handleMvuUpdate([
      {
        event: 'insertByPath',
        detail: {
          path: `worldInfo.factionPrestige.${factionKey}`,
          value: itemToDelete,
        },
      },
    ]);
  };

  const getNPCNameByKey = (npcKey: string): string => {
    const npc = mvu.value.worldInfo.nearbyNPC;
    const party = mvu.value.followerNPCData;
    const archivedNpc = mvu.value.archivedData.worldNPC;
    return npc[npcKey]
      ? npc[npcKey].character.name
      : party[npcKey]
        ? party[npcKey].character.name
        : archivedNpc[npcKey]
          ? archivedNpc[npcKey].character.name
          : '未知NPC';
  };
  const getFavorabilityTowardsNPCs = (val: Record<string, number> | undefined) => {
    if (!val) return '';

    const favs = Object.entries(val).map(([npcName, fav]) => {
      return `${npcName}: ${fav}`;
    });
    return favs.join(', ');
  };

  return {
    archivedFlag,
    selectedNpc,
    selectNpc,
    openWorldMap,
    getPrestigeDescription,
    getPrestigeColor,
    archiveNPC,
    openNPC,
    archiveFaction,
    openFaction,
    getNPCNameByKey,
    getFavorabilityTowardsNPCs,
  };
}
