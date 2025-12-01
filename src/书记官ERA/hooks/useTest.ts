// hooks/useTest.ts

export function useTest(mvu: any, handleMvuUpdate: Function) {
  const testFunc = () => {
    const command = `
            _.insert('FollowerNPCData','npcTest',{
				"character": {
					"$meta": {
						"extensible": true,
						"required": [
							"name",
							"level",
							"gender",
							"race"
						]
					},
					"name": "npcTest",
					"level": 1,
					"gender": "男",
					"race": ""
				},
				"status": {
					"$meta": {
						"extensible": true,
						"required": [
							"health",
							"mood",
							"arousal"
						]
					},
					"health": {
						"current": 0,
						"max": 0
					},
					"mood": {
						"current": 0,
						"max": 100
					},
					"arousal": {
						"current": 50,
						"max": 100
					}
				},
				"attributes": {
					"$meta": {
						"extensible": true,
						"required": [
							"shooting",
							"melee",
							"construction",
							"mining",
							"cooking",
							"planting",
							"animals",
							"crafting",
							"artistic",
							"medical",
							"social",
							"intellectual"
						]
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
			});
        `;
    handleMvuUpdate(command);
  };

  return {
    testFunc,
  };
}
