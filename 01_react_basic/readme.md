[← Back to Home](../readme.md)

# Chapter 1 - React Basics

This chapter uses a series of comparative examples to build an understanding of React's core ideas from scratch. All examples load React directly via CDN in plain HTML — no build tools required.

## Table of Contents

1. [Goal: A Static List](#1-goal-a-static-list)
2. [Vanilla JS DOM Manipulation](#2-vanilla-js-dom-manipulation)
3. [Creating Elements with React.createElement](#3-creating-elements-with-reactcreateelement)
4. [JSX: Making Code Look More Like HTML](#4-jsx-making-code-look-more-like-html)
5. [JSX and createElement Are Equivalent](#5-jsx-and-createelement-are-equivalent)
6. [The Standard React Template](#6-the-standard-react-template)
7. [Rendering Comparison: Vanilla JS vs React Virtual DOM](#7-rendering-comparison-vanilla-js-vs-react-virtual-dom)
8. [Introduction to React Components](#8-introduction-to-react-components)
9. [Advanced Components: Props and Reuse](#9-advanced-components-props-and-reuse)

---

## 1. Goal: A Static List

> Example code: [codes/01_static_list.html](codes/01_static_list.html)

We start with the simplest possible goal — render the following list:

```html
<ul>
  <li>item 1</li>
  <li class="active">item 2</li>
  <li><a href="http://abc.com">item 3</a></li>
</ul>
```

This HTML is hardcoded directly in the page. Over the next few sections, we will generate it "dynamically" using different approaches, and compare how vanilla JS and React each handle it.

---

## 2. Vanilla JS DOM Manipulation

> Example code: [codes/02_vanilla_js_dom.html](codes/02_vanilla_js_dom.html)

Creating the same list with vanilla JS requires manually manipulating the DOM step by step:

```js
const root = document.getElementById("root");

const ul = document.createElement("ul");

const li1 = document.createElement("li");
li1.textContent = "item 1";

const li2 = document.createElement("li");
li2.textContent = "item 2";
li2.className = "active";

const li3 = document.createElement("li");
li3.innerHTML = `<a href="${linkAddress}">${linkName}</a>`;

ul.appendChild(li1);
ul.appendChild(li2);
ul.appendChild(li3);
root.appendChild(ul);
```

**What's the problem?**

The code is *imperative* — you have to tell the browser **how** to do everything (create each element, set its attributes, mount them one by one). As UI structure grows more complex, this kind of code quickly becomes hard to maintain.

---

## 3. Creating Elements with React.createElement

> Example code: [codes/03_react_create_element.html](codes/03_react_create_element.html)

Include React via CDN in the HTML:

```html
<script src="https://unpkg.com/react@18/umd/react.development.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
```

React provides `React.createElement` to create **virtual DOM elements** (React Elements), which are then mounted to the real DOM via `ReactDOM.createRoot` + `render`:

```js
const root = ReactDOM.createRoot(document.getElementById("root"));

const ul = React.createElement(
  "ul",
  null,
  React.createElement("li", null, "item 1"),
  React.createElement("li", { className: "active" }, "item 2"),
  React.createElement("li", { style: { color: "red", backgroundColor: "green" } }, "item 3"),
  React.createElement("li", null, React.createElement("a", { href: "http://abc.com" }, "item 4")),
);

root.render(ul);
```

**`React.createElement` parameters:**

```
React.createElement(type, props, ...children)
```

| Parameter     | Description                                                          |
| ------------- | -------------------------------------------------------------------- |
| `type`        | Element type, e.g. `"ul"`, `"li"`, or a component function          |
| `props`       | Props object, e.g. `{ className: "active" }`, or `null` if none     |
| `...children` | Child elements — strings or other React Elements                     |

**Note:** Use `className` instead of `class`, because `class` is a reserved keyword in JavaScript.

`React.createElement` returns a plain JS object (a React Element). React uses it to describe what should be rendered — it does not directly touch the real DOM.

---

## 4. JSX: Making Code Look More Like HTML

> Example code: [codes/04_jsx.html](codes/04_jsx.html)

`React.createElement` is verbose and hard to read when deeply nested. To address this, React introduced **JSX**.

Include Babel so the browser can parse JSX directly:

```html
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
```

The script tag needs `type="text/babel"`:

```html
<script type="text/babel">
  const root = ReactDOM.createRoot(document.getElementById("root"));

  const linkName = "item 3";
  const linkAddress = "http://abc.com";

  const ul = (
    <ul>
      <li>item 1</li>
      <li className="active">item 2</li>
      <li>
        <a href={linkAddress}>{linkName}</a>
      </li>
    </ul>
  );

  root.render(ul);
</script>
```

**Key points about JSX:**

- JSX looks like HTML, but it is a **JavaScript syntax extension** — Babel compiles it into `React.createElement` calls
- Use `{}` to embed any **JavaScript expression**: variables, operations, function calls
- Attribute names use camelCase: `className`, `onClick`, `backgroundColor`
- JSX is **declarative** — you describe what the UI **looks like**, not **how to build it**

> **JSX is just syntactic sugar.** Babel compiles JSX back to `React.createElement`, and both produce exactly the same result.

---

## 5. JSX and createElement Are Equivalent

> Example code: [codes/05_jsx_vs_create_element.html](codes/05_jsx_vs_create_element.html)

You can verify this directly in the browser console:

```js
const element1 = <h2 className="title">Hello, JSX!</h2>;

const element2 = React.createElement("h2", { className: "title" }, "Hello, JSX!");

console.log("element1 = ", element1);
console.log("element2 = ", element2);
// Both print identical output
```

Both produce the same React Element object, roughly structured as:

```js
{
  type: "h2",
  props: {
    className: "title",
    children: "Hello, JSX!"
  },
  ...
}
```

**Conclusion:** JSX is syntactic sugar for `React.createElement` — it makes code easier to read and write. In practice you will almost always use JSX; `React.createElement` is what JSX compiles down to under the hood.

---

## 6. The Standard React Template

> Example code: [codes/06_react_template.html](codes/06_react_template.html)

A complete React CDN starter template looks like this:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React App</title>
    <!-- 1. Include React and ReactDOM -->
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <!-- 2. Include Babel to enable JSX in the browser -->
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  </head>
  <body>
    <!-- 3. Mount point for React -->
    <div id="root"></div>

    <!-- 4. Set the script type to text/babel -->
    <script type="text/babel">
      // 5. Create the React root
      const root = ReactDOM.createRoot(document.getElementById("root"));

      // 6. Write the UI with JSX
      const app = (
        <div>
          <h1>React Handbook</h1>
          <p>Master React, and you are one step closer to changing the world.</p>
        </div>
      );

      // 7. Render to the page
      root.render(app);
    </script>
  </body>
</html>
```

These 7 steps form the fixed structure for all React CDN examples. Everything in later examples builds on step 6 — the JSX section.

---

## 7. Rendering Comparison: Vanilla JS vs React Virtual DOM

> Example code: [codes/07_vanilla_js_render.html](codes/07_vanilla_js_render.html) | [codes/08_react_render.html](codes/08_react_render.html)

These two examples use buttons to demonstrate a key difference: **React only updates changed DOM nodes, rather than rebuilding the entire DOM.**

### Vanilla JS approach

Each button click wipes the entire list with `innerHTML = ''` and recreates every node from scratch:

```js
function renderList(items) {
  const root = document.getElementById("root");
  root.innerHTML = ""; // clear everything
  const ul = document.createElement("ul");
  items.forEach((text) => {
    const li = document.createElement("li");
    li.textContent = text;
    ul.appendChild(li);
  });
  root.appendChild(ul);
}

function step1() {
  renderList(["item 1", "item 2"]);
}
function step2() {
  renderList(["item 1", "item 2", "item 3"]);
}
function step3() {
  renderList(["item 1", "item 2", "item 3", "item 4"]);
}
```

Even when adding just one `<li>`, all existing `<li>` elements are destroyed and recreated.

### React approach

Each button click calls `root.render` with updated JSX:

```js
const root = ReactDOM.createRoot(document.getElementById("root"));

function step1() {
  root.render(
    <ul>
      <li>item 1</li>
      <li>item 2</li>
    </ul>,
  );
}
function step2() {
  root.render(
    <ul>
      <li>item 1</li>
      <li>item 2</li>
      <li>item 3</li>
    </ul>,
  );
}
function step3() {
  root.render(
    <ul>
      <li>item 1</li>
      <li>item 2</li>
      <li>item 3</li>
      <li>item 4</li>
    </ul>,
  );
}
```

**Watch in browser DevTools:** when `step2` or `step3` runs, only the newly added `<li>` flashes to indicate a DOM update. Existing nodes remain untouched.

### Why is React more efficient?

React maintains a **Virtual DOM tree** in memory. Each time `render` is called, React:

1. Builds a new virtual DOM tree from the new JSX
2. **Diffs** the new tree against the previous tree
3. Syncs only the differences to the real DOM

This process is called **Reconciliation** and is the core mechanism behind React's efficient rendering.

---

## 8. Introduction to React Components

> Example code: [codes/09_components_basic.html](codes/09_components_basic.html)

So far, we have stored JSX in variables and written all UI in one place. As pages grow more complex, this becomes just as hard to maintain.

**Components** are React's core abstraction: break the UI into independent, reusable pieces — each piece is a **component**.

### Defining a component

The simplest React component is a **function that returns JSX** (a function component):

```js
// Component names must start with a capital letter
function Header() {
  return (
    <header>
      <h1>React Handbook</h1>
      <h2>Open source, free, professional, and easy to use</h2>
    </header>
  );
}

function Main({ name }) {
  return (
    <main>
      <p>Master {name} and you are one step closer to changing the world.</p>
      <input placeholder="Type your thoughts" />
      <button>Submit</button>
    </main>
  );
}
```

### Using components (component composition)

Components can be used in JSX just like HTML tags:

```js
const app = (
  <div>
    <Header />
    <Main name="React" />
  </div>
);

root.render(app);
```

### Props: passing data to components

`name="React"` looks like an HTML attribute, but Babel compiles it into an object passed to the component function:

```js
// JSX syntax
<Main name="React" />;

// Equivalent to
React.createElement(Main, { name: "React" }, null);

// What Main actually receives
Main({ name: "React" });
```

So `{ name }` is simply destructuring the `props` object:

```js
function Main({ name }) {
  // equivalent to: function Main(props) { const name = props.name; ... }
  return <p>Master {name}</p>;
}
```

### Two ways to call a component

```js
// Method 1: JSX tag (recommended)
<Main name="React" />;

// Method 2: direct function call (not recommended, but reveals the underlying mechanics)
{
  Main({ name: "JavaScript" });
}
```

Both produce the same rendered output, but React strongly recommends always using the JSX tag form — only then can React correctly track component lifecycle and apply reconciliation optimizations.

---

## 9. Advanced Components: Props and Reuse

> Example code: [codes/10_components_advanced.html](codes/10_components_advanced.html)

This example builds a simple chat interface with components to demonstrate **component reuse** and **conditional rendering**.

### Input component

```js
function Input() {
  return (
    <div className="input">
      <input placeholder="Type your question" />
      <button>submit</button>
    </div>
  );
}
```

### Chat message component

`ChatMessage` receives `message` (the message text) and `sender` (`"user"` or `"bot"`), and uses `sender` to determine the style and icon:

```js
function ChatMessage({ message, sender }) {
  return (
    <div className={`message ${sender}`}>
      <p>{message}</p>
      {sender === "bot" ? (
        <span className="material-symbols-outlined">smart_toy</span>
      ) : (
        <span className="material-symbols-outlined">face</span>
      )}
    </div>
  );
}
```

**Two important JSX techniques used here:**

1. **Dynamic className**: `` className={`message ${sender}`} `` uses a template literal to compose the class name based on `sender`
2. **Conditional rendering**: `{condition ? <A /> : <B />}` uses a ternary expression inside JSX to render different content based on a condition

### Component composition (reuse)

```js
const app = (
  <div className="app">
    <Input />
    <ChatMessage message="Hello!" sender="user" />
    <ChatMessage message="Hello! How are you?" sender="bot" />
    <ChatMessage message="Fine, thank you, and you?" sender="user" />
    <ChatMessage message="I am good!" sender="bot" />
  </div>
);
```

The same `ChatMessage` component renders differently styled message bubbles simply by receiving different props. This is the core value of component **reuse**.

---

## Summary

| Concept           | Key Points                                                                           |
| ----------------- | ------------------------------------------------------------------------------------ |
| **React Element** | A plain JS object created by `React.createElement` or JSX that describes UI structure |
| **JSX**           | A JavaScript syntax extension compiled by Babel into `React.createElement` calls     |
| **Virtual DOM**   | React's in-memory UI description tree — only diffs are synced to the real DOM        |
| **Component**     | A function that returns JSX; React's basic building block; name must start uppercase |
| **Props**         | A component's input parameters; JSX attributes are compiled into an object           |
| **Conditional rendering** | Use ternary expressions or `&&` inside JSX `{}` to control rendered content  |
