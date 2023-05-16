# @uncenter/eleventy-plugin-toc

Easily generate a table of contents (toc) for your Eleventy site, with easy configuration and customization.

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

-   [Greetings from Mars](#greetings-from-mars)
    -   [The red planet](#the-red-planet)
-   [Greetings from Pluto](#greetings-from-pluto)

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

<hr>

# Table of Contents

-   [Install](#install)
-   [Usage](#usage)
    -   [Using the provided filter](#using-the-provided-filter)
    -   [Configuring](#configuring)
-   [Gotchyas](#gotchyas)

## Install

<table>
    <tr>
        <td>Package Manager</td>
        <td>Command</td>
    </tr>
    <tr>
        <td>npm</td>
        <td>
            <pre lang="sh">npm i @uncenter/eleventy-plugin-toc</pre>
        </td>
    </tr>
    <tr>
        <td>yarn</td>
        <td>
            <pre lang="sh">yarn add @uncenter/eleventy-plugin-toc</pre>
        </td>
    </tr>
    <tr>
        <td>pnpm</td>
        <td>
            <pre lang="sh">pnpm add @uncenter/eleventy-plugin-toc</pre>
        </td>
    </tr>
</table>

## Usage

Your heading tags will need to have `id`s on them, so that the TOC can provide proper anchor links to them. Eleventy does not do this for you out of the box. You can use a plugin like [markdown-it-anchor](https://www.npmjs.com/package/markdown-it-anchor) to add those `id`s to the headings automagically (or a similar plugin for your Markdown engine of choice).

> **Note**
> 
> Make sure not to duplicate the `module.exports` line in your config file for any of the examples below! If you already have a `module.exports` line, just add the lines above and below it to your config file.

```js
// .eleventy.js / eleventy.config.(c)js
const markdownIt = require('markdown-it');
const markdownItAnchor = require('markdown-it-anchor');
module.exports = function (eleventyConfig) {
    eleventyConfig.setLibrary("md",
        markdownIt({
            html: true,
            linkify: true,
            typographer: true,
        }).use(markdownItAnchor, {})
        );
    };
}
```

Then add the TOC plugin to your Eleventy config:

```js
// .eleventy.js / eleventy.config.(c)js
const pluginTOC = require("@uncenter/eleventy-plugin-toc");

module.exports = function (eleventyConfig) {
    eleventyConfig.addPlugin(pluginTOC);
};
```

### Using the provided filter

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

Override the defaults for your whole site (defaults are shown below):

```js
// .eleventy.js / eleventy.config.(c)js
const pluginTOC = require("@uncenter/eleventy-plugin-toc");

module.exports = function (eleventyConfig) {
    eleventyConfig.addPlugin(pluginTOC, {
        tags: ["h2", "h3", "h4"], // the tags (heading levels) to include in the TOC
        ignoredHeadings: ["[data-toc-exclude]"], // the headings to ignore when generating the TOC (list of selectors)
        ignoredElements: [], // the elements (within the headings) to ignore when generating the TOC (list of selectors)
        ul: false, // whether to a use ul or ol
        wrapper: function (toc) {
            // the wrapper to use around the generated TOC
            return `<nav class="toc">${toc}</nav>`;
        },
    });
};
```

And override those just for one template, as it's being invoked

```twig
<aside>
  {{ content | toc(tags=['h2', 'h3']) | safe }}
</aside>
```

If you have specific headings which you don't want to be included in the TOC, you can add one of the `ignoredElements` selectors to exclude these headings (defaults to the`[data-toc-exclude]` selector).

One way to add this attribute is via the use of the [markdown-it-attrs](https://www.npmjs.com/package/markdown-it-attrs) plugin:

```md
## Heading {data-toc-exclude}
```

## Gotchyas

A few things must be in place for this to work properly, and provide the proper nested structure:

-   The first matched heading on the page should be the topmost. _Don't put an `<h3>` before an `<h2>`!_
