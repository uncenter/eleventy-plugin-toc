const cheerio = require('cheerio');

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
	constructor({ $el = null, options }) {
		this.options = options;
		if ($el) {
			this.slug = $el.attr('id');
			this.text = $el.text().trim();
			this.level = +$el.get(0).tagName.slice(1);
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

class Toc {
	constructor(htmlstring = '', options = defaults) {
		this.options = { ...defaults, ...options };
		const selector = this.options.tags.join(',');
		this.root = new Item({ options: this.options });
		this.root.parent = this.root;

		const $ = cheerio.load(htmlstring);

		let headings = $(selector).filter('[id]'); // Make sure heading has an ID (for linking).
		this.options.ignoredHeadings.forEach((selector) => {
			headings = headings.filter(`:not(${selector})`); // Remove ignored elements.
		});

		headings.find(this.options.ignoredElements.join(',')).remove(); // Remove ignored elements from heading text content.

		if (headings.length) {
			let previous = this.root;
			headings.each((index, heading) => {
				const current = new Item({
					$el: $(heading),
					options: this.options,
				});
				const parent = getParent(previous, current);
				current.parent = parent;
				parent.children.push(current);
				previous = current;
			});
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

module.exports = { Toc };
