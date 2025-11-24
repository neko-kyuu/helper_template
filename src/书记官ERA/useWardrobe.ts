// hooks/useWardrobe.ts
import { computed, ref, watch } from 'vue';
import { QualityType, SlotType, TierType, calculateClothingAttributes } from './clothingConstants';

export function useWardrobe(mvu: any) {
  const slotNames: { [key: string]: string } = {
    head: '头部',
    bodyInner: '内衬',
    bodyArmor: '身体',
    hands: '手部',
    legsInner: '内裤',
    legsArmor: '腿部',
    feet: '脚部',
    cloak: '披风',
    neck: '颈部',
    ring: '戒指',
    belt: '腰带',
    extra: '额外',
  };

  const selectedOutfitId = ref(mvu.value.Wardrobe.currentOutfit);

  watch(
    () => mvu.value.Wardrobe.currentOutfit,
    newOutfitId => {
      selectedOutfitId.value = newOutfitId;
    },
  );

  const selectedOutfit = computed(() => {
    return mvu.value.Wardrobe.ownedOutfits[selectedOutfitId.value];
  });

  const currentEquippedOutfit = computed(() => {
    return mvu.value.Wardrobe.ownedOutfits[mvu.value.Wardrobe.currentOutfit];
  });

  const equipOutfit = (outfitId: string) => {
    // TODO: This should trigger an MVU update to persist the change.
    // For now, just updating local state for UI demonstration.
    mvu.value.Wardrobe.currentOutfit = outfitId;
  };

  // 侦听当前服装变化, 自动重新计算总属性
  watch(
    currentEquippedOutfit,
    currentOutfit => {
      const newAttributes = {
        defense: 0,
        comfort: 0,
        warmth: 0,
        social: 0,
        weight: 0,
      };

      if (currentOutfit) {
        for (const slot in currentOutfit.slots) {
          const item = currentOutfit.slots[slot as keyof typeof currentOutfit.slots];
          if (item && !Array.isArray(item)) {
            try {
              const itemAttributes = calculateClothingAttributes({
                tier: item.tier as TierType,
                quality: item.quality as QualityType,
                slot: item.slot as SlotType,
              });
              newAttributes.defense += itemAttributes.defense || 0;
              newAttributes.comfort += itemAttributes.comfort || 0;
              newAttributes.warmth += itemAttributes.warmth || 0;
              newAttributes.social += itemAttributes.social || 0;
              newAttributes.weight += itemAttributes.weight || 0;
            } catch (error) {
              console.error(`计算${slot}服装属性出错:`, item, error);
            }
          }
        }
      }

      // TODO: This should trigger an MVU update to persist the change？
      mvu.value.PlayerDynamicData.clothingAttributes = newAttributes;
    },
    { immediate: true },
  );

  return {
    slotNames,
    selectedOutfitId,
    selectedOutfit,
    currentEquippedOutfit,
    equipOutfit,
  };
}
