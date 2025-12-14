import { ClothingSystemData, type QualityType, type SlotType, type TierType } from '../书记官ERA/itemConstants';

// ============ 类型定义 ============

export interface ClothingAttributes {
  defense: number;
  comfort: number;
  warmth: number;
  social: number;
  weight: number;
}

export interface CalculationResult {
  valid: boolean;
  error?: string;
  usedDefaults?: {
    tier: boolean;
    quality: boolean;
  };
  input?: {
    tier: TierType;
    quality: QualityType;
    slot: SlotType;
  };
  displayName?: string;
  slotName?: string;
  tierName?: string;
  qualityName?: string;
  qualityColor?: string;
  attributes?: ClothingAttributes;
  defense: number;
  comfort: number;
  warmth: number;
  social: number;
  weight: number;
}

export interface ClothingInput {
  tier: TierType;
  quality: QualityType;
  slot: SlotType;
}

export interface GeneratedClothing {
  tier: TierType;
  quality: QualityType;
  slot: SlotType;
  material: string;
  name: string;
}

export interface GenerateOptions {
  slot?: SlotType;
  tier?: TierType;
  quality?: QualityType;
}

// ============ 数据配置 ============

// 材质常量
const MATERIALS: readonly string[] = [
  '布料',
  '亚麻',
  '棉布',
  '丝绸',
  '羊毛',
  '皮革',
  '软皮',
  '硬皮',
  '鹿皮',
  '鳄鱼皮',
  '铁',
  '钢',
  '秘银',
  '精金',
  '黑钢',
  '木材',
  '橡木',
  '紫杉木',
  '黑檀木',
  '兽皮',
  '熊皮',
  '狼皮',
  '龙鳞',
] as const;

// 各部位的精确服装名词
const CLOTHING_NAMES: Record<SlotType, readonly string[]> = {
  head: [
    '贝雷帽',
    '礼帽',
    '软呢帽',
    '钟形帽',
    '头巾',
    '皮盔',
    '轻盔',
    '圆盔',
    '全盔',
    '面甲',
    '王冠',
    '头环',
    '兜帽',
    '护额',
    '战盔',
  ],
  bodyInner: ['衬衫', '束腰外衣', '长袍', '背心', '汗衫', '内衬', '软甲内衬', '垫甲', '护心镜', '贴身衣'],
  bodyArmor: [
    '皮甲',
    '胸甲',
    '锁甲',
    '板甲',
    '鳞甲',
    '多曼',
    '枪骑兵夹克',
    '胸铠',
    '护心甲',
    '战袍',
    '骑士铠',
    '龙鳞甲',
    '秘银甲',
    '符文铠甲',
  ],
  hands: ['手套', '拳套', '护手', '臂甲', '腕甲', '绑手', '拳击手套', '骑手手套', '长手套', '护臂'],
  legsInner: ['短裤', '长裤', '马裤', '紧身裤', '灯笼裤', '衬裤', '护腿内衬', '软甲裤'],
  legsArmor: ['护腿', '腿甲', '胫甲', '战裤', '铠裤', '骑士护腿', '链甲裤', '板甲护腿', '鳞甲裤'],
  feet: [
    '布鞋',
    '皮鞋',
    '靴子',
    '长靴',
    '短靴',
    '战靴',
    '骑士靴',
    '登山靴',
    '铁靴',
    '板甲靴',
    '凉鞋',
    '软鞋',
    '高筒靴',
  ],
  cloak: ['披风', '斗篷', '罩衫', '披肩', '披挂', '旅行斗篷', '战斗披风', '毛皮披风', '丝绸披风', '贵族披肩'],
  neck: ['围巾', '项链', '颈饰', '护符', '吊坠', '项圈', '丝巾', '领结', '领带', '护喉'],
  ring: ['戒指', '指环', '符文戒', '宝石戒', '印章戒', '婚戒', '魔戒', '护身戒', '尾戒'],
  belt: ['腰带', '皮带', '束带', '绶带', '腰链', '武装带', '宽腰带', '编织带', '装饰带'],
} as const;

// ============ 核心函数 ============

/**
 * 计算服装最终属性值
 */
