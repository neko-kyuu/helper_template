import { ref } from 'vue';
import type { InventoryItem } from './itemConstants';

export function useInventory() {
  const selectedItem = ref<InventoryItem | null>(null);

  function selectItem(item: InventoryItem) {
    selectedItem.value = item;
  }

  return {
    selectedItem,
    selectItem,
  };
}