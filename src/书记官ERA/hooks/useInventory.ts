import { ref, watch } from 'vue';
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
    const itemToDelete = mvu.value.PlayerDynamicData.inventory[itemKey];
    if (selectedItem.value && itemToDelete && selectedItem.value.name === itemToDelete.name) {
      selectItem(null, '');
    }
    handleMvuUpdate([
      {
        event: 'deleteByObject',
        detail: {
          PlayerDynamicData: {
            inventory: {
              [itemKey]: {},
            },
          },
        },
      },
    ]);
  };

  const editItem = (itemKey: string, item: BaseInventoryItem) => {
    handleMvuUpdate([
      {
        event: 'updateByObject',
        detail: {
          PlayerDynamicData: {
            inventory: {
              [itemKey]: item,
            },
          },
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
  };
}
