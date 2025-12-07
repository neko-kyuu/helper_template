<template>
  <div class="world-container">
    <div class="section-title">
      附近NPC
      <button @click="openWorldMap">世界地图 <i class="fa-solid fa-map-location-dot"></i></button>
    </div>

    <div class="master-detail-body reverse">
      <div class="scene-detail-item">
        <div
          v-for="(npc, index) in mvu.PlayerData.settings.nearbyNPC"
          :key="index"
          @click="selectNpc(npc, index)"
          :class="{ selected: selectedNpc?.id === index }"
          class="npc-name"
        >
          {{ npc.character?.name }}
        </div>
      </div>

      <div class="detail-panel">
        <div v-if="selectedNpc" class="scene-detail-item">
          <i
            class="fa-solid fa-trash-can"
            @click="deleteNPC(selectedNpc.id)"
            style="cursor: pointer; position: absolute; top: 15px; right: 15px"
            title="删除物品"
          >
          </i>
          <div class="column">
            <div class="column-content" v-for="(value, key) in selectedNpc.character" :key="key">
              <span>{{ characterLabels[key as keyof typeof selectedNpc.character] || key }}</span> {{ value }}
            </div>
            <div class="column-content" style="grid-column: 1 / -1" v-for="(value, key) in selectedNpc.meta" :key="key">
              <span>{{ metaLabels[key as keyof typeof selectedNpc.meta] || key }}</span>
              <span v-if="key === 'favorabilityTowardsNPCs'">
                <div v-for="(fav, npcName) in value" :key="npcName">{{ npcName }}: {{ fav }}</div>
              </span>
              <span v-else> {{ value }} </span>
            </div>
          </div>
          <div class="attributes">
            <div class="attr" v-for="(value, key) in selectedNpc.attributes" :key="key">
              <span>{{ attributeLabels[key as keyof typeof selectedNpc.attributes] || key }}</span>
              <span class="attr-value">{{ value }}</span>
            </div>
          </div>
        </div>
        <div v-else class="data-empty">选择一个角色查看详情</div>
      </div>
    </div>

    <div class="section-title" style="margin-top: 20px">阵营声望</div>
    <div v-for="(faction, index) in mvu.PlayerData.settings.factionPrestige" :key="index" class="faction-card">
      <div class="faction-header">
        <div class="faction-name">{{ faction.name }}</div>
        <div class="faction-prestige" :style="{ color: getPrestigeColor(faction.prestige) }">
          {{ faction.prestige }} ({{ getPrestigeDescription(faction.prestige) }})
        </div>
      </div>
      <div class="faction-content">
        <span>{{ faction.description }}</span>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useMvuData } from '../hooks/useMvuData';
import { useParty } from '../hooks/useParty';
import { useWorld } from '../hooks/useWorld';

const emit = defineEmits(['open-map']);

const { mvu, rawMvuData, handleMvuUpdate } = useMvuData();
const { selectedNpc, selectNpc, openWorldMap, getPrestigeDescription, getPrestigeColor, deleteNPC } = useWorld(
  mvu,
  handleMvuUpdate,
  emit,
);
const { characterLabels, metaLabels, attributeLabels } = useParty(mvu, rawMvuData, handleMvuUpdate);
</script>
