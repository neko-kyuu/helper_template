<template>
  <div class="trade-container">
    <div class="inventory-mini">
      <div class="gold">💰 {{ mvu.playerDynamicData.gold }}金币</div>
      <div class="trade-controls">
        <textarea
          v-model="refreshUserInput"
          placeholder="输入刷新要求 (可选)..."
          class="refresh-textarea"
          :disabled="isGenerating"
        ></textarea>
        <div>
          <button @click="$emit('open-settings')" title="API 设置" style="margin-right: 6px">
            <i class="fa-solid fa-gear"></i>
          </button>
          <button @click="refreshShop(refreshUserInput)" :disabled="isGenerating">
            刷新货架 <i class="fa-solid fa-rotate" :class="{ 'fa-spin': isGenerating }"></i>
          </button>
        </div>
      </div>
    </div>

    <div class="master-detail-body">
      <div class="master-grid trade-grid" v-if="shopItems.length">
        <div class="section-title grid-col-span-full">今日供应</div>
        <div
          class="master-grid-item"
          v-for="item in shopItems"
          :key="item.id"
          :class="{ selected: selectedItem?.id === item.id }"
          @click="selectedItem = item"
        >
          <div class="item-main">
            <i class="fa-solid fa-box" v-if="item.type == 'item'"></i>
            <i class="fa-solid fa-plate-wheat" v-if="item.type == 'consumable'"></i>
            <i class="fa-solid fa-shirt" v-if="item.type == 'cloth'"></i>
            <i class="fa-solid fa-wand-sparkles" v-if="item.type == 'weapon'"></i>
            {{ item.name }}
          </div>
          <div class="item-price">{{ item.price }}g</div>
        </div>
      </div>
      <div v-else-if="isGenerating" class="data-empty" style="background: var(--blur_tint_color)">
        <i class="fa-solid fa-spinner fa-spin"></i> 正在联络商人...
      </div>
      <div v-else class="data-empty" style="background: var(--blur_tint_color)">货架空空如也，点击刷新尝试生成</div>

      <div class="detail-panel">
        <div v-if="selectedItem" class="details-content">
          <div class="item-name flex-between">
            {{ selectedItem.name }}
          </div>
          <div class="item-quality" :class="selectedItem.quality">{{ qualityLabels[selectedItem.quality] }}</div>
          <div class="item-type-tier">{{ typeLabels[selectedItem.type] }} / {{ tierLabels[selectedItem.tier] }}</div>
          <div class="item-slot" v-if="selectedItem.slot">部位: {{ slotLabels[selectedItem.slot] }}</div>
          <div class="item-description">{{ selectedItem.description }}</div>

          <div class="trade-actions">
            <div class="price-tag">价格: {{ selectedItem.price }} 金币</div>
            <button class="buy-button" :disabled="mvu.playerDynamicData.gold < selectedItem.price" @click="handleBuy">
              购买
            </button>
          </div>
        </div>
        <div v-else class="data-empty">选择一个商品查看详情</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMvuData } from '../hooks/useMvuData';
import { useTrade } from '../hooks/useTrade';
import { qualityLabels, slotLabels, tierLabels, typeLabels } from '../itemConstants';

defineEmits(['open-settings']);

const { mvu, handleMvuUpdate } = useMvuData();
const { refreshUserInput, shopItems, selectedItem, isGenerating, refreshShop, handleBuy } = useTrade(
  mvu,
  handleMvuUpdate,
);
</script>

<style lang="scss" scoped>
.trade-container {
  padding: 10px 40px;
  display: flex;
  flex-direction: column;

  .trade-grid {
    .master-grid-item {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: flex-end;
      padding: 8px 12px;

      .item-main {
        text-align: right;
      }

      .item-price {
        font-weight: bold;
        color: var(--quote_text_color);
        font-size: var(--font-size-small);
      }
    }
  }

  .trade-actions {
    margin-top: 20px;
    padding-top: 15px;
    border-top: 1px solid var(--border_color);
    display: flex;
    justify-content: space-between;
    align-items: center;

    .price-tag {
      font-size: var(--font-size-medium);
      font-weight: bold;
    }

    .buy-button {
      background: var(--quote_text_color);
      color: white;
      border: none;
      padding: 8px 20px;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.2s;
    }
  }
}

.inventory-mini {
  font-size: var(--font-size-small);
  color: var(--italics_text_color);
  line-height: 1.5;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .gold {
    color: var(--quote_text_color);
    font-weight: bold;
  }

  .trade-controls {
    display: flex;
    align-items: stretch;
    gap: 8px;

    .refresh-textarea {
      width: 200px;
      height: 28px;
      background: var(--input_background_color);
      color: var(--main_text_color);
      border: 1px solid var(--border_color);
      border-radius: 4px;
      padding: 4px 8px;
      font-size: var(--font-size-small);
      resize: none;
      font-family: inherit;

      &:focus {
        outline: none;
        border-color: var(--quote_text_color);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
  }
}
</style>
