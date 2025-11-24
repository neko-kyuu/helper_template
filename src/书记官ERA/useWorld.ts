import { ref } from 'vue';

interface NPC {
  character:{
    name: string;
    level: number;
    gender: string;
    race: string;
  },
  attributes: {
    shooting: number;
    melee: number;
    construction: number;
    mining: number;
    cooking: number;
    planting: number;
    animals: number;
    crafting: number;
    artistic: number;
    medical: number;
    social: number;
    intellectual: number;
  },
  meta:{
    relationship: string;
    favorability: number;
    description: string;
  }
}

export function useWorld(mvu: any) {
  const selectedNpc = ref<NPC | null>(null);

  function selectNpc(npc: NPC) {
    if (selectedNpc.value === npc) {
      selectedNpc.value = null;
    } else {
      selectedNpc.value = npc;
    }
  }

  return {
    selectedNpc,
    selectNpc,
  };
}
