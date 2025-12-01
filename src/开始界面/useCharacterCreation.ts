import { computed, reactive, watch } from 'vue';

// Based on src/书记官ERA/书记官_ERA.json PlayerData
export function useCharacterCreation(defaultMvuData: any) {
  const character = reactive({
    name: '',
    level: 1,
    gender: '男',
    race: '月精灵',
    height: '',
    build: '',
    appearance: '',
    personality: '',
    location: '' as string,
  });

  const sys = reactive({
    mainStoryMode: true,
  });

  const races = [
    { name: '月精灵', description: '优雅而神秘的森林居民，擅长魔法和弓箭。' },
    { name: '人类', description: '适应性强，遍布世界各地，在各种领域都有建树。' },
    { name: '矮人', description: '强壮的矿工和工匠，以其坚韧和对工艺的热爱而闻名。' },
    { name: '兽人', description: '勇猛的战士，拥有强大的力量和无畏的精神。' },
  ];
  const genders = ['男', '女']; // Example genders
  const builds = ['纤细', '匀称', '健壮', '魁梧'];

  const base: number = 0;
  const attributes = reactive({
    shooting: base,
    melee: base,
    construction: base,
    mining: base,
    cooking: base,
    planting: base,
    animals: base,
    crafting: base,
    artistic: base,
    medical: base,
    social: base,
    intellectual: base,
  });

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

  const raceBonuses: { [key: string]: Partial<typeof attributes> } = {
    月精灵: { shooting: 3, intellectual: 2, artistic: 1 },
    人类: { social: 1, crafting: 1, cooking: 1, intellectual: 1, construction: 1, medical: 1 },
    矮人: { mining: 3, construction: 2, crafting: 1 },
    兽人: { melee: 4, mining: 2 },
  };

  const baseAttributes = computed(() => {
    const bonuses = raceBonuses[character.race] || {};
    const baseAttrs: { [key: string]: number } = {};
    for (const key in attributes) {
      const attrKey = key as keyof typeof attributes;
      baseAttrs[attrKey] = base + (bonuses[attrKey] || 0);
    }
    return baseAttrs;
  });

  watch(
    () => character.race,
    () => {
      const newBaseAttrs = baseAttributes.value;
      for (const key in attributes) {
        const attrKey = key as keyof typeof attributes;
        attributes[attrKey] = newBaseAttrs[attrKey];
      }
    },
    { immediate: true },
  );

  const totalPoints = 20;

  const spentPoints = computed(() => {
    let total = 0;
    const currentBase = baseAttributes.value;
    for (const key in attributes) {
      const attrKey = key as keyof typeof attributes;
      total += attributes[attrKey] - currentBase[attrKey];
    }
    return total;
  });

  const availablePoints = computed(() => totalPoints - spentPoints.value);

  function increaseAttribute(attr: keyof typeof attributes) {
    if (availablePoints.value > 0) {
      attributes[attr]++;
    }
  }

  function decreaseAttribute(attr: keyof typeof attributes) {
    if (attributes[attr] > baseAttributes.value[attr]) {
      attributes[attr]--;
    }
  }

  function createCharacter() {
    // TODO: Implement character creation logic
    // This would likely involve saving the data using酒馆助手 APIs
    const userSelection = {
      PlayerData: {
        character: { ...character, level: 1 },
        attributes: { ...attributes },
      },
      sys: {
        mainStoryMode: sys.mainStoryMode,
      },
    };
    if (sys.mainStoryMode) {
      const mainStoryInit = {
        PlayerData: {
          progress: {
            currentQuest: {
              MQ1: {
                name: '节日的插曲',
                description:
                  '你们作为旅者，本想享受这难得的安宁与热闹，却意外卷入了一场发生于市中心“长者之喉”许愿井的不同寻常的事件。',
                isMain: true,
              },
            },
          },
          settings: {
            date: '1468DR 奈托月19日',
            time: '傍晚',
            weather: '飘雪',
            currentRegion: '巴拉德雷',
            currentLocation: '羽笔与酒杯旅店附近',
          },
        },
      };
    }
    // 使用 cloneDeep 避免修改原始的 defaultMvuData, 并确保结构匹配
    const finalCharacterData = _.merge(_.cloneDeep(defaultMvuData), userSelection);
    console.log('Creating character:', finalCharacterData);

    try {
      eventEmit('era:insertByObject', finalCharacterData);
      // createMessage()
    } catch (error) {
      console.error('修改 MVU 数据失败:', error);
      toastr.error('操作失败: 保存数据时出错');
    }
  }

  const openingConfirmText = computed(() => {
    return `
                    玩家信息:
                    名字: ${character.name}
                    等级: ${character.level}
                    性别: ${character.gender}
                    种族: ${character.race}
                    身高: ${character.height}
                    体型: ${character.build}
                    外貌: ${character.appearance}
                    性格: ${character.personality}

                    属性点:
                    射击${attributes.shooting}, 格斗${attributes.melee}, 建造${attributes.construction}, 采矿${attributes.mining}, 烹饪${attributes.cooking}, 种植${attributes.planting}, 驯兽${attributes.animals}, 手工${attributes.crafting}, 艺术${attributes.artistic}, 医疗${attributes.medical}, 社交${attributes.social}, 智识${attributes.intellectual}

                    `;
  });
  const fixedOpeningText = `
初始地点: 巴拉德雷

开场白:
【节日的插曲】

1468DR，奈托月19日，冬至。

艺术之城巴拉德雷正被长夜节的温暖灯火拥抱着。尽管寒风从德温林平原上呼啸而过，城内却洋溢着一股由烤栗子、香料热酒和松木燃烧的气味混合而成的暖意。家家户户的窗台上都点缀着冬青与小巧的魔法光球，将那些绘有壁画的墙壁和带有阳台的小楼映照得如同童话插画。

吟游诗人们的鲁特琴声从每一扇窗扉间里流淌出来，与街头巷尾孩子们的欢笑声交织在一起。这里的生活总是如此，悠闲而富有创造力，节日的到来更是将这份惬意推向了高潮。对于一个刚刚结束漫长旅途的旅人来说，没有什么比这景象更治愈的了。

顺着人流和愈发清晰的乐声，旅人之阶的热闹印面而来。旅店、酒馆和市场鳞次栉比，刚抵达的商队正在卸货，空气中满是马匹的鼻息和商贩的叫卖声。在一片喧闹之中，一块画着羽毛笔和高脚杯的木制招牌显得格外醒目。“羽笔与酒杯旅店”的窗户透出温暖的橘色光芒，门缝里飘散出烤肉和麦酒的香气，仿佛在无声地召唤着每一位风尘仆仆的过客。
                  `;

  async function createMessage() {
    const message_id = getLastMessageId();
    if (message_id !== 0) {
      return;
    }
    let context = openingConfirmText.value + fixedOpeningText;
    await createChatMessages(
      [
        {
          role: 'user',
          message: dedent(context),
        },
      ],
      { refresh: 'all' },
    );
    await triggerSlash('/trigger');
  }

  return {
    character,
    sys,
    races,
    genders,
    builds,
    attributes,
    baseAttributes,
    availablePoints,
    increaseAttribute,
    decreaseAttribute,
    createCharacter,
    attributeLabels,
    raceBonuses,
    openingConfirmText,
    fixedOpeningText,
  };
}
