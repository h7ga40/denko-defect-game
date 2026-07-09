# Specification: 電気工事士2種技能試験ゲーム

## 1. Project Goal

第二種電気工事士技能試験の欠陥判定を練習するWebミニゲーム。候補問題の簡略配線図を見て欠陥を選び、正誤と解説、スコアを確認できる。

## 2. Target Users

- 第二種電気工事士技能試験の受験者
- 候補問題の施工後チェックを練習したい学習者
- 欠陥名と図の特徴を短時間で反復したい人

## 3. Core Features

- 簡略SVG配線図を見て欠陥を選ぶクイズ
- 回答後の正誤判定と解説表示
- 問題数、正解数、最高記録の表示
- 最高記録をlocalStorageへ保存
- スマートフォンとPCの両方で操作できるレスポンシブUI

## 4. Technology Stack

- Primary language / stack: React
- Runtime / framework: Vite + React + TypeScript
- Data storage: localStorage
- Drawing: React component SVG

## 5. Architecture Notes

- Source code lives in `src/`.
- Project notes live in `docs/`.
- AI handoff context lives in `ai_context/`.
- `src/data/problems.ts` contains the quiz data.
- `src/components/svg/WiringDiagram.tsx` renders simplified wiring diagrams from defect types.
- `src/components/ProblemView.tsx` handles question display and answer feedback.
- `src/components/ScoreView.tsx` handles final score display.

## 6. Open Questions

- 問題データを実際の候補問題番号ごとに増やすか。
- 欠陥判定の文言を公開資料に合わせて厳密化するか。
- GitHub Pages公開用のdeploy設定を追加するか。
