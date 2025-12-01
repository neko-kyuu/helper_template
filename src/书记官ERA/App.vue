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
        <WorldTab @open-map="openMapModal" />
      </template>
      <!-- 队伍 -->
      <template v-if="activeTab === 'party'">
        <PartyTab />
      </template>
      <!-- 衣柜 -->
      <template v-if="activeTab === 'wardrobe'">
        <WardTab @open-update="openOutfitModal" />
      </template>

      <!-- 任务与探索 -->
      <template v-if="activeTab === 'quests'">
        <QuestsTab />
      </template>

      <!-- 背包 -->
      <template v-if="activeTab === 'bag'">
        <BagTab />
      </template>

      <!-- 交易 -->
      <template v-if="activeTab === 'trade'"> </template>
      <!-- 图鉴 -->
      <template v-if="activeTab === 'codex'">
        <CodexTab />
      </template>
    </div>

    <ModalDialog v-model="showModal" :title="modalTitle" @confirm="handleConfirm">
      <template #default>
        <component :is="modalContent" ref="modalComponentRef" @point-selected="handlePointSelected" />
      </template>
      <template #footer>
        <!-- <button @click="showModal = false">关闭</button> -->
        <button @click="handleConfirm">确认</button>
      </template>
    </ModalDialog>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref, shallowRef } from 'vue';
import BagTab from './components/bagTab.vue';
import CodexTab from './components/codexTab.vue';
import PartyTab from './components/partyTab.vue';
import QuestsTab from './components/questsTab.vue';
import WardTab from './components/wardTab.vue';
import WorldTab from './components/worldTab.vue';
import { useMvuData } from './hooks/useMvuData';
import { useTest } from './hooks/useTest';

import ModalDialog from './components/ModalDialog.vue';
import MapSelector from './components/MapSelector.vue';
import OutfitSelector from './components/outfitSelector.vue';

const activeTab = ref('party');
const showModal = ref(false);
const modalTitle = ref('');
const modalContent = shallowRef<any>(null);
const selectedPointName = ref('');
const modalComponentRef = ref<any>(null);

const openMapModal = () => {
  modalTitle.value = '世界地图';
  modalContent.value = MapSelector;
  selectedPointName.value = '';
  showModal.value = true;
};

const openOutfitModal = () => {
  modalTitle.value = '今日穿搭';
  modalContent.value = OutfitSelector;
  showModal.value = true;
};

const handlePointSelected = (point: string) => {
  selectedPointName.value = point;
};

const handleConfirm = () => {
  if (modalContent.value === MapSelector && selectedPointName.value) {
    const [region, location] = selectedPointName.value.split(', ');
    // todo 将目的地作为prompt告知llm，暂时不用实现
    console.log('已确认选择地点:', region, location);
  } else if (modalContent.value === OutfitSelector) {
    const outfitData = modalComponentRef.value?.getOutfitData();
    if (outfitData) {
      console.log('获取到的套装数据:', outfitData);
      // todo: 调用 handleMvuUpdate 来保存套装数据
    }
  } else {
    console.log('确认按钮被点击');
  }
  showModal.value = false;
};

const { mvu, rawMvuData, handleMvuUpdate, initialize } = useMvuData();

const { testFunc } = useTest(mvu, handleMvuUpdate);

onMounted(async () => {
  await initialize();
});
</script>
