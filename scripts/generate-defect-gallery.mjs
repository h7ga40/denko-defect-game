import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { referenceImages, referencePage, referenceRows } from './defect-references.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const out = path.join(root, 'tmp/image-audit');
await fs.mkdir(path.join(out, 'references'), { recursive: true });
const vite = await createServer({ root, server: { middlewareMode: true }, appType: 'custom' });
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const keyOf = part => `${part.deviceVariant ?? ''}|${part.defectType}`;
const el = React.createElement;
try {
  const { problems } = await vite.ssrLoadModule('/src/data/problems.ts');
  const { createProblemInspectionPart } = await vite.ssrLoadModule('/src/data/problemInspection.ts');
  const { createBoxInspectionRound } = await vite.ssrLoadModule('/src/data/boxInspectionGame.ts');
  const { WiringDiagram } = await vite.ssrLoadModule('/src/components/svg/WiringDiagram.tsx');
  const { PhysicalInspectionView } = await vite.ssrLoadModule('/src/components/PhysicalInspectionView.tsx');
  const { DirectDeviceDiagram } = await vite.ssrLoadModule('/src/components/WorkInspectionGame.tsx');
  const { ConnectionDetailDiagram } = await vite.ssrLoadModule('/src/components/svg/ConnectionDetailDiagram.tsx');
  const { CableInspectionDiagram } = await vite.ssrLoadModule('/src/components/svg/CableInspectionDiagram.tsx');
  const byQuiz = new Map(problems.map((problem, index) => [problem.id, { problem, index }]));
  const samples = new Map();
  const connectionSamples = new Map();
  for (let candidateNo = 1; candidateNo <= 13; candidateNo++) {
    for (let seedIndex = 0; seedIndex < 600; seedIndex++) {
      const seed = 'reference-gallery-' + seedIndex;
      const round = createBoxInspectionRound({ candidateNo, seed });
      for (const part of round.units.flatMap(unit => unit.parts)) {
        if (part.defectType === 'none') continue;
        const sample = { part, candidateNo, seed };
        if (!samples.has(keyOf(part))) samples.set(keyOf(part), sample);
        if ('installedCable' in part || ('connection' in part && ['ring_sleeve', 'push_connector'].includes(part.connection.method))) {
          if (!connectionSamples.has(part.defectType)) connectionSamples.set(part.defectType, sample);
        }
      }
    }
  }

  for (const image of referenceImages) {
    const target = path.join(out, 'references', image.file);
    try {
      await fs.copyFile(path.join(root, 'tmp', image.localFile), target);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      try { await fs.access(target); } catch {
        const response = await fetch(image.url);
        if (!response.ok) throw new Error(`参考画像取得失敗: ${image.url} (${response.status})`);
        await fs.writeFile(target, Buffer.from(await response.arrayBuffer()));
      }
    }
  }

  const views = ['front', 'back', 'left', 'right'];
  const viewNames = ['正面', '背面', '左側面', '右側面'];
  function renderViews(part, front) {
    return views.map(viewpoint => renderToStaticMarkup(el(PhysicalInspectionView, { part, viewpoint }, front)));
  }
  function quizImages(id) {
    const item = byQuiz.get(id);
    assert(item, `存在しない問題ID: ${id}`);
    const { problem, index } = item;
    const part = createProblemInspectionPart(problem);
    return {
      title: problem.title,
      origin: `欠陥判定 ${index + 1} / ${problems.length}`,
      code: id,
      diagrams: renderViews(part, el(WiringDiagram, { defectType: problem.defectType, deviceName: part.title, deviceVariant: part.deviceVariant })),
    };
  }
  function constructionImages(sample) {
    const { part, candidateNo, seed } = sample;
    const front = 'installedCable' in part ? el(CableInspectionDiagram, { part })
      : 'connection' in part ? el(ConnectionDetailDiagram, { part })
      : el(DirectDeviceDiagram, { part });
    return {
      title: `${part.title} / ${part.answer}`,
      origin: `施工チェック No.${candidateNo}`,
      code: part.defectType,
      seed,
      diagrams: renderViews(part, front),
    };
  }

  const usedQuiz = new Set();
  const usedConnections = new Set();
  const rows = referenceRows.map(row => {
    let implementation;
    if (row.quiz) {
      usedQuiz.add(row.quiz);
      implementation = quizImages(row.quiz);
    } else if (row.construction) {
      const { variant, defectType } = row.construction;
      const sample = variant ? samples.get(`${variant}|${defectType}`) : connectionSamples.get(defectType);
      assert(sample, `施工チェックの描画対象が見つかりません: ${row.id}`);
      implementation = constructionImages(sample);
      if (!variant) usedConnections.add(defectType);
    }
    assert.equal(Boolean(implementation), row.match !== 'missing', `対応状態の不整合: ${row.id}`);
    return { ...row, implementation };
  });
  for (const problem of problems) {
    if (!usedQuiz.has(problem.id)) rows.push({ id: `quiz:${problem.id}`, group: '実装のみ（対応する参考画像なし）', title: problem.title, match: 'unreferenced', implementation: quizImages(problem.id) });
  }
  for (const [type, sample] of connectionSamples) {
    if (!usedConnections.has(type)) rows.push({ id: `construction:${type}`, group: '施工チェック追加図（対応する参考画像なし）', title: sample.part.answer, match: 'unreferenced', implementation: constructionImages(sample) });
  }
  assert.equal(new Set(rows.map(row => row.id)).size, rows.length, '行IDが重複しています。');
  const summary = {
    referenceImages: referenceImages.length,
    referenceCases: referenceRows.length,
    matched: rows.filter(row => row.match === 'matched').length,
    related: rows.filter(row => row.match === 'related').length,
    missing: rows.filter(row => row.match === 'missing').length,
    unreferenced: rows.filter(row => row.match === 'unreferenced').length,
    quizCount: problems.length,
    constructionConnectionTypes: connectionSamples.size,
    totalRows: rows.length,
  };
  const appCss = await fs.readFile(path.join(root, 'src/styles.css'), 'utf8') + await fs.readFile(path.join(root, 'src/components/physicalInspection.css'), 'utf8');
  const labels = { matched: '対応画像あり', related: '類似・要確認', missing: '欠陥画像なし', unreferenced: '参考画像なし' };
  const version = Date.now();
  function referenceCell(row) {
    if (!row.image) return '<span class="empty-label">対応する参考画像なし</span>';
    const image = referenceImages.find(image => image.id === row.image);
    const href = `references/${image.file}?v=${version}`;
    return `<a class="reference-link" href="${href}" target="_blank" rel="noopener"><span class="reference-photo"><img src="${href}" alt="${escape(row.group)} 参考写真${row.number}: ${escape(row.title)}" loading="lazy" style="width:${row.panels * 100}%;left:-${row.panel * 100}%"></span><span>写真 ${row.number}・元画像を拡大</span></a><a class="source-link" href="${referencePage}" target="_blank" rel="noopener">出典：でんブロ</a>`;
  }
  let group = '';
  const body = rows.map(row => {
    const groupHeading = row.group !== group ? `<tr class="group-heading" data-group="${escape(row.group)}"><th colspan="6">${escape(row.group)}</th></tr>` : '';
    group = row.group;
    const implementation = row.implementation;
    return groupHeading + `<tr class="audit-row" data-status="${row.match}" data-group="${escape(row.group)}" data-row-id="${escape(row.id)}">
      <th scope="row"><span class="row-title">${escape(row.title)}</span><span class="status status-${row.match}">${labels[row.match]}</span>
      ${implementation ? `<span class="origin">${escape(implementation.origin)}</span><code>${escape(implementation.code)}</code>` : '<span class="origin">参照サイトのみ・未実装</span>'}
      ${row.note ? `<p class="match-note">${escape(row.note)}</p>` : ''}${implementation?.seed ? `<details class="seed"><summary>再現シード</summary>${escape(implementation.seed)}</details>` : ''}</th>
      <td class="reference-cell">${referenceCell(row)}</td>
      ${implementation ? implementation.diagrams.map((diagram, index) => `<td class="diagram-cell"><button class="diagram-zoom" type="button" aria-label="${escape(row.title)}・${viewNames[index]}を拡大">${diagram}</button></td>`).join('') : '<td colspan="4" class="missing-diagrams">欠陥画像なし</td>'}
    </tr>`;
  }).join('');
  const html = `<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>欠陥画像 確認一覧</title><style>${appCss}
    body{margin:0;background:#fff;color:#26363e;font-family:system-ui,sans-serif} .audit-main{max-width:none;padding:20px;display:block} .audit-main h1{font-size:24px;margin:0 0 10px} .audit-main p{line-height:1.6} .audit-main a{color:#176578} .audit-toolbar{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin:16px 0} .audit-toolbar label{display:flex;align-items:center;gap:8px} .audit-toolbar input,.audit-toolbar select{font:inherit;border:1px solid #a5b5bb;border-radius:4px;padding:8px;max-width:100%} .audit-scroll{overflow:auto;max-height:78vh;border:1px solid #a5b5bb} .audit-table{border-collapse:separate;border-spacing:0;width:100%;min-width:1540px;table-layout:fixed} .audit-table col:first-child{width:230px} .audit-table col:nth-child(2){width:210px} .audit-table th,.audit-table td{border-bottom:1px solid #cdd9dd;border-right:1px solid #e0e8eb;vertical-align:top;padding:10px} .audit-table thead th{position:sticky;top:0;z-index:2;background:#e7f1f4;text-align:center;height:42px} .audit-table tbody th{text-align:left;font-weight:400} .group-heading th{background:#edf3f5;font-weight:700!important;padding:12px!important} .row-title{display:block;font-size:16px;font-weight:650;margin-bottom:8px} .status{display:inline-block;font-size:12px;padding:3px 6px;border-radius:4px;background:#e5f2ec;color:#25593f} .status-missing{background:#f7e5e6;color:#873f46} .status-related{background:#fff2cb;color:#6e5719} .status-unreferenced{background:#edf0f3;color:#52616b} .origin,.audit-table code{display:block;font-size:12px;margin-top:8px;overflow-wrap:anywhere} .match-note{font-size:13px;margin:8px 0} .seed{font-size:12px;overflow-wrap:anywhere;margin-top:8px} .reference-photo{display:block;position:relative;width:100%;aspect-ratio:1/1.15;overflow:hidden;background:#fff} .reference-photo img{position:absolute;top:0;max-width:none;height:auto} .reference-link,.source-link{display:block;font-size:12px;text-align:center;line-height:1.6} .source-link{margin-top:6px} .audit-table .diagram-zoom{display:block;width:100%;padding:0;background:white;border:0;border-radius:0;cursor:zoom-in;color:inherit} .diagram-zoom svg{width:100%;height:auto;display:block} .audit-table .physical-inspection-view{min-height:0} .missing-diagrams,.empty-label{color:#64747b;text-align:center} .missing-diagrams{vertical-align:middle!important;font-size:18px;background:#fafbfc} .empty-label{display:block;padding:28px 0;font-size:13px} .audit-dialog{width:min(1050px,94vw);max-height:94vh;padding:16px;border:1px solid #9aaeb8;border-radius:6px} .audit-dialog::backdrop{background:#0007} .audit-dialog header{display:flex;justify-content:space-between;gap:16px;align-items:center} .audit-dialog button{font:inherit;padding:6px 12px} .audit-dialog svg{width:100%;height:auto;max-height:80vh} [hidden]{display:none!important} @media(max-width:600px){.audit-main{padding:12px}.audit-toolbar label{width:100%}.audit-toolbar input{min-width:0;width:100%}.audit-scroll{max-height:70vh}.audit-main h1{font-size:22px}}
  </style></head><body><main class="audit-main"><h1>欠陥画像 確認一覧</h1><p>参照：<a href="${referencePage}" target="_blank" rel="noopener">でんブロ「第二種電気工事士技能試験の欠陥まとめ」</a><br>更新：${escape(new Date().toLocaleString('ja-JP'))} / 作業中の最新コード<br>参考写真は照合用です。写真内の各番号を個別の行に対応させています。「対応画像あり」は欠陥の種類の対応を示し、形状の精度を保証するものではありません。</p>
  <p>${summary.referenceCases}例：対応画像あり ${summary.matched} / 類似・要確認 ${summary.related} / 欠陥画像なし ${summary.missing}。参考写真と対応しない既存画像 ${summary.unreferenced}行も末尾に保持。</p>
  <div class="audit-toolbar"><label>表示<select id="status-filter"><option value="all">すべて</option>${Object.entries(labels).map(([key,label]) => `<option value="${key}">${label}</option>`).join('')}</select></label><label>絞り込み<input id="search-filter" type="search" placeholder="部品名・欠陥名"></label><output id="visible-count">${rows.length}行</output></div>
  <div class="audit-scroll"><table class="audit-table"><colgroup>${'<col>'.repeat(6)}</colgroup><thead><tr><th scope="col">部品・欠陥・実装状況</th><th scope="col">参考画像</th>${viewNames.map(name=>`<th scope="col">${name}</th>`).join('')}</tr></thead><tbody>${body}</tbody></table></div>
  <p>参考写真はローカル確認用に保存しています。公開アプリ・ビルド結果には含めません。側面の模式断面など、実物と表現方法が異なる図もあります。</p></main>
  <dialog class="audit-dialog"><header><strong id="zoom-title"></strong><button type="button" id="close-zoom">閉じる</button></header><div id="zoom-content"></div></dialog>
  <script>
  const filter=document.querySelector('#status-filter'), search=document.querySelector('#search-filter'), rows=[...document.querySelectorAll('.audit-row')];
  function update(){const query=search.value.trim().toLocaleLowerCase();for(const row of rows)row.hidden=(filter.value!=='all'&&row.dataset.status!==filter.value)||!(row.dataset.group+' '+row.textContent).toLocaleLowerCase().includes(query);for(const heading of document.querySelectorAll('.group-heading'))heading.hidden=!rows.some(row=>!row.hidden&&row.dataset.group===heading.dataset.group);document.querySelector('#visible-count').textContent=rows.filter(row=>!row.hidden).length+'行';}
  filter.addEventListener('change',update);search.addEventListener('input',update);
  const dialog=document.querySelector('dialog');for(const button of document.querySelectorAll('.diagram-zoom'))button.addEventListener('click',()=>{document.querySelector('#zoom-title').textContent=button.getAttribute('aria-label');document.querySelector('#zoom-content').replaceChildren(button.firstElementChild.cloneNode(true));dialog.showModal();});document.querySelector('#close-zoom').addEventListener('click',()=>dialog.close());
  </script></body></html>`;
  await fs.writeFile(path.join(out, 'index.html'), html);
  await fs.writeFile(path.join(out, 'reference-mapping.json'), JSON.stringify({ summary, rows: rows.map(({ implementation, ...row }) => ({ ...row, implementation: implementation ? { origin: implementation.origin, code: implementation.code, seed: implementation.seed } : null })) }, null, 2));
  console.log(JSON.stringify(summary, null, 2));
  console.log(path.join(out, 'index.html'));
} finally {
  await vite.close();
}
