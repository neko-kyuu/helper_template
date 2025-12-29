<template>
  <div class="world-container">
    <div class="section-title">
      世界NPC
      <button @click="openWorldMap">世界地图 <i class="fa-solid fa-map-location-dot"></i></button>
    </div>

    <div class="master-detail-body reverse">
      <div class="scene-detail-item" style="border: 1px solid var(--border_color)">
        <div
          v-for="(npc, index) in mvu.worldInfo.nearbyNPC"
          :key="index"
          @click="selectNpc(npc, index, false)"
          :class="{ selected: selectedNpc?.id === index }"
          class="npc-name"
        >
          {{ npc.character?.name }}
        </div>
        <div
          v-for="(npc, index) in mvu.archivedData.worldNPC"
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
            @click="archiveNPC(selectedNpc.id)"
            style="cursor: pointer; position: absolute; top: 15px; right: 15px"
            title="归档NPC"
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
                <span v-if="key === 'favorabilityTowardsNPCs'">
                  {{ getFavorabilityTowardsNPCs(value as unknown as any) }}
                </span>
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
    <div v-for="(faction, index) in mvu.worldInfo.factionPrestige" :key="index" class="faction-card">
      <div class="faction-header">
        <div class="faction-name">{{ faction.name }}</div>
        <div class="faction-prestige" :style="{ color: getPrestigeColor(faction.prestige) }">
          {{ faction.prestige }} ({{ getPrestigeDescription(faction.prestige) }})
          <i class="fa-solid fa-trash-can" @click="archiveFaction(index)" style="cursor: pointer" title="归档阵营"> </i>
        </div>
      </div>
      <div class="faction-content">
        <span>{{ faction.description }}</span>
      </div>
    </div>
    <div v-for="(faction, index) in mvu.archivedData.factionPrestige" :key="index" class="faction-card archived">
      <div class="faction-header">
        <div class="faction-name">{{ faction.name }}</div>
        <div class="faction-prestige" :style="{ color: getPrestigeColor(faction.prestige) }">
          {{ faction.prestige }} ({{ getPrestigeDescription(faction.prestige) }})
          <i
            class="fa-solid fa-arrow-up-from-bracket"
            @click="openFaction(index)"
            style="cursor: pointer"
            title="恢复阵营"
          >
          </i>
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
  archiveNPC,
  openNPC,
  archiveFaction,
  openFaction,
  getNPCNameByKey,
  getFavorabilityTowardsNPCs,
} = useWorld(mvu, handleMvuUpdate, emit);
const { characterLabels, metaLabels, attributeLabels } = useParty(mvu, rawMvuData, handleMvuUpdate);
</script>
<style lang="scss" scoped>
.world-container {
  padding: 10px 40px;

  .scene-detail-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 4px;
    background: var(--blur_tint_color);
    border-radius: 4px;

    .column {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;

      .column-content {
        display: grid;
        grid-template-columns: 60px 1fr;
        color: var(--main_text_color);
        font-size: var(--font-size-small);
      }
    }

    .npc-name {
      background: var(--blur_tint_color);
      border-radius: 3px;
      border: 1px solid var(--border_color);
      color: var(--main_text_color);
      font-size: var(--font-size-small);
      cursor: pointer;
      padding: 2px 5px;
      border-radius: 3px;
      transition: background-color 0.3s;

      &.archived {
        background-color: var(--underline_text_color);
      }

      &:hover {
        background: var(--user_mes_blur_tint_color);
      }

      &.selected {
        background-color: var(--quote_text_color);
        color: white;
      }
    }
  }

  .faction-card {
    background: var(--blur_tint_color);
    border: 1px solid var(--border_color);
    border-radius: 4px;
    margin-bottom: 4px;
    &.archived {
      background-color: var(--underline_text_color);
    }

    .faction-header {
      padding: 6px 5px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border_color);

      .faction-name {
        font-size: var(--font-size-small);
        font-weight: bold;
        color: var(--main_text_color);
      }

      .faction-prestige {
        padding: 0 4px;
        font-size: var(--font-size-small);
        border: 1px solid var(--border_color);
        border-radius: 4px;
      }
    }

    .faction-content {
      padding: 6px 5px;

      span {
        font-size: var(--font-size-small);
        color: var(--italics_text_color);
      }
    }

    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>
