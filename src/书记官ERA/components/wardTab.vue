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
        :class="{ active: outfitId === mvu.Wardrobe.currentOutfit, selected: outfitId === selectedOutfitId }"
        @click="selectedOutfitId = outfitId"
      >
        {{ outfit.name }}
        <span v-if="outfitId === mvu.Wardrobe.currentOutfit" class="current-tag">(当前)</span>
      </div>
    </div>
    <div class="outfit-details">
      <template v-if="selectedOutfit">
        <div class="outfit-header">
          <div class="section-title">{{ selectedOutfit.name }}</div>
          <button @click="equipOutfit(selectedOutfitId)" :disabled="selectedOutfitId === mvu.Wardrobe.currentOutfit">
            装备
          </button>
        </div>

        <div class="equipment-slots">
          <template v-for="(item, slotKey) in selectedOutfit.slots" :key="slotKey">
            <div class="slot-item" v-if="!Array.isArray(item) && item">
              <span class="slot-name">{{ slotNames[slotKey] || item.slot }}</span>
              <span class="item-name"
                >{{ item.name }} <span class="item-details">({{ item.quality }}, {{ item.material }})</span></span
              >
            </div>
            <div class="slot-item" v-else-if="slotKey !== 'extra'">
              <span class="slot-name">{{ slotNames[slotKey] }}</span>
              <span class="item-name-empty">--</span>
            </div>
            <template v-if="slotKey === 'extra' && Array.isArray(item) && item.length > 0">
              <div v-for="(extraItem, index) in item" :key="`extra-${index}`" class="slot-item">
                <span class="slot-name">{{ slotNames.extra || '额外' }}</span>
                <span class="item-name"
                  >{{ extraItem.name }}
                  <span class="item-details">({{ extraItem.quality }}, {{ extraItem.material }})</span></span
                >
              </div>
            </template>
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

const emit = defineEmits(['open-update']);

const { mvu, rawMvuData, handleMvuUpdate, initialize } = useMvuData();
const { slotNames, selectedOutfitId, selectedOutfit, currentEquippedOutfit, equipOutfit, openUpdateOutfit } =
  useWardrobe(mvu, emit);
</script>
