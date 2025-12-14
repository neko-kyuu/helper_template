<template>
  <div v-if="modelValue" class="modal-overlay" @click.self="$emit('update:modelValue', false)">
    <div class="modal-container" ref="modalContainerRef">
      <div class="modal-header">
        <slot name="header">
          <h3>{{ title }}</h3>
        </slot>
        <div class="header-buttons">
          <button class="fullscreen-button" @click="toggleFullscreen">
            <i :class="isFullscreen ? 'fa-solid fa-compress' : 'fa-solid fa-expand'"></i>
          </button>
          <button class="close-button" @click="$emit('update:modelValue', false)">
            <i class="fa-regular fa-circle-xmark"></i>
          </button>
        </div>
      </div>
      <div class="modal-body">
        <slot>
          <p>这是默认的弹窗内容。</p>
        </slot>
      </div>
      <div class="modal-footer">
        <slot name="footer">
          <button @click="$emit('confirm')">确认</button>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFullscreen } from '@vueuse/core';
import { ref } from 'vue';

const modalContainerRef = ref<HTMLElement | null>(null);
const { isFullscreen, toggle: toggleFullscreen } = useFullscreen(modalContainerRef);

defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '弹窗',
  },
});

defineEmits(['update:modelValue', 'confirm']);
</script>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(30, 30, 30, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background-color: var(--blur_tint_color);
  color: var(--main_text_color);
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(30, 30, 30, 0.5);
  max-width: 95%;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border_color);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 12px;
  border-bottom: 1px solid var(--border_color);
}

.header-buttons {
  display: flex;
  align-items: center;
  gap: 6px;
}

.modal-header h3 {
  margin: 0;
  font-size: var(--font-size-large);
}

.close-button,
.fullscreen-button {
  background: transparent;
  border: none;
  line-height: 1;
  color: var(--italics_text_color);
  cursor: pointer;
  padding: 0;
}

.close-button {
  font-size: var(--font-size-large);
}

.fullscreen-button {
  font-size: var(--font-size-large);
}

.close-button:hover,
.fullscreen-button:hover {
  color: var(--main_text_color);
}

.modal-body {
  padding: 16px 12px;
  flex-grow: 1;
  overflow-y: auto;
}

.modal-footer {
  padding: 6px 12px;
  border-top: 1px solid var(--border_color);
  display: flex;
  justify-content: flex-end;
  gap: 6px;
}
</style>
