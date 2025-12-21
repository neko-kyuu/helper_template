<template>
  <div class="world-container">
    <div class="section-title">
      世界NPC
      <button @click="openWorldMap">世界地图 <i class="fa-solid fa-map-location-dot"></i></button>
    </div>

    <div class="master-detail-body reverse">
      <div class="scene-detail-item" style="border: 1px solid var(--border_color)">
        <div
          v-for="(npc, index) in mvu.WorldInfo.nearbyNPC"
          :key="index"
          @click="selectNpc(npc, index, false)"
          :class="{ selected: selectedNpc?.id === index }"
          class="npc-name"
        >
          {{ npc.character?.name }}
        </div>
        <div
          v-for="(npc, index) in mvu.ArchivedData.worldNPC"
          :key="index"
          @click="selectNpc(npc, index, true)"
          :class="{ selected: selectedNpc?.id === index }"
          class="npc-name archived"
        >
          {{ npc.character?.name }}
        </div>
      </div>

      <div class="detail-panel">
        <div v-if="selectedNpc" class="scene-detail-item">
          <i
            v-if="!archivedFlag"
            class="fa-solid fa-trash-can"
            @click="deleteNPC(selectedNpc.id)"
            style="cursor: pointer; position: absolute; top: 15px; right: 15px"
            title="删除NPC"
          >
          </i>
          <i
            v-if="archivedFlag"
            class="fa-solid fa-arrow-up-from-bracket"
            @click="openNPC(selectedNpc.id)"
            style="cursor: pointer; position: absolute; top: 15px; right: 15px"
            title="恢复NPC"
          >
          </i>
          <div class="column">
            <div class="section-title grid-col-span-full">基础信息 | {{ selectedNpc.id }}</div>
            <div class="column-content" v-for="(value, key) in selectedNpc.character" :key="key">
              <span>{{ characterLabels[key as keyof typeof selectedNpc.character] || key }}</span> {{ value }}
            </div>

            <div class="section-title grid-col-span-full">元信息</div>
            <div class="column-content grid-col-span-full" v-for="(value, key) in selectedNpc.meta" :key="key">
              <span>{{ metaLabels[key as keyof typeof selectedNpc.meta] || key }}</span>
              <span v-if="key === 'favorabilityTowardsNPCs'">
                <div v-for="(fav, npcName) in value" :key="npcName">
                  {{ getNPCNameByKey(npcName as unknown as string) }}: {{ fav }}
                </div>
              </span>
              <span v-else> {{ value }} </span>
            </div>
          </div>

          <div class="section-title grid-col-span-full">属性</div>
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
    <div v-for="(faction, index) in mvu.WorldInfo.factionPrestige" :key="index" class="faction-card">
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
const {
  archivedFlag,
  selectedNpc,
  selectNpc,
  openWorldMap,
  getPrestigeDescription,
  getPrestigeColor,
  deleteNPC,
  openNPC,
  getNPCNameByKey,
} = useWorld(mvu, handleMvuUpdate, emit);
const { characterLabels, metaLabels, attributeLabels } = useParty(mvu, rawMvuData, handleMvuUpdate);
</script>
