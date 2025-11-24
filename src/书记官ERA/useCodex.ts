import type { Ref } from 'vue';
import { computed, ref } from 'vue';

// 定义图鉴和趣闻条目的类型，以便在组件中使用
export interface BestiaryEntry {
  name: string;
  description: string;
  habitat: string;
  weaknesses: string;
  knownInfo: string;
  killCount: number;
}

export interface AnecdoteEntry {
  name: string;
  description: string;
  location: string;
  charactersInvolved: string;
  knownInfo: string;
}

export function useCodex(mvu: Ref<any>) {
  const selectedEntry = ref<BestiaryEntry | AnecdoteEntry | null>(null);
  const activeCodexTab = ref('bestiary'); // 'bestiary' or 'anecdotes'

  const bestiaryEntries = computed(() => {
    return mvu.value.PlayerData.settings.bestiary || {};
  });

  const anecdoteEntries = computed(() => {
    return mvu.value.PlayerData.settings.anecdotes || {};
  });

  function selectEntry(entry: BestiaryEntry | AnecdoteEntry) {
    selectedEntry.value = entry;
  }

  return {
    selectedEntry,
    selectEntry,
    activeCodexTab,
    bestiaryEntries,
    anecdoteEntries,
  };
}
