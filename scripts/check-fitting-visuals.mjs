import assert from 'node:assert/strict';
import { createServer } from 'vite';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
try {
  const { CeilingConnectorDiagram } = await vite.ssrLoadModule('/src/components/svg/diagrams/CeilingConnectorDiagram.tsx');
  for (const viewpoint of ['front', 'back', 'left', 'right']) for (const defectType of ['none', 'ceiling_connector_polarity']) {
    const html = renderToStaticMarkup(React.createElement(CeilingConnectorDiagram, { viewpoint, defectType }));
    for (const shape of ['round', 'square']) assert(html.includes(`data-ceiling-shape="${shape}"`));
    const color = defectType === 'none' ? 'white' : 'black';
    assert.equal(html.split(`data-ceiling-terminal="W" data-wire-color="${color}"`).length - 1, 2);
    assert(!html.includes('NaN'));
  }
  console.log('PASS: round and square ceiling polarity in four inspection views.');
} finally {
  await vite.close();
}
