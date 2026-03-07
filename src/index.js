import { parseHTML } from 'linkedom';

const defaults = {
	tags: ['h2', 'h3', 'h4'],
	ignoredHeadings: ['[data-toc-exclude]'],
	ignoredElements: [],
	ul: false,
	wrapper: function (toc) {
		return `<nav class="toc">${toc}</nav>`;
	},
};

function getParent(prev, current) {
	if (current.level > prev.level) {
		// Child of previous.
		return prev;
	} else if (current.level === prev.level) {
		// Sibling of previous.
		return prev.parent;
	} else {
		// Above the previous.
		return getParent(prev.parent, current);
	}
}

class Item {
	/**
	 *
	 * @param {HTMLElement} el
	 * @param {*} options
	 */
	constructor(el, options) {
		this.options = options;
		if (el) {
			this.slug = el.id;
			this.text = el.textContent.trim();
			this.level = el.tagName.slice(1);
		} else {
			this.level = 0;
		}
		this.children = [];
	}

	html() {
		let markup = '';
		if (this.slug && this.text) {
			markup += `<li><a href="#${this.slug}">${this.text}</a>`;
		}
		if (this.children.length > 0) {
			markup += `${this.options.ul ? '<ul>' : '<ol>'}${this.children
				.map((item) => item.html())
				.join('\n')}${this.options.ul ? '</ul>' : '</ol>'}`;
		}

		if (this.slug && this.text) {
			markup += '</li>';
		}

		return markup;
	}
}

export class Toc {
	constructor(htmlstring = '', options = defaults) {
		this.options = { ...defaults, ...options };
		const selector = this.options.tags.join(',');
		this.root = new Item(undefined, this.options);
		this.root.parent = this.root;

		const { document } = parseHTML(htmlstring);

		let headings = Array.from(document.querySelectorAll(selector)).filter(
			(el) =>
				el.id && // Make sure heading has an ID (for linking).
				!this.options.ignoredHeadings.some(
					(ignoredHeadingSelector) =>
						el.matches(ignoredHeadingSelector), // Filter out the heading if it matches any configured ignore selectors.
				),
		);

		for (let heading of headings) {
			for (let ignoredElementMatch of heading.querySelectorAll(
				this.options.ignoredElements.join(','),
			)) {
				ignoredElementMatch.remove();
			} // Remove ignored elements from heading text content.
		}

		if (headings.length) {
			let previous = this.root;
			for (let heading of headings) {
				const current = new Item(heading, this.options);
				const parent = getParent(previous, current);
				current.parent = parent;
				parent.children.push(current);
				previous = current;
			}
		}
	}

	get() {
		return this.root;
	}

	html() {
		const { wrapper } = this.options;
		const root = this.get();

		// Only return markup if there are headings.
		return root.children.length ? wrapper(root.html()) : '';
	}
}
