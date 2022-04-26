import { HTML } from 'lib/HTML';
import { emitter } from 'eventEmitter';
import { headerNav } from 'ui/nav';
import { db } from 'db';
import { itemPanel } from 'db/itemPanel';
import { calendar } from 'ui/calendar';
import { coreViewer } from 'ui/cores';
import { inventory } from 'ui/inventory';
import { modalConstructor } from 'ui/modal';
import { privacy } from 'ui/privacy';
import { vanity } from 'pages/vanity';
import { router } from 'pages';

import './styles.css';

console.log('hello world');

class App {
	async init() {
		await db.init();

		HTML.bind(document.querySelector('.js--privacy'))`
			<span
				class="privacy-button"
				onclick=${() => modalConstructor.showView(privacy.render())}
			>Privacy</span>
		`;

		await this.handleNavigation();
		this.parseUriHash();
		
		window.addEventListener('popstate', async (event) => {
			// event?.preventDefault();
			console.log('popstate', event.state);
			if (event?.state?.path) db.showItemPanelByPath(event.state.path, true);
			emitter.emit('popstate');

			await this.handleNavigation(event);
		});
		window.addEventListener('hashchange', (event) => {
			const hash = window.location.hash?.substring?.(1);
			if (hash && typeof hash === 'string' && hash.length > 6 && hash.substring(hash.length -5) === '.json')
			{
				return db.showItemPanelByPath(hash, true);
			}

			return itemPanel.hide();
		});
	}

	async render() {
		this?.page?.render() ?? console.warn('no page...');
	}

	async handleNavigation(event) {
		return await router.route();
		// console.log('handleNavigation', this?.pathname)
		// const url = new URL(window.location);
		// const { pathname } = url;
		// console.log(`url ${url}`, pathname);

		// if (this?.pathname === pathname) return;
		// this.pathname = pathname;

		// console.log('navigating', this?.pathname)

		// if (pathname.startsWith('/vanity'))
		// {
		// 	this.page = new VanityExplorer();
		// } else {
		// 	this.page = new ItemExplorer();
		// }

		// await this.page.init();
		// this.render();
	}

	parseUriHash() {
		const hash = window.location.hash?.substring?.(1);
		if (hash && typeof hash === 'string' && hash.substring(hash.length-5, hash.length) === '.json') {
			try {
				db.showItemPanelByPath(hash, true);
			} catch (error) {
				console.error(`[skimmer][parseUri]`, error)
			}
		} else if (hash && typeof hash === 'string') {
			const el = document.querySelector(`#${hash}`);
			if (el)
			{
				el.scrollIntoView();
			}
		}
	}
}

const app = new App();
app.init();