<template>
  <div class="wardrobe-container">
    <div class="outfit-list">
      <div class="outfit-header">
        <div class="section-title">可用套装</div>
        <button @click="openUpdateOutfit">新增</button>
      </div>

      <div
        v-for="(outfit, outfitId) in mvu.Wardrobe.ownedOutfits"
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
            <span>防御</span><span>{{ mvu.PlayerDynamicData.clothingAttributes.defense.toFixed(1) }}</span>
          </div>
          <div class="attr">
            <span>舒适</span><span>{{ mvu.PlayerDynamicData.clothingAttributes.comfort.toFixed(1) }}</span>
          </div>
          <div class="attr">
            <span>保暖</span><span>{{ mvu.PlayerDynamicData.clothingAttributes.warmth.toFixed(1) }}</span>
          </div>
          <div class="attr">
            <span>社交</span><span>{{ mvu.PlayerDynamicData.clothingAttributes.social.toFixed(1) }}</span>
          </div>
          <div class="attr">
            <span>重量</span><span>{{ mvu.PlayerDynamicData.clothingAttributes.weight.toFixed(1) }}</span>
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
const { slotNames, selectedOutfitId, selectedOutfit, editOutfit, openUpdateOutfit } = useWardrobe(mvu, emit);
</script>
