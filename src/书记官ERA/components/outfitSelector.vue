<template>
  <div class="outfit-editor-container">
    <div class="outfit-selector-container">
      <div class="detail-panel">
        <div class="details-content">
          <div class="edit-form">
            <div class="form-group">
              <label for="outfit-name">名称</label>
              <input id="outfit-name" v-model="editingOutfit.name" type="text" />
            </div>
            <div class="form-group">
              <label for="outfit-type">类型</label>
              <input id="outfit-type" v-model="editingOutfit.type" type="text" />
            </div>
            <div class="form-group">
              <label for="outfit-description">描述</label>
              <textarea id="outfit-description" v-model="editingOutfit.description"></textarea>
            </div>
            <div class="form-group">
              <label for="outfit-wearer">穿戴者</label>
              <select v-model="editingOutfit.wearer">
                <option v-for="(char, key) in party" :key="key" :value="key">{{ char.character.name }}</option>
              </select>
              <!-- <input id="outfit-wearer" v-model="editingOutfit.wearer" type="text" /> -->
            </div>
          </div>
        </div>
      </div>
      <div class="outfit-grid">
        <template v-for="(row, rowIndex) in layout" :key="rowIndex">
          <template v-for="(item, colIndex) in row" :key="colIndex">
            <div
              v-if="item"
              class="outfit-slot"
              :class="{ selected: selectedSlot === item }"
              @click="handleSlotClick(item)"
            >
              {{ editingOutfit.slots[item] ? editingOutfit.slots[item].name : slotLabels[item] }}
            </div>
            <div v-else />
          </template>
        </template>
      </div>
      <div class="item-display-panel">
        <div v-if="selectedSlot" class="item-list">
          <ul>
            <li
              v-for="item in groupedInventory[selectedSlot]"
              :key="item.id"
              class="item-card"
              :class="{ equipped: isEquipped(item) }"
            >
              <div class="item-info">
                <div>
                  {{ item.name }} ({{ qualityLabels[item.quality] }}) - {{ tierLabels[item.tier] }}
                  <button @click="equipItem(item)">
                    {{ isEquipped(item) ? '已穿上' : '穿上' }}
                  </button>
                </div>
                <div class="item-description">{{ item.description }}</div>
              </div>
            </li>
          </ul>
          <div v-if="!groupedInventory[selectedSlot] || groupedInventory[selectedSlot].length === 0" class="empty-text">
            该部位没有衣物
          </div>
        </div>
        <div v-else class="empty-text">点击一个部位来查看衣物</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { computed, defineExpose, defineProps, ref, watch } from 'vue';
import { useMvuData } from '../hooks/useMvuData';
import { useParty } from '../hooks/useParty';
import { qualityLabels, slotLabels, tierLabels, type InventoryItem, type SlotType } from '../itemConstants';
import { type OutfitData, type Slots } from '../types';

const props = defineProps<{
  outfitId: string | null;
}>();

const { mvu, rawMvuData, handleMvuUpdate } = useMvuData();
const { party } = useParty(mvu, rawMvuData, handleMvuUpdate);
const selectedSlot = ref<SlotType | null>(null);

const defaultSlots: Slots = {
  head: null,
  bodyInner: null,
  bodyArmor: null,
  hands: null,
  legsInner: null,
  legsArmor: null,
  feet: null,
  cloak: null,
  neck: null,
  ring: null,
  belt: null,
  extra: [],
};

const defaultOutfitTemplate: OutfitData = {
  name: '初始套装',
  type: 'casual',
  description: '[套装描述]',
  wearer: null,
  slots: _.cloneDeep(defaultSlots),
};

const editingOutfit = ref<OutfitData>(_.cloneDeep(defaultOutfitTemplate));

watch(
  () => props.outfitId,
  newOutfitId => {
    const newOutfitData = newOutfitId ? mvu.value.Wardrobe.ownedOutfits[newOutfitId] : null;
    if (newOutfitData) {
      const hydratedSlots: Slots = _.cloneDeep(defaultSlots);
      const itemInventory = mvu.value.PlayerDynamicData.inventory;

      for (const slotKey in newOutfitData.slots) {
        if (Object.prototype.hasOwnProperty.call(newOutfitData.slots, slotKey)) {
          const slotName = slotKey as keyof Slots;
          if (slotName === 'extra') {
            const itemIds = (newOutfitData.slots as any)[slotName] as string[];
            (hydratedSlots as any)[slotName] = itemIds
              .map(id => (itemInventory[id] ? { ...itemInventory[id], id } : null))
              .filter(Boolean);
          } else {
            const itemId = (newOutfitData.slots as any)[slotName];
            if (typeof itemId === 'string' && itemInventory[itemId]) {
              (hydratedSlots as any)[slotName] = { ...itemInventory[itemId], id: itemId };
            } else {
              (hydratedSlots as any)[slotName] = null;
            }
          }
        }
      }
      editingOutfit.value = {
        ...newOutfitData,
        slots: hydratedSlots,
      };
    } else {
      editingOutfit.value = _.cloneDeep(defaultOutfitTemplate);
    }
  },
  { immediate: true },
);

