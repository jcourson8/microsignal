# microsignal

A tiny reactive JavaScript framework inspired by SolidJS and micrograd.

Try the example [here](https://rawcdn.githack.com/jcourson8/microsignal/ae87e12ba390d28851fe4fe409dff1c1ebe4051b/examples/microsignal.html)!

It combines the following core features:

- **Signal-based reactivity**: Tracking of dependencies through signals
- **Minimal DOM rendering**: Efficient updates without a virtual DOM
- **JSX-like templating**: Using [htm](https://github.com/developit/htm) for template literals

## Core Concepts

### Signals

```js
const [count, setCount] = createSignal(0);

// Read the signal value
console.log(count()); // 0

// Update the signal value
setCount(1);
// Or use a function updater
setCount(n => n + 1);
```

### Derived Values (Memos)

Create computed values that automatically update:

```js
const [count, setCount] = createSignal(0);
const double = createMemo(() => count() * 2);

console.log(double()); // 0
setCount(5);
console.log(double()); // 10
```

### Effects

Run side effects when dependencies change:

```js
const [count, setCount] = createSignal(0);

createEffect(() => {
  console.log("Count changed to:", count());
});

setCount(1); // Logs: "Count changed to: 1"
```

### HTML Templates

Create reactive DOM with the `html` template tag:

```js
const [name, setName] = createSignal("World");

const greeting = html`
  <div>
    <h1>Hello ${name}!</h1>
    <button onclick=${() => setName("microsignal")}>
      Change name
    </button>
  </div>
`;
```

## Examples

### Counter App

```js
function Counter() {
  const [count, setCount] = createSignal(0);
  
  return html`
    <div>
      <h2>Count: ${count}</h2>
      <button onclick=${() => setCount(n => n - 1)}>-</button>
      <button onclick=${() => setCount(0)}>Reset</button>
      <button onclick=${() => setCount(n => n + 1)}>+</button>
    </div>
  `;
}

render(Counter, document.getElementById('app'));
```
