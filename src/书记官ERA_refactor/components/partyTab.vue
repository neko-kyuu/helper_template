<template>
  <div class="party-container">
    <div class="master-detail-body">
      <div class="character-card-pane">
        <div
          class="character-card"
          v-for="(char, charKey) in party"
          :key="charKey"
          :class="{ selected: selectedCharKey === charKey }"
          @click="selectChar(char, charKey)"
        >
          <div class="char-header">
            <span class="char-name">{{ char.character.name }} (Lv. {{ char.character.level }})</span>
            <div class="right-btns">
              <div v-if="isAssigningAttributes[charKey]">
                <span>属性点: {{ (mvu.progressData.partyAttrPoints[charKey] || 0) - getSpentPoints(char) }}</span>
                <button @click="commitAttributes(char, charKey)">保存</button>
              </div>
              <button
                @click="levelUp(char, charKey)"
                :disabled="!char.status.experience || char.status.experience.current < char.status.experience.max"
              >
                升级
              </button>
            </div>
          </div>
          <div class="column">
            <!-- 状态 -->
            <div class="status">
              <!-- <div class="stat grid-col-1">{{ charKey }} | {{ char.character.gender }} {{ char.character.race }}</div> -->
              <div class="stat" v-for="(stat, key) in char.status" :key="key">
                {{ statusLabels[key] }}
                <div class="bar">
                  <div class="fill" :style="{ width: `${Math.min(100, (stat.current / stat.max) * 100)}%` }"></div>
                </div>
                {{ stat.current }} / {{ stat.max }}
                <div></div>
                <div
                  class="grid-col-1"
                  v-if="key == 'health'"
                  :style="{ color: getHealthColor(stat.current, stat.max) }"
                >
                  当前状态: {{ getHealthDescription(stat.current, stat.max) }}
                </div>
              </div>
            </div>
            <!-- 属性 -->
            <div class="attributes">
              <div class="attr" v-for="(value, attrKey) in char.attributes" :key="attrKey">
                <span>{{ attributeLabels[attrKey] || attrKey }}</span>
                <div class="attr-value-controls" v-if="isAssigningAttributes[charKey]">
                  <button
                    class="small"
                    @click="decrementAttribute(char, charKey, attrKey as unknown as string)"
                    :disabled="
                      partyUpgradeState[char.character.name]?.tempAttributes[attrKey] <=
                      partyUpgradeState[char.character.name]?.initialAttributes[attrKey]
                    "
                  >
                    -
                  </button>
                  <span class="attr-value">{{ partyUpgradeState[char.character.name]?.tempAttributes[attrKey] }}</span>
                  <button
                    class="small"
                    @click="incrementAttribute(char, charKey, attrKey as unknown as string)"
                    :disabled="(mvu.progressData.partyAttrPoints[charKey] || 0) <= getSpentPoints(char)"
                  >
                    +
                  </button>
                </div>
                <span class="attr-value" v-else>{{ value }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="detail-panel">
        <div v-if="selectedChar && selectedCharKey" class="scene-detail-item">
          <div class="column">
            <div class="section-title">基础信息 | {{ selectedCharKey }}</div>
            <div class="column-content" v-for="(value, key) in selectedChar.character" :key="key">
              <span>{{ characterLabels[key] || key }}</span> {{ value }}
            </div>

            <div class="section-title">元信息</div>
            <template v-if="'meta' in selectedChar">
              <div class="column-content" v-for="(value, key) in selectedChar.meta" :key="key">
                <span>{{ metaLabels[key] || key }}</span>
                <span v-if="key === 'favorabilityTowardsNPCs'">
                  {{ getFavorabilityTowardsNPCs(value as unknown as any) }}
                </span>
                <span v-else> {{ value }} </span>
              </div>
            </template>

            <div class="section-title">穿戴信息</div>
            <div class="column-content">
              <span>套装ID</span>
              <select
                :value="mvu.archivedData.outfitIds[selectedCharKey]"
                @change="updateOutfit(($event.target as HTMLSelectElement).value)"
              >
                <option value="">无</option>
                <option v-for="(outfit, outfitId) in characterOutfits" :key="outfitId" :value="outfitId">
                  {{ outfit.name }}
                </option>
              </select>
            </div>
            <div class="column-content" v-for="(value, key) in selectedChar.equipment" :key="key">
              <span>{{ equipmentLabels[key] || key }}</span>
              <span v-if="value"> {{ value }} </span>
              <span v-else> -- </span>
            </div>
          </div>
        </div>
        <div v-else class="data-empty">选择一个角色查看详情</div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useMvuData } from '../hooks/useMvuData';
import { useParty } from '../hooks/useParty';

const { mvu, rawMvuData, handleMvuUpdate, initialize } = useMvuData();

const {
  party,
  partyUpgradeState,
  characterLabels,
  metaLabels,
  attributeLabels,
  statusLabels,
  equipmentLabels,
  levelUp,
  commitAttributes,
  incrementAttribute,
  decrementAttribute,
  isAssigningAttributes,
  getSpentPoints,
  selectChar,
  selectedChar,
  selectedCharKey,
  characterOutfits,
  updateOutfit,
  getNPCNameByKey,
  getFavorabilityTowardsNPCs,
  getHealthDescription,
  getHealthColor,
} = useParty(mvu, rawMvuData, handleMvuUpdate);
</script>
<style lang="scss" scoped>
.party-container {
  .character-card {
    background: var(--blur_tint_color);
    border: 1px solid var(--border_color);
    border-radius: 4px;
    margin-bottom: 10px;
    cursor: pointer;

    .char-header {
      padding: 10px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border_color);

      .char-name {
        font-size: var(--font-size-medium);
        font-weight: bold;
        color: var(--main_text_color);
      }

      .right-btns {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 4px;

        span {
          font-size: var(--font-size-small);
          color: var(--italics_text_color);
        }

        span + button {
          margin-left: 4px;
        }
      }
    }

    .column {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      padding: 10px 40px;
    }

    &.selected {
      border-color: var(--quote_text_color);
      box-shadow: 0 0 5px var(--quote_text_color);
    }

    &:last-child {
      margin-bottom: 0;
    }
  }

  .scene-detail-item {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .column {
      display: grid;
      grid-template-columns: 1fr;
      gap: 10px;

      .column-content {
        display: grid;
        grid-template-columns: 60px 1fr;
        color: var(--main_text_color);
        font-size: var(--font-size-small);
      }
    }
  }
}
</style>
