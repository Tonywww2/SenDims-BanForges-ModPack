ServerEvents.highPriorityData(event => {
	let jade = count => {
		let stack = $BloodJade.withKillCount(128);
		stack.setCount(count);
		return stack;
	};

	createS4MediumMythicGateway("sdbf_dr2_g1", 0x456c67, {
		normalWaves: [
			[["terra_entity:pixie", 3], ["terra_entity:spore_zombie", 3]],
			[["terra_entity:pixie", 4], ["terra_entity:granite_elemental", 2]],
			[["terra_entity:spore_skeleton", 4], ["terra_entity:possess_armor", 2]],
			[["terra_entity:pixie", 5], ["terra_entity:spore_zombie", 5]],
			[["terra_entity:granite_elemental", 4], ["terra_entity:spore_skeleton", 5]],
			[["terra_entity:possess_armor", 4], ["terra_entity:pixie", 6]]
		],
		bossIds: [
			"sdbf:deep_realm_2/terra_entity_pixie",
			"sdbf:deep_realm_2/terra_entity_possess_armor",
			"sdbf:deep_realm_2/terra_entity_granite_elemental",
			"sdbf:deep_realm_2/terra_entity_possess_armor"
		],
		perWave: {
			"slashblade:proudsoul": [2, 2, 3, 3, 3, 3, 4, 3, 4, 4],
			"slashblade:proudsoul_ingot": [0, 0, 0, 0, 1, 0, 0, 1, 0, 1],
			"kubejs:mysterious_alkali_crystal": [0, 1, 1, 1, 1, 1, 1, 1, 1, 2],
			"apotheosis:epic_material": [0, 0, 1, 0, 1, 0, 1, 0, 1, 1],
			"apotheosis:mythic_material": [0, 0, 0, 0, 0, 0, 1, 0, 0, 1]
		},
		jadeRewards: [jade(1), null, null, jade(1), null, null, jade(1), null, jade(1), jade(1)],
		completion: { "slashblade:proudsoul": 4 },
		starChart: true
	});

	Gateway.registerJson("gateways:sdbf_dr2_g2", JSON.stringify({
		type: "gateways:endless",
		size: "medium",
		color: "#456C67",
		base_wave: {
			entities: [
				{ entity: "terra_entity:pixie", count: 2 },
				{ entity: "terra_entity:granite_elemental", count: 1 },
				{ entity: "terra_entity:possess_armor", count: 1 },
				{ entity: "terra_entity:spore_zombie", count: 2 }
			],
			rewards: [
				{
					type: "gateways:stack",
					stack: { item: "slashblade:proudsoul", count: 1 }
				},
				{
					type: "gateways:experience",
					experience: 18,
					orb_size: 6
				}
			],
			max_wave_time: 1200,
			setup_time: 100
		},
		modifiers: [
			{
				application_mode: {
					type: "gateways:after_every_n_waves",
					waves: 3,
					max: 6
				},
				entities: [
					{ entity: "terra_entity:pixie", count: 1 },
					{ entity: "terra_entity:granite_elemental", count: 1 }
				],
				rewards: [
					{
						type: "gateways:stack",
						stack: { item: "kubejs:mysterious_alkali_crystal", count: 1 }
					}
				]
			},
			{
				application_mode: {
					type: "gateways:after_every_n_waves",
					waves: 5,
					max: 3
				},
				entities: [
					{ entity: "terra_entity:possess_armor", count: 1 }
				],
				modifiers: [
					{
						attribute: "generic.max_health",
						operation: "multiply_total",
						value: 0.1
					}
				],
				rewards: [
					{
						type: "gateways:stack",
						stack: { item: "slashblade:proudsoul_ingot", count: 1 }
					},
					{
						type: "gateways:stack",
						stack: { item: "apotheosis:mythic_material", count: 1 }
					},
					{
						type: "gateways:stack",
						stack: {
							item: "slashblade_sendims:blood_jade",
							count: 1,
							nbt: { "sbsd.bj.kill_count": 128 }
						}
					}
				]
			}
		],
		failures: [],
		boss_event: { mode: "name_plate" },
		spawn_algorithm: "gateways:inward_spiral"
	}));
})
