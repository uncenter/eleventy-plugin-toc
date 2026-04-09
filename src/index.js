// @ts-check

import { parseHTML } from 'linkedom';

/**
 * @typedef {Object} Options
 * @property {Array<string>} tags - Heading tags (levels) to include.
 * @property {Array<string>} ignoredHeadings - List of selectors to ignore for matched headings.
 * @property {Array<string>} ignoredElements - List of selectors for elements to ignore inside headings.
 * @property {boolean} ul - Use an unordered list instead of an ordered list.
 * @property {(toc: string) => string} wrapper - Wrapper function around the generated table of contents.
 */

/** @type {Options} */
const defaults = {
	tags: ['h2', 'h3', 'h4'],
	ignoredHeadings: ['[data-toc-exclude]'],
	ignoredElements: [],
	ul: false,
	wrapper: function (toc) {
		return `<nav class="toc">${toc}</nav>`;
	},
};

/**
 *
 * @param {Item} prev
 * @param {Item} current
 * @returns {Item}
 */
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
	 * @param {Element | undefined} el
	 * @param {Item | undefined} previous
	 * @param {Options} options
	 */
	constructor(el, previous, options) {
		this.options = options;
		if (el) {
			this.slug = el.id;
			this.content = el.innerHTML.trim();
			this.level = el.tagName.slice(1);
		} else {
			this.level = 0;
		}
		/**
		 * @type {Item}
		 * @public
		 */
		this.parent = previous ? getParent(previous, this) : this;
		/**
		 * @type {Array<Item>}
		 * @public
		 */
		this.children = [];
	}

	html() {
		let markup = '';
		if (this.slug && this.content) {
			markup += `<li><a href="#${this.slug}">${this.content}</a>`;
		}
		if (this.children.length > 0) {
			markup += `${this.options.ul ? '<ul>' : '<ol>'}${this.children
				.map((item) => item.html())
				.join('\n')}${this.options.ul ? '</ul>' : '</ol>'}`;
		}

		if (this.slug && this.content) {
			markup += '</li>';
		}

		return markup;
	}
}

export class Toc {
	constructor(htmlstring = '', options = defaults) {
		this.options = { ...defaults, ...options };
		const selector = this.options.tags.join(',');
		this.root = new Item(undefined, undefined, this.options);

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
				const current = new Item(heading, previous, this.options);
				current.parent.children.push(current);
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
