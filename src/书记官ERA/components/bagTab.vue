<template>
  <div class="bag-container">
    <div class="inventory-mini">
      <div class="gold">💰 {{ mvu.PlayerDynamicData.gold }}金币</div>
    </div>
    <div class="master-detail-body">
      <div
        class="master-grid bag-grid"
        v-if="mvu.PlayerDynamicData.inventory && Object.keys(mvu.PlayerDynamicData.inventory).length"
      >
        <template v-for="type in groupOrder" :key="type">
          <template v-if="groupedInventory[type] && Object.keys(groupedInventory[type]).length">
            <!-- <div > -->
            <div class="section-title grid-col-span-full">{{ typeLabels[type] }}</div>

            <div
              class="master-grid-item"
              v-for="(item, key) in groupedInventory[type]"
              :key="key"
              :class="{ selected: selectedItem?.name === item.name }"
              @click="selectItem(item, key as unknown as string)"
            >
              <i class="fa-solid fa-box" v-if="item.type == 'item'"></i>
              <i class="fa-solid fa-shirt" v-if="item.type == 'cloth'"></i>
              <i class="fa-solid fa-wand-sparkles" v-if="item.type == 'weapon'"></i>
              {{ item.name }}
            </div>
            <!-- </div> -->
          </template>
        </template>
      </div>
      <div v-else class="data-empty" style="background: var(--blur_tint_color)">背包空空如也</div>
      <div class="detail-panel">
        <div v-if="selectedItem" class="details-content">
          <div v-if="!isEditing">
            <div class="item-name flex-between">
              {{ selectedItem.name }}
              <div>
                <i
                  class="fa-solid fa-pencil"
                  @click="startEditing"
                  style="cursor: pointer; margin-right: 8px"
                  title="编辑物品"
                ></i>
                <i
                  class="fa-solid fa-trash-can"
                  @click="deleteItem(selectedItem.id)"
                  style="cursor: pointer"
                  title="删除物品"
                >
                </i>
              </div>
            </div>
            <div class="item-quality" :class="selectedItem.quality">{{ qualityLabels[selectedItem.quality] }}</div>
            <div class="item-type-tier">{{ typeLabels[selectedItem.type] }} / {{ tierLabels[selectedItem.tier] }}</div>
            <div class="item-slot" v-if="selectedItem.slot">部位: {{ slotLabels[selectedItem.slot] }}</div>
            <div class="item-description">{{ selectedItem.description }}</div>
          </div>
          <div v-else-if="editableItem" class="edit-form">
            <div class="form-group">
              <label>名称</label>
              <input type="text" v-model="editableItem.name" />
            </div>
            <div class="form-group">
              <label>品质</label>
              <select v-model="editableItem.quality">
                <option v-for="(label, key) in qualityLabels" :key="key" :value="key">{{ label }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>类型</label>
              <select v-model="editableItem.type">
                <option v-for="(label, key) in typeLabels" :key="key" :value="key">{{ label }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>等级</label>
              <select v-model="editableItem.tier">
                <option v-for="(label, key) in tierLabels" :key="key" :value="key">{{ label }}</option>
              </select>
            </div>
            <div class="form-group" v-if="editableItem.slot">
              <label>部位</label>
              <select v-model="editableItem.slot">
                <option v-for="(label, key) in slotLabels" :key="key" :value="key">{{ label }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>描述</label>
              <textarea v-model="editableItem.description"></textarea>
            </div>
            <div class="edit-buttons">
              <button @click="saveChanges">保存</button>
              <button @click="cancelEditing">取消</button>
            </div>
          </div>
        </div>
        <div v-else class="data-empty">选择一个物品查看详情</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useInventory } from '../hooks/useInventory';
import { useMvuData } from '../hooks/useMvuData';
import { qualityLabels, slotLabels, tierLabels, typeLabels } from '../itemConstants';

const { mvu, handleMvuUpdate } = useMvuData();
const {
  selectedItem,
  selectItem,
  deleteItem,
  isEditing,
  editableItem,
  startEditing,
  cancelEditing,
  saveChanges,
  groupOrder,
  groupedInventory,
} = useInventory(mvu, handleMvuUpdate);
</script>
