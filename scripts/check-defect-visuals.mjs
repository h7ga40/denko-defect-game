import assert from 'node:assert/strict';
import { createServer } from 'vite';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
try {
  const { createBoxInspectionRound, getRingRating } = await vite.ssrLoadModule('/src/data/boxInspectionGame.ts');
  const { quizConnectionVisual, visualConductors } = await vite.ssrLoadModule('/src/data/connectionVisuals.ts');
  const { RingAssemblyDiagram } = await vite.ssrLoadModule('/src/components/svg/RingAssemblyDiagram.tsx');
  const { PushConnectorAssemblyDiagram } = await vite.ssrLoadModule('/src/components/svg/PushConnectorAssemblyDiagram.tsx');
  const { CableInspectionDiagram } = await vite.ssrLoadModule('/src/components/svg/CableInspectionDiagram.tsx');
  const { ScrewLoopTerminal } = await vite.ssrLoadModule('/src/components/svg/ScrewLoopTerminal.tsx');
  const samples = new Map();
  let wrongCountCases = 0;
  for (let n = 1; n <= 13; n++) for (let seed = 0; seed < 150; seed++) {
    for (const unit of createBoxInspectionRound({ candidateNo: n, seed: 'visual-regression-' + seed }).units) for (const part of unit.parts) {
      if (part.connection?.method === 'ring_sleeve' || part.connection?.method === 'push_connector' || part.installedCable) {
        samples.set(`${part.connection?.method ?? 'cable'}:${part.defectType}`, part);
      }
      if (part.defectType === 'push_connector_wrong_wire_count') {
        assert(part.connection.wireCount > 2, 'Two wires must not get a too-few-ports question');
        wrongCountCases++;
      }
    }
  }
  assert(wrongCountCases > 0);
  for (const part of samples.values()) for (const viewpoint of ['front', 'back', 'left', 'right']) {
    const ring = part.connection?.method === 'ring_sleeve';
    const html = renderToStaticMarkup(part.installedCable
      ? React.createElement(CableInspectionDiagram, { part, viewpoint })
      : React.createElement(ring ? RingAssemblyDiagram : PushConnectorAssemblyDiagram, { connection: part.connection, defectType: part.defectType, viewpoint }));
    assert(!html.includes('NaN'));
    const count = token => html.split(token).length - 1;
    if (part.installedCable) {
      if (['cable_split_sheath', 'cable_conductor_damage'].includes(part.defectType)) {
        assert.equal(count('data-preparation-core='), part.installedCable.coreCount);
        assert(html.includes(part.defectType === 'cable_split_sheath' ? 'data-split-sheath-mm="30"' : 'data-conductor-notch="true"'));
        continue;
      }
      assert.equal(count('data-cable-core='), part.installedCable.coreCount * 2);
      assert.equal(count('data-common-sheath='), part.installedCable.hasSheath ? 2 : 0);
      if (part.defectType === 'cable_insulation_damage') assert.equal(count('data-insulation-wound='), 1);
    } else {
      assert.equal(count(ring ? 'data-ring-wire=' : 'data-push-wire='), visualConductors(part.connection).length);
      if (part.defectType === 'ring_sleeve_uncrimped') assert.equal(count('data-crimp-count='), 0);
      if (part.defectType === 'ring_sleeve_double_mark') assert(html.includes('data-crimp-count="2"'));
      if (part.defectType === 'push_connector_insufficient_insert') assert(html.includes('data-copper-tip="412"'));
      if (part.defectType === 'push_connector_exposed_conductor') assert(html.includes('data-insulation-end="302"'));
    }
  }
  for (const defectType of ['ring_sleeve_wrong_mark', 'ring_sleeve_wrong_size', 'ring_sleeve_insufficient_insert', 'ring_sleeve_insulation_bite']) {
    const connection = quizConnectionVisual(defectType, 'ring_sleeve');
    const expected = getRingRating(connection.wireSizes);
    const html = renderToStaticMarkup(React.createElement(RingAssemblyDiagram, { connection, defectType }));
    assert.equal(connection.wireCount, 3);
    if (defectType === 'ring_sleeve_wrong_mark') assert(!html.includes(`data-ring-mark="${expected.mark}"`));
    else if (defectType === 'ring_sleeve_wrong_size') assert(!html.includes(`data-ring-size="${expected.size}"`));
    else assert(html.includes(`data-ring-mark="${expected.mark}"`));
  }
  for (const reverse of [false, true]) assert(renderToStaticMarkup(React.createElement(ScrewLoopTerminal, { reverse })).includes(`data-loop-direction="${reverse ? 'counterclockwise' : 'clockwise'}"`));
  console.log(`Verified ${samples.size} material states in four views, quiz ratings, loop directions and ${wrongCountCases} connector capacity cases.`);
} finally {
  await vite.close();
}
