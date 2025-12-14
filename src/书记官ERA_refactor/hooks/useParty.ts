// hooks/useParty.ts
import _ from 'lodash';
import { computed, ref, Ref, watchEffect } from 'vue';
import { MvuData, PartyMember } from '../types';

type UpgradeState = {
  tempAttributes: Record<string, number>;
  initialAttributes: Record<string, number>;
};

export function useParty(mvu: Ref<MvuData>, rawMvuData: Ref<any>, handleMvuUpdate: Function) {
  const partyUpgradeState = ref<{ [charName: string]: UpgradeState }>({});

  const isAssigningAttributes = computed(() => (mvu.value.PlayerData.progress.partyAttrPoints || 0) > 0);

  const party = computed(() => {
    const partyAsObject: Record<string, any> = {
      F0: { ...mvu.value.PlayerData },
    };
    const followerNpcKeys = Object.keys(mvu.value.FollowerNPCData || {});
    for (const key of followerNpcKeys) {
      const mvuNpcData = rawMvuData.value?.FollowerNPCData?.[key];
      if (mvuNpcData) {
        partyAsObject[key] = mvuNpcData;
      }
    }
    return partyAsObject;
  });

  const totalSpentPoints = computed(() => {
    if (!isAssigningAttributes.value) return 0;
    return _.sum(
      Object.values(party.value).map(char => {
        const state = partyUpgradeState.value[char.character.name];
        if (!state) return 0;
        return _.sum(Object.values(state.tempAttributes)) - _.sum(Object.values(state.initialAttributes));
      }),
    );
  });

  watchEffect(() => {
    if (isAssigningAttributes.value) {
      Object.values(party.value).forEach(char => {
        const charName = char.character.name;
        if (!partyUpgradeState.value[charName]) {
          partyUpgradeState.value[charName] = {
            tempAttributes: _.cloneDeep(char.attributes),
            initialAttributes: _.cloneDeep(char.attributes),
          };
        }
      });
    } else {
      partyUpgradeState.value = {};
    }
  });

  const characterLabels: { [key: string]: string } = {
    name: '姓名',
    level: '等级',
    gender: '性别',
    race: '种族',
    height: '身高',
    build: '体型',
    appearance: '外貌',
    personality: '性格',
  };
  const metaLabels: { [key: string]: string } = {
    relationship: '关系',
    favorability: '好感度',
    favorabilityTowardsNPCs: '对NPC好感度',
    description: '概要',
    title: '称号',
  };

  const attributeLabels: { [key: string]: string } = {
    shooting: '射击',
    melee: '格斗',
    construction: '建造',
    mining: '采矿',
    cooking: '烹饪',
    planting: '种植',
    animals: '驯兽',
    crafting: '手工',
    artistic: '艺术',
    medical: '医疗',
    social: '社交',
    intellectual: '智识',
  };

  const statusLabels: { [key: string]: string } = {
    health: 'HP',
    mood: '心情',
    arousal: '性欲',
  };

  const equipmentLabels: { [key: string]: string } = {
    leftHand: '左手',
    rightHand: '右手',
    outfit: '套装Id',
    outfitContent: '套装内容',
  };

  // 检查经验值是否足够
  function validateExperience(): boolean {
    if (mvu.value.PlayerData.progress.partyExperience.current < mvu.value.PlayerData.progress.partyExperience.max) {
      toastr.warning('经验值不足, 无法升级');
      return false;
    }
    return true;
  }

  // 计算升级后的数据
  function calculateLevelUpData(char: any) {
    const currentExp = mvu.value.PlayerData.progress.partyExperience.current;
    const maxExp = mvu.value.PlayerData.progress.partyExperience.max;
    const levelsToGain = 1;
    const pointsToGain = levelsToGain;

    return {
      charName: char.character.name,
      newLevel: char.character.level + levelsToGain,
      newExp: currentExp - maxExp,
      levelsToGain,
      newPartyAttrPoints: (mvu.value.PlayerData.progress.partyAttrPoints || 0) + pointsToGain,
    };
  }

  // 获取角色数据路径
  function getCharacterPath(key: string): string {
    if (key === 'F0') {
      return 'PlayerData';
    }
    return `FollowerNPCData.${key}`;
  }

  // 生成升级命令
  function generateLevelUpCommand(
    basePath: string,
    newLevel: number,
    newExp: number,
    newPartyAttrPoints: number,
  ): any[] {
    return [
      { event: 'updateByPath', detail: { path: `${basePath}.character.level`, value: newLevel } },
      { event: 'updateByPath', detail: { path: 'PlayerData.progress.partyExperience.current', value: newExp } },
      { event: 'updateByPath', detail: { path: 'PlayerData.progress.partyAttrPoints', value: newPartyAttrPoints } },
    ];
  }

  // 统一的升级逻辑
  async function levelUp(char: any, key: string) {
    if (!validateExperience()) return;

    const { charName, newLevel, newExp, levelsToGain, newPartyAttrPoints } = calculateLevelUpData(char);
    const basePath = getCharacterPath(key);
    const commands = generateLevelUpCommand(basePath, newLevel, newExp, newPartyAttrPoints);

    await handleMvuUpdate(commands, () => {
      toastr.success(`${charName} 升了 ${levelsToGain} 级! 等级 ${newLevel}, 获得 ${levelsToGain} 属性点.`);
    });
  }

  // 生成属性变更命令
  function generateAttributeCommands(
    basePath: string,
    tempAttributes: any,
    initialAttributes: any,
    newPartyAttrPoints: number,
  ): any[] {
    const commands: any[] = [];
    for (const key in tempAttributes) {
      if (tempAttributes[key] !== initialAttributes[key]) {
        // commands.push(`_.set('${basePath}.attributes.${key}', ${tempAttributes[key]});`);
        commands.push({
          event: 'updateByPath',
          detail: { path: `${basePath}.attributes.${key}`, value: tempAttributes[key] },
        });
      }
    }
    if (commands.length > 0) {
      // commands.push(`_.set('PlayerData.progress.partyAttrPoints', ${newPartyAttrPoints});`);
      commands.push({
        event: 'updateByPath',
        detail: { path: 'PlayerData.progress.partyAttrPoints', value: newPartyAttrPoints },
      });
    }
    return commands;
  }

  function getSpentPoints(char: any): number {
    const state = partyUpgradeState.value[char.character.name];
    if (!state) return 0;
    return _.sum(Object.values(state.tempAttributes)) - _.sum(Object.values(state.initialAttributes));
  }

  // 统一的提交属性逻辑
  async function commitAttributes(char: any, key: string) {
    const charName = char.character.name;
    const state = partyUpgradeState.value[charName];
    if (!state) return;

    const pointsSpent = getSpentPoints(char);

    if (pointsSpent < 0) {
      toastr.error('属性点减少异常');
      return;
    }

    if (pointsSpent === 0) {
      toastr.info('属性没有变化');
      return;
    }

    const newPartyAttrPoints = (mvu.value.PlayerData.progress.partyAttrPoints || 0) - pointsSpent;
    const basePath = getCharacterPath(key);
    const commands = generateAttributeCommands(
      basePath,
      state.tempAttributes,
      state.initialAttributes,
      newPartyAttrPoints,
    );

    if (commands.length === 0) return;

    // const command = commands.join('\n');

    await handleMvuUpdate(commands, () => {
      partyUpgradeState.value[charName].initialAttributes = _.cloneDeep(
        partyUpgradeState.value[charName].tempAttributes,
      );
      // const freshChar = party.value.find(p => p.character.name === charName);
      // if (freshChar && partyUpgradeState.value[charName]) {
      //   partyUpgradeState.value[charName].initialAttributes = _.cloneDeep(freshChar.attributes);
      // }
      toastr.success(`${charName} 属性已更新!`);
    });
  }

  function incrementAttribute(char: any, key: string, attrKey: string) {
    const charName = char.character.name;
    const state = partyUpgradeState.value[charName];
    if (state) {
      if ((mvu.value.PlayerData.progress.partyAttrPoints || 0) > totalSpentPoints.value) {
        state.tempAttributes[attrKey]++;
      }
    }
  }

  function decrementAttribute(char: any, key: string, attrKey: string) {
    const charName = char.character.name;
    const state = partyUpgradeState.value[charName];
    if (state && state.tempAttributes[attrKey] > state.initialAttributes[attrKey]) {
      state.tempAttributes[attrKey]--;
    }
  }

  const selectedChar = ref<PartyMember | null>(null);
  const selectedCharKey = ref<string | null>(null);

  function selectChar(char: any, key: string) {
    if (selectedCharKey.value === key) {
      selectedChar.value = null;
      selectedCharKey.value = null;
    } else {
      selectedChar.value = char;
      selectedCharKey.value = key;
    }
  }

  const characterOutfits = computed(() => {
    if (!selectedCharKey.value) return {};
    return _.pickBy(mvu.value.Wardrobe.ownedOutfits, outfit => outfit.wearer === selectedCharKey.value);
  });

  async function updateOutfit(newOutfitId: string) {
    if (!selectedCharKey.value) return;

    let outfitContent = '';
    if (newOutfitId && mvu.value.Wardrobe.ownedOutfits[newOutfitId]) {
      const outfitData = mvu.value.Wardrobe.ownedOutfits[newOutfitId];
      const inventory = mvu.value.PlayerDynamicData.inventory;
      const itemNames: string[] = [];

      for (const slotKey in outfitData.slots) {
        const itemIds = (outfitData.slots as any)[slotKey];
        if (!itemIds) continue;

        const ids = Array.isArray(itemIds) ? itemIds : [itemIds];
        for (const id of ids) {
          if (inventory[id]) {
            itemNames.push(inventory[id].name);
          }
        }
      }
      outfitContent = itemNames.join(',');
    }

    const basePath = getCharacterPath(selectedCharKey.value);
    const commands = [
      {
        event: 'updateByPath',
        detail: { path: `${basePath}.equipment.outfit`, value: newOutfitId },
      },
      {
        event: 'updateByPath',
        detail: { path: `${basePath}.equipment.outfitContent`, value: outfitContent },
      },
    ];

    await handleMvuUpdate(commands, () => {
      toastr.success('套装已更新!');
    });
  }

  return {
    party,
    partyUpgradeState,
    characterLabels,
    metaLabels,
    attributeLabels,
    statusLabels,
    equipmentLabels,
    isAssigningAttributes,
    totalSpentPoints,
    levelUp,
    commitAttributes,
    incrementAttribute,
    decrementAttribute,
    selectChar,
    selectedChar,
    selectedCharKey,
    characterOutfits,
    updateOutfit,
  };
}
