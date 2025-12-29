import { computed, ref, type Ref } from 'vue';
import { uuidv4 } from '../../util/common';
import { InventoryItem } from '../itemConstants';
import type { MvuData } from '../types';
import economySystem from '../文档/经济体系.md?raw';

/**
 * 商店物品，在基础物品属性上增加了价格
 */
export interface ShopItem extends InventoryItem {
  price: number;
}

// --- 全局单例状态 ---
const refreshUserInput = ref('');
const shopItems = ref<ShopItem[]>([]);
const selectedItem = ref<ShopItem | null>(null);
const isGenerating = ref(false);

/**
 * 交易所组合式函数
 */
export function useTrade(mvu: Ref<MvuData>, handleMvuUpdate: Function) {
  // 从 MVU 变量中读取自定义 API 配置（用于生成请求）
  const tradeCustomApi = computed(() => mvu.value.system.tradeCustomApi);

  /**
   * 刷新商店货架
   * @param userInput 用户输入的额外要求
   */
  async function refreshShop(userInput?: string) {
    isGenerating.value = true;
    selectedItem.value = null;
    try {
      const location = mvu.value.worldInfo.currentLocation || mvu.value.worldInfo.currentRegion || '未名之地';
      const result = await requestShopItems(location, userInput);
      shopItems.value = result.items;
    } catch (e) {
      console.error('刷新商店失败:', e);
      toastr.error('无法获取商品信息');
    } finally {
      isGenerating.value = false;
    }
  }

  /**
   * 处理购买逻辑
   */
  async function handleBuy() {
    if (!selectedItem.value) return;

    try {
      const message = await buyItem(selectedItem.value);
      toastr.success(message);
      // 购买成功后从货架移除
      shopItems.value = shopItems.value.filter(i => i.id !== selectedItem.value?.id);
      selectedItem.value = null;
    } catch (e: any) {
      toastr.error(e.message || '购买失败');
    }
  }

  /**
   * 请求生成商店物品
   * @param locationName 当前商店所在的地点名称
   * @param userInput 用户输入的额外要求
   * @returns 包含剧情描述和物品列表的对象
   */
  async function requestShopItems(locationName: string, userInput?: string): Promise<{ items: ShopItem[] }> {
    // 将地点名称注入到经济体系文档的占位符中
    const prompt = economySystem.replace('{{locationName}}', locationName);

    // 调用酒馆助手的生成接口
    const response = await generateRaw({
      user_input: userInput,
      ordered_prompts: [
        'world_info_before', // 世界书(角色定义前)
        'world_info_after', // 世界书(角色定义后)
        'chat_history', // 聊天历史 (含世界书中按深度插入的条目、作者注释)
        { role: 'system', content: prompt },
        'user_input', // 用户输入
      ],
      overrides: {
        chat_history: { with_depth_entries: false },
      },
      ...(tradeCustomApi.value?.apiurl && {
        custom_api: {
          apiurl: tradeCustomApi.value.apiurl,
          key: tradeCustomApi.value.key,
          model: tradeCustomApi.value.model,
          source: 'openai',
        },
      }),
    });

    // 解析 JSON 数据
    const jsonMatch = response.match(/<ShopInventory>([\s\S]*?)<\/ShopInventory>/);
    let items: ShopItem[] = [];

    if (jsonMatch) {
      try {
        const rawItems = JSON.parse(jsonMatch[1].trim());
        if (Array.isArray(rawItems)) {
          items = rawItems.map((item: any) => ({
            ...item,
            id: uuidv4(), // 初始分配一个 UUID，购买时会替换为 I+数字
          }));
        }
      } catch (e) {
        console.error('解析商店物品失败:', e);
      }
    }

    return { items };
  }

  /**
   * 购买物品逻辑
   * @param item 要购买的物品
   * @returns 购买结果消息，如果失败则抛出错误
   */
  async function buyItem(item: ShopItem): Promise<string> {
    const currentGold = mvu.value.playerDynamicData.gold;

    if (currentGold < item.price) {
      throw new Error(`金币不足！需要 ${item.price}g，当前仅有 ${currentGold}g。`);
    }

    // 生成新的物品 ID: "I" + 数字自增
    const inventory = mvu.value.playerDynamicData.inventory;
    const maxIdNum = Object.keys(inventory)
      .filter(id => id.startsWith('I'))
      .map(id => parseInt(id.substring(1)))
      .filter(num => !isNaN(num))
      .reduce((max, curr) => Math.max(max, curr), -1);
    const newId = `I${maxIdNum + 1}`;

    // 构造物品对象（移除 price 字段，并更新 ID）
    const { price, ...inventoryItem } = item;
    inventoryItem.id = newId;

    // 使用 MVU 指令更新金币和背包
    await handleMvuUpdate([
      {
        event: 'updateByPath',
        detail: {
          path: 'playerDynamicData.gold',
          value: currentGold - item.price,
        },
      },
      {
        event: 'insertByPath',
        detail: {
          path: `playerDynamicData.inventory.${newId}`,
          value: inventoryItem,
        },
      },
    ]);

    return `成功购买了 ${item.name}！花费了 ${item.price} 金币。`;
  }

  return {
    // 状态
    refreshUserInput,
    shopItems,
    selectedItem,
    isGenerating,
    tradeCustomApi,
    // 方法
    refreshShop,
    handleBuy,
    requestShopItems,
    buyItem,
  };
}
