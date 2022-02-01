import { Component } from 'component';
import { HTML } from 'lib/HTML';
import { settings } from 'ui/settings';

import './index.css';

class Database {
	constructor() {
		this.dbPath = 'db';
		if (settings.data.has('dbPath')) this.dbPath = settings.data.get('dbPath');
		if (settings.data.has('pathCasing')) this.pathCasing = settings.data.get('pathCasing');

		// TODO get manufacturer info
		// metadata/metadata.json
	}

	async init() {
		const metadataPath = 'metadata/metadata.json';
		this.metadata = await this.getJSON(metadataPath)
			.catch(error => {
				console.warn(`[skimmer] metadata did not load...`, error);
				this.metadata = {}
			});
	}

	async getJSON(path) {
		// console.log(`[db.get] "${path}"`);
		if (!path)
		{
			console.warn(`[db.get] Bad path! "${path}"`);
			return;
		}
		
		return await fetch(`/${this?.dbPath ?? 'db'}/${this.pathCase(path)}`)
			.then(response => {
				if (response.ok) return response.json();
				console.error(`[db.get] ${response.status} "${this.pathCase(path)}"`)
				return Promise.reject(response);
			});
	}

	get items() {
		return this?._items ?? (this._items = new Map());
	}

	get manufacturers() {
		if (!this.metadata) return new Map();
		return this?._manufacturers ?? (this._manufacturers = new Map(
			this?.metadata?.Manufacturers.map((properties, index) => [index, properties])
		))
	}

	getManufacturerByIndex(index) {
		const defaultMan = {
			"ManufacturerName": "",
			"ManufacturerLogoImage": ""
		}
		if (!index || index === 0) return defaultMan;
		if (this.manufacturers.has(index)) return this.manufacturers.get(index);
		return defaultMan;
	}

	get itemTypes() {
		return this?._types ?? (this._types = new Map([
			['ArmorCoating', 'Coating, Armor'],
			['ArmorHelmet', 'Helmet'],
			['ArmorHelmetAttachment', 'Helmet Attachment'],
			['ArmorVisor', 'Visor'],
			['ArmorLeftShoulderPad', 'Shoulder, Left'],
			['ArmorRightShoulderPad', 'Shoulder, Right'],
			['ArmorGlove', 'Gloves'],
			['ArmorChestAttachment', 'Chest Attachment'],
			['ArmorKneePad', 'Knee Pads'],
			['ArmorWristAttachment', 'Wrist Attachment'],
			['ArmorHipAttachment', 'Hip Attachment'],
			['ArmorEmblem', 'Emblem, Armor'],
			['ArmorFx', 'Armor Effects'],
			['ArmorMythicFx', 'Mythic Effects'],
			['ArmorTheme', 'Theme, Armor'],
			['ArmorCore', 'Core, Armor'],
			['SpartanActionPose', 'Stance'],
			['SpartanBackdropImage', 'Backdrop'],
			['SpartanEmblem', 'Emblem, Player'],
			['WeaponCharm', 'Weapon Charm'],
			['WeaponCoating', 'Coating, Weapon'],
			['WeaponDeathFx', 'Weapon Death Effect'],
			['WeaponEmblem', 'Emblem, Weapon'],
			['WeaponTheme', 'Theme, Weapon'],
			['WeaponCore', 'Core, Weapon'],
			['WeaponAlternateGeometryRegion', 'Weapon Model'],
			['VehicleAlternateGeometryRegion', 'Vehicle Model'],
			['VehicleCoating', 'Coating, Vehicle'],
			['VehicleEmblem', 'Emblem, Vehicle'],
			['VehicleTheme', 'Theme, Vehicle'],
			['VehicleCore', 'Core, Vehicle'],
			['HelmetAttachments', 'Helmet Attachments'],
			['LeftShoulderPads', 'Shoulder, Left'],
			['RightShoulderPads', 'Shoulder, Right'],
			['KneePads', 'Knee Pads'],
			['ChestAttachments', 'Chest Attachments'],
			['WristAttachments', 'Wrist Attachments'],
			['HipAttachments', 'Hip Attachments'],
			['WeaponCharms', 'Weapon Charms'],
			['DeathFx', 'Death Effects'],
			['AlternateGeometryRegions', 'Models'],
			['MythicFx', 'Mythic Effects'],
			['AiColor', 'AI Color'],
			['AiModel', 'AI Model'],
			['AiTheme', 'Theme, AI'],
			['AiCore', 'Core, AI']
		]))
	}

	getItemType(name) {
		if (name && this.itemTypes.has(name)) return this.itemTypes.get(name);
		return name;
	}

	async showItemPanelByPath(path, skipState) {
		const item = new Item(path);
		await item?.init();
		itemPanel.displayItem(item, skipState);
	}

	pathCase(path) {
		if (!path || typeof path !== 'string') return '';
		return `${(this?.pathCasing ?? true) ? path.toLowerCase() : path}`
	}
}

export const db = new Database();



export class Item extends Component {
	constructor(path) {
		super();
		if (!path || path.length < 10) return console.error(`[Item] Bad path ${path}`);
		if (db.items.has(path))
		{
			// console.warn('[skimmer][db.item] Duplicate', path);
			return db.items.get(path);
		}
		this.path = path;
		db.items.set(`${path}`, this);
	}

	get name() {
		return this?.data?.CommonData?.Title ?? '???';
	}

	async getName() {
		if (!this.data) await this.init();
		return this?.data?.CommonData?.Title ?? '???';
	}

	get parentPaths() {
		if (!this?.data?.CommonData?.ParentPaths?.length) return;
		return this?._parentPaths ?? (this._parentPaths = new Set([...this?.data?.CommonData?.ParentPaths.map(parent => parent?.Path)]));
	}

	get manufacturerName() {
		return db.getManufacturerByIndex(this?.data?.CommonData?.ManufacturerId)?.ManufacturerName ?? '';
	}

	get manufacturerImage() {
		return db.getManufacturerByIndex(this?.data?.CommonData?.ManufacturerId)?.ManufacturerLogoImage ?? '';
	}

	get defaultState() {
		return {
			expand: false
		};
	}

	async init() {
		if (this.data) return this;
		try {
			this.data = await db.getJSON(this.path);
		} catch (error) {
			console.error(`[Item.init]`, error)
		}
		return this;
	}

	async render() {
			if (!this.data) await this.init();
			let imagePath = '';
			const displayPath = this?.data?.CommonData?.DisplayPath?.Media?.MediaUrl?.Path;
			if (displayPath && typeof displayPath === 'string') {
				imagePath = `${displayPath[0].toUpperCase()}${displayPath.substring(1)}`;
			}
			// console.log('render', this.path)
			return this.html`
				<button
					class=${`item dbItemIcon${this?.data?.CommonData?.Quality ? ` ${this?.data.CommonData.Quality?.toLowerCase?.()}` : ''}`}
					onclick=${() => this.showItemPanel()}
					style=${{backgroundImage: `url(/${db?.dbPath ?? 'db'}/images/${db.pathCase(imagePath)})`}}
				>
					<span>${this?.data?.CommonData?.Title ?? '???'}</span>
				</button>
			`;
	}

	async renderIcon(id) {
		if (!this.data) await this.init();
		// let imagePath = '';
		// const displayPath = this?.data?.CommonData?.DisplayPath?.Media?.MediaUrl?.Path;
		// if (displayPath && typeof displayPath === 'string') {
		// 	imagePath = `${displayPath[0].toUpperCase()}${displayPath.substring(1)}`;
		// }
		// console.info(`[skimmer][item:icon]`, this.path)
		return HTML.wire(this, `:${id ?? 'icon'}`)`
			<button
				class=${
					`dbItem dbItemIcon${
						this?.data?.CommonData?.Quality ? ` ${this?.data?.CommonData?.Quality?.toLowerCase?.() ?? ''}` : ''
						}${
						this?.data?.CommonData?.Type === 'SpartanBackdropImage' ? ' invert-hover' : ''
					}`
				}
				onclick=${() => this.showItemPanel()}
				style=${{backgroundImage: `url(/${db?.dbPath ?? 'db'}/images/${db.pathCase(this.imagePath)})`}}
			>
				<span>${this.name ?? '???'}</span>
			</button>
		`;
	}

	get imagePath() {
		let imagePath = '';
		const displayPath = this?.data?.CommonData?.DisplayPath?.Media?.MediaUrl?.Path;
		if (displayPath && typeof displayPath === 'string') {
			imagePath = `${displayPath[0].toLowerCase()}${displayPath.substring(1)}`;
		}

		return imagePath;
	}

	get icon() {
		return this?._icon ?? (this._icon = this.renderIcon())
	}

	showItemPanel() {
		itemPanel.displayItem(this);
	}
}

export class CurrencyItem extends Item {
	get currencies() {
		return this?._currencies ?? (this._currencies = new Map([
			['currency/currencies/rerollcurrency.json', {
				mediaPath: 'progression/currencies/1104-000-data-pad-e39bef84-sm.png',
				name: 'Challenge Swap'
			}],
			['currency/currencies/xpgrant.json', {
				mediaPath: 'progression/currencies/1102-000-xp-grant-c77c6396-sm.png',
				name: 'XP Grant'
			}],
			['currency/currencies/xpboost.json', {
				mediaPath: 'progression/currencies/1103-000-xp-boost-5e92621a-sm.png',
				name: 'XP Boost'
			}],
			['currency/currencies/cr.json', {
				mediaPath: 'progression/Default/default.png',
				name: 'cR'
			}]
		]))
	}

	get currency() {
		const path = this.path.toLowerCase();
		if (this.currencies.has(path)) return this.currencies.get(path);
		return {
			mediaPath: 'progression/Default/default.png',
			name: 'Unknown Currency'
		}
	}

	get name() {
		return this.currency.name;
	}

	get imagePath() {
		return this.currency.mediaPath;
	}
}

class ItemPanel extends Component {
	get defaultState() {
		return {
			visible: false,
			item: {},
			pretty: true
		};
	}

	show() {
		this.setState({visible: true});
	}

	hide() {
		this.setState({visible: false});
		history.pushState(null, 'Halosets', `.`);
	}

	toggleVisibility() {
		this.setState({visible: !this.state.visible});
	}

	get history() {
		return this?._history ?? (this._history = new Set());
	}

	displayItem(item, skipState) {
		// check if is of class Item...
		// this.history.add(item);
		// console.log(`[ItemPanel] Displaying "${item?.path}". "${this.history.size}" items in history.`);
		if (skipState) {
			history.replaceState({path: `${item?.path}`}, `Halosets`, `#${item?.path}`);
		} else {
			history.pushState({path: `${item?.path}`}, `Halosets`, `#${item?.path}`);
		}
		
		this.setState({
			item,
			visible: true
		});
	}

	render() {
		if (this.state.visible) {
			const item = this.state.item.data;

			let imagePath = '';
			const displayPath = item?.CommonData?.DisplayPath?.Media?.MediaUrl?.Path;
			if (displayPath && typeof displayPath === 'string') {
				imagePath = `${displayPath[0].toUpperCase()}${displayPath.substring(1)}`;
			}

			return HTML.bind(document.querySelector('.js--item-panel'))`
				<div
					class="dbItemPanel_clickout"
					onclick=${() => this.hide()}
				></div>
				<div
					class="dbItemPanel_wrapper"
				>
					<header>
						<div
							class="item-img"
							style=${{backgroundImage: `url(/${db?.dbPath ?? 'db'}/images/${db.pathCase(imagePath)})`}}
						></div>
						<div class=${`dbItemPanel_titles${item?.CommonData?.Quality ? ` ${item.CommonData.Quality?.toLowerCase?.()}` : ''}`}>
							<h2>${this.state.item?.data?.CommonData?.Title ?? 'Item'}</h2>
							<h3>${this.state.item?.data?.CommonData?.Description ?? '...'}</h3>
						</div>
					</header>
					<div class="item-info_wrapper">
						<div class="item-badges">
							<div class="badge">
								<span>${this.state.item?.data?.CommonData?.Season ?? ''}</span>
							</div>
							<div class="badge">
								<div
									class="badge-svg"
									data-icon=${this.state.item?.data?.CommonData?.Type ?? 'default'}
									style=${{backgroundImage: `url(items.svg#${this.state.item?.data?.CommonData?.Type ?? 'default'})`}}
								></div>
								<span class="badge">${db.getItemType(this.state.item?.data?.CommonData?.Type) ?? ''}</span>
							</div>
							<div class="badge">
								<div
									class="badge-icon"
									style=${{backgroundImage: `url(/${db?.dbPath ?? 'db'}/images/${db.pathCase(this.state.item?.manufacturerImage)})`}}
								></div>
								<span class="badge">${this.state.item?.manufacturerName ?? ''}</span>
							</div>
						</div>
						<span class="attribute">${this.state.item?.data?.CommonData?.CustomAvailability ?? null}</span>
						<span class="attribute">
							${this.state.item?.parentPaths ? `Applies to: ` : ''}
							${[...this.state.item?.parentPaths ?? []].map(async path => `<a class="parentSocket" href=${`#${path}`}>${await new Item(path).getName()}</a>`)}
						</span>
					</div>
					<div class="json-info_wrapper">
						<span class="dbItemPanel_path">Share link: <a href=${`#${this.state.item?.path ?? ''}`}>${this.state.item?.path ?? 'UNK'}</a></span>
						<button
							onclick=${() => this.setState({pretty: !this.state.pretty})}
						>${this.state.pretty ? 'raw' : 'pretty'}</button>
					</div>
					<pre class="dbItemPanel_json">${{html: this.state.pretty ? this.prettyJson(this.state?.item?.data ?? {}) : JSON.stringify(this.state.item?.data, null, "\t")}}</pre>
				</div>
			`;
			// <pre class="dbItemPanel_json">${JSON.stringify(this.state.item?.data, null, "\t")}</pre>
									// style=${{"maskImage": `url("/assets/icons.svg")`}}
		}
		return HTML.bind(document.querySelector('.js--item-panel'))``;
	}

	prettyJson(json) {
		return JSON.stringify(json, (key, value) => {
			if (typeof value === 'string' && value.length > 10 && value.substring(value.length -5) === '.json')
			{
				return `<a href=${`#${value}`}>${value}</a>`;
			}
			return value;
		}, '\t');
	}
}

const itemPanel = new ItemPanel();
itemPanel.render();