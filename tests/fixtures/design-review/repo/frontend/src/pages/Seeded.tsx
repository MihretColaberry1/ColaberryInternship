// FIXTURE: seeded with known patterns. The expected findings are listed in tests/design-review.test.mjs.
import React from 'react';
import Child from './Child';

const BRAND = { bg: '#ea4335' };
// A comment with #ffffff must not count.

export default function Seeded({ go, close, save, rest }: any) {
  return (
    <div>
      <h2>Title</h2>
      <h4>Skipped level</h4>
      <span style={{ color: '#2d3748' }}>Token colour</span>
      <a href="#add">Anchor, not a colour</a>
      <p>Ticket #123 is text, not a colour</p>
      <input type="text" placeholder="Search" />
      <label htmlFor="name">Name</label>
      <input id="name" type="text" />
      <label>Wrapped <input type="checkbox" /></label>
      <input type="text" aria-label="Email" />
      <input type="hidden" value="x" />
      <img src="a.png" />
      <img src="b.png" alt="" />
      <div onClick={() => go()}>Click</div>
      <table><tbody><tr onClick={() => go()}><td>row</td></tr></tbody></table>
      <button onClick={close}>x</button>
      <button onClick={save}>Save</button>
      <div className="alert alert-danger">Error</div>
      <div className="alert alert-info" role="alert">Fine</div>
      <div className="spinner-border" role="status" />
      <div className="modal show">Dialog</div>
      <Child {...rest} />
      <span style={{ color: BRAND.bg }}>{rest && 'dynamic'}</span>
    </div>
  );
}
