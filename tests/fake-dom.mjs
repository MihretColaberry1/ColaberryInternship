// The smallest DOM that command-center/dom.js needs, so a test can render a real panel under
// `node --test` and read its text. It supports exactly what h() calls and nothing more: if the
// page starts using more of the DOM, these tests fail loudly rather than passing on a stub.

class FakeNode {
  constructor() { this.children = []; }
  append(...nodes) { this.children.push(...nodes); }
  get textContent() { return this.children.map((c) => c.textContent).join(''); }
}

class FakeText extends FakeNode {
  constructor(text) { super(); this.text = text; }
  get textContent() { return this.text; }
}

class FakeElement extends FakeNode {
  constructor(tag) { super(); this.tagName = tag.toUpperCase(); this.attributes = {}; this.className = ''; }
  setAttribute(name, value) { this.attributes[name] = value; }
  getAttribute(name) { return this.attributes[name] ?? null; }
  addEventListener() {}
}

/** Installs the fake as globalThis.document / globalThis.Node. Returns a function that removes it. */
export function installFakeDom() {
  const before = { document: globalThis.document, Node: globalThis.Node };
  globalThis.Node = FakeNode;
  globalThis.document = {
    createElement: (tag) => new FakeElement(tag),
    createTextNode: (text) => new FakeText(text),
  };
  return () => { globalThis.document = before.document; globalThis.Node = before.Node; };
}

/** Every element under root (inclusive) that matches the predicate, in document order. */
export function findAll(root, predicate) {
  const out = [];
  const walk = (n) => {
    if (n instanceof FakeElement && predicate(n)) out.push(n);
    for (const c of n.children ?? []) walk(c);
  };
  for (const r of [root].flat(Infinity)) if (r) walk(r);
  return out;
}

export const hasClass = (name) => (el) => el.className.split(/\s+/).includes(name);
