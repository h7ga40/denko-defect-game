# 電気工事士2種技能試験ゲーム

第二種電気工事士技能試験の施工確認と欠陥判定を練習するWebアプリです。候補問題13問の学習用簡略複線図、施工チェックゲーム、部品ごとの欠陥判定クイズを収録しています。

公開URL: https://h7ga40.github.io/denko-defect-game/

## 学習モード

### 施工チェック

初期表示されるメインゲームです。

- 候補問題No.1～No.13から毎回ランダムに出題
- ランプ、スイッチ、コンセントなどは複線図から直接選択
- 接続点はアウトレットボックスまたはジョイントボックスとして選択
- ボックス内にはリングスリーブ2件、差し込みコネクタ2件を表示
- 回答時点では正誤を表示せず、最後にまとめて採点
- 欠陥ありとして選択した接続部を一覧表示
- 接続部の欠陥は毎回2～3か所をランダムに設定

### 複線図

公式候補問題のNo.1～No.13に対応した、学習用の簡略複線図を一覧表示します。器具配置や配線はアプリ用に簡略化しています。

### 欠陥判定

部品ごとのSVGを見て欠陥名を選ぶクイズです。全18問を順番に回答し、正誤・解説・最終スコアを確認できます。最高記録はブラウザのlocalStorageへ保存します。

## 主な対象部品・欠陥

- ランプレセプタクル
- ケーブル外装
- 露出形コンセント
- 配線用遮断器
- リングスリーブ
- 差し込みコネクタ
- 端子台
- 引掛シーリング
- 連用取付枠
- スイッチ
- コンセント
- 接地極付コンセント
- アウトレットボックス
- ジョイントボックス

リングスリーブでは刻印、サイズ、心線差し込み、絶縁被覆かみ込みを扱います。差し込みコネクタでは心線差し込み不足と接続本数不適合を扱います。

## 技術構成

- Vite 8
- React 19
- TypeScript 7
- Reactコンポーネントとして管理するSVG
- localStorage
- GitHub Actions / GitHub Pages

## ローカル実行

~~~powershell
npm install
npm run dev
~~~

本番ビルド:

~~~powershell
npm run build
~~~

ビルド結果は dist/ に生成されます。

## GitHub Pages公開

master ブランチへのプッシュで .github/workflows/deploy.yml が実行されます。

1. Node.js 24をセットアップ
2. npm ci
3. npm run build
4. dist/ をGitHub Pagesへデプロイ

docs/ フォルダへビルド結果を置く方式は使用していません。

## 主要ファイル

~~~text
src/
|-- App.tsx
|-- data/
|   |-- problems.ts
|   |-- candidateDiagrams.ts
|   +-- boxInspectionGame.ts
|-- components/
|   |-- WorkInspectionGame.tsx
|   |-- CandidateDiagramView.tsx
|   |-- BoxWiringDiagram.tsx
|   |-- ProblemView.tsx
|   |-- ScoreView.tsx
|   +-- svg/
|       |-- WiringDiagram.tsx
|       +-- diagrams/
+-- styles.css
~~~

詳細仕様は docs/specification.md、作業履歴は docs/dev_diary.md、AI向け引き継ぎは ai_context/handoff_notes.md を参照してください。

## 注意事項

このアプリは練習用の簡略教材です。実際の施工条件や欠陥判定は、試験センター等の最新の公式資料で確認してください。
