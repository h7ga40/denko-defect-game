import assert from 'node:assert/strict';
import {createServer} from 'vite';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {referenceRows} from './defect-references.mjs';
const vite=await createServer({server:{middlewareMode:true},appType:'custom'});
try {
 const {materialDefectDefinitions,additionalMaterialProblems}=await vite.ssrLoadModule('/src/data/materialDefects.ts');
 const {problems}=await vite.ssrLoadModule('/src/data/problems.ts');
 const {createProblemInspectionPart}=await vite.ssrLoadModule('/src/data/problemInspection.ts');
 const {createBoxInspectionRound}=await vite.ssrLoadModule('/src/data/boxInspectionGame.ts');
 const {PhysicalInspectionView}=await vite.ssrLoadModule('/src/components/PhysicalInspectionView.tsx');
 const {WiringDiagram}=await vite.ssrLoadModule('/src/components/svg/WiringDiagram.tsx');
 assert.equal(problems.length,44);
 assert.equal(new Set(problems.map(p=>p.id)).size,problems.length);
 for(const problem of additionalMaterialProblems) {
  assert.equal(problem.choices.filter(c=>c===problem.answer).length,1);
  assert(referenceRows.some(r=>r.quiz===problem.id&&r.match==='matched'));
  const part=createProblemInspectionPart(problem);
  assert.notDeepEqual(part.physicalInspection.installed,part.physicalInspection.expected);
  for(const viewpoint of ['front','back','left','right']) {
   const html=renderToStaticMarkup(React.createElement(PhysicalInspectionView,{part,viewpoint},React.createElement(WiringDiagram,{defectType:problem.defectType})));
   assert(!html.includes('NaN'));
   assert(html.includes(problem.defectType.startsWith('ring_') ? 'data-ring-size=' : `data-material-defect="${problem.defectType}"`));
  }
 }
 const seen=new Set();
 for(let no=1;no<=13;no++)for(let seed=0;seed<400;seed++) {
  const round=createBoxInspectionRound({candidateNo:no,seed:`material-additions-${seed}`});
  const all=round.units.flatMap(unit=>unit.parts);
  assert.equal(all.filter(part=>part.defectType!=='none').length,round.defectCount);
  for(const part of all)if(materialDefectDefinitions.some(d=>d.defectType===part.defectType)) {
   seen.add(part.defectType);
   assert(part.choices.includes(part.answer));
   if(part.defectType==='cable_split_sheath')assert(part.installedCable.hasSheath);
   if(part.defectType==='ring_sleeve_short_insulation')assert(part.connection.sourceCables[0].hasSheath);
  }
 }
 assert.deepEqual([...seen].sort(),materialDefectDefinitions.map(d=>d.defectType).sort());
 console.log('PASS: ten reference defects, four views, physical states and construction availability; 44 quiz problems.');
} finally {await vite.close();}
