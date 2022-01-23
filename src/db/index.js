import { Component } from 'component';
import { HTML } from 'lib/HTML';
import { settings } from 'ui/settings';

import './index.css';

class Database {
	constructor() {
		this.dbPath = 'db';
		if (settings.data.has('dbPath')) this.dbPath = settings.data.get('dbPath');
	}

	async getJSON(path) {
		console.log(`[db.get] "${path}"`);
		if (!path)
		{
			console.warn(`[db.get] Bad path! "${path}"`);
			return;
		}
		return await fetch(`/${this?.dbPath ?? 'db'}/${path}`)
			.then(response => {
				if (response.ok) return response.json();
				console.error(`[db.get] ${response.status} "${path}"`)
				return Promise.reject(response);
			});
	}

	get items() {
		return this?._items ?? (this._items = new Map());
	}

	async showItemPanelByPath(path, skipState) {
		const item = new Item(path);
		await item?.init();
		itemPanel.displayItem(item, skipState);
	}
}

export const db = new Database();



export class Item extends Component {
	constructor(path) {
		super();
		if (!path || path.length < 10) return console.error(`[Item] Bad path ${path}`);
		if (db.items.has(path))
		{
			console.warn('[halosets][db.item] Duplicate', path);
			return db.items.get(path);
		}
		this.path = path;
		db.items.set(`${path}`, this);
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
			console.log('render', this.path)
			return this.html`
				<button
					class=${`dbItem dbItemIcon${this?.data?.CommonData?.Quality ? ` ${this?.data.CommonData.Quality?.toLowerCase?.()}` : ''}`}
					onclick=${() => this.showItemPanel()}
					style=${{backgroundImage: `url(/${db?.dbPath ?? 'db'}/images/${this?.data?.CommonData?.DisplayPath?.Media?.MediaUrl?.Path})`}}
				>
					<span>${this?.data?.CommonData?.Title ?? '???'}</span>
				</button>
			`;
	}

	showItemPanel() {
		itemPanel.displayItem(this);
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
		// history.pushState(null, 'Halosets', `#`);
	}

	toggleVisibility() {
		this.setState({visible: !this.state.visible});
	}

	get history() {
		return this?._history ?? (this._history = new Set());
	}

	displayItem(item, skipState) {
		// check if is of class Item...
		this.history.add(item);
		console.log(`[ItemPanel] Displaying "${item?.path}". "${this.history.size}" items in history.`);
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
			return HTML.bind(document.querySelector('.js-item-panel'))`
				<div
					class="dbItemPanel_clickout"
					onclick=${() => this.hide()}
				></div>
				<div
					class="dbItemPanel_wrapper"
				>
					<header>
						<img src=${`db/images/${this.state.item?.data?.CommonData?.DisplayPath?.Media?.MediaUrl?.Path}`}>
						<div class=${`dbItemPanel_titles${item?.CommonData?.Quality ? ` ${item.CommonData.Quality?.toLowerCase?.()}` : ''}`}>
							<h2>${this.state.item?.data?.CommonData?.Title ?? 'Item'}</h2>
							<h3>${this.state.item?.data?.CommonData?.Description ?? '...'}</h3>
						</div>
					</header>
					<span class="dbItemPanel_path">${this.state.item?.path ?? 'UNK'}</span>
					<button
						onclick=${() => this.setState({pretty: !this.state.pretty})}
					>${this.state.pretty ? 'raw' : 'pretty'}</button>
					<pre class="dbItemPanel_json">${{html: this.state.pretty ? this.prettyJson(this.state?.item?.data ?? {}) : JSON.stringify(this.state.item?.data, null, "\t")}}</pre>
				</div>
			`;
			// <pre class="dbItemPanel_json">${JSON.stringify(this.state.item?.data, null, "\t")}</pre>
		}
		return HTML.bind(document.querySelector('.js-item-panel'))``;
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