<template>
  <div class="opening">
    <div class="corner left-top"></div>
    <div class="corner right-top"></div>
    <div class="corner left-bottom"></div>
    <div class="corner right-bottom"></div>

    <div class="tabs">
      <button :class="{ active: activeTab === 'sys' }" @click="activeTab = 'sys'">系统设置</button>
      <button :class="{ active: activeTab === 'character' }" @click="activeTab = 'character'">创建新角色</button>
      <button :class="{ active: activeTab === 'race' }" @click="activeTab = 'race'">选择种族</button>
      <button :class="{ active: activeTab === 'attributes' }" @click="activeTab = 'attributes'">属性点分配</button>
      <button :class="{ active: activeTab === 'follower' }" @click="activeTab = 'follower'">随行NPC</button>
      <button :class="{ active: activeTab === 'initLocation' }" @click="activeTab = 'initLocation'">初始地点</button>
      <button :class="{ active: activeTab === 'confirm' }" @click="activeTab = 'confirm'">确认开局</button>
    </div>

    <div class="tab-content">
      <div class="sys-section" v-if="activeTab === 'sys'">
        <div><input type="checkbox" v-model="sys.mainStoryMode" /> 主线剧情模式</div>

        <div
          class="card"
          v-for="m in modes"
          :key="m.name"
          :class="{ selected: selectedMode === m.name }"
          @click="selectedMode = m.name"
        >
          <h3>{{ m.name }}</h3>
          <p>{{ m.description }}</p>
        </div>
      </div>

      <div v-if="activeTab === 'character'">
        <div class="form-section">
          <div class="form-grid">
            <div class="form-group">
              <label for="name">名字:</label>
              <input type="text" id="name" v-model="state.character.name" placeholder="输入你的名字" />
            </div>

            <div class="form-group">
              <label for="gender">性别:</label>
              <select id="gender" v-model="state.character.gender">
                <option v-for="g in genders" :key="g" :value="g">{{ g }}</option>
              </select>
            </div>
            <div class="form-group">
              <label for="height">身高:</label>
              <input type="text" id="height" v-model="state.character.height" placeholder="例如: 185cm" />
            </div>
            <div class="form-group">
              <label for="build">体型:</label>
              <select id="build" v-model="state.character.build">
                <option v-for="b in builds" :key="b" :value="b">{{ b }}</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label for="appearance">外貌:</label>
            <textarea id="appearance" v-model="state.character.appearance" placeholder="描述角色的外貌"></textarea>
          </div>
          <div class="form-group">
            <label for="personality">性格:</label>
            <textarea id="personality" v-model="state.character.personality" placeholder="描述角色的性格"></textarea>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'race'">
        <div class="race-selection">
          <div
            class="card"
            v-for="r in races"
            :key="r.name"
            :class="{ selected: state.character.race === r.name }"
            @click="state.character.race = r.name"
          >
            <h3>{{ r.name }}</h3>
            <p>{{ r.description }}</p>
            <p class="card-bonuses">
              <span v-for="(bonus, attr) in raceBonuses[r.name]" :key="attr" class="bonus-item">
                {{ attributeLabels[attr] }}: +{{ bonus }}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div class="attributes-section" v-if="activeTab === 'attributes'">
        <h2>剩余点数: {{ availablePoints }}</h2>
        <ul>
          <li v-for="(value, key) in state.attributes" :key="key">
            <span class="attribute-name">{{ attributeLabels[key] }}:</span>
            <div class="attribute-controls">
              <button @click="decreaseAttribute(key)" :disabled="value <= baseAttributes[key]">-</button>
              <span class="attribute-value">{{ value }}</span>
              <button @click="increaseAttribute(key)" :disabled="availablePoints <= 0">+</button>
            </div>
          </li>
        </ul>
      </div>

      <div v-if="activeTab === 'follower'">
        <div class="follower-section">
          <div class="follower-header">添加随行NPC<button @click="addFollower">+</button></div>

          <div v-for="(follower, index) in state.followers" :key="index" class="follower-card">
            <div class="follower-header">
              随行NPC {{ index + 1 }} <button @click="removeFollower(index)">删除</button>
            </div>
            <div class="form-grid">
              <div class="form-group">
                <label>名字:</label>
                <input type="text" v-model="follower.character.name" />
              </div>
              <div class="form-group">
                <label>性别:</label>
                <select v-model="follower.character.gender">
                  <option v-for="g in genders" :key="g" :value="g">{{ g }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>种族:</label>
                <select v-model="follower.character.race">
                  <option v-for="r in races" :key="r.name" :value="r.name">{{ r.name }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>身高:</label>
                <input type="text" v-model="follower.character.height" />
              </div>
              <div class="form-group">
                <label>体型:</label>
                <select v-model="follower.character.build">
                  <option v-for="b in builds" :key="b" :value="b">{{ b }}</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>外貌:</label>
              <textarea v-model="follower.character.appearance"></textarea>
            </div>
            <div class="form-group">
              <label>性格:</label>
              <textarea v-model="follower.character.personality"></textarea>
            </div>

            <div class="follower-header">属性</div>
            <div class="attributes-section">
              <ul>
                <li v-for="(value, key) in follower.attributes" :key="key">
                  <span class="attribute-name">{{ attributeLabels[key] }}:</span>
                  <div class="attribute-controls">
                    <button @click="follower.attributes[key]--">-</button>
                    <span class="attribute-value">{{ value }}</span>
                    <button @click="follower.attributes[key]++">+</button>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'initLocation'">
        <MapSelector
          v-model:coordinate-helper-mode="coordinateHelperMode"
          :show-helper-checkbox="true"
          @point-selected="handlePointSelected"
          @coordinates-clicked="handleCoordinatesClicked"
        />
      </div>

      <div v-if="activeTab === 'confirm'">
        <p style="white-space: pre-line" v-html="openingConfirmText"></p>
        <p style="white-space: pre-line" v-html="fixedOpeningText"></p>

        <div class="actions">
          <button class="create-button" @click="createCharacter">创建角色</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import MapSelector from '../书记官ERA/components/MapSelector.vue';
import { useCharacterCreation } from './useCharacterCreation';

const coordinateHelperMode = ref(false);
const lastClickedCoords = ref<{ x: number; y: number } | null>(null);

const activeTab = ref('character');

const defaultMvuData: any = JSON.parse(`{
    "PlayerData": {
        "$meta": {
            "necessary": "self",
            "updatable": true
        },
        "character": {
            "$meta": {
                "necessary": "all",
                "updatable": true
            },
            "name": "",
            "level": 1,
            "gender": "",
            "race": "",
            "height": "",
            "build": "",
            "appearance": "",
            "personality": ""
        },
        "status": {
            "$meta": {
                "necessary": "all",
                "updatable": true
            },
            "health": {
                "current": 12,
                "max": 12
            },
            "mood": {
                "current": 80,
                "max": 100
            },
            "arousal": {
                "current": 50,
                "max": 100
            }
        },
        "attributes": {
            "$meta": {
                "necessary": "all",
                "updatable": true
            },
            "shooting": 0,
            "melee": 0,
            "construction": 0,
            "mining": 0,
            "cooking": 0,
            "planting": 0,
            "animals": 0,
            "crafting": 0,
            "artistic": 0,
            "medical": 0,
            "social": 0,
            "intellectual": 0
        },
        "equipment": {
            "leftHand": "none",
            "rightHand": "none",
            "outfit": "none",
            "outfitContent": "none"
        },
        "progress": {
            "$meta": {
                "necessary": "self",
                "updatable": true
            },
            "questPhase": "",
            "currentQuest": {
                "$meta": {
                    "updatable": true
                },
                "$template": {
                    "name": "[任务名称]",
                    "description": "",
                    "isMain": false,
                    "$meta": {
                        "updatable": true
                    }
                }
            },
            "nextQuest": {
                "$meta": {
                    "necessary": "self",
                    "updatable": true
                },
                "$template": {
                    "name": "[任务名称]",
                    "description": "",
                    "isMain": false,
                    "$meta": {
                        "updatable": true
                    }
                }
            },
            "pendingQuest": {
                "$meta": {
                    "necessary": "self",
                    "updatable": true
                },
                "$template": {
                    "name": "[任务名称]",
                    "description": "",
                    "isMain": false,
                    "$meta": {
                        "updatable": true
                    }
                }
            },
            "completedQuest": {
                "$meta": {
                    "necessary": "self",
                    "updatable": true
                },
                "$template": {
                    "name": "[任务名称]",
                    "description": "",
                    "isMain": false,
                    "$meta": {
                        "updatable": true
                    }
                }
            },
            "partyExperience": {
                "current": 0,
                "max": 100
            },
            "partyAttrPoints": 0
        },
        "settings": {
            "$meta": {
                "necessary": "self",
                "updatable": true
            },
            "date": "",
            "time": "",
            "weather": "",
            "currentRegion": "",
            "currentLocation": "",
            "nearbyNPC": {
                "$meta": {
                    "updatable": true
                },
                "$template": {
                    "character": {
                        "name": "[角色名称]",
                        "level": "[角色等级]",
                        "gender": "[性别]",
                        "race": "[种族]",
                        "height": "[身高]",
                        "build": "[体型]",
                        "appearance": "[外貌]",
                        "personality": "[性格]"
                    },
                    "attributes": {
                        "$meta": {
                            "necessary": "all",
                            "updatable": true
                        },
                        "shooting": 0,
                        "melee": 0,
                        "construction": 0,
                        "mining": 0,
                        "cooking": 0,
                        "planting": 0,
                        "animals": 0,
                        "crafting": 0,
                        "artistic": 0,
                        "medical": 0,
                        "social": 0,
                        "intellectual": 0
                    },
                    "meta": {
                        "relationship": "陌生人",
                        "favorability": 0,
                        "favorabilityTowardsNPCs": {
                            "$meta": {
                                "updatable": true
                            }
                        },
                        "description": "[简要描述]"
                    },
                    "$meta": {
                        "updatable": true
                    }
                }
            },
            "factionPrestige": {
                "$meta": {
                    "updatable": true
                },
                "$template": {
                    "name": "[阵营名称]",
                    "description": "[简要描述]",
                    "favorability": 0,
                    "$meta": {
                        "updatable": true
                    }
                }
            },
            "bestiary": {
                "$meta": {
                    "updatable": true
                },
                "$template": {
                    "name": "[异怪名称]",
                    "description": "[异怪描述]",
                    "habitat": "[栖息地]",
                    "weaknesses": "[已知弱点]",
                    "knownInfo": "[已知信息]",
                    "killCount": 0,
                    "$meta": {
                        "updatable": true
                    }
                }
            },
            "anecdotes": {
                "$meta": {
                    "updatable": true
                },
                "$template": {
                    "name": "[趣闻名称]",
                    "description": "[趣闻描述]",
                    "location": "[发生地点]",
                    "charactersInvolved": "[相关人物]",
                    "knownInfo": "[已知信息]",
                    "$meta": {
                        "updatable": true
                    }
                }
            }
        }
    },
    "PlayerDynamicData": {
        "$meta": {
            "necessary": "self",
            "updatable": true
        },
        "inventory": {
            "$meta": {
                "updatable": true
            },
            "$template": {
                "name": "",
                "description": "",
                "tier": "basic",
                "quality": "common",
                "type": "item",
                "slot": "",
                "$meta": {
                    "updatable": true
                }
            }
        },
        "clothingAttributes": {
            "$meta": {
                "necessary": "all",
                "updatable": true
            },
            "defense": 0,
            "comfort": 0,
            "warmth": 0,
            "social": 0,
            "weight": 0
        },
        "gold": 100
    },
    "FollowerNPCData": {
        "$meta": {
            "updatable": true
        },
        "$template": {
            "character": {
                "$meta": {
                    "necessary": "all",
                    "updatable": true
                },
                "name": "[名字]",
                "level": 1,
                "gender": "[性别]",
                "race": "[种族]",
                "height": "[身高]",
                "build": "[体型]",
                "appearance": "[外貌]",
                "personality": "[性格]"
            },
            "status": {
                "$meta": {
                    "necessary": "all",
                    "updatable": true
                },
                "health": {
                    "current": 12,
                    "max": 12
                },
                "mood": {
                    "current": 50,
                    "max": 100
                },
                "arousal": {
                    "current": 50,
                    "max": 100
                }
            },
            "attributes": {
                "$meta": {
                    "necessary": "all",
                    "updatable": true
                },
                "shooting": 0,
                "melee": 0,
                "construction": 0,
                "mining": 0,
                "cooking": 0,
                "planting": 0,
                "animals": 0,
                "crafting": 0,
                "artistic": 0,
                "medical": 0,
                "social": 0,
                "intellectual": 0
            },
            "equipment": {
              "leftHand": "none",
              "rightHand": "none",
              "outfit": "none",
              "outfitContent": "none"
            },
            "meta": {
                "relationship": "同伴",
                "favorability": 50,
                "favorabilityTowardsNPCs": {
                    "$meta": {
                        "updatable": true
                    }
                },
                "description": "[简要描述]"
            },
            "$meta": {
                "updatable": true
            }
        }
    },
    "Wardrobe": {
        "ownedOutfits": {
            "$meta": {
                "updatable": true
            },
            "$template": {
                "name": "初始套装",
                "type": "casual",
                "description": "[套装描述]",
                "wearer": null,
                "slots": {
                    "head": null,
                    "bodyInner": null,
                    "bodyArmor": null,
                    "hands": null,
                    "legsInner": null,
                    "legsArmor": null,
                    "feet": null,
                    "cloak": null,
                    "neck": null,
                    "ring": null,
                    "belt": null,
                    "extra": []
                },
                "$meta": {
                    "updatable": true
                }
            }
        }
    },
    "ArchivedData":{
        "factionPrestige": {
            "$meta": {
                "updatable": true
            },
            "$template": {
                "name": "[阵营名称]",
                "description": "[简要描述]",
                "prestige": 0,
                "$meta": {
                    "updatable": true
                }
            }
        },
        "bestiary": {
            "$meta": {
                "updatable": true
            },
            "$template": {
                "name": "[异怪名称]",
                "description": "[异怪描述]",
                "habitat": "[栖息地]",
                "weaknesses": "[已知弱点]",
                "knownInfo": "[已知信息]",
                "killCount": 0,
                "$meta": {
                    "updatable": true
                }
            }
        },
        "anecdotes": {
            "$meta": {
                "updatable": true
            },
            "$template": {
                "name": "[趣闻名称]",
                "description": "[趣闻描述]",
                "location": "[发生地点]",
                "charactersInvolved": "[相关人物]",
                "knownInfo": "[已知信息]",
                "$meta": {
                    "updatable": true
                }
            }
        }
    },
    "System": {
        "mainStoryMode": true,
        "$meta": {
            "updatable": true
        }
    }
}`);

const {
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
} = useCharacterCreation(defaultMvuData);

const handlePointSelected = (regionName: string) => {
  state.character.location = regionName;
};

const handleCoordinatesClicked = (coords: { x: number; y: number }) => {
  lastClickedCoords.value = coords;
};
</script>
