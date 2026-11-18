// FIXTURE: a clean page. No draft-rule pattern should be detected.
import React from 'react';

export default function Clean({ save }: any) {
  return (
    <main>
      <h1>Clean page</h1>
      <h2>Section</h2>
      <label htmlFor="q">Query</label>
      <input id="q" type="text" />
      <img src="logo.png" alt="Colaberry logo" />
      <button onClick={save}>Save</button>
      <div aria-live="polite"><div className="spinner-border" /></div>
      <div className="alert alert-warning" role="alert">Heads up</div>
    </main>
  );
}
