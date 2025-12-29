<template>
  <div class="settings-form">
    <div class="form-group">
      <label>API 地址</label>
      <input type="text" v-model="apiConfig.apiurl" placeholder="https://api.openai.com/v1" />
    </div>
    <div class="form-group">
      <label>API Key</label>
      <input type="password" v-model="apiConfig.key" placeholder="sk-..." />
    </div>
    <div class="form-group">
      <label>模型名称</label>
      <input type="text" v-model="apiConfig.model" placeholder="gpt-3.5-turbo" />
    </div>
    <div class="settings-tip">* 设置后将使用自定义 API 生成商品，留空则使用酒馆默认配置。</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useMvuData } from '../hooks/useMvuData';

const { mvu } = useMvuData();

const apiConfig = ref({
  apiurl: mvu.value.system.tradeCustomApi?.apiurl || '',
  key: mvu.value.system.tradeCustomApi?.key || '',
  model: mvu.value.system.tradeCustomApi?.model || '',
});

defineExpose({
  getApiConfig: () => ({ ...apiConfig.value }),
});
</script>

<style lang="scss" scoped>
.settings-form {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  min-width: 300px;

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 5px;

    label {
      font-size: var(--font-size-small);
      color: var(--italics_text_color);
      font-weight: bold;
    }

    input {
      background: var(--bot_mes_blur_tint_color);
      border: 1px solid var(--border_color);
      color: var(--main_text_color);
      padding: 8px 12px;
      border-radius: 4px;
      font-size: var(--font-size-medium);

      &:focus {
        border-color: var(--quote_text_color);
        outline: none;
      }
    }
  }

  .settings-tip {
    font-size: var(--font-size-extra-small);
    color: var(--italics_text_color);
    font-style: italic;
  }
}
</style>
