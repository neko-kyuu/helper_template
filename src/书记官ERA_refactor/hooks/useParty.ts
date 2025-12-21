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

  const isAssigningAttributes = computed(() => {
    const points = mvu.value.progressData.partyAttrPoints || {};
    return _.mapValues(points, val => val > 0);
  });

  const party = computed(() => {
    const partyAsObject: Record<string, any> = {
      F0: { ...mvu.value.playerData },
    };
    const followerNpcKeys = Object.keys(mvu.value.followerNPCData || {});
    for (const key of followerNpcKeys) {
      const mvuNpcData = rawMvuData.value?.followerNPCData?.[key];
      if (mvuNpcData) {
        partyAsObject[key] = mvuNpcData;
      }
    }
    return partyAsObject;
  });

  watchEffect(() => {
    if (_.some(isAssigningAttributes.value)) {
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
    experience: '经验',
  };

  const equipmentLabels: { [key: string]: string } = {
    leftHand: '左手',
    rightHand: '右手',
    outfit: '套装Id',
    outfitContent: '套装内容',
  };

  // 检查经验值是否足够
  function validateExperience(char: any): boolean {
    if (char.status.experience.current < char.status.experience.max) {
      toastr.warning(`${char.character.name} 的经验值不足, 无法升级`);
      return false;
    }
    return true;
  }

  /**
   * 计算给定等级所需的最大经验值。
   * 使用修改后的S型曲线, 使得经验值增长“前缓中快后缓”。
   * @param level - 角色的下一个等级。
   * @returns 该等级所需的最大经验值。
   */
  function calculateMaxExpForLevel(level: number): number {
    // S型曲线参数
    const L = 5000; // 曲线最大值 (影响后期经验)
    const k = 0.1; // 曲线陡峭度 (影响中期经验增长速度)
    const x0 = 40; // 曲线中点 (中期开始的等级)

    // 基础线性增长，确保经验值总是稳定增加
    const baseLinearGrowth = 100 * level;

    // S型曲线部分
    const sigmoidPart = L / (1 + Math.exp(-k * (level - x0)));

    // 最终经验值 = 基础线性增长 + S型曲线部分
    return Math.floor(baseLinearGrowth + sigmoidPart);
  }

  // 计算升级后的数据
  function calculateLevelUpData(char: any, key: string) {
    const currentExp = char.status.experience.current;
    const maxExp = char.status.experience.max;
    const levelsToGain = 1;
    const pointsToGain = levelsToGain;
    const hpGainPerLevel = 10; // 每个等级增加10点生命值
    const newLevel = char.character.level + levelsToGain;

    return {
      charName: char.character.name,
      newLevel,
      newExp: currentExp - maxExp,
      newMaxExp: calculateMaxExpForLevel(newLevel), // 计算下一级的最大经验值
      levelsToGain,
      newAttrPointsForChar: (mvu.value.progressData.partyAttrPoints?.[key] || 0) + pointsToGain,
      newMaxHp: (char.status.health.max || 10) + hpGainPerLevel * levelsToGain,
    };
  }

  // 获取角色数据路径
  function getCharacterPath(key: string): string {
    if (key === 'F0') {
      return 'playerData';
    }
    return `followerNPCData.${key}`;
  }

  // 生成升级命令
  function generateLevelUpCommand(
    basePath: string,
    key: string,
    newLevel: number,
    newExp: number,
    newMaxExp: number,
    newAttrPointsForChar: number,
    newMaxHp: number,
  ): any[] {
    return [
      { event: 'updateByPath', detail: { path: `${basePath}.character.level`, value: newLevel } },
      { event: 'updateByPath', detail: { path: `${basePath}.status.health.max`, value: newMaxHp } },
      { event: 'updateByPath', detail: { path: `${basePath}.status.health.current`, value: newMaxHp } },
      { event: 'updateByPath', detail: { path: `${basePath}.status.experience.current`, value: newExp } },
      { event: 'updateByPath', detail: { path: `${basePath}.status.experience.max`, value: newMaxExp } },
      { event: 'updateByPath', detail: { path: `progressData.partyAttrPoints.${key}`, value: newAttrPointsForChar } },
    ];
  }

  // 统一的升级逻辑
  async function levelUp(char: any, key: string) {
    if (!validateExperience(char)) return;

    const { charName, newLevel, newExp, newMaxExp, levelsToGain, newAttrPointsForChar, newMaxHp } =
      calculateLevelUpData(char, key);
    const basePath = getCharacterPath(key);
    const commands = generateLevelUpCommand(basePath, key, newLevel, newExp, newMaxExp, newAttrPointsForChar, newMaxHp);

    await handleMvuUpdate(commands, () => {
      toastr.success(`${charName} 升了 ${levelsToGain} 级! 等级 ${newLevel}, 获得 ${levelsToGain} 属性点.`);
    });
  }

  // 生成属性变更命令
  function generateAttributeCommands(
    basePath: string,
    key: string,
    tempAttributes: any,
    initialAttributes: any,
    newAttrPointsForChar: number,
  ): any[] {
    const commands: any[] = [];
    for (const attrKey in tempAttributes) {
      if (tempAttributes[attrKey] !== initialAttributes[attrKey]) {
        commands.push({
          event: 'updateByPath',
          detail: { path: `${basePath}.attributes.${attrKey}`, value: tempAttributes[attrKey] },
        });
      }
    }
    if (commands.length > 0) {
      commands.push({
        event: 'updateByPath',
        detail: { path: `progressData.partyAttrPoints.${key}`, value: newAttrPointsForChar },
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

    const availablePoints = mvu.value.progressData.partyAttrPoints?.[key] || 0;
    if (pointsSpent > availablePoints) {
      toastr.error('属性点不足');
      return;
    }

    const newAttrPointsForChar = availablePoints - pointsSpent;
    const basePath = getCharacterPath(key);
    const commands = generateAttributeCommands(
      basePath,
      key,
      state.tempAttributes,
      state.initialAttributes,
      newAttrPointsForChar,
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
      const availablePoints = mvu.value.progressData.partyAttrPoints?.[key] || 0;
      const spentPoints = getSpentPoints(char);
      if (availablePoints > spentPoints) {
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
    return _.pickBy(mvu.value.wardrobe.ownedOutfits, outfit => outfit.wearer === selectedCharKey.value);
  });

  async function updateOutfit(newOutfitId: string) {
    if (!selectedCharKey.value) return;

    let outfitContent = '';
    if (newOutfitId && mvu.value.wardrobe.ownedOutfits[newOutfitId]) {
      const outfitData = mvu.value.wardrobe.ownedOutfits[newOutfitId];
      const inventory = mvu.value.playerDynamicData.inventory;
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
        detail: { path: `archivedData.outfitIds.${selectedCharKey.value}`, value: newOutfitId },
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

  const getNPCNameByKey = (npcKey: string): string => {
    const npc = mvu.value.worldInfo.nearbyNPC;
    const party = mvu.value.followerNPCData;
    return npc[npcKey] ? npc[npcKey].character.name : party[npcKey] ? party[npcKey].character.name : '';
  };

  const getHealthDescription = (current: number, max: number): string => {
    if (current / max >= 0.75) return '健康';
    if (current / max >= 0.5) return '良好';
    if (current / max >= 0.25) return '受伤';
    return '急需治疗';
  };

  const getHealthColor = (current: number, max: number): string => {
    if (current / max >= 0.75) return '#4caf50';
    if (current / max >= 0.5) return '#8bc34a';
    if (current / max >= 0.25) return '#ffeb3b';
    return '#f44336';
  };

  return {
    party,
    partyUpgradeState,
    characterLabels,
    metaLabels,
    attributeLabels,
    statusLabels,
    equipmentLabels,
    isAssigningAttributes,
    getSpentPoints,
    levelUp,
    commitAttributes,
    incrementAttribute,
    decrementAttribute,
    selectChar,
    selectedChar,
    selectedCharKey,
    characterOutfits,
    updateOutfit,
    getNPCNameByKey,
    getHealthDescription,
    getHealthColor,
  };
}
