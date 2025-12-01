// hooks/useParty.ts
import _ from 'lodash';
import { computed, ref, Ref, watchEffect } from 'vue';
import { MvuData } from '../types';

type UpgradeState = {
  tempAttributes: Record<string, number>;
  initialAttributes: Record<string, number>;
};

export function useParty(mvu: Ref<MvuData>, rawMvuData: Ref<any>, handleMvuUpdate: Function) {
  const partyUpgradeState = ref<{ [charName: string]: UpgradeState }>({});

  const isAssigningAttributes = computed(() => (mvu.value.PlayerData.progress.partyAttrPoints || 0) > 0);

  const party = computed(() => {
    const followerNPCs = Object.keys(mvu.value.FollowerNPCData || {}).map((name: string) => {
      // const defaultNpcData = { ...npcConst.get(name) };
      const mvuNpcData = rawMvuData.value?.FollowerNPCData?.[name];
      return mvuNpcData;

      // return mvuNpcData ? _.merge(defaultNpcData, mvuNpcData) : defaultNpcData;
    });
    return [{ ...mvu.value.PlayerData }, ...followerNPCs];
  });

  const totalSpentPoints = computed(() => {
    if (!isAssigningAttributes.value) return 0;
    return _.sum(
      party.value.map(char => {
        const state = partyUpgradeState.value[char.character.name];
        if (!state) return 0;
        return _.sum(Object.values(state.tempAttributes)) - _.sum(Object.values(state.initialAttributes));
      }),
    );
  });

  watchEffect(() => {
    if (isAssigningAttributes.value) {
      party.value.forEach(char => {
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
    const levelsToGain = Math.floor(currentExp / maxExp);
    const pointsToGain = levelsToGain;

    return {
      charName: char.character.name,
      newLevel: char.character.level + levelsToGain,
      newExp: currentExp % maxExp,
      levelsToGain,
      newPartyAttrPoints: (mvu.value.PlayerData.progress.partyAttrPoints || 0) + pointsToGain,
    };
  }

  // 获取角色数据路径
  function getCharacterPath(index: number): string {
    if (index === 0) {
      return 'PlayerData';
    }
    const followerIds = Object.keys(mvu.value.FollowerNPCData || {});
    const npcId = followerIds[index - 1];
    return `FollowerNPCData.${npcId}`;
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
  async function levelUp(char: any, index: number) {
    if (!validateExperience()) return;

    const { charName, newLevel, newExp, levelsToGain, newPartyAttrPoints } = calculateLevelUpData(char);
    const basePath = getCharacterPath(index);
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
  async function commitAttributes(char: any, index: number) {
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
    const basePath = getCharacterPath(index);
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

  function incrementAttribute(char: any, index: number, attrKey: string) {
    const charName = char.character.name;
    const state = partyUpgradeState.value[charName];
    if (state) {
      if ((mvu.value.PlayerData.progress.partyAttrPoints || 0) > totalSpentPoints.value) {
        state.tempAttributes[attrKey]++;
      }
    }
  }

  function decrementAttribute(char: any, index: number, attrKey: string) {
    const charName = char.character.name;
    const state = partyUpgradeState.value[charName];
    if (state && state.tempAttributes[attrKey] > state.initialAttributes[attrKey]) {
      state.tempAttributes[attrKey]--;
    }
  }

  const selectedChar = ref<any>(null);
  const selectedCharIndex = ref<number | null>(null);

  function selectChar(char: any, index: number) {
    if (selectedCharIndex.value === index) {
      selectedChar.value = null;
      selectedCharIndex.value = null;
    } else {
      selectedChar.value = char;
      selectedCharIndex.value = index;
    }
  }

  return {
    party,
    partyUpgradeState,
    characterLabels,
    metaLabels,
    attributeLabels,
    statusLabels,
    isAssigningAttributes,
    totalSpentPoints,
    levelUp,
    commitAttributes,
    incrementAttribute,
    decrementAttribute,
    selectChar,
    selectedChar,
    selectedCharIndex,
  };
}
