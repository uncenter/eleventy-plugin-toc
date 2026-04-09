# @uncenter/eleventy-plugin-toc

> [!NOTE]
> This repository is an updated fork of [JordanShurmer/eleventy-plugin-nesting-toc](https://github.com/JordanShurmer/eleventy-plugin-nesting-toc) with some additional features and bug fixes.

> [!IMPORTANT]
> This plugin is now ESM-only. It can be used in CJS though (i.e. imported via `require`) starting with Node.js version 20 and newer.

Easily generate a table of contents (TOC) for your Eleventy site, with easy configuration and customization.

HTML:

```html
<h1>Hello, World</h1>
Lorem ipsum dolor sit amet, consectetur adipisicing elit.

<h2 id="greetings-from-mars">Greetings from Mars</h2>
Lorem ipsum dolor sit amet, consectetur adipisicing elit.

<h3 id="the-red-planet">The red planet</h3>
Lorem ipsum dolor sit amet, consectetur adipisicing elit.

<h2 id="greetings-from-pluto">Greetings from Pluto</h2>
```

Generated TOC:

- [Greetings from Mars](#greetings-from-mars)
  - [The red planet](#the-red-planet)
- [Greetings from Pluto](#greetings-from-pluto)

```html
<nav class="toc">
	<ol>
		<li><a href="#greetings-from-mars">Greetings from Mars</a></li>
		<ol>
			<li><a href="#the-red-planet">The red planet</a></li>
		</ol>
		<li><a href="#greetings-from-pluto">Greetings from Pluto</a></li>
	</ol>
</nav>
```

## Install

```sh
npm i @uncenter/eleventy-plugin-toc
pnpm add @uncenter/eleventy-plugin-toc
yarn add @uncenter/eleventy-plugin-toc
bun add @uncenter/eleventy-plugin-toc
```

## Usage

Your heading elements will need to have `id` attributes on them, so that the table of contents can provide anchor links to them. Eleventy does not do this for you out of the box. You can use a plugin like [markdown-it-anchor](https://www.npmjs.com/package/markdown-it-anchor) to add `id` attributes to the headings automatically (or a similar plugin for your Markdown engine of choice).

> [!IMPORTANT]
> Make sure not to duplicate the `export default function (eleventyConfig) {` line in your config file for any of the examples below! If you already have a `export default function (eleventyConfig) {` line, just add the lines above and below it to your config file.

In your Eleventy config file (`.eleventy.js`, `eleventy.config.js`, or `eleventy.config.cjs`), add your heading plugin of choice. This example uses the aforementioned `markdown-it-anchor` plugin:

```js
import markdownIt from 'markdown-it';
import markdownItAnchor from 'markdown-it-anchor';

export default function (eleventyConfig) {
	eleventyConfig.setLibrary('md', markdownIt().use(markdownItAnchor));
}
```

Then add the table of contents plugin:

```js
import pluginTOC from '@uncenter/eleventy-plugin-toc';

export default function (eleventyConfig) {
	eleventyConfig.addPlugin(pluginTOC);
}
```

To use the table of contents in your templates, apply the `toc` filter to your template content:

> [!IMPORTANT]
> The first matched heading on the page should be the topmost. _Don't put an `<h3>` before an `<h2>`!_

```twig
<aside>
  {{ content | toc | safe }}
</aside>
<article>
  {{ content }}
</article>
```

### Configuring

You can override some of the [options](#options) at the time that you call it, or all of them when you add it in your Eleventy config.
All of the options will be merged together, with the options passed to the filter taking precedence over the options passed to the plugin (which take precedence over the defaults).

Override the defaults for your whole site (defaults are shown):

```js
{
    tags: ["h2", "h3", "h4"], // tags (heading levels) to include
    ignoredHeadings: ["[data-toc-exclude]"], // headings to ignore (list of selectors)
    ignoredElements: [], // elements (within the headings) to ignore when generating the TOC (list of selectors)
    ul: false, // whether to a use a `ul` or `ol`
    wrapper: function (toc) {
        // wrapper around the generated TOC
        return `<nav class="toc">${toc}</nav>`;
    },
}
```

Or override as it's being invoked:

```twig
<aside>
  {{ content | toc(tags=['h2', 'h3']) | safe }}
</aside>
```

If you have specific headings which you don't want to be included in the TOC, you can add one of the `ignoredHeadings` selectors to exclude these headings (defaults to the`[data-toc-exclude]` selector).

One way to add this attribute is via the use of the [markdown-it-attrs](https://www.npmjs.com/package/markdown-it-attrs) plugin:

```md
## Heading {data-toc-exclude}
```

## License

[MIT](LICENSE)
