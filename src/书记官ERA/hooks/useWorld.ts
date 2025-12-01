import { ref, Ref } from 'vue';
import { MvuData, NpcData } from '../types';

export function useWorld(mvu: Ref<MvuData>, emit: (event: 'open-map') => void) {
  const selectedNpc = ref<NpcData | null>(null);

  function selectNpc(npc: NpcData) {
    if (selectedNpc.value === npc) {
      selectedNpc.value = null;
    } else {
      selectedNpc.value = npc;
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

  return {
    selectedNpc,
    selectNpc,
    openWorldMap,
    getPrestigeDescription,
    getPrestigeColor
  };
}
