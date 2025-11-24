<template>
  <div class="status-bar">
    <div class="corner left-top"></div>
    <div class="corner right-top"></div>
    <div class="corner left-bottom"></div>
    <div class="corner right-bottom"></div>

    <!-- 场景信息 - 顶部横栏 -->
    <div class="scene-section">
      <div class="scene-details">
        <div class="scene-left">
          <div class="location">
            🏰 {{ mvu.PlayerData.settings.currentRegion }} - {{ mvu.PlayerData.settings.currentLocation }}
          </div>
        </div>
        <div class="scene-right">
          <div class="meta-info">
            时间: <span>{{ mvu.PlayerData.settings.date }} {{ mvu.PlayerData.settings.time }}</span>
          </div>
          <div class="meta-info">
            天气: <span>{{ mvu.PlayerData.settings.weather }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="tabs">
      <!-- <button @click="testFunc">测试</button> -->
      <button @click="activeTab = 'world'" :class="{ active: activeTab === 'world' }">世界</button>
      <button @click="activeTab = 'party'" :class="{ active: activeTab === 'party' }">队伍</button>
      <button @click="activeTab = 'wardrobe'" :class="{ active: activeTab === 'wardrobe' }">衣柜</button>
      <button @click="activeTab = 'quests'" :class="{ active: activeTab === 'quests' }">任务日志</button>
      <button @click="activeTab = 'bag'" :class="{ active: activeTab === 'bag' }">小队背包</button>
      <button @click="activeTab = 'trade'" :class="{ active: activeTab === 'trade' }">交易</button>
      <button @click="activeTab = 'codex'" :class="{ active: activeTab === 'codex' }">图鉴</button>
    </div>
    <div class="tab-content">
      <!-- 世界 -->
      <template v-if="activeTab === 'world'">
        <div class="world-container">
          <div class="section-title">附近NPC</div>

            <div class="master-detail-body reverse">
              <div class="scene-detail-item">
                  <div v-for="(npc, index) in mvu.PlayerData.settings.nearbyNPC" :key="index" @click="selectNpc(npc)"
                    :class="{ selected: selectedNpc === npc }" class="npc-name">{{ npc.character?.name }}</div>
              </div>

              <div class="detail-panel">
                <div v-if="selectedNpc" class="scene-detail-item">
                  <div class="column">
                    <div class="column-content" v-for="(value, key) in selectedNpc.character" :key="key">
                      <span>{{ characterLabels[key] || key }}</span> {{ value }}
                    </div>
                    <div class="column-content" v-for="(value, key) in selectedNpc.meta" :key="key">
                      <span>{{ metaLabels[key] || key }}</span> {{ value }}
                    </div>
                  </div>
                  <div class="attributes">
                    <div class="attr" v-for="(value, key) in selectedNpc.attributes" :key="key">
                      <span>{{ attributeLabels[key] || key }}</span>
                      <span class="attr-value">{{ value }}</span>
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
      <!-- 队伍 -->
      <template v-if="activeTab === 'party'">
        <div class="character-card" v-for="(char, index) in party" :key="index">
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
      </template>

      <!-- 衣柜 -->
      <template v-if="activeTab === 'wardrobe'">
        <div class="wardrobe-container">
          <div class="outfit-list">
            <div class="outfit-header">
              <div class="section-title">可用套装</div>
              <button>新增</button>
            </div>

            <div v-for="outfit in mvu.Wardrobe.ownedOutfits" :key="outfit.id" class="outfit-item"
              :class="{ active: outfit.id === mvu.Wardrobe.currentOutfit, selected: outfit.id === selectedOutfitId }"
              @click="selectedOutfitId = outfit.id">
              {{ outfit.name }}
              <span v-if="outfit.id === mvu.Wardrobe.currentOutfit" class="current-tag">(当前)</span>
            </div>
          </div>
          <div class="outfit-details">
            <template v-if="selectedOutfit">
              <div class="outfit-header">
                <div class="section-title">{{ selectedOutfit.name }}</div>
                <button @click="equipOutfit(selectedOutfit.id)"
                  :disabled="selectedOutfit.id === mvu.Wardrobe.currentOutfit">
                  装备
                </button>
              </div>

              <div class="equipment-slots">
                <template v-for="(item, index) in selectedOutfit.slots" :key="index">
                  <div class="slot-item" v-if="!Array.isArray(item) && item">
                    <span class="slot-name">{{ slotNames[index] || item?.slot }}</span>
                    <span class="item-name">{{ item.name }} <span class="item-details">({{ item.quality }}, {{
                      item.material }})</span></span>
                  </div>
                  <div class="slot-item" v-else-if="!Array.isArray(item) && item?.slot !== 'extra'">
                    <span class="slot-name">{{ slotNames[index] || item?.slot }}</span>
                    <span class="item-name-empty">--</span>
                  </div>
                  <template v-if="item?.slot === 'extra' && Array.isArray(item) && item.length > 0">
                    <div v-for="(extraItem, index) in item" :key="`extra-${index}`" class="slot-item">
                      <span class="slot-name">{{ slotNames.extra || '额外' }}</span>
                      <span class="item-name">{{ extraItem.name }}
                        <span class="item-details">({{ extraItem.quality }}, {{ extraItem.material }})</span></span>
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

      <!-- 任务与探索 -->
      <template v-if="activeTab === 'quests'">
        <div class="quest-container">
          <div class="master-tabs">
            <button @click="activeQuestTab = 'currentQuests'" :class="{ active: activeQuestTab === 'currentQuests' }">
              进行中任务
            </button>
            <button @click="activeQuestTab = 'nextQuests'" :class="{ active: activeQuestTab === 'nextQuests' }">
              可接取任务
            </button>
            <button @click="activeQuestTab = 'pendingQuests'" :class="{ active: activeQuestTab === 'pendingQuests' }">
              挂起任务
            </button>
            <button @click="activeQuestTab = 'completedQuests'" :class="{ active: activeQuestTab === 'completedQuests' }">
              已完成任务
            </button>
          </div>

          <template v-if="activeQuestTab === 'currentQuests'">
            <div v-if="Object.keys(currentQuests).length === 0" class="data-empty">自由探索中</div>
              <div v-else>
                <div class="quest-item" v-for="(quest, index) in currentQuests" :key="index"
                  :class="{ 'side-quest': !quest.isMain }">
                  <div class="quest-title">{{ quest.isMain ? '主线' : '支线' }} - {{ quest.name }}</div>
                  <div class="quest-description">{{ quest.description }}</div>
                </div>
              </div>
          </template>

          <template v-if="activeQuestTab === 'nextQuests'">
            <div v-if="Object.keys(nextQuests).length === 0" class="data-empty">自由探索中</div>
              <div v-else>
                <div class="quest-item" v-for="(quest, index) in nextQuests" :key="index"
                  :class="{ 'side-quest': !quest.isMain }">
                  <div class="quest-title">{{ quest.isMain ? '主线' : '支线' }} - {{ quest.name }}</div>
                  <div class="quest-description">{{ quest.description }}</div>
                  <button @click="activeQuest(index)">激活</button>
                </div>
              </div>
          </template>

          <template v-if="activeQuestTab === 'pendingQuests'">
            <div v-if="Object.keys(pendingQuests).length === 0" class="data-empty">自由探索中</div>
              <div v-else>
                <div class="quest-item" v-for="(quest, index) in pendingQuests" :key="index"
                  :class="{ 'side-quest': !quest.isMain }">
                  <div class="quest-title">{{ quest.isMain ? '主线' : '支线' }} - {{ quest.name }}</div>
                  <div class="quest-description">{{ quest.description }}</div>
                </div>
              </div>
          </template>

          <template v-if="activeQuestTab === 'completedQuests'">
            <div v-if="Object.keys(completedQuests).length === 0" class="data-empty">自由探索中</div>
              <div v-else>
                <div class="quest-item" v-for="(quest, index) in completedQuests" :key="index"
                  :class="{ 'side-quest': !quest.isMain }">
                  <div class="quest-title">{{ quest.isMain ? '主线' : '支线' }} - {{ quest.name }}</div>
                  <div class="quest-description">{{ quest.description }}</div>
                </div>
              </div>
          </template>

        
        </div>
      </template>

      <!-- 背包 -->
      <template v-if="activeTab === 'bag'">
        <div class="bag-container">
          <div class="inventory-mini">
            <div class="gold">💰 {{ mvu.PlayerDynamicData.gold }}金币</div>
          </div>
          <div class="master-detail-body">
            <div class="master-grid bag-grid" v-if="Object.keys(mvu.PlayerDynamicData.inventory).length">
              <div class="master-grid-item" v-for="(item, index) in mvu.PlayerDynamicData.inventory" :key="index"
                @click="selectItem(item)" :class="{ selected: selectedItem?.name === item.name }">
                <i class="fa-solid fa-box" v-if="item.type == 'item'"></i>
                <i class="fa-solid fa-shirt" v-if="item.type == 'cloth'"></i>
                <i class="fa-solid fa-wand-sparkles" v-if="item.type == 'weapon'"></i>
                {{ item.name }}
              </div>
            </div>
            <div v-else class="data-empty" style="background: var(--blur_tint_color);">
              背包空空如也
            </div>
            <div class="detail-panel">
              <div v-if="selectedItem" class="details-content">
                <div class="item-name">{{ selectedItem.name }}</div>
                <div class="item-quality" :class="selectedItem.quality">{{ qualityLabels[selectedItem.quality] }}</div>
                <div class="item-type-tier">{{ typeLabels[selectedItem.type] }} / {{ tierLabels[selectedItem.tier] }}
                </div>
                <div class="item-slot" v-if="selectedItem.slot">部位: {{ slotLabels[selectedItem.slot] }}</div>
                <div class="item-description">{{ selectedItem.description }}</div>
              </div>
              <div v-else class="data-empty">
                选择一个物品查看详情
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- 交易 -->
      <template v-if="activeTab === 'trade'"> </template>
      <!-- 图鉴 -->
      <template v-if="activeTab === 'codex'">
        <div class="codex-container">
          <div class="master-tabs">
            <button @click="activeCodexTab = 'bestiary'" :class="{ active: activeCodexTab === 'bestiary' }">
              异怪图鉴
            </button>
            <button @click="activeCodexTab = 'anecdotes'" :class="{ active: activeCodexTab === 'anecdotes' }">
              旅途趣闻
            </button>
          </div>
          <div class="master-detail-body">
            <div class="master-grid codex-grid">
              <template v-if="activeCodexTab === 'bestiary'">
                <div class="master-grid-item" v-for="(entry, index) in bestiaryEntries" :key="index"
                  @click="selectEntry(entry)" :class="{ selected: selectedEntry?.name === entry.name }">
                  {{ entry.name }}
                </div>
              </template>
              <template v-if="activeCodexTab === 'anecdotes'">
                <div class="master-grid-item" v-for="(entry, index) in anecdoteEntries" :key="index"
                  @click="selectEntry(entry)" :class="{ selected: selectedEntry?.name === entry.name }">
                  {{ entry.name }}
                </div>
              </template>
            </div>
            <div class="detail-panel">
              <div v-if="selectedEntry" class="details-content">
                <div class="item-name">{{ selectedEntry.name }}</div>
                <div v-if="'habitat' in selectedEntry" class="detail-item">
                  <strong>栖息地:</strong> {{ selectedEntry.habitat }}
                </div>
                <div v-if="'weaknesses' in selectedEntry" class="detail-item">
                  <strong>弱点:</strong> {{ selectedEntry.weaknesses }}
                </div>
                <div v-if="'killCount' in selectedEntry" class="detail-item">
                  <strong>击杀数量:</strong> {{ selectedEntry.killCount }}
                </div>
                <div v-if="'location' in selectedEntry" class="detail-item">
                  <strong>发生地点:</strong> {{ selectedEntry.location }}
                </div>
                <div v-if="'charactersInvolved' in selectedEntry" class="detail-item">
                  <strong>相关人物:</strong> {{ selectedEntry.charactersInvolved }}
                </div>
                <div class="item-description"><strong>描述:</strong> {{ selectedEntry.description }}</div>
                <div class="item-description"><strong>已知信息:</strong> {{ selectedEntry.knownInfo }}</div>
              </div>
              <div v-else class="data-empty">
                选择一个条目查看详情
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { qualityLabels, slotLabels, tierLabels, typeLabels } from './itemConstants';
import { useCodex } from './useCodex';
import { useInventory } from './useInventory';
import { useMvuData } from './useMvuData';
import { useParty } from './useParty';
import { useQuests } from './useQuests';
import { useTest } from './useTest';
import { useWardrobe } from './useWardrobe';
import { useWorld } from './useWorld';

const activeTab = ref('party');

// 默认的 MVU 数据结构
const defaultMvuData = {
  PlayerData: {
    character: {
      name: '',
      level: 1,
      gender: '男',
      race: '',
      height: '',
      build: '',
      appearance: '',
      personality: ''
    },
    status: {
      health: {
        current: 12,
        max: 12,
      },
      mood: {
        current: 0,
        max: 100,
      },
      arousal: {
        current: 50,
        max: 100,
      },
    },
    attributes: {
      shooting: 0,
      melee: 0,
      construction: 0,
      mining: 0,
      cooking: 0,
      planting: 0,
      animals: 0,
      crafting: 0,
      artistic: 0,
      medical: 0,
      social: 0,
      intellectual: 0,
    },
    progress: {
      questPhase: '',
      partyExperience: {
        current: 0,
        max: 100,
      },
      partyAttrPoints: 0,
      currentQuest: {},
      nextQuest: {},
      pendingQuest: {},
      completedQuest: {},
    },
    settings: {
      date: '',
      time: '',
      weather: '',
      currentRegion: '',
      currentLocation: '',
      nearbyNPC: {},
      factionPrestige: {},
      bestiary: {},
      anecdotes: {}
    },
  },
  PlayerDynamicData: {
    inventory: {},
    equipment: {
      leftHand: 'none',
      rightHand: 'none',
      body: 'none',
    },
    clothingAttributes: {
      defense: 0,
      comfort: 0,
      warmth: 0,
      social: 0,
      weight: 0,
    },
    gold: 100,
  },
  FollowerNPCData: {},
  Wardrobe: {
    ownedOutfits: {},
    currentOutfit: 'none',
  },
};

const { mvu, rawMvuData, handleMvuUpdate, initialize } = useMvuData(defaultMvuData);

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
} = useParty(mvu, rawMvuData, handleMvuUpdate);

const { slotNames, selectedOutfitId, selectedOutfit, currentEquippedOutfit, equipOutfit } = useWardrobe(mvu);

const {
  currentQuests,
  nextQuests,
  pendingQuests,
  completedQuests,
  activeQuestTab,
  activeQuest
} = useQuests(mvu, handleMvuUpdate);
const { selectedNpc, selectNpc } = useWorld(mvu);
const { testFunc } = useTest(mvu, handleMvuUpdate);
const { selectedItem, selectItem } = useInventory();
const { selectedEntry, selectEntry, activeCodexTab, bestiaryEntries, anecdoteEntries } = useCodex(mvu);

onMounted(async () => {
  await initialize();
});
</script>
