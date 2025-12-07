import { computed, reactive, ref, watch } from 'vue';
import defaultEra from '../书记官ERA/default_ERA.json';

// Based on src/书记官ERA/书记官_ERA.json PlayerData
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
    { name: '人类', description: '适应性强，遍布世界各地，在各种领域都有建树。' },
    { name: '矮人', description: '强壮的矿工和工匠，以其坚韧和对工艺的热爱而闻名。' },
    { name: '兽人', description: '勇猛的战士，拥有强大的力量和无畏的精神。' },
  ];
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

  const raceBonuses: { [key: string]: Partial<typeof state.attributes> } = {
    月精灵: { shooting: 3, intellectual: 2, artistic: 1 },
    人类: { social: 1, crafting: 1, cooking: 1, intellectual: 1, construction: 1, medical: 1 },
    矮人: { mining: 3, construction: 2, crafting: 1 },
    兽人: { melee: 4, mining: 2 },
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
    let userSelection = {
      PlayerData: {
        character: { ...state.character },
        attributes: { ...state.attributes },
      },
      FollowerNPCData: state.followers.reduce((acc: any, curr, i) => {
        // 使用模板字符串 `${}` 拼接键名
        acc[`F${i + 1}`] = {
          character: { ...curr.character },
          attributes: { ...curr.attributes },
          status: {
            health: { current: 12, max: 12 },
            mood: { current: 50, max: 100 },
            arousal: { current: 50, max: 100 },
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
      System: {
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
      userSelection = _.merge(userSelection, mainStoryInit);
    }
    // 使用 cloneDeep 避免修改原始的 defaultMvuData, 并确保结构匹配
    const finalCharacterData = _.merge(_.cloneDeep(defaultMvuData), userSelection);
    console.log('Creating character:', finalCharacterData);

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
#节日的插曲

1468DR 奈托月19日


寒风裹挟着远方炊烟的气息，在德温林平原上呼啸而过。

驿道两旁的白蜡树早已褪尽了最后一片枯叶，光秃秃的枝桠在铅灰色的天穹下交织成网。车辙碾过冻得硬邦邦的泥土路面，发出有节奏的吱呀声响，偶尔碾过一块碎石，便颠簸一下，将车厢里的乘客摇晃得东倒西歪。

"快到喽——"

赶车的老汉扬起鞭子往前方虚空里甩了个响亮的鞭花。他裹着一件看不出原本颜色的破旧羊皮袄，脖子上缠着好几圈磨得起毛的围巾。

"看见没？那边，那边——"他腾出一只手往前方指了指，"那冒烟的地方就是巴拉德雷！赶在长夜节前头到了，运气不赖！"

巴拉德雷的轮廓渐渐清晰起来。

远远望去，赭红色的屋顶层层叠叠，错落有致地铺陈在缓坡之上，像是谁打翻了一篮子熟透的苹果。炊烟从无数烟囱中袅袅升起，在半空中汇成一片朦胧的暖灰色薄纱。

"长夜节嘛，"老汉絮絮叨叨地说着，也不管车厢里的乘客是否在听，"巴拉德雷的长夜节那可是出了名的热闹。我年轻那会儿也来过一回，嚯，满大街都是唱歌的、跳舞的、耍把戏的……那个酒啊，叫什么来着……冬日香料？热乎乎的，甜丝丝的，喝一口从嗓子眼暖到脚后跟——"

他咂了咂嘴，似乎在回味几十年前的味道。

"就是贵。不过节日嘛，图个喜庆。"

马车又颠了一下。

驿道逐渐变得宽阔平整起来，路旁开始出现零星的行人。有挑着担子进城贩卖干柴的农夫，有牵着小毛驴驮着货物的行商，还有三三两两结伴而行的旅人。所有人的脸上都带着一种相似的表情——那是长途跋涉后即将抵达目的地的如释重负，也是对即将到来的节日的隐隐期待。

城门近在眼前。

两名穿着帝国制服的守卫懒洋洋地倚在门柱旁，对进进出出的人流只是随意瞥上一眼，显然今日不是仔细盘查的时候。

"哟，老帕特，又拉了一车人来凑热闹？"其中一名守卫朝赶车老汉喊道，语气里带着几分熟稔的调侃。

"可不是嘛！"老汉咧嘴一笑，露出几颗缺损的黄牙，"人家大老远来听曲儿喝酒，我就挣个脚程钱，谁也不耽误谁！"

守卫挥了挥手，示意马车通行。

穿过门洞的那一刻，寒风似乎骤然减弱了几分，取而代之的是一股夹杂着烤肉香气和酒精气息的暖流。

旅人之阶——城门内那片阶梯式的迎客区——此刻已是人声鼎沸。

这是一片依着地势修建的露天集市与客栈区，石板台阶层层向上延伸，两旁是密密麻麻的店铺、酒馆和旅店。招牌五颜六色，有的是木刻的，有的是铁艺的，还有的干脆就是在布幔上涂了几笔歪歪扭扭的字。小贩们的叫卖声此起彼伏——

"热乎的百灵鸟肉派嘞——刚出锅的——吃了嗓子亮堂——"

"冬青花环！冬青花环！姑娘小伙买一个，来年走好运咯——"

"磨剪子嘞——戗菜刀——"

空气里弥漫着烤肉、热苹果酒和新鲜面包的诱人香气。几个孩子举着冬青枝编成的花环追逐打闹，叽叽喳喳地笑闹着，险些撞上一位正在台阶上调音的吟游诗人。那诗人穿着一身打了补丁却洗得干干净净的靛蓝色斗篷，手里抱着一把略显陈旧的鲁特琴，被孩子们冲撞得差点坐倒，却也不恼，只是笑骂了一声"小兔崽子们慢点跑"，便继续拨弄琴弦。

"到喽到喽——"老帕特把马车停在一处稍微宽敞的空地上，转过身来朝车厢里招呼道，"各位客人，巴拉德雷到了！要住店的往上走，'羽笔与酒杯'最实惠，'说书人酒馆'最热闹——要吃东西呢，台阶两边多的是馆子——嘿，老乔治的炖锅，招牌猪肋骨一绝，就是名字起得邪乎，什么'F小调'、'降B'的，听不懂——"

他跳下车辕，搓了搓冻僵的双手，热情地帮乘客们卸下行李。

"祝各位长夜节愉快！要是回程还走这条道，记得找老帕特！"

石板台阶向上延伸。

${state.character.name}${state.followers.length > 1 ? '一行人' : state.followers.length == 1 ? '和' + state.followers[0].character.name : ''}循着人流往上走，穿过熙熙攘攘的人群，两旁的喧嚣声渐渐变得有些模糊，像是被什么无形的东西过滤掉了一般。倒不是真的安静下来，只是走了一天的路，耳朵和脑子都有些麻木了。

往上走不多远，一块手绘的木质招牌映入眼帘。

招牌上画着一支羽毛笔斜插在一只盛满琥珀色液体的高脚酒杯里，笔尖似乎正在酒液表面书写着什么。底下歪歪扭扭地写着几个字：

**"羽笔与酒杯"**

招牌下方还挂着一块小一号的木板，上面是今日新添的粉笔字：

*"冬日香料热酒供应中——新客免费一杯！"*
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
    if (!detail.statWithoutMeta.PlayerData.character.name) return;

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

  state.character = filterMeta(defaultEra.PlayerData.character);
  state.attributes = filterMeta(defaultEra.PlayerData.attributes);
  state.followers = Object.values(filterMeta(defaultEra.FollowerNPCData))
    .filter((v: any) => v.character)
    .map((v: any) => {
      return {
        character: filterMeta(v.character),
        attributes: filterMeta(v.attributes),
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
