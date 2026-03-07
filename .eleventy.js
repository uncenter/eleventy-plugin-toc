import { Toc } from './src/index.js';

export default function (eleventyConfig, options) {
	eleventyConfig.addFilter('toc', (content, opts) => {
		const toc = new Toc(content, { ...options, ...opts });
		return toc.html();
	});
}
