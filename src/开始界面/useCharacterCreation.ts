import { computed, reactive, ref, watch } from 'vue';
import defaultEra from '../书记官ERA_refactor/default_ERA.json';

export function useCharacterCreation(defaultMvuData: any) {
  const sys = reactive({
    mainStoryMode: true,
  });

  const selectedMode = ref('自定义开局');
  const modes = [
    { name: '自定义开局', description: '自由创建角色并开始冒险。' },
    { name: '模板开局', description: '使用预设的角色模板快速开始游戏。' },
    { name: '起源角色开局', description: '选择一个起源角色，体验独特的背景故事和初始条件。' },
  ];

  const races = [
    { name: '月精灵', description: '优雅而神秘的森林居民，擅长魔法和弓箭。' },
    { name: '高等精灵', description: '追求奥术极致的精灵，博学且高傲，天生对魔力敏感。' },
    { name: '木精灵', description: '荒野的守护者，动作迅捷，能完美融入森林环境。' },
    { name: '卓尔', description: '居住在幽暗地域，拥有极佳的夜视能力和冷酷的社交手腕。' },
    { name: '至高妖精', description: '来自妖精荒野的精灵，性格多变，充满艺术灵感。' },
    { name: '人类', description: '适应性强，遍布世界各地，在各种领域都有建树。' },
    { name: '矮人', description: '强壮的矿工和工匠，以其坚韧和对工艺的热爱而闻名。' },
    { name: '兽人', description: '勇猛的战士，拥有强大的力量和无畏的精神。' },
    { name: '半身人', description: '乐观且热爱生活的族群，是天生的厨师和优秀的谈判家。' },
    { name: '机械生命', description: '高度精密的合成金属生命体，逻辑严密，擅长制造与研究。' },
    { name: '龙裔', description: '流淌着古龙之血的战士，拥有极强的身体素质和威慑力。' },
    { name: '提夫林', description: '流淌着炼狱之血的凡人，对火焰有着天然抗性。' },
    { name: '坎比翁', description: '高等恶魔与凡人的后代，不仅强壮且极具威慑力。' },
    { name: '神裔', description: '体内承载着天界神力的生灵，是天生的领导者和医者。' },
    { name: '堕落神裔', description: '被内心阴影或悲剧侵蚀的神裔，虽然失去了光辉，但拥有恐怖的战斗意志。' },
    { name: '灵族', description: '纯粹的精神能量体，能感知灵魂，在医疗和艺术上有极高天赋。' },
    { name: '穴居人', description: '长期生活在深地底，极其擅长挖掘和在恶劣环境下生存。' },
    { name: '魅魔', description: '擅长玩弄人心的族群，社交手腕高超，审美独特。' },
    { name: '树精', description: '森林的化身，生长缓慢但与植物有着天然的共鸣。' },
  ];
  const raceBonuses: { [key: string]: Partial<typeof state.attributes> } = {
    月精灵: { shooting: 3, intellectual: 2, artistic: 1 },
    高等精灵: { intellectual: 4, artistic: 2, shooting: 1 },
    木精灵: { shooting: 4, construction: 2, melee: 1 },
    卓尔: { social: 3, shooting: 2, melee: 2 },
    至高妖精: { artistic: 5, social: 2 },
    人类: { social: 1, crafting: 1, cooking: 1, intellectual: 1, construction: 1, medical: 1 },
    矮人: { mining: 3, construction: 2, crafting: 1 },
    兽人: { melee: 4, mining: 2 },
    半身人: { cooking: 4, social: 2, artistic: 1 },
    机械生命: { intellectual: 4, crafting: 3, social: 0 },
    龙裔: { melee: 3, construction: 2, social: 1 },
    提夫林: { social: 4, intellectual: 2, cooking: 1 },
    坎比翁: { melee: 4, social: 2, construction: 1 },
    神裔: { medical: 4, social: 3, artistic: 1 },
    堕落神裔: { melee: 3, shooting: 3, social: 1 },
    灵族: { medical: 4, artistic: 3, intellectual: 1 },
    穴居人: { mining: 5, construction: 2 },
    魅魔: { social: 5, artistic: 2 },
    树精: { planting: 5, medical: 2, cooking: 1 },
  };
  const genders = ['男', '女']; // Example genders
  const builds = ['纤细', '匀称', '健壮', '魁梧'];

  const base: number = 0;
  const state = reactive({
    character: {
      name: '',
      level: 1,
      gender: '男',
      race: '月精灵',
      height: '',
      build: '',
      appearance: '',
      personality: '',
      location: '' as string,
    },
    attributes: {
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
    },
    followers: [] as Array<{
      character: {
        name: string;
        level: number;
        gender: string;
        race: string;
        height: string;
        build: string;
        appearance: string;
        personality: string;
      };
      attributes: {
        shooting: number;
        melee: number;
        construction: number;
        mining: number;
        cooking: number;
        planting: number;
        animals: number;
        crafting: number;
        artistic: number;
        medical: number;
        social: number;
        intellectual: number;
      };
    }>,
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

  const baseAttributes = computed(() => {
    const bonuses = raceBonuses[state.character.race] || {};
    const baseAttrs: { [key: string]: number } = {};
    for (const key in state.attributes) {
      const attrKey = key as keyof typeof state.attributes;
      baseAttrs[attrKey] = base + (bonuses[attrKey] || 0);
    }
    return baseAttrs;
  });

  watch(
    () => state.character.race,
    () => {
      const newBaseAttrs = baseAttributes.value;
      for (const key in state.attributes) {
        const attrKey = key as keyof typeof state.attributes;
        state.attributes[attrKey] = newBaseAttrs[attrKey];
      }
    },
    { immediate: true },
  );

  const totalPoints = 20;

  watch(selectedMode, value => {
    if (value === '模板开局') {
      createDefaultCharacter(state);
    } else if (value === '自定义开局') {
      resetCharacter(state);
    }
  });

  const spentPoints = computed(() => {
    let total = 0;
    const currentBase = baseAttributes.value;
    for (const key in state.attributes) {
      const attrKey = key as keyof typeof state.attributes;
      total += state.attributes[attrKey] - currentBase[attrKey];
    }
    return total;
  });

  const availablePoints = computed(() => totalPoints - spentPoints.value);

  function increaseAttribute(attr: keyof typeof state.attributes) {
    if (availablePoints.value > 0) {
      state.attributes[attr]++;
    }
  }

  function decreaseAttribute(attr: keyof typeof state.attributes) {
    if (state.attributes[attr] > baseAttributes.value[attr]) {
      state.attributes[attr]--;
    }
  }

  function createDefaultFollower() {
    return {
      character: {
        name: '',
        level: 1,
        gender: '男',
        race: '人类',
        height: '',
        build: '匀称',
        appearance: '',
        personality: '',
      },
      attributes: {
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
      },
    };
  }

  function addFollower() {
    state.followers.push(createDefaultFollower());
  }

  function removeFollower(index: number) {
    state.followers.splice(index, 1);
  }

  function createCharacter() {
    const partyAttrPoints = state.followers.reduce(
      (acc: Record<string, number>, _, i) => {
        acc[`F${i + 1}`] = 0;
        return acc;
      },
      { F0: 0 },
    );
    const outfitIds = state.followers.reduce(
      (acc: Record<string, string>, _, i) => {
        acc[`F${i + 1}`] = 'none';
        return acc;
      },
      { F0: 'none' },
    );

    let userSelection = {
      playerData: {
        character: { ...state.character },
        attributes: { ...state.attributes },
        equipment: {
          leftHand: 'none',
          rightHand: 'none',
          outfitContent: '旅行装',
        },
      },
      followerNPCData: state.followers.reduce((acc: any, curr, i) => {
        // 使用模板字符串 `${}` 拼接键名
        acc[`F${i + 1}`] = {
          character: { ...curr.character },
          attributes: { ...curr.attributes },
          equipment: {
            leftHand: 'none',
            rightHand: 'none',
            outfitContent: '旅行装',
          },
          meta: {
            relationship: '同伴',
            favorability: 50,
            favorabilityTowardsNPCs: {
              $meta: {
                updatable: true,
              },
            },
            description: '',
          },
        };
        return acc;
      }, {}),
      system: {
        mainStoryMode: sys.mainStoryMode,
      },
      progressData: {
        partyAttrPoints,
      },
      archivedData: {
        outfitIds,
      },
    };
    if (sys.mainStoryMode) {
      const mainStoryInit = {
        progressData: {
          currentQuest: {
            MQ1: {
              name: '节日的插曲',
              description:
                '你们作为旅者，本想享受这难得的安宁与热闹，却意外卷入了一场发生于市中心“长者之喉”许愿井-不同寻常的事件。',
              isMain: true,
            },
          },
        },
        worldInfo: {
          date: '1468DR 奈托月19日',
          time: '傍晚',
          weather: '飘雪',
          currentRegion: '巴拉德雷',
          currentLocation: '羽笔与酒杯旅店附近',
        },
      };
      userSelection = _.merge(userSelection, mainStoryInit);
    }
    // 使用 cloneDeep 避免修改原始的 defaultMvuData, 并确保结构匹配
    const finalCharacterData = _.merge(_.cloneDeep(defaultMvuData), userSelection);
    console.log('最终角色数据:', finalCharacterData);

    try {
      eventEmit('era:insertByObject', finalCharacterData);
    } catch (error) {
      console.error('修改 MVU 数据失败:', error);
      toastr.error('操作失败: 保存数据时出错');
    }
  }

  const openingConfirmText = computed(() => {
    const followerText = state.followers
      .map((f, i) => {
        const attributesText = Object.keys(f.attributes)
          .map(key => `${attributeLabels[key]}${f.attributes[key as keyof typeof f.attributes]}`)
          .join(', ');
        return `
                     随行NPC ${i + 1}:
                     名字: ${f.character.name}
                     性别: ${f.character.gender}
                     种族: ${f.character.race}
                     身高: ${f.character.height}
                     体型: ${f.character.build}
                     外貌: ${f.character.appearance}
                     性格: ${f.character.personality}
                     属性点:
                     ${attributesText}
`;
      })
      .join('');
    return `
                     玩家信息:
                     名字: ${state.character.name}
                     等级: ${state.character.level}
                     性别: ${state.character.gender}
                     种族: ${state.character.race}
                     身高: ${state.character.height}
                     体型: ${state.character.build}
                     外貌: ${state.character.appearance}
                     性格: ${state.character.personality}
 
                     属性点:
                     射击${state.attributes.shooting}, 格斗${state.attributes.melee}, 建造${state.attributes.construction}, 采矿${state.attributes.mining}, 烹饪${state.attributes.cooking}, 种植${state.attributes.planting}, 驯兽${state.attributes.animals}, 手工${state.attributes.crafting}, 艺术${state.attributes.artistic}, 医疗${state.attributes.medical}, 社交${state.attributes.social}, 智识${state.attributes.intellectual}
 ${followerText}

初始地点: 巴拉德雷

---
                     `;
  });
  const fixedOpeningText = computed(() => {
    return `
1468DR 奈托月19日

---

如今已鲜有人记得那条古老的驿道了。

它从帕尔镇蜿蜒向西，穿过德温林平原的腹地，经过许多如今已荒废或被遗忘的村庄，最终抵达那座吟游诗人的城市。在古老的年代里，当科雷斯尚是一个年轻的王国而非庞大的帝国时，这条路上曾有无数旅人行走——商人与学者，士兵与朝圣者，以及那些仅仅是怀着一颗不安分的心、想要看看山那边有什么风景的人。

${state.character.name}${state.followers.length > 1 ? '一行人' : state.followers.length == 1 ? '和' + state.followers[0].character.name : ''}已经在路上走了许久。当那座依着缓坡而建的小城终于出现在视野中，天边最后一缕霞光正好沉入地平线。

在帝国的编年史中，巴拉德雷算不上一座古老的城市，更算不上一座宏伟的城市。它只是德温林平原上的一座小城，依着缓坡而建，被矮墙环绕，在帝国的版图上不过是一个不起眼的墨点。

然而，那些曾到访过巴拉德雷的人，往往会带着一种奇特的眷恋离开。

或许是因为那里的空气中总是飘荡着音乐，或许是因为那里的人们似乎比别处更懂得如何享受生活，又或许仅仅是因为——正如一首古老的歌谣所唱的那样：

*巴拉德雷，巴拉德雷，*
*琴弦与诗歌的故乡，*
*疲惫的旅人在此歇脚，*
*忧伤的心灵在此疗伤。*
*壁炉的火光永远温暖，*
*杯中的麦酒永远芬芳，*
*来吧，朋友，推开那扇门，*
*让歌声伴你度过漫漫长夜。*

这首歌谣据说已有两百年的历史，最初是由一位名叫"银舌"班德里克的游吟诗人所作。关于这位诗人，流传着许多故事——有人说他曾用一首歌平息了两个家族之间的血仇，有人说他曾在月圆之夜与精灵共舞，还有人说他的歌声甜美得能让石头落泪——但这些都是另外的故事了。眼下重要的是：他的歌谣所描绘的巴拉德雷，与此刻所看到的巴拉德雷，并没有太大的不同。

城门口挂着成串的灯笼，在暮色中亮起，像一串温暖的珍珠。远远望去，整座城市仿佛被一层柔和的金色光芒所笼罩，在灰蓝色的天幕下显得格外温馨。

空气中飘来了别样的气息。
烤面包的香气。炖肉的浓郁。蜂蜜与肉桂的甜蜜。烤栗子的焦香。还有麦芽酒，那种在寒冬里格外诱人的、温热的、令人微醺的麦芽酒的气息。

一块略显陈旧但保养良好的招牌在晚风中轻轻摇晃，上面画着一根羽毛笔插在一只盛满美酒的高脚杯中，底下用优雅的字体写着：**羽笔与酒杯**。

招牌下方还挂着一块小一号的木板，上面是今日新添的粉笔字：

*"冬日香料热酒供应中——新客免费一杯！"*

温暖的灯光从窗户中倾泻而出，在青石板路面上投下一方金色的光影。透过凝结着水雾的玻璃窗，隐约可见里面人影绰绰，炉火正旺。
`;
  });

  async function createMessage() {
    const message_id = getLastMessageId();
    if (message_id !== 0) {
      return;
    }
    let context = fixedOpeningText.value;
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

  eventOn('era:writeDone', detail => {
    if (!detail || !detail.statWithoutMeta) return;
    if (!detail.statWithoutMeta.playerData || !detail.statWithoutMeta.playerData.character.name) return;

    // 处理世界书蓝绿灯
    let currentQuests: string[] = [];

    if (sys.mainStoryMode) {
      currentQuests = ['MQ1'];
    }

    updateWorldbookWith('奥弗萨斯', worldbook => {
      const QUEST_KEYWORDS = ['主线', '支线'];
      const STRATEGY_TYPE = {
        CONSTANT: 'constant' as const,
        SELECTIVE: 'selective' as const,
      };

      return worldbook.map(entry => {
        const isQuestEntry = QUEST_KEYWORDS.some(keyword => entry.name.includes(keyword));

        // 如果不是任务条目或缺少 strategy 属性，则直接返回原始条目，不做任何修改
        if (!isQuestEntry || !entry.strategy) {
          return entry;
        }

        // 判断需要激活的条目是否处于激活状态
        const isQuestActive = currentQuests.some(quest => entry.strategy.keys.includes(quest));
        const newStrategyType = isQuestActive ? STRATEGY_TYPE.CONSTANT : STRATEGY_TYPE.SELECTIVE;

        // 如果策略类型无需改变，则直接返回原始条目，避免不必要的对象创建
        if (entry.strategy.type === newStrategyType) {
          return entry;
        }

        // 返回一个新的条目对象，其中包含更新后的 strategy
        return {
          ...entry,
          strategy: {
            ...entry.strategy, // 复制 strategy 的所有现有属性
            type: newStrategyType, // 仅覆盖 type 属性
          },
        };
      });
    });

    createMessage();
  });

  return {
    state,
    sys,
    selectedMode,
    modes,
    races,
    genders,
    builds,
    baseAttributes,
    availablePoints,
    increaseAttribute,
    decreaseAttribute,
    createCharacter,
    attributeLabels,
    raceBonuses,
    openingConfirmText,
    fixedOpeningText,
    addFollower,
    removeFollower,
  };
}

function createDefaultCharacter(state: any) {
  const filterMeta = (obj: any) => {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }
    const newObj: { [key: string]: any } = {};
    for (const key in obj) {
      if (key !== '$meta' && key !== '$template') {
        newObj[key] = obj[key];
      }
    }
    return newObj;
  };

  state.character = filterMeta(defaultEra.playerData.character);
  state.attributes = filterMeta(defaultEra.playerData.attributes);
  state.equipment = filterMeta(defaultEra.playerData.equipment);
  state.followers = Object.values(filterMeta(defaultEra.followerNPCData))
    .filter((v: any) => v.character)
    .map((v: any) => {
      return {
        character: filterMeta(v.character),
        attributes: filterMeta(v.attributes),
        equipment: filterMeta(v.equipment),
      };
    });
}

function resetCharacter(state: any) {
  state.character = {
    name: '',
    level: 1,
    gender: '男',
    race: '月精灵',
    height: '',
    build: '',
    appearance: '',
    personality: '',
    location: '',
  };
  state.attributes = {
    shooting: 0,
    melee: 0,
    construction: 0,
    mining: 0,
    cooking: 0,
    planting: 0,
    animals: 0,
    crafting: 0,
    artistic: 0,
    medical: 0,
    social: 0,
    intellectual: 0,
  };
  state.followers = [];
}
