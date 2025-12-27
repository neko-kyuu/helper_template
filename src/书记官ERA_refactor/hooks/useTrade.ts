import { computed, ref, type Ref } from 'vue';
import { uuidv4 } from '../../util/common';
import { InventoryItem } from '../itemConstants';
import type { MvuData } from '../types';

/**
 * 商店物品，在基础物品属性上增加了价格
 */
export interface ShopItem extends InventoryItem {
  price: number;
}

/**
 * 交易所组合式函数
 */
export function useTrade(mvu: Ref<MvuData>, handleMvuUpdate: Function) {
  // --- 状态定义 ---
  const shopItems = ref<ShopItem[]>([]);
  const shopDescription = ref('');
  const selectedItem = ref<ShopItem | null>(null);
  const isGenerating = ref(false);
  const showSettings = ref(false);

  // API 配置表单状态，初始化为当前 MVU 中的值
  const apiConfig = ref({
    apiurl: mvu.value.system.customApi?.apiurl || '',
    key: mvu.value.system.customApi?.key || '',
    model: mvu.value.system.customApi?.model || '',
  });

  // 从 MVU 变量中读取自定义 API 配置（用于生成请求）
  const customApi = computed(() => mvu.value.system.customApi);

  /**
   * 保存自定义 API 配置
   */
  async function handleSaveApi() {
    try {
      const hasCustomApi = !!mvu.value.system.customApi;
      await handleMvuUpdate([
        {
          event: hasCustomApi ? 'updateByPath' : 'insertByPath',
          detail: {
            path: 'system.customApi',
            value: { ...apiConfig.value },
          },
        },
      ]);
      toastr.success('API 配置已保存');
      showSettings.value = false;
    } catch (e) {
      toastr.error('保存失败');
    }
  }

  /**
   * 刷新商店货架
   */
  async function refreshShop() {
    isGenerating.value = true;
    selectedItem.value = null;
    try {
      const location = mvu.value.worldInfo.currentLocation || mvu.value.worldInfo.currentRegion || '未名之地';
      const result = await requestShopItems(location);
      shopItems.value = result.items;
      shopDescription.value = result.description;
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
   * @returns 包含剧情描述和物品列表的对象
   */
  async function requestShopItems(locationName: string): Promise<{ description: string; items: ShopItem[] }> {
    const prompt = `你现在是 ERA 系统的地下城主（DM）。玩家刚刚进入了位于 **${locationName}** 的商店。

**任务目标：**
请根据该地点的背景和繁荣程度，生成 3-5 件符合该地特色的商品。

**生成规则：**
1. **描述风格**：物品描述（description）必须保持极简干练，强调功能或质感重点，避免冗长。
2. **数值平衡**：
   - **金币 (price)**：参考系统物价（自由民日入 10g，高级工匠 100g）。普通消耗品应在 5-50g 之间，精良装备应在 200-1000g 之间，更高品质则更贵。
   - **品质 (quality)**：严格使用枚举值：'common' | 'good' | 'excellent' | 'masterwork' | 'legendary'。
3. **数据结构**：每件商品必须严格符合 \`InventoryItem\` 格式：
   - \`name\`: 物品名称。
   - \`description\`: 极简描述。
   - \`quality\`: 品质枚举。
   - \`type\`: 类型枚举 ('cloth' | 'weapon' | 'item' | 'consumable')。
   - \`tier\`: 重量阶梯 ('basic' | 'light' | 'medium' | 'heavy')。
   - \`slot\`: 若类型为 'cloth'，必须提供部位 ('head' | 'bodyInner' | 'bodyArmor' | 'hands' | 'legsInner' | 'legsArmor' | 'feet' | 'cloak' | 'neck' | 'ring' | 'belt')。
   - \`price\`: 销售价格（Number）。

**输出格式：**
请先进行一段简短的剧情描述（商店氛围、老板的招呼），然后按照以下格式输出商品列表：

### 货架清单
[此处列出物品名称与价格，方便阅读]

<ShopInventory>
[
  {
    "name": "...",
    "description": "...",
    "quality": "...",
    "type": "...",
    "tier": "...",
    "slot": "...", // 仅限 cloth
    "price": 100
  },
  ...
]
</ShopInventory>`;

    // 调用酒馆助手的生成接口
    const response = await generate({
      user_input: '',
      injects: [{ role: 'system', content: prompt, position: 'in_chat', depth: 0, should_scan: false }],
      overrides: { chat_history: { with_depth_entries: false }, world_info_after: '' },
      custom_api: customApi.value?.apiurl
        ? {
            apiurl: customApi.value.apiurl,
            key: customApi.value.key,
            model: customApi.value.model,
            source: 'openai',
          }
        : undefined,
    });

    // 解析剧情描述 (提取 <ShopInventory> 之前的内容)
    const descriptionMatch = response.match(/([\s\S]*?)<ShopInventory>/);
    const description = descriptionMatch ? descriptionMatch[1].trim() : '老板热情地向你展示了他的货物。';

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

    return { description, items };
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
    shopItems,
    shopDescription,
    selectedItem,
    isGenerating,
    showSettings,
    apiConfig,
    customApi,
    // 方法
    refreshShop,
    handleBuy,
    handleSaveApi,
    requestShopItems,
    buyItem,
  };
}
