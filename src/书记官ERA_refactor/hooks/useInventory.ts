import { computed, ref, watch } from 'vue';
import type { BaseInventoryItem, InventoryItem } from '../itemConstants';
import { MvuData } from '../types';

export function useInventory(mvu: Ref<MvuData>, handleMvuUpdate: Function) {
  const selectedItem = ref<InventoryItem | null>(null);
  const isEditing = ref(false);
  const editableItem = ref<InventoryItem | null>(null);

  function selectItem(item: BaseInventoryItem | null, index: string) {
    if (selectedItem.value?.id === index) {
      selectedItem.value = null;
    } else {
      selectedItem.value = item
        ? {
            ...item,
            id: index,
          }
        : null;
    }
  }

  const deleteItem = (itemKey: string) => {
    const itemToDelete = mvu.value.playerDynamicData.inventory[itemKey];
    if (selectedItem.value && itemToDelete && selectedItem.value.name === itemToDelete.name) {
      selectItem(null, '');
    }
    handleMvuUpdate([
      {
        event: 'deleteByPath',
        detail: {
          path: `playerDynamicData.inventory.${itemKey}`,
        },
      },
    ]);
  };

  const editItem = (itemKey: string, item: BaseInventoryItem) => {
    handleMvuUpdate([
      {
        event: 'updateByPath',
        detail: {
          path: `playerDynamicData.inventory.${itemKey}`,
          value: item,
        },
      },
    ]);
  };

  const startEditing = () => {
    if (selectedItem.value) {
      editableItem.value = JSON.parse(JSON.stringify(selectedItem.value));
      isEditing.value = true;
    }
  };

  const cancelEditing = () => {
    isEditing.value = false;
    editableItem.value = null;
  };

  const saveChanges = () => {
    if (selectedItem.value && editableItem.value) {
      const { id } = selectedItem.value;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _, ...itemData } = editableItem.value;
      editItem(id, itemData);
      isEditing.value = false;
      // Manually update selectedItem to reflect changes immediately
      selectedItem.value = { ...selectedItem.value, ...itemData };
    }
  };

  watch(selectedItem, (newItem, oldItem) => {
    if (newItem?.id !== oldItem?.id) {
      cancelEditing();
    }
  });

  const groupOrder = ['item', 'consumable', 'cloth', 'weapon'] as const;

  const groupedInventory = computed(() => {
    const groups: { [key: string]: { [key: string]: any } } = {
      cloth: {},
      weapon: {},
      item: {},
      consumable: {},
    };

    if (mvu.value.playerDynamicData.inventory) {
      for (const key in mvu.value.playerDynamicData.inventory) {
        const item = mvu.value.playerDynamicData.inventory[key];
        if (item.type && groups[item.type]) {
          groups[item.type][key] = item;
        }
      }
    }

    return groups;
  });

  return {
    selectedItem,
    selectItem,
    deleteItem,
    editItem,
    isEditing,
    editableItem,
    startEditing,
    cancelEditing,
    saveChanges,
    groupOrder,
    groupedInventory,
  };
}
