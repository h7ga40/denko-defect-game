# 電気工事士2種技能試験ゲーム

## Overview

第二種電気工事士技能試験の欠陥判定を練習するWebミニゲームです。簡略配線図を見て欠陥を選び、正誤と解説、スコアを確認できます。

## Tech Stack

- Vite
- React
- TypeScript
- SVG
- localStorage

## Getting Started

1. Run `npm install`.
2. Run `npm run dev`.
3. Open the local URL shown in the terminal.

## Current MVP

- 5問の欠陥判定クイズ
- ランプレセプタクル、接地極付コンセント、アウトレットボックスの簡略SVG図
- 選択式の正誤判定
- 解説表示
- スコアと最高記録のlocalStorage保存

## Folder Structure

```text
.
|-- index.html
|-- package.json
|-- vite.config.ts
|-- README.md
|-- docs/
|   |-- specification.md
|   `-- dev_diary.md
|-- ai_context/
|   `-- handoff_notes.md
`-- src/
    |-- App.tsx
    |-- main.tsx
    |-- styles.css
    |-- components/
    |   |-- ProblemView.tsx
    |   |-- ScoreView.tsx
    |   `-- svg/
    |       `-- WiringDiagram.tsx
    `-- data/
        `-- problems.ts
```

## Notes

このアプリは練習用の簡略教材です。実際の欠陥判定は試験センター等の公開資料で確認してください。

`ai_context/handoff_notes.md` は、新しいCodexスレッドへ作業を移す前に更新する引き継ぎファイルです。
