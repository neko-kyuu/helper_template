<template>
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
      <div class="quest-item-container" v-else>
        <div class="quest-phase">当前进度: {{ mvu.progressData.questPhase }}</div>
        <div
          class="quest-item"
          v-for="(quest, questId) in currentQuests"
          :key="questId"
          :class="{ 'side-quest': !quest.isMain, 'main-quest': quest.isMain }"
        >
          <div class="quest-title">
            {{ quest.isMain ? '主线' : '支线' }} - {{ quest.name }}
            <div>
              <button @click="completeQuest(questId as unknown as string)" style="margin-right: 6px">完成</button>
              <button @click="deleteQuest(questId as unknown as string, 'currentQuest')">删除</button>
            </div>
          </div>
          <div class="quest-description">{{ quest.description }}</div>
        </div>
      </div>
    </template>

    <template v-if="activeQuestTab === 'nextQuests'">
      <div v-if="Object.keys(nextQuests).length === 0" class="data-empty">自由探索中</div>
      <div class="quest-item-container" v-else>
        <div
          class="quest-item"
          v-for="(quest, questId) in nextQuests"
          :key="questId"
          :class="{ 'side-quest': !quest.isMain, 'main-quest': quest.isMain }"
        >
          <div class="quest-title">
            {{ quest.isMain ? '主线' : '支线' }} - {{ quest.name }}
            <div>
              <button @click="activeQuest(questId as unknown as string)" style="margin-right: 6px">激活</button>
              <button @click="deleteQuest(questId as unknown as string, 'nextQuest')">删除</button>
            </div>
          </div>
          <div class="quest-description">{{ quest.description }}</div>
        </div>
      </div>
    </template>

    <template v-if="activeQuestTab === 'pendingQuests'">
      <div v-if="Object.keys(pendingQuests).length === 0" class="data-empty">自由探索中</div>
      <div class="quest-item-container" v-else>
        <div
          class="quest-item"
          v-for="(quest, index) in pendingQuests"
          :key="index"
          :class="{ 'side-quest': !quest.isMain, 'main-quest': quest.isMain }"
        >
          <div class="quest-title">
            {{ quest.isMain ? '主线' : '支线' }} - {{ quest.name }}
            <button @click="deleteQuest(index as unknown as string, 'pendingQuest')">删除</button>
          </div>
          <div class="quest-description">{{ quest.description }}</div>
        </div>
      </div>
    </template>

    <template v-if="activeQuestTab === 'completedQuests'">
      <div v-if="Object.keys(completedQuests).length === 0" class="data-empty">自由探索中</div>
      <div class="quest-item-container" v-else>
        <div
          class="quest-item"
          v-for="(quest, index) in completedQuests"
          :key="index"
          :class="{ 'side-quest': !quest.isMain, 'main-quest': quest.isMain }"
        >
          <div class="quest-title">
            {{ quest.isMain ? '主线' : '支线' }} - {{ quest.name }}
            <button @click="deleteQuest(index as unknown as string, 'completedQuest')">删除</button>
          </div>
          <div class="quest-description">{{ quest.description }}</div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useMvuData } from '../hooks/useMvuData';
import { useQuests } from '../hooks/useQuests';

const { mvu, handleMvuUpdate } = useMvuData();

const {
  currentQuests,
  nextQuests,
  pendingQuests,
  completedQuests,
  activeQuestTab,
  activeQuest,
  completeQuest,
  deleteQuest,
} = useQuests(mvu, handleMvuUpdate);
</script>
<style lang="scss" scoped>
.quest-container {
  padding: 10px 20px;
  display: flex;
  gap: 10px;
  height: 100%;

  .quest-item-container {
    width: 100%;
    max-height: 360px;
    overflow-y: auto;
  }
  .quest-phase {
    font-size: var(--font-size-small);
    color: var(--main_text_color);
    margin-bottom: 6px;
  }

  .quest-item {
    margin-bottom: 6px;
    padding: 8px;
    background: var(--blur_tint_color);
    border-left: 3px solid var(--quote_text_color);
    border-radius: 2px;

    &.side-quest {
      border-left-color: rgb(86, 57, 137);
    }
    &.main-quest {
      border-left-color: rgb(137, 136, 57);
    }

    .quest-title {
      font-size: var(--font-size-small);
      font-weight: bold;
      color: var(--main_text_color);
      margin-bottom: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .quest-description {
      font-size: var(--font-size-extra-small);
      color: var(--quote_text_color);
      line-height: 1.5;
    }
  }
}
</style>
