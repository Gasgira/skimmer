import { forge, game, FOOD, ForgeNode } from './index.js';
import { LiteGraph } from 'lib/LiteGraph';

export class Play3DAudioForAllPlayers extends ForgeNode {
	constructor() {
		super();
		this.color = forge.nodeColor.event;

		this.properties = {
			audio: ''
		}

		this.addInput("Event", LiteGraph.ACTION);
		this.addInput("Position", forge.type.position);

    this.addOutput("Event", LiteGraph.EVENT);

		this.mode = LiteGraph.ON_EVENT;
	}

	static get title() {
		return 'Play 3D Audio For All Players';
	}
	get title() {
		return Play3DAudioForAllPlayers.title;
	}

	onAction() {
		console.log(`[Play3DAudioForAllPlayers]`, {...this.properties});
		this.triggerSlot(0);
	}
}
LiteGraph.registerNodeType("audio/Play3DAudioForAllPlayers", Play3DAudioForAllPlayers);

export class Play3DAudioForOpposingTeams extends ForgeNode {
	constructor() {
		super();
		this.color = forge.nodeColor.event;

		this.properties = {
			audio: '',
			team: 0
		}

		this.addInput("Event", LiteGraph.ACTION);
		this.addInput("Team", forge.type.team);
		this.addInput("Position", forge.type.position);

    this.addOutput("Event", LiteGraph.EVENT);

		this.mode = LiteGraph.ON_EVENT;
	}

	static get title() {
		return 'Play 3D Audio For Opposing Teams';
	}
	get title() {
		return Play3DAudioForOpposingTeams.title;
	}

	onAction() {
		console.log(`[Play3DAudioForOpposingTeams]`, {...this.properties});
		this.triggerSlot(0);
	}
}
LiteGraph.registerNodeType("audio/Play3DAudioForOpposingTeams", Play3DAudioForOpposingTeams);

export class Play3DAudioForTeam extends ForgeNode {
	constructor() {
		super();
		this.color = forge.nodeColor.event;

		this.properties = {
			audio: '',
			team: 0
		}

		this.addInput("Event", LiteGraph.ACTION);
		this.addInput("Team", forge.type.team);
		this.addInput("Position", forge.type.position);

    this.addOutput("Event", LiteGraph.EVENT);

		this.mode = LiteGraph.ON_EVENT;
	}

	static get title() {
		return 'Play 3D Audio For Team';
	}
	get title() {
		return Play3DAudioForTeam.title;
	}

	onAction() {
		console.log(`[Play3DAudioForTeam]`, {...this.properties});
		this.triggerSlot(0);
	}
}
LiteGraph.registerNodeType("audio/Play3DAudioForTeam", Play3DAudioForTeam);

export class RegisterAudioZone extends ForgeNode {
	constructor() {
		super();
		this.color = forge.nodeColor.event;

		this.addInput("Event", LiteGraph.ACTION);
		this.addInput("Area Monitor", forge.type.areaMonitor);
		this.addInput("Audio Zone Effect", forge.type.audioZoneEffect);

    this.addOutput("Event", LiteGraph.EVENT);

		this.mode = LiteGraph.ON_EVENT;
	}

	static get title() {
		return 'Register Audio Zone';
	}
	get title() {
		return RegisterAudioZone.title;
	}

	onAction() {
		console.log(`[RegisterAudioZone]`);
		this.triggerSlot(0);
	}
}
LiteGraph.registerNodeType("audio/RegisterAudioZone", RegisterAudioZone);

export class UnregisterAudioZone extends ForgeNode {
	constructor() {
		super();
		this.color = forge.nodeColor.event;

		this.addInput("Event", LiteGraph.ACTION);
		this.addInput("Area Monitor", forge.type.areaMonitor);

    this.addOutput("Event", LiteGraph.EVENT);

		this.mode = LiteGraph.ON_EVENT;
	}

	static get title() {
		return 'Unregister Audio Zone';
	}
	get title() {
		return UnregisterAudioZone.title;
	}

	onAction() {
		console.log(`[UnregisterAudioZone]`);
		this.triggerSlot(0);
	}
}
LiteGraph.registerNodeType("audio/UnregisterAudioZone", UnregisterAudioZone);

export class SetObject3DAudioLoop extends ForgeNode {
	constructor() {
		super();
		this.color = forge.nodeColor.event;

		this.addInput("Event", LiteGraph.ACTION);
		this.addInput("Object", forge.type.object);
		this.addInput("Play For Allies", forge.type.boolean);

    this.addOutput("Event", LiteGraph.EVENT);

		this.mode = LiteGraph.ON_EVENT;
	}

	static get title() {
		return 'Set Object 3D Audio Loop';
	}
	get title() {
		return SetObject3DAudioLoop.title;
	}

	onAction() {
		console.log(`[SetObject3DAudioLoop]`);
		this.triggerSlot(0);
	}
}
LiteGraph.registerNodeType("audio/SetObject3DAudioLoop", SetObject3DAudioLoop);

export class StopObject3DAudioLoop extends ForgeNode {
	constructor() {
		super();
		this.color = forge.nodeColor.event;

		this.addInput("Event", LiteGraph.ACTION);
		this.addInput("Object", forge.type.object);
		this.addInput("Stop For Allies", forge.type.boolean);
		this.addInput("Stop For Enemies", forge.type.boolean);

    this.addOutput("Event", LiteGraph.EVENT);

		this.mode = LiteGraph.ON_EVENT;
	}

	static get title() {
		return 'Stop Object 3D Audio Loop';
	}
	get title() {
		return StopObject3DAudioLoop.title;
	}

	onAction() {
		console.log(`[StopObject3DAudioLoop]`);
		this.triggerSlot(0);
	}
}
LiteGraph.registerNodeType("audio/StopObject3DAudioLoop", StopObject3DAudioLoop);