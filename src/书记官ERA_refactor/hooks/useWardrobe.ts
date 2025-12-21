// hooks/useWardrobe.ts
import { computed, ref, Ref, watch } from 'vue';
import { calculateClothingAttributes } from '../clothingConstants';
import { QualityType, SlotType, TierType } from '../itemConstants';
import { MvuData, Slots } from '../types';

export function useWardrobe(mvu: Ref<MvuData>, emit: (event: 'open-update', outfitId?: string) => void) {
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

  const selectedOutfitId = ref('');

  const hydrateOutfit = (outfitData: any) => {
    if (!outfitData) return null;

    const hydratedSlots: any = {};
    const inventory = mvu.value.playerDynamicData.inventory;

    for (const slotKey in outfitData.slots) {
      const slotName = slotKey as keyof Slots;
      if (slotName === 'extra') {
        const itemIds = (outfitData.slots[slotName] || []) as string[];
        hydratedSlots[slotName] = itemIds.map(id => (inventory[id] ? { ...inventory[id], id } : null)).filter(Boolean);
      } else {
        const itemId = outfitData.slots[slotName];
        if (itemId && inventory[itemId]) {
          hydratedSlots[slotName] = { ...inventory[itemId], id: itemId };
        } else {
          hydratedSlots[slotName] = null;
        }
      }
    }

    return { ...outfitData, slots: hydratedSlots };
  };

  const selectedOutfit = computed(() => {
    const outfitData = mvu.value.wardrobe.ownedOutfits[selectedOutfitId.value];
    return hydrateOutfit(outfitData);
  });

  const editOutfit = (outfitId: string) => {
    emit('open-update', outfitId);
  };

  const clothingAttributes = ref({
    defense: 0,
    comfort: 0,
    warmth: 0,
    social: 0,
    weight: 0,
  });

  // 侦听当前服装变化, 自动重新计算总属性
  watch(
    selectedOutfit,
    outfit => {
      const newAttributes = {
        defense: 0,
        comfort: 0,
        warmth: 0,
        social: 0,
        weight: 0,
      };

      if (outfit) {
        for (const slot in outfit.slots) {
          const item = outfit.slots[slot as keyof Slots];
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

      clothingAttributes.value = newAttributes;
    },
    { immediate: true },
  );

  const openUpdateOutfit = () => {
    emit('open-update');
  };

  return {
    slotNames,
    selectedOutfitId,
    selectedOutfit,
    editOutfit,
    openUpdateOutfit,
    clothingAttributes,
  };
}
