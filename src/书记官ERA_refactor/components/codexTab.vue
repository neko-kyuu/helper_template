<template>
  <div class="codex-container">
    <div class="master-tabs">
      <button @click="activeCodexTab = 'bestiary'" :class="{ active: activeCodexTab === 'bestiary' }">生物图鉴</button>
      <button @click="activeCodexTab = 'anecdotes'" :class="{ active: activeCodexTab === 'anecdotes' }">
        旅途轶事
      </button>
    </div>
    <div class="master-detail-body">
      <div class="master-grid codex-grid">
        <template v-if="activeCodexTab === 'bestiary'">
          <div
            class="master-grid-item"
            v-for="(entry, index) in bestiaryEntries"
            :key="index"
            @click="selectEntry(entry, index as string, 'bestiaryEntries')"
            :class="{ selected: selectedEntry?.name === entry.name }"
          >
            {{ entry.name }}
          </div>
        </template>
        <template v-if="activeCodexTab === 'anecdotes'">
          <template v-if="Object.keys(anecdoteEntries).length">
            <div class="section-title grid-col-span-full">轶事</div>
            <div
              class="master-grid-item"
              v-for="(entry, index) in anecdoteEntries"
              :key="index"
              @click="selectEntry(entry, index as string, 'anecdoteEntries')"
              :class="{ selected: selectedEntry?.name === entry.name }"
            >
              {{ entry.name }}
            </div>
          </template>
          <template v-if="Object.keys(archivedEntries).length">
            <div class="section-title grid-col-span-full">已归档</div>
            <div
              class="master-grid-item"
              v-for="(entry, index) in archivedEntries"
              :key="index"
              @click="selectEntry(entry, index as string, 'archivedEntries')"
              :class="{ selected: selectedEntry?.name === entry.name }"
            >
              {{ entry.name }}
            </div>
          </template>
        </template>
      </div>
      <div class="detail-panel">
        <div v-if="selectedEntry" class="details-content">
          <div v-if="!isEditing">
            <div class="item-name flex-between">
              {{ selectedEntry.name }}
              <div style="flex-shrink: 0">
                <i
                  class="fa-solid fa-pencil"
                  @click="startEditing"
                  style="cursor: pointer; margin-right: 8px"
                  title="编辑条目"
                ></i>
                <i
                  class="fa-solid fa-trash-can"
                  @click="deleteEntry(selectedEntry.id)"
                  style="cursor: pointer; margin-right: 8px"
                  title="删除条目"
                >
                </i>
                <i
                  v-if="selectedTab != 'archivedEntries'"
                  class="fa-solid fa-box-archive"
                  @click="archiveEntry(selectedEntry.id)"
                  style="cursor: pointer"
                  title="归档条目"
                ></i>
                <i
                  v-if="selectedTab == 'archivedEntries'"
                  class="fa-solid fa-arrow-up-from-bracket"
                  @click="openEntry(selectedEntry.id)"
                  style="cursor: pointer"
                  title="公开条目"
                ></i>
              </div>
            </div>
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
          <div v-else-if="editableEntry" class="edit-form">
            <div class="form-group">
              <label>名称</label>
              <input type="text" v-model="editableEntry.name" />
            </div>
            <template v-if="'habitat' in editableEntry">
              <div class="form-group">
                <label>栖息地</label>
                <input type="text" v-model="editableEntry.habitat" />
              </div>
              <div class="form-group">
                <label>弱点</label>
                <textarea v-model="editableEntry.weaknesses"></textarea>
              </div>
              <div class="form-group">
                <label>击杀数量</label>
                <input type="number" v-model.number="editableEntry.killCount" />
              </div>
            </template>
            <template v-if="'location' in editableEntry">
              <div class="form-group">
                <label>发生地点</label>
                <input type="text" v-model="editableEntry.location" />
              </div>
              <div class="form-group">
                <label>相关人物</label>
                <input type="text" v-model="editableEntry.charactersInvolved" />
              </div>
            </template>
            <div class="form-group">
              <label>描述</label>
              <textarea v-model="editableEntry.description"></textarea>
            </div>
            <div class="form-group">
              <label>已知信息</label>
              <textarea v-model="editableEntry.knownInfo"></textarea>
            </div>
            <div class="edit-buttons">
              <button @click="saveChanges">保存</button>
              <button @click="cancelEditing">取消</button>
            </div>
          </div>
        </div>
        <div v-else class="data-empty">选择一个条目查看详情</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCodex } from '../hooks/useCodex';
import { useMvuData } from '../hooks/useMvuData';

const { mvu, handleMvuUpdate } = useMvuData();
const {
  selectedEntry,
  selectEntry,
  selectedTab,
  activeCodexTab,
  bestiaryEntries,
  anecdoteEntries,
  deleteEntry,
  isEditing,
  editableEntry,
  startEditing,
  cancelEditing,
  saveChanges,
  archiveEntry,
  openEntry,
  archivedEntries,
} = useCodex(mvu, handleMvuUpdate);
</script>
