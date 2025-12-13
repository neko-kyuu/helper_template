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
              <div v-if="isAssigningAttributes">
                <span>团队属性点: {{ mvu.PlayerData.progress.partyAttrPoints - totalSpentPoints }}</span>
                <button @click="commitAttributes(char, charKey)">保存</button>
              </div>
              <button
                @click="levelUp(char, charKey)"
                :disabled="
                  mvu.PlayerData.progress.partyExperience.current < mvu.PlayerData.progress.partyExperience.max
                "
              >
                升级
              </button>
            </div>
          </div>
          <div class="column">
            <!-- 状态 -->
            <div class="status">
              <div class="stat grid-col-1">{{ charKey }} | {{ char.character.gender }} {{ char.character.race }}</div>
              <div class="stat" v-for="(stat, key) in char.status" :key="key">
                {{ statusLabels[key] }}
                <div class="bar">
                  <div class="fill" :style="{ width: `${Math.min(100, (stat.current / stat.max) * 100)}%` }"></div>
                </div>
                {{ stat.current }} / {{ stat.max }}
              </div>
              <div class="stat">
                小队经验
                <div class="bar">
                  <div
                    class="fill"
                    :style="{
                      width: `${Math.min(100, (mvu.PlayerData.progress.partyExperience.current / mvu.PlayerData.progress.partyExperience.max) * 100)}%`,
                    }"
                  ></div>
                </div>
                {{ mvu.PlayerData.progress.partyExperience.current }} /
                {{ mvu.PlayerData.progress.partyExperience.max }}
              </div>
            </div>
            <!-- 属性 -->
            <div class="attributes">
              <div class="attr" v-for="(value, attrKey) in char.attributes" :key="attrKey">
                <span>{{ attributeLabels[attrKey] || attrKey }}</span>
                <div class="attr-value-controls" v-if="isAssigningAttributes">
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
                    :disabled="mvu.PlayerData.progress.partyAttrPoints <= totalSpentPoints"
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
        <div v-if="selectedChar" class="scene-detail-item">
          <div class="column">
            <div class="section-title">基础信息</div>
            <div class="column-content" v-for="(value, key) in selectedChar.character" :key="key">
              <span>{{ characterLabels[key] || key }}</span> {{ value }}
            </div>

            <div class="section-title">元信息</div>
            <template v-if="'meta' in selectedChar">
              <div class="column-content" v-for="(value, key) in selectedChar.meta" :key="key">
                <span>{{ metaLabels[key] || key }}</span>
                <span v-if="key === 'favorabilityTowardsNPCs'">
                  <div v-for="(fav, npcName) in value" :key="npcName">{{ npcName }}: {{ fav }}</div>
                </span>
                <span v-else> {{ value }} </span>
              </div>
            </template>

            <div class="section-title">穿戴信息</div>
            <div class="column-content" v-for="(value, key) in selectedChar.equipment" :key="key">
              <span>{{ equipmentLabels[key] || key }}</span>
              <template v-if="key === 'outfit'">
                <select :value="value" @change="updateOutfit(($event.target as HTMLSelectElement).value)">
                  <option value="">无</option>
                  <option v-for="(outfit, outfitId) in characterOutfits" :key="outfitId" :value="outfitId">
                    {{ outfit.name }}
                  </option>
                </select>
              </template>
              <template v-else>
                <span v-if="value"> {{ value }} </span>
                <span v-else> -- </span>
              </template>
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
  totalSpentPoints,
  selectChar,
  selectedChar,
  selectedCharKey,
  characterOutfits,
  updateOutfit,
} = useParty(mvu, rawMvuData, handleMvuUpdate);
</script>
