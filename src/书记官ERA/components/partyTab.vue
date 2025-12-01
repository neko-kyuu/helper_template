<template>
  <div class="party-container">
    <div class="master-detail-body">
      <div class="character-card-pane">
        <div class="character-card" v-for="(char, index) in party" :key="index"
          :class="{ selected: selectedCharIndex === index }"  @click="selectChar(char,index)">
          <div class="char-header">
            <span class="char-name">{{ char.character.name }} (Lv. {{ char.character.level }})</span>
            <div class="right-btns">
              <div v-if="isAssigningAttributes">
                <span>团队属性点: {{ mvu.PlayerData.progress.partyAttrPoints - totalSpentPoints }}</span>
                <button @click="commitAttributes(char, index)">保存</button>
              </div>
              <button @click="levelUp(char, index)" :disabled="mvu.PlayerData.progress.partyExperience.current < mvu.PlayerData.progress.partyExperience.max
                ">
                升级
              </button>
            </div>
          </div>
          <div class="column">
            <!-- 状态 -->
            <div class="status">
              <div class="stat">{{ char.character.gender }} {{ char.character.race }}</div>
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
                  <div class="fill" :style="{
                    width: `${Math.min(100, (mvu.PlayerData.progress.partyExperience.current / mvu.PlayerData.progress.partyExperience.max) * 100)}%`,
                  }"></div>
                </div>
                {{ mvu.PlayerData.progress.partyExperience.current }} /
                {{ mvu.PlayerData.progress.partyExperience.max }}
              </div>
            </div>
            <!-- 属性 -->
            <div class="attributes">
              <div class="attr" v-for="(value, key) in char.attributes" :key="key">
                <span>{{ attributeLabels[key] || key }}</span>
                <div class="attr-value-controls" v-if="isAssigningAttributes">
                  <button class="small" @click="decrementAttribute(char, index, key as unknown as string)" :disabled="partyUpgradeState[char.character.name]?.tempAttributes[key] <=
                    partyUpgradeState[char.character.name]?.initialAttributes[key]
                    ">
                    -
                  </button>
                  <span class="attr-value">{{ partyUpgradeState[char.character.name]?.tempAttributes[key] }}</span>
                  <button class="small" @click="incrementAttribute(char, index, key as unknown as string)"
                    :disabled="mvu.PlayerData.progress.partyAttrPoints <= totalSpentPoints">
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
            <div class="column-content" v-for="(value, key) in selectedChar.character" :key="key">
              <span>{{ characterLabels[key] || key }}</span> {{ value }}
            </div>
            <div class="column-content" v-for="(value, key) in selectedChar.meta" :key="key">
              <span>{{ metaLabels[key] || key }}</span> {{ value }}
            </div>
          </div>
        </div>
        <div v-else class="data-empty">
          选择一个角色查看详情
        </div>
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
  levelUp,
  commitAttributes,
  incrementAttribute,
  decrementAttribute,
  isAssigningAttributes,
  totalSpentPoints,
  selectChar,
  selectedChar,
  selectedCharIndex
} = useParty(mvu, rawMvuData, handleMvuUpdate);
</script>