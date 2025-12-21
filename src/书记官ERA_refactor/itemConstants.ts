import { z } from 'zod';

// ============ 类型定义 ============

export const TierTypeSchema = z.enum(['basic', 'light', 'medium', 'heavy']);
export type TierType = z.infer<typeof TierTypeSchema>;
export const QualityTypeSchema = z.enum(['common', 'good', 'excellent', 'masterwork', 'legendary']);
export type QualityType = z.infer<typeof QualityTypeSchema>;
export const SlotTypeSchema = z.enum([
  'head',
  'bodyInner',
  'bodyArmor',
  'hands',
  'legsInner',
  'legsArmor',
  'feet',
  'cloak',
  'neck',
  'ring',
  'belt',
]);
export type SlotType = z.infer<typeof SlotTypeSchema>;
export const ItemTypeSchema = z.enum(['cloth', 'weapon', 'item', 'consumable']);
export type ItemType = z.infer<typeof ItemTypeSchema>;

export const BaseInventoryItemSchema = z.object({
  name: z.string().default(''),
  description: z.string().default(''),
  quality: QualityTypeSchema.default('common'),
  type: ItemTypeSchema.default('item'),
  tier: TierTypeSchema.default('basic'),
  slot: SlotTypeSchema.optional(),
});
export type BaseInventoryItem = z.infer<typeof BaseInventoryItemSchema>;

export const InventoryItemSchema = BaseInventoryItemSchema.extend({
  id: z.string(),
});
export type InventoryItem = z.infer<typeof InventoryItemSchema>;

export interface TierData {
  name: string;
  description?: string;
  defenseCoeff: number;
  comfortCoeff: number;
  warmthCoeff: number;
  socialCoeff: number;
  weightCoeff: number;
}

export interface QualityData {
  name: string;
  color: string;
  allAttributesCoeff: number;
}

export interface SlotData {
  name: string;
  baseDefense: number;
  baseComfort: number;
  baseWarmth: number;
  baseSocial: number;
  baseWeight: number;
}

// ============ 数据配置 ============

const ClothingSystemData = {
  TierSystem: {
    basic: {
      name: '基础',
      description: '日常穿着,舒适但防护力弱',
      defenseCoeff: 0.5,
      comfortCoeff: 1.2,
      warmthCoeff: 1.0,
      socialCoeff: 0.8,
      weightCoeff: 0.6,
    },
    light: {
      name: '轻型',
      description: '平衡防护与舒适,适合冒险者',
      defenseCoeff: 1.0,
      comfortCoeff: 1.0,
      warmthCoeff: 0.9,
      socialCoeff: 1.0,
      weightCoeff: 1.0,
    },
    medium: {
      name: '中型',
      description: '较强防护,牺牲部分舒适度',
      defenseCoeff: 1.5,
      comfortCoeff: 0.6,
      warmthCoeff: 0.7,
      socialCoeff: 1.2,
      weightCoeff: 1.8,
    },
    heavy: {
      name: '重型',
      description: '最强防护,笨重且不舒适',
      defenseCoeff: 2.0,
      comfortCoeff: 0.3,
      warmthCoeff: 0.5,
      socialCoeff: 1.5,
      weightCoeff: 2.5,
    },
  } as Record<TierType, TierData>,

  QualitySystem: {
    common: { name: '一般', allAttributesCoeff: 1.0, color: '#9d9d9d' },
    good: { name: '良好', allAttributesCoeff: 1.2, color: '#1eff00' },
    excellent: { name: '极佳', allAttributesCoeff: 1.5, color: '#0070dd' },
    masterwork: { name: '大师', allAttributesCoeff: 2.0, color: '#a335ee' },
    legendary: { name: '传奇', allAttributesCoeff: 3.0, color: '#ff8000' },
  } as Record<QualityType, QualityData>,

  ClothingSlots: {
    head: { name: '头部', baseDefense: 5, baseComfort: 7, baseWarmth: 4, baseSocial: 5, baseWeight: 1.0 },
    bodyInner: { name: '内衬', baseDefense: 2, baseComfort: 9, baseWarmth: 5, baseSocial: 4, baseWeight: 0.5 },
    bodyArmor: { name: '身体护甲', baseDefense: 12, baseComfort: 5, baseWarmth: 4, baseSocial: 7, baseWeight: 6.0 },
    hands: { name: '手部', baseDefense: 3, baseComfort: 7, baseWarmth: 5, baseSocial: 4, baseWeight: 0.5 },
    legsInner: { name: '腿部内衬', baseDefense: 2, baseComfort: 9, baseWarmth: 4, baseSocial: 4, baseWeight: 0.4 },
    legsArmor: { name: '腿部护甲', baseDefense: 10, baseComfort: 5, baseWarmth: 4, baseSocial: 6, baseWeight: 5.0 },
    feet: { name: '足部', baseDefense: 4, baseComfort: 8, baseWarmth: 6, baseSocial: 5, baseWeight: 1.0 },
    cloak: { name: '披风', baseDefense: 1, baseComfort: 8, baseWarmth: 10, baseSocial: 7, baseWeight: 1.5 },
    neck: { name: '颈部', baseDefense: 1, baseComfort: 10, baseWarmth: 3, baseSocial: 6, baseWeight: 0.1 },
    ring: { name: '戒指', baseDefense: 0, baseComfort: 10, baseWarmth: 0, baseSocial: 8, baseWeight: 0.02 },
    belt: { name: '腰带', baseDefense: 1, baseComfort: 8, baseWarmth: 0, baseSocial: 5, baseWeight: 0.3 },
  } as Record<SlotType, SlotData>,
};

// ============ 标签映射 ============

export const qualityLabels = Object.fromEntries(
  Object.entries(ClothingSystemData.QualitySystem).map(([key, value]) => [key, value.name]),
) as Record<QualityType, string>;

export const tierLabels = Object.fromEntries(
  Object.entries(ClothingSystemData.TierSystem).map(([key, value]) => [key, value.name]),
) as Record<TierType, string>;

export const slotLabels = Object.fromEntries(
  Object.entries(ClothingSystemData.ClothingSlots).map(([key, value]) => [key, value.name]),
) as Record<SlotType, string>;

export const typeLabels: Record<ItemType, string> = {
  cloth: '衣物',
  weapon: '武器',
  item: '物品',
  consumable: '消耗品',
};

export { ClothingSystemData };
