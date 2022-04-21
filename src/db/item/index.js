import { db } from 'db';
import { itemPanel } from 'db/itemPanel';
import { Component } from 'component';
import { HTML } from 'lib/HTML';

import './index.css';

export const placeholderItem = HTML.wire()`
	<button
		class='dbItem dbItemIcon dbItemPlaceholder'
		title='Loading Item...'
	>
	</button>
`;

export class Item extends Component {
	constructor(path) {
		super();
		if (!path || path.length < 10) return console.error(`[Item] Bad path ${path}`);
		const pathLowercase = path.toLowerCase();
		if (db.items.has(pathLowercase))
		{
			// console.warn('[skimmer][db.item] Duplicate', path);
			return db.items.get(pathLowercase);
		}
		this.path = pathLowercase;
		db.items.set(`${pathLowercase}`, this);

		this.renderCount = 0;
	}

	get id() {
		return this?._id ?? (this._id = db.itemPathToID(this.path));
	}

	get name() {
		if (this.isRedacted) return '[REDACTED]';
		let title = this?.data?.CommonData?.Title;
		if (title && typeof title === 'string')
		{
			return title;
		}
			else if (db.replacedInfoItems.has(this.path))
		{
			const replacedInfo = db.replacedInfoItems.get(this.path);
			if (replacedInfo.name) return replacedInfo.name;
		}
		return this.id ?? '???';
	}

	async getName() {
		await this.init();
		if (this.isRedacted) return '[REDACTED]';
		return this?.data?.CommonData?.Title ?? this.id;
	}

	async getSeasonNumber() {
		if (this?._seasonNumber) return this._seasonNumber;
		await this.init();
		const season = this?.data?.CommonData?.Season;
		if (!season || typeof season !== 'string') return (this._seasonNumber = 0);
		const split = season.split(' ');
		if (split && split?.[1]) return (this._seasonNumber = parseInt(split[1]));
		return (this._seasonNumber = 0);
	}

	get seasonNumber() {
		const season = this?.data?.CommonData?.Season;
		if (!season || typeof season !== 'string') return '0';
		const split = season.split(' ');
		if (split && split?.[1]) return parseInt(split[1]);
		return '0';
	}

	get parentPaths() {
		if (!this?.data?.CommonData?.ParentPaths?.length) return;
		return this?._parentPaths ?? (this._parentPaths = new Set([...this?.data?.CommonData?.ParentPaths.map(parent => parent?.Path)]));
	}

	get manufacturerName() {
		return db.getManufacturerByIndex(this?.data?.CommonData?.ManufacturerId ?? 0)?.ManufacturerName ?? '';
	}

	get manufacturerImage() {
		return db.getManufacturerByIndex(this?.data?.CommonData?.ManufacturerId ?? 0)?.ManufacturerLogoImage ?? '';
	}

	async init() {
		if (this.data)
		{
			await this.data;
			return this;
		}
		try {
			this.data = db.getJSON(this.path)
				.then(res => this.data = res);
			await this.data;
		} catch (error) {
			console.error(`[Item.init]`, error);
			return false;
		}
		this.renderIcon();
		return this;
	}

	async render() {
		console.warn('render', this);
	}

	async renderIcon(id, {
		itemTypeIcon = false
	} = {}) {
		await this.init();
		return HTML.wire(this, `:${id ?? 'icon'}`)`
			<button
				class=${
					`dbItem dbItemIcon ${this?.data?.CommonData?.Type ?? 'defaultType'}${
						this?.data?.CommonData?.Quality ? ` ${this?.data?.CommonData?.Quality?.toLowerCase?.() ?? ''}` : ''
						}${
						this?.data?.CommonData?.Type === 'SpartanBackdropImage' ? ' invert-hover' : ''
						}`
				}
				onclick=${() => this.showItemPanel()}
				style=${{backgroundImage: `url(/${db?.dbPath ?? 'db'}/images/${db.pathCase(this.imagePath)})`}}
				title=${this.name ?? 'item'}
			>
				<span>${this.name ?? '???'}</span>
				${itemTypeIcon ? this.renderItemTypeIcon() : ''}
				${{html: this.seasonNumber > 1 ? `<div
						class="season-icon"
						data-season="${this.seasonNumber ?? 0}"
						style="-webkit-mask-image:${`url(/seasons.svg#${this.seasonNumber ?? 0})`}"
					></div>` : ''
				}}
			</button>
		`;
	}

