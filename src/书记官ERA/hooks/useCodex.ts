import type { Ref } from 'vue';
import { computed, ref, watch } from 'vue';
import type { MvuData } from '../types';

// 定义图鉴和趣闻条目的类型，以便在组件中使用
export interface BaseBestiaryEntry {
  name: string;
  description: string;
  habitat: string;
  weaknesses: string;
  knownInfo: string;
  killCount: number;
}

export interface BaseAnecdoteEntry {
  name: string;
  description: string;
  location: string;
  charactersInvolved: string;
  knownInfo: string;
}

export type CodexEntry = (BaseBestiaryEntry | BaseAnecdoteEntry) & { id: string };

export function useCodex(mvu: Ref<MvuData>, handleMvuUpdate: Function) {
  const selectedEntry = ref<CodexEntry | null>(null);
  const activeCodexTab = ref('bestiary'); // 'bestiary' or 'anecdotes'
  const isEditing = ref(false);
  const editableEntry = ref<CodexEntry | null>(null);

  const bestiaryEntries = computed(() => {
    return mvu.value.PlayerData.settings.bestiary || {};
  });

  const anecdoteEntries = computed(() => {
    return mvu.value.PlayerData.settings.anecdotes || {};
  });

  function selectEntry(entry: BaseBestiaryEntry | BaseAnecdoteEntry | null, key: string) {
    selectedEntry.value = entry
      ? {
          ...entry,
          id: key,
        }
      : null;
  }

  const deleteEntry = (entryKey: string) => {
    const entryToDelete =
      activeCodexTab.value === 'bestiary'
        ? mvu.value.PlayerData.settings.bestiary[entryKey]
        : mvu.value.PlayerData.settings.anecdotes[entryKey];

    if (selectedEntry.value && entryToDelete && selectedEntry.value.name === entryToDelete.name) {
      selectEntry(null, '');
    }

    const path = activeCodexTab.value === 'bestiary' ? 'bestiary' : 'anecdotes';

    handleMvuUpdate([
      {
        event: 'deleteByObject',
        detail: {
          PlayerData: {
            settings: {
              [path]: {
                [entryKey]: {},
              },
            },
          },
        },
      },
    ]);
  };

  const editEntry = (entryKey: string, entry: BaseBestiaryEntry | BaseAnecdoteEntry) => {
    const path = activeCodexTab.value === 'bestiary' ? 'bestiary' : 'anecdotes';
    handleMvuUpdate([
      {
        event: 'updateByObject',
        detail: {
          PlayerData: {
            settings: {
              [path]: {
                [entryKey]: entry,
              },
            },
          },
        },
      },
    ]);
  };

  const startEditing = () => {
    if (selectedEntry.value) {
      editableEntry.value = JSON.parse(JSON.stringify(selectedEntry.value));
      isEditing.value = true;
    }
  };

  const cancelEditing = () => {
    isEditing.value = false;
    editableEntry.value = null;
  };

  const saveChanges = () => {
    if (selectedEntry.value && editableEntry.value) {
      const { id } = selectedEntry.value;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _, ...entryData } = editableEntry.value;
      editEntry(id, entryData);
      isEditing.value = false;
      // Manually update selectedEntry to reflect changes immediately
      selectedEntry.value = { ...selectedEntry.value, ...entryData };
    }
  };

  watch(selectedEntry, (newEntry, oldEntry) => {
    if (newEntry?.id !== oldEntry?.id) {
      cancelEditing();
    }
  });

  watch(activeCodexTab, () => {
    selectEntry(null, '');
  });

  return {
    selectedEntry,
    selectEntry,
    activeCodexTab,
    bestiaryEntries,
    anecdoteEntries,
    deleteEntry,
    isEditing,
    editableEntry,
    startEditing,
    cancelEditing,
    saveChanges,
  };
}
