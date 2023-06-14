const Toc = require("./toc");

test("ignores headings without anchors", () => {
    const toc = new Toc(
        `
        <h2 id="section1">Section 1</h2>
        <h2>Section 2</h2>
        <h2 id="section3">Section 3</h2>
    `,
        { tags: ["h2"] }
    );
    const results = toc.get();
    expect(results.children.length).toBe(2);
});

test("ignores headings not in tags", () => {
    const toc = new Toc(
        `
        <h1 id="section1">Section 1</h1>
        <h2 id="section2">Section 2</h2>
        <h3 id="section3">Section 3</h3>
    `,
        { tags: ["h1"] }
    );
    const results = toc.get();
    expect(results.children.length).toBe(1);
});

test("ignores headings with ignored selectors", () => {
    const toc = new Toc(
        `
        <h2 id="section1" data-toc-exclude>Section 1</h2>
        <h2 id="section2">Section 2</h2>
    `,
        { ignoredHeadings: ["[data-toc-exclude]"] }
    );
    const results = toc.get();
    expect(results.children.length).toBe(1) &&
        expect(results.children[0].text).toBe("Section 2");
});

test("removes ignored elements", () => {
    const toc = new Toc(
        `
        <h2 id="section1">Section 1</h2>
        <h2 id="section2">Section 2 <a class="permalink">#</a></h2>
    `,
        { ignoredElements: [".permalink"] }
    );
    const results = toc.get();
    expect(results.children[1].text).toBe("Section 2");
});

test("removes headings with multiple ignored selectors", () => {
    const toc = new Toc(
        `
        <h2 id="section1" data-toc-exclude>Section 1</h2>
        <h2 id="section2" class="toc-ignore">Section 2</h2>
        <h2 id="section3">Section 3</h2>
    `,
        { ignoredHeadings: ["[data-toc-exclude]", ".toc-ignore"] }
    );
    const results = toc.get();
    expect(results.children.length).toBe(1);
    expect(results.children[0].text).toBe("Section 3");
});

test("heading nesting", () => {
    const toc = new Toc(
        `
        <h1 id="foo">Foo</h1>
        <h2 id="bar">Bar</h2>
        <h3 id="baz">Baz</h3>
    `,
        { tags: ["h2", "h3"] }
    );
    const results = toc.get();
    expect(results.children.length).toBe(1);
    expect(results.children[0].slug).toBe("bar");
    expect(results.children[0].text).toBe("Bar");
    expect(results.children[0].children.length).toBe(1);
    expect(results.children[0].children[0].slug).toBe("baz");
    expect(results.children[0].children[0].text).toBe("Baz");
});

test("wrapper function is applied", () => {
    const toc = new Toc(`
        <h2 id="foo">Foo</h2>
        <h2 id="bar">Bar</h2>
    `);
    const html = toc.html();
    expect(
        html ===
            `<nav class="toc"><ol><li><a href="#foo">Foo</a></li><li><a href="#bar">Bar</a></li></ol></nav>`
    );
});

test("wrapper function is applied with custom wrapper", () => {
    const toc = new Toc(
        `
        <h2 id="foo">Foo</h2>
        <h2 id="bar">Bar</h2>
    `,
        {
            wrapper: function (toc) {
                return toc;
            },
        }
    );
    const html = toc.html();
    expect(
        html ===
            `<ol><li><a href="#foo">Foo</a></li><li><a href="#bar">Bar</a></li></ol>`
    );
});

test("uses ol by default", () => {
    const toc = new Toc(`
        <h2 id="foo">Foo</h2>
        <h2 id="bar">Bar</h2>
    `);
    const html = toc.html();
    expect(html.includes(`<ol>`));
});

test("use ul instead of ol", () => {
    const toc = new Toc(
        `
        <h2 id="foo">Foo</h2>
        <h2 id="bar">Bar</h2>
    `,
        { ul: true }
    );
    const html = toc.html();
    expect(html.includes(`<ul>`));
});

test("no generated TOC (and no wrapper) when no headings", () => {
    const toc = new Toc(`
        <p>Foo</p>
        <p>Bar</p>
    `);
    const html = toc.html();
    expect(html === "");
});

test("deep nesting", () => {
    const toc = new Toc(`
            <h1>Foo</h1>
                <h2 id="bar">Bar</h2>
                    <h3 id="foobar">FooBar</h3>
                        <h4 id="deeeep">Deeeep</h4>
                    <h3 id="foobar-again">FooBar Again</h3>
                <h2 id="baz">Baz</h2>
                    <h3 id="bazbar">BazBar</h3>
            <h1>Hello</h1>
        `);
    const results = toc.get();
    expect(results.children.length).toBe(2);
    expect(results.children[0].slug).toBe("bar");
    expect(results.children[0].text).toBe("Bar");
    expect(results.children[0].children.length).toBe(2);
    expect(results.children[0].children[0].slug).toBe("foobar");
    expect(results.children[0].children[0].text).toBe("FooBar");
    expect(results.children[0].children[0].children.length).toBe(1);
    expect(results.children[0].children[0].children[0].slug).toBe("deeeep");
    expect(results.children[0].children[1].slug).toBe("foobar-again");
    expect(results.children[0].children[1].text).toBe("FooBar Again");
    expect(results.children[1].slug).toBe("baz");
    expect(results.children[1].text).toBe("Baz");
    expect(results.children[1].children.length).toBe(1);
    expect(results.children[1].children[0].slug).toBe("bazbar");
    expect(results.children[1].children[0].text).toBe("BazBar");
});

test("the README example works", () => {
    const toc = new Toc(`
    <h1>Hello, World</h1>
    Lorem ipsum dolor sit amet, consectetur adipisicing elit.
    
    <h2 id="greetings-from-mars">Greetings from Mars</h2>
    Lorem ipsum dolor sit amet, consectetur adipisicing elit.
    
    <h3 id="the-red-planet">The red planet</h3>
    Lorem ipsum dolor sit amet, consectetur adipisicing elit.
    
    <h2 id="greetings-from-pluto">Greetings from Pluto</h2>
    `);
    const results = toc.get();
    expect(results.children.length).toBe(2);
    expect(results.children[0].slug).toBe("greetings-from-mars");
    expect(results.children[0].text).toBe("Greetings from Mars");
    expect(results.children[0].children.length).toBe(1);
    expect(results.children[0].children[0].slug).toBe("the-red-planet");
    expect(results.children[0].children[0].text).toBe("The red planet");
    expect(results.children[1].slug).toBe("greetings-from-pluto");
    expect(results.children[1].text).toBe("Greetings from Pluto");
});