function handleSlotClick(slot: SlotType) {
  selectedSlot.value = slot;
}

function equipItem(item: InventoryItem) {
  if (!item.slot) return;
  const currentEquippedItem = editingOutfit.value.slots[item.slot];
  if (currentEquippedItem && 'id' in currentEquippedItem && currentEquippedItem.id === item.id) {
    editingOutfit.value.slots[item.slot] = null;
  } else {
    editingOutfit.value.slots[item.slot] = item as any;
  }
}

function isEquipped(item: InventoryItem): boolean {
  if (!item.slot) return false;
  const equippedItem = editingOutfit.value.slots[item.slot];
  return !!(equippedItem && 'id' in equippedItem && equippedItem.id === item.id);
}

defineExpose({
  getOutfitData: () => {
    const outfitToSave = _.cloneDeep(editingOutfit.value);
    const dehydratedSlots: any = {};
    for (const key in outfitToSave.slots) {
      const slotKey = key as keyof Slots;
      if (slotKey === 'extra') {
        dehydratedSlots[slotKey] = ((outfitToSave.slots[slotKey] || []) as { id: string }[]).map(item => item.id);
      } else {
        const item = outfitToSave.slots[slotKey] as InventoryItem | null;
        dehydratedSlots[slotKey] = item ? item.id : null;
      }
    }
    outfitToSave.slots = dehydratedSlots;
    return outfitToSave;
  },
});

const groupedInventory = computed(() => {
  const inventoryItemsWithId = Object.entries(mvu.value.PlayerDynamicData.inventory).map(([id, itemData]) => ({
    ...itemData,
    id,
  }));
  const slottedItems = inventoryItemsWithId.filter((item): item is InventoryItem & { slot: SlotType } => !!item.slot);
  return _.groupBy(slottedItems, 'slot') as Record<SlotType, InventoryItem[]>;
});

const layout: (SlotType | null)[][] = [
  [null, 'neck', 'head', null],
  ['cloak', 'bodyArmor', 'bodyInner', null],
  ['ring', null, 'belt', 'hands'],
  [null, 'legsArmor', 'legsInner', 'feet'],
];
</script>

<style scoped lang="scss">
@import '../css/style.scss';

.outfit-editor-container {
  padding: 6px;
}

.outfit-meta-editor {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 4px;
  border: 1px solid var(--border_color);
  border-radius: 4px;
  padding: 6px;
}

.outfit-selector-container {
  display: flex;
  gap: 16px;
}

.outfit-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  width: 321px;
  flex-shrink: 0;
}

.outfit-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1 / 1;
  border: 1px dashed var(--border_color);
  color: var(--italics_text_color);
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  font-size: var(--font-size-small);

  &:hover {
    border-style: solid;
    color: var(--main_text_color);
  }

  &.selected {
    border-style: solid;
    border-color: var(--quote_text_color);
    color: var(--quote_text_color);
    font-weight: bold;
  }
}

.item-display-panel {
  flex: 1;
  border: 1px solid var(--border_color);
  border-radius: 4px;
  padding: 16px;
  min-width: 200px;
  max-height: 300px;
  overflow-y: auto;

  .item-list {
    ul {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  }

  .item-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 1px solid var(--border_color);
    border-radius: 4px;
    padding: 8px;
    color: var(--main_text_color);
    transition: all 0.2s ease-in-out;

    &.equipped {
      border-color: var(--quote_text_color);
      background-color: rgba(86, 57, 137, 0.05);
    }

    button {
      background-color: var(--blur_tint_color);
      border: 1px solid var(--border_color);
      border-radius: 4px;
      padding: 4px 8px;
      cursor: pointer;
      flex-shrink: 0;
      margin-left: 8px;
      &:hover {
        background-color: var(--underline_text_color);
      }
    }
  }

  .item-info {
    font-size: var(--font-size-medium);
  }

  .item-description {
    font-size: var(--font-size-small);
    color: var(--italics_text_color);
    margin-top: 4px;
  }

  .empty-text {
    display: flex;
    height: 100%;
    align-items: center;
    justify-content: center;
    color: var(--italics_text_color);
    font-size: var(--font-size-small);
  }
}
</style>
