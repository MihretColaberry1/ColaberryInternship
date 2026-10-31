// Small element builder. Data text is always added as text nodes, never as HTML,
// so nothing in the .colaberry files can inject markup into the page.

const SAFE_HREF = /^(#|https?:\/\/)/;

export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [name, value] of Object.entries(attrs)) {
    if (value === null || value === undefined || value === false) continue;
    if (name === 'href' && !SAFE_HREF.test(String(value))) continue;
    if (name === 'class') el.className = value;
    else if (name.startsWith('on') && typeof value === 'function') el.addEventListener(name.slice(2), value);
    else el.setAttribute(name, value === true ? '' : String(value));
  }
  append(el, children);
  return el;
}

function append(el, children) {
  for (const child of children) {
    if (child === null || child === undefined || child === false) continue;
    if (Array.isArray(child)) append(el, child);
    else el.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
}
