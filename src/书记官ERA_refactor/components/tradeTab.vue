<template>
  <div class="trade-container">
    <div class="inventory-mini">
      <div class="gold">💰 {{ mvu.playerDynamicData.gold }}金币</div>
      <div>
        <button @click="showSettings = !showSettings" :class="{ active: showSettings }" style="margin-right: 6px">
          API 设置 <i class="fa-solid fa-gear"></i>
        </button>
        <button @click="refreshShop" :disabled="isGenerating">
          刷新货架 <i class="fa-solid fa-rotate" :class="{ 'fa-spin': isGenerating }"></i>
        </button>
      </div>
    </div>

    <div class="master-detail-body">
      <!-- API 设置面板 -->
      <div v-if="showSettings" class="settings-panel">
        <div class="section-title">自定义 LLM API</div>
        <div class="form-group">
          <label>API 地址</label>
          <input type="text" v-model="apiConfig.apiurl" placeholder="https://api.openai.com/v1" />
        </div>
        <div class="form-group">
          <label>API Key</label>
          <input type="password" v-model="apiConfig.key" placeholder="sk-..." />
        </div>
        <div class="form-group">
          <label>模型名称</label>
          <input type="text" v-model="apiConfig.model" placeholder="gpt-3.5-turbo" />
        </div>
        <div class="settings-tip">* 设置后将使用自定义 API 生成商品，留空则使用酒馆默认配置。</div>
        <button @click="handleSaveApi">保存设置</button>
      </div>

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
        <div v-else class="data-empty">
          <div class="shop-description" v-if="shopDescription">
            {{ shopDescription }}
          </div>
          <div v-else>选择一个商品查看详情</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMvuData } from '../hooks/useMvuData';
import { useTrade } from '../hooks/useTrade';
import { qualityLabels, slotLabels, tierLabels, typeLabels } from '../itemConstants';

const { mvu, handleMvuUpdate } = useMvuData();
const {
  shopItems,
  shopDescription,
  selectedItem,
  isGenerating,
  showSettings,
  apiConfig,
  refreshShop,
  handleBuy,
  handleSaveApi,
} = useTrade(mvu, handleMvuUpdate);
</script>

<style lang="scss" scoped>
.trade-container {
  padding: 10px 40px;
  display: flex;
  flex-direction: column;

  .settings-panel {
    padding: 15px;
    background: var(--user_mes_blur_tint_color);
    border-bottom: 1px solid var(--border_color);

    .form-group {
      margin-bottom: 10px;
      label {
        display: block;
        font-size: var(--font-size-extra-small);
        color: var(--italics_text_color);
        margin-bottom: 4px;
      }
      input {
        width: 100%;
        background: var(--bot_mes_blur_tint_color);
        border: 1px solid var(--border_color);
        color: var(--main_text_color);
        padding: 6px 10px;
        border-radius: 4px;
        font-size: var(--font-size-small);

        &:focus {
          border-color: var(--quote_text_color);
          outline: none;
        }
      }
    }

    .settings-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 12px;

      .save-btn {
        background: var(--quote_text_color);
        color: white;
        padding: 4px 12px;
        font-size: var(--font-size-small);
      }
    }

    .settings-tip {
      font-size: var(--font-size-extra-small);
      color: var(--italics_text_color);
    }
  }

  .trade-grid {
    .master-grid-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;

      .item-price {
        font-weight: bold;
        color: var(--quality-legendary-color);
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
      color: var(--quality-legendary-color);
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

  .shop-description {
    padding: 15px;
    font-style: italic;
    color: var(--italics_text_color);
    line-height: 1.5;
    background: var(--bot_mes_blur_tint_color);
    border-radius: 4px;
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
}
</style>
