# AI Handoff Notes: 電気工事士2種技能試験ゲーム

## 1. プロジェクトの現在のゴール

- 第二種電気工事士技能試験の欠陥判定を練習するWebミニゲームを作る。
- 現在はMVPとして、簡略SVG図を見て欠陥を選び、正誤と解説、スコアを確認できる状態。

## 2. 現在の実装状況とアーキテクチャ

- Vite + React + TypeScript。
- `src/data/problems.ts` に5問の問題データがある。
- `src/components/svg/WiringDiagram.tsx` が欠陥タイプに応じた簡略SVG図を描画する。
- `src/components/ProblemView.tsx` が出題と正誤表示を担当する。
- `src/components/ScoreView.tsx` が結果表示を担当する。
- 最高記録はlocalStorageに保存する。

## 3. 直近で解決した課題・決定事項

- `codex-project-initializer` で `D:\ElectricalTechnician\denko-defect-game` を作成し、Gitを初期化した。
- 初期MVPとしてランプレセプタクル、接地極付コンセント、アウトレットボックスの欠陥判定問題を追加した。

## 4. 次に取り組むべきタスク（Next Actions）

- `npm install` 後に `npm run build` でビルド確認する。
- 問題数を候補問題ごとに増やす。
- 公開資料の欠陥判定文言に合わせて解説を精査する。
- GitHub Pages公開をするならdeploy設定を追加する。

## 5. 既知の注意点・制約事項

- このアプリは練習用の簡略教材で、実技試験の公式判定を代替しない。
- 実際の欠陥判定は試験センター等の公開資料で確認する前提。
- SVGは教材用のオリジナル簡略図として扱う。
