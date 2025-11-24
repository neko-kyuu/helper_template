<template>
	<div class="opening">
		<div class="corner left-top"></div>
		<div class="corner right-top"></div>
		<div class="corner left-bottom"></div>
		<div class="corner right-bottom"></div>

		<div class="tabs">
			<button :class="{ active: activeTab === 'character' }" @click="activeTab = 'character'">创建新角色</button>
			<button :class="{ active: activeTab === 'race' }" @click="activeTab = 'race'">选择种族</button>
			<button :class="{ active: activeTab === 'attributes' }" @click="activeTab = 'attributes'">属性点分配</button>
			<button :class="{ active: activeTab === 'initLocation' }" @click="activeTab = 'initLocation'">初始地点</button>
			<button :class="{ active: activeTab === 'confirm' }" @click="activeTab = 'confirm'">确认开局</button>
		</div>

		<div class="tab-content">
			<div v-if="activeTab === 'character'">
				<h1>基础信息</h1>

				<div class="form-section">
					<div class="form-grid">
						<div class="form-group">
							<label for="name">名字:</label>
							<input type="text" id="name" v-model="character.name" placeholder="输入你的名字" />
						</div>

						<div class="form-group">
							<label for="gender">性别:</label>
							<select id="gender" v-model="character.gender">
								<option v-for="g in genders" :key="g" :value="g">{{ g }}</option>
							</select>
						</div>
						<div class="form-group">
							<label for="height">身高:</label>
							<input type="text" id="height" v-model="character.height" placeholder="例如: 185cm" />
						</div>
						<div class="form-group">
							<label for="build">体型:</label>
							<select id="build" v-model="character.build">
								<option v-for="b in builds" :key="b" :value="b">{{ b }}</option>
							</select>
						</div>
					</div>
					<div class="form-group">
						<label for="appearance">外貌:</label>
						<textarea id="appearance" v-model="character.appearance" placeholder="描述角色的外貌"></textarea>
					</div>
					<div class="form-group">
						<label for="personality">性格:</label>
						<textarea id="personality" v-model="character.personality" placeholder="描述角色的性格"></textarea>
					</div>
				</div>
			</div>

			<div v-if="activeTab === 'race'">
				<h1>选择种族</h1>
				<div class="race-selection">
					<div
						class="race-card"
						v-for="r in races"
						:key="r.name"
						:class="{ selected: character.race === r.name }"
						@click="character.race = r.name"
					>
						<h3>{{ r.name }}</h3>
						<p>{{ r.description }}</p>
						<p class="race-bonuses">
							<span v-for="(bonus, attr) in raceBonuses[r.name]" :key="attr" class="bonus-item">
								{{ attributeLabels[attr] }}: +{{ bonus }}
							</span>
						</p>
					</div>
				</div>
			</div>

			<div class="attributes-section" v-if="activeTab === 'attributes'">
				<h2>属性点分配 (剩余点数: {{ availablePoints }})</h2>
				<ul>
					<li v-for="(value, key) in attributes" :key="key">
						<span class="attribute-name">{{ attributeLabels[key] }}:</span>
						<div class="attribute-controls">
							<button @click="decreaseAttribute(key)" :disabled="value <= baseAttributes[key]">-</button>
							<span class="attribute-value">{{ value }}</span>
							<button @click="increaseAttribute(key)" :disabled="availablePoints <= 0">+</button>
						</div>
					</li>
				</ul>
			</div>

            <div v-if="activeTab === 'initLocation'">
                <h1>选择初始地点</h1>
                <div class="map-controls">
                    <label>
                        <input type="checkbox" v-model="coordinateHelperMode" />
                        坐标拾取模式
                    </label>
                    <span v-if="lastClickedCoords">
                        最后点击的坐标: { x: {{ lastClickedCoords.x }}, y: {{ lastClickedCoords.y }} }
                    </span>
                </div>
                <MapSelector
                    :coordinate-helper-mode="coordinateHelperMode"
                    @point-selected="handlePointSelected"
                    @coordinates-clicked="handleCoordinatesClicked"
                />
                <div v-if="character.location && !coordinateHelperMode">
                    你选择的地点是: {{ character.location }}
                </div>
            </div>

			<div v-if="activeTab === 'confirm'">
                <p style="white-space: pre-line;" v-html="openingConfirmText"></p>
                <p style="white-space: pre-line;" v-html="fixedOpeningText"></p>

                <div class="actions">
				    <button class="create-button" @click="createCharacter">创建角色</button>
			    </div>
            </div>
		</div>

	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import MapSelector from './MapSelector.vue';
import { useCharacterCreation } from './useCharacterCreation';

const coordinateHelperMode = ref(false);
const lastClickedCoords = ref<{ x: number; y: number } | null>(null);

const activeTab = ref('character');

const defaultMvuData:any = JSON.parse(`{
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
        "equipment": {
            "leftHand": "none",
            "rightHand": "none",
            "body": "initalSet"
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
        },
        "currentOutfit": null
    }
}`)

const {
	character,
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
    fixedOpeningText
} = useCharacterCreation(defaultMvuData);

const handlePointSelected = (regionName: string) => {
    character.location = regionName;
};

const handleCoordinatesClicked = (coords: { x: number; y: number }) => {
    lastClickedCoords.value = coords;
};


</script>