	get itemTypeIcons() {
		return this?._itemTypeIcons ?? (this._itemTypeIcons = new Set([
			'ArmorCoating',
			'WeaponCoating'
		]));
	}

	async renderItemTypeIcon() {
		const path = this?.data?.CommonData?.ParentPaths?.[0]?.Path ?? this?.data?.CommonData?.ParentTheme ?? '';
		const type = this?.data?.CommonData?.Type;
		if (!path || !this.itemTypeIcons.has(type)) return '';
		if (type && type === 'WeaponCoating')
		{
			const parent = await new Item(path).getImagePath();
			const imagePath = `url(/${db?.dbPath ?? 'db'}/images/${db.pathCase(parent)})`;
			return HTML.wire(this, `:itemType-${path}`)`
				<div
					class=${`item-type-icon ${this?.data?.CommonData?.Type ?? 'default-type'}`}
					style=${{webkitMaskImage: imagePath, maskImage: imagePath}}
				></div>
			`;
		}
		if (type && type === 'ArmorCoating')
		{
			let svgId = 'ArmorCoating';
			switch (path) {
				case 'Inventory/Armor/Themes/007-001-olympus-c13d0b38.json':
					svgId = 'MK7'
					break;
				case 'Inventory/Armor/Themes/007-001-reach-2564121f.json':
					svgId = 'MK5'
					break;
				case 'Inventory/Armor/Themes/007-001-samurai-55badb14.json':
					svgId = 'YOROI'
					break;
			
				default:
					break;
			}
			return HTML.wire(this, `:itemType-${performance.now()}`)`
				<div
					class=${`item-type-icon ${this?.data?.CommonData?.Type ?? 'default-type'}`}
					style=${{backgroundImage: `url(/items.svg#${svgId ?? 'default'})`}}
				></div>
			`;
		}
	}

	get imagePath() {
		let imagePath = 'progression/default/default.png';

		if (this.isRedacted) return imagePath;

		const displayPath = this?.data?.CommonData?.DisplayPath?.Media?.MediaUrl?.Path;
		if (displayPath && typeof displayPath === 'string') {
			imagePath = `${displayPath.toLowerCase().replace('.svg', '.png')}`;
		}
			else if (db.replacedInfoItems.has(this.path))
		{
			const replacedInfo = db.replacedInfoItems.get(this.path);
			if (replacedInfo.mediaPath) return replacedInfo.mediaPath;
		}
		return imagePath;
	}

	async getImagePath() {
		if (this?._imagePath) return this._imagePath;
		await this.init();
		let imagePath = 'progression/default/default.png';

		if (this.isRedacted) return imagePath;
		
		const displayPath = this?.data?.CommonData?.DisplayPath?.Media?.MediaUrl?.Path;
		if (displayPath && typeof displayPath === 'string') {
			imagePath = `${displayPath[0].toLowerCase()}${displayPath.substring(1)}`;
		}

		return (this._imagePath = imagePath);
	}

	async getParentItem() {
		if (this?._parentItem) return this._parentItem;
		if (this?.data?.CommonData?.ParentTheme)
		{
			this._parentItem = new Item(this?.data?.CommonData?.ParentTheme);
			await this._parentItem.init();
			return this._parentItem;
		}
		// const test = async path => `<a class="parentSocket" href=${`#${path}`}>${await new Item(path).getName()}</a>`
	}

	get icon() {
		return this?._icon ?? (this._icon = this.renderIcon())
	}

	showItemPanel() {
		itemPanel.displayItem(this);
	}

	get manifestItem() {
		if (this?._manifestItem) return this._manifestItem;
		const manifest = db.getItemManifestByID(this.id);
		if (manifest) return (this._manifestItem = manifest);
	}

	get lastModifiedDate() {
		if (this?._lastModifiedDate) return this._lastModifiedDate;
		if (!Array.isArray(this?.manifestItem?.touched)) return new Date('2021-11-15T20:00:00.000Z');
		
		const dateString = this?.manifestItem?.touched[this.manifestItem.touched.length-1];
		if (!Date.parse(dateString)) new Date('2021-11-15T20:00:00.000Z');

		const date = new Date(dateString);
		date.setUTCHours(20);
		return (this._lastModifiedDate = date);
	}

	get isRedacted() {
		if (this.state.userUnredacted) return false;
		if (this?._isRedacted) return this._isRedacted;
		if (db.revealHidden) return (this._isRedacted = false);

		const visibility = this.visibility;
		if (visibility.status === 'Hidden') return (this._isRedacted = true);
		if (visibility.status === 'Seen') return (this._isRedacted = false);
		return (this._isRedacted = false);
	}

	get visibility() {
		if (this?._visibility) return this._visibility;
		try {
			const manifest = this.manifestItem;
			const lastVisible = manifest?.visible;

			if (!manifest.path.startsWith('inventory'))
			{
				return (this._visibility = {
					status: 'Visible',
					date: new Date(lastVisible)
				});
			}

			const isHidden = this?.data?.CommonData.HideUntilOwned;
	
			// Now hidden, but was seen before
			if (isHidden && lastVisible) return (this._visibility = {
				status: 'Seen',
				date: new Date(lastVisible)
			})
	
			// Not hidden and has a date for first appearance
			if (!isHidden && lastVisible) return (this._visibility = {
				status: 'Visible',
				date: new Date(lastVisible)
			})
	
			return (this._visibility = {
				status: isHidden ? 'Hidden' : 'Visible',
				date: new Date('2021-11-15T20:00:00.000Z')
			})
		} catch (error) {
			return (this._visibility = {
				status: 'Hidden',
				date: new Date('2021-11-15T20:00:00.000Z')
			})
		}
	}

	unredact() {
		this.state.userUnredacted = true;
	}
}

export class Offering extends Item {
	constructor({ offering, id }) {
		if (db.items.has(id))
		{
			console.log('dupe offering', id)
			return db.items.get(id);
		}
		if (offering?.title && Array.isArray(offering.touched))
		{
			const path = `storecontent/offerings/${id}.json`;
			super(path);
			console.log('new offering', path)
			db.items.set(path, this);
			this.data = offering;
			this.path = path;
		}
	}

	async renderIcon(id, {
		itemTypeIcon = false
	} = {}) {
		await this.init();
		return HTML.wire(this, `:${id ?? 'icon'}`)`
			<button
				class=${
					`dbItem dbItemIcon offering ${this?.data?.info?.Type ?? 'defaultType'}${
						this?.data?.info?.Quality ? ` ${this?.data?.info?.Quality?.toLowerCase?.() ?? ''}` : ''
						}`
				}
				onclick=${() => this.showItemPanel()}
				style=${{backgroundImage: `url(/${db?.dbPath ?? 'db'}/images/store/${db.pathCase(this.data.offering.OfferingId)}.png)`}}
				title=${this.name ?? 'item'}
			>
				<span>${this.name ?? '???'}</span>
			</button>
		`;
	}

	get name() {
		return this.data.title || this.data?.offering?.OfferingId || 'Offering';
	}

	async getRelatedItems() {
		if (this.relatedItems) return this.relatedItems;
		const items = new Set();
		this.data.offering.IncludedItems.forEach(offeringItem => {
			if (offeringItem && offeringItem.ItemPath)
			{
				try {
					const item = new Item(offeringItem.ItemPath);
					if (item) items.add(item);
				} catch (error) {
					console.error(`[Item.Bundle] Invalid item`, error);
				}
			}
		});

		this.relatedItems = items;
		if (!items.size) console.error(`[Item.Bundle] No valid items`);
	}

	get cost() {
		// TODO extract filename as currency name
		const cost = this.data?.Prices.map(price => `${price?.Cost ?? 0}`).join(', ');
	}
	
	get lastModifiedDate() {
		const touched = this.data.touched;
		return new Date(touched[touched.length-1]);
	}
}