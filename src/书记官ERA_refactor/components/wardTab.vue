<template>
  <div class="wardrobe-container">
    <div class="outfit-list">
      <div class="outfit-header">
        <div class="section-title">可用套装</div>
        <button @click="openUpdateOutfit">新增</button>
      </div>

      <div
        v-for="(outfit, outfitId) in mvu.wardrobe.ownedOutfits"
        :key="outfitId"
        class="outfit-item"
        :class="{ selected: outfitId === selectedOutfitId }"
        @click="selectedOutfitId = outfitId"
      >
        {{ outfit.name }}
      </div>
    </div>
    <div class="outfit-details">
      <template v-if="selectedOutfit">
        <div class="outfit-header">
          <div class="section-title">{{ selectedOutfit.name }}</div>
          <button @click="editOutfit(selectedOutfitId)">编辑</button>
        </div>

        <div class="equipment-slots">
          <template v-for="(slotName, slotKey) in slotNames" :key="slotKey">
            <template v-if="slotKey !== 'extra'">
              <div class="slot-item">
                <span class="slot-name">{{ slotName }}</span>
                <span v-if="selectedOutfit.slots[slotKey]" class="item-name">
                  {{ selectedOutfit.slots[slotKey].name }}
                  <span class="item-details">({{ selectedOutfit.slots[slotKey].quality }})</span>
                </span>
                <span v-else class="item-name-empty">--</span>
              </div>
            </template>
          </template>
          <template v-if="selectedOutfit.slots.extra && selectedOutfit.slots.extra.length > 0">
            <div v-for="(extraItem, index) in selectedOutfit.slots.extra" :key="`extra-${index}`" class="slot-item">
              <span class="slot-name">{{ slotNames.extra || '额外' }}</span>
              <span class="item-name">
                {{ extraItem.name }} <span class="item-details">({{ extraItem.quality }})</span>
              </span>
            </div>
          </template>
        </div>

        <div class="clothing-attributes">
          <div class="section-title">当前总属性</div>
          <div class="attr">
            <span>防御</span><span>{{ clothingAttributes.defense.toFixed(1) }}</span>
          </div>
          <div class="attr">
            <span>舒适</span><span>{{ clothingAttributes.comfort.toFixed(1) }}</span>
          </div>
          <div class="attr">
            <span>保暖</span><span>{{ clothingAttributes.warmth.toFixed(1) }}</span>
          </div>
          <div class="attr">
            <span>社交</span><span>{{ clothingAttributes.social.toFixed(1) }}</span>
          </div>
          <div class="attr">
            <span>重量</span><span>{{ clothingAttributes.weight.toFixed(1) }}</span>
          </div>
        </div>
      </template>
      <div v-else class="data-empty">请选择一套服装查看详情</div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useMvuData } from '../hooks/useMvuData';
import { useWardrobe } from '../hooks/useWardrobe';

const emit = defineEmits<{
  (e: 'open-update', outfitId?: string): void;
}>();

const { mvu, rawMvuData, handleMvuUpdate, initialize } = useMvuData();
const { slotNames, selectedOutfitId, selectedOutfit, editOutfit, openUpdateOutfit, clothingAttributes } = useWardrobe(
  mvu,
  emit,
);
</script>

<style lang="scss" scoped>
.wardrobe-container {
  display: flex;
  gap: 16px;
  height: 100%;
  width: 100%;
  padding: 0 40px;

  .outfit-list {
    width: 180px;
    border-right: 1px solid var(--border_color);
    padding-right: 16px;
    flex-shrink: 0;
    overflow-y: auto;

    .outfit-item {
      padding: 8px 12px;
      border-radius: 4px;
      cursor: pointer;
      margin: 4px 0;
      transition: all 0.2s ease;
      font-size: var(--font-size-small);
      display: flex;
      justify-content: space-between;
      align-items: center;

      &:hover {
        background-color: var(--blur_tint_color_less);
      }

      &.selected {
        background-color: var(--blur_tint_color);
        border-color: var(--border_color);
      }

      &.active {
        font-weight: bold;
        color: var(--main_text_color);
      }

      .current-tag {
        font-size: var(--font-size-extra-small);
        color: var(--quote_text_color);
        font-weight: normal;
      }
    }
  }

  .outfit-details {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;

    .equipment-slots {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      column-gap: 10px;

      .slot-item {
        display: flex;
        justify-content: space-between;
        padding: 5px 0;
        font-size: var(--font-size-small);
        border-bottom: 1px solid var(--bot_mes_blur_tint_color);

        .slot-name {
          color: var(--quote_text_color);
          text-transform: capitalize;
          font-weight: bold;
        }

        .item-name {
          .item-details {
            color: var(--italics_text_color);
            font-size: var(--font-size-extra-small);
          }
        }

        .item-name-empty {
          color: var(--italics_text_color);
        }
      }
    }

    .clothing-attributes {
      margin-top: auto;
      padding-top: 10px;

      .attr {
        display: flex;
        justify-content: space-between;
        font-size: var(--font-size-small);
        padding: 3px 0;
      }
    }
  }

  .outfit-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 6px;
    border-bottom: 1px solid var(--border_color);

    .section-title {
      margin-bottom: 0;
      border-bottom: none;
      padding-bottom: 0;
    }
  }
}
</style>