function calculateClothingAttributes(input: ClothingInput): CalculationResult {
  const { tier, quality, slot } = input;

  // 默认兜底值
  const defaultTier: TierType = 'light';
  const defaultQuality: QualityType = 'common';

  // 输入校验
  const tierData = ClothingSystemData.TierSystem[tier] || ClothingSystemData.TierSystem[defaultTier];
  const qualityData = ClothingSystemData.QualitySystem[quality] || ClothingSystemData.QualitySystem[defaultQuality];
  const slotData = ClothingSystemData.ClothingSlots[slot];

  // 如果slot不存在，返回全0
  if (!slotData) {
    return {
      valid: false,
      error: `无效的装备部位: ${slot}`,
      defense: 0,
      comfort: 0,
      warmth: 0,
      social: 0,
      weight: 0,
    };
  }

  // 记录是否使用了默认值
  const usedDefaults = {
    tier: !ClothingSystemData.TierSystem[tier],
    quality: !ClothingSystemData.QualitySystem[quality],
  };

  // 计算最终属性：基准值 × 等级系数 × 品质系数
  const qCoeff = qualityData.allAttributesCoeff;

  const defense = Math.round(slotData.baseDefense * tierData.defenseCoeff * qCoeff * 10) / 10;
  const comfort = Math.round(slotData.baseComfort * tierData.comfortCoeff * qCoeff * 10) / 10;
  const warmth = Math.round(slotData.baseWarmth * tierData.warmthCoeff * qCoeff * 10) / 10;
  const social = Math.round(slotData.baseSocial * tierData.socialCoeff * qCoeff * 10) / 10;
  const weight = Math.round(slotData.baseWeight * tierData.weightCoeff * qCoeff * 100) / 100;

  return {
    valid: true,
    usedDefaults,
    input: {
      tier: tier || defaultTier,
      quality: quality || defaultQuality,
      slot,
    },
    displayName: `${qualityData.name}${tierData.name}${slotData.name}`,
    slotName: slotData.name,
    tierName: tierData.name,
    qualityName: qualityData.name,
    qualityColor: qualityData.color,
    attributes: {
      defense,
      comfort,
      warmth,
      social,
      weight,
    },
    defense,
    comfort,
    warmth,
    social,
    weight,
  };
}

/**
 * 从数组中随机选择一个元素
 */
function randomChoice<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * 随机生成交易界面的服装物品
 */
function generateRandomClothing(options: GenerateOptions = {}): GeneratedClothing {
  // 有效的枚举值
  const validTiers = Object.keys(ClothingSystemData.TierSystem) as TierType[];
  const validQualities = Object.keys(ClothingSystemData.QualitySystem) as QualityType[];
  const validSlots = Object.keys(ClothingSystemData.ClothingSlots) as SlotType[];

  // 随机或使用指定值
  const tier = options.tier && validTiers.includes(options.tier) ? options.tier : randomChoice(validTiers);

  const quality =
    options.quality && validQualities.includes(options.quality) ? options.quality : randomChoice(validQualities);

  const slot = options.slot && validSlots.includes(options.slot) ? options.slot : randomChoice(validSlots);

  // 随机材质和名称
  const material = randomChoice(MATERIALS);
  const name = randomChoice(CLOTHING_NAMES[slot]);

  return {
    tier,
    quality,
    slot,
    material,
    name,
  };
}

/**
 * 批量生成随机服装
 */
function generateRandomClothingBatch(count: number, options: GenerateOptions = {}): GeneratedClothing[] {
  const items: GeneratedClothing[] = [];
  for (let i = 0; i < count; i++) {
    items.push(generateRandomClothing(options));
  }
  return items;
}

// ============ 导出 ============

export {
  // 函数
  calculateClothingAttributes,
  // 数据
  CLOTHING_NAMES,
  generateRandomClothing,
  generateRandomClothingBatch,
  MATERIALS,
  randomChoice,
};

/** ============ 测试用例 ============

// 示例用法：
console.log("=== TypeScript 版本测试 ===\n");

const item1 = generateRandomClothing();
console.log("随机生成装备:", item1);
console.log("属性计算:", calculateClothingAttributes(item1));

const legendaryItems = generateRandomClothingBatch(3, { quality: "legendary" });
console.log("\n传奇装备批量生成:", legendaryItems);
 */
