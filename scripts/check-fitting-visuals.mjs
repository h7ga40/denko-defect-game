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
  const { EmbeddedDeviceDiagram } = await vite.ssrLoadModule('/src/components/svg/diagrams/EmbeddedDeviceDiagram.tsx');
  const { MountingFrameDiagram } = await vite.ssrLoadModule('/src/components/svg/diagrams/MountingFrameDiagram.tsx');
  const { getDeviceSpecification } = await vite.ssrLoadModule('/src/data/deviceSpecifications.ts');
  for (const variant of ['single_pole_switch', 'three_way_switch', 'four_way_switch', 'embedded_receptacle', 'double_receptacle', 'grounded_receptacle', 'grounded_20a_receptacle', 'eet_receptacle', 'pilot_lamp']) {
    for (const viewpoint of ['front', 'back', 'left', 'right']) {
      const html = renderToStaticMarkup(React.createElement(EmbeddedDeviceDiagram, { variant, viewpoint }));
      const terminals = getDeviceSpecification(variant).terminals;
      assert.equal(html.split('data-embedded-terminal=').length - 1, terminals.length);
      for (const terminal of terminals.filter(t => t.role === 'neutral')) {
        assert(html.includes(`data-embedded-terminal="${terminal.id}" data-wire-color="white"`));
      }
      assert(!html.includes('NaN'));
    }
  }
  for (const viewpoint of ['front', 'back', 'left', 'right']) {
    const render = props => renderToStaticMarkup(React.createElement(EmbeddedDeviceDiagram, { viewpoint, ...props }));
    assert(render({variant: 'embedded_receptacle', defectType: 'receptacle_polarity'}).includes('data-embedded-terminal="neutral" data-wire-color="black"'));
    assert(render({variant: 'three_way_switch', defectType: 'switch_wrong_terminal'}).includes('data-embedded-terminal="0" data-wire-color="white"'));
    assert(!render({defectType: 'push_in_retention_failure'}).includes('data-withdrawn-conductor'));
    assert(render({defectType: 'push_in_retention_failure', released: true}).includes('data-withdrawn-conductor'));
    for (const defectType of ['none', 'mounting_frame_loose', 'mounting_frame_wrong_position']) {
      const html = renderToStaticMarkup(React.createElement(MountingFrameDiagram, { viewpoint, defectType }));
      assert(html.includes('施工条件（指定位置）'));
      assert.equal(html.includes('data-frame-claw="open"'), defectType === 'mounting_frame_loose');
      assert(html.includes(`data-frame-member="switch" data-position="${defectType === 'mounting_frame_wrong_position' ? 'bottom' : 'top'}"`));
      assert(!html.includes('class="missing"'));
    }
  }
  console.log('PASS: embedded terminal counts/colors, retention response and frame positions/claws.');
} finally {
  await vite.close();
}
