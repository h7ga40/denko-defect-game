# Development Diary

## 2026-07-09

- Work done:
  - codex-project-initializerでプロジェクトを作成。
  - Vite + React + TypeScriptの初期MVPを実装。
  - 欠陥判定、SVG、解説、得点、localStorage最高記録を追加。
- Ideas:
  - 候補問題別データとGitHub Pages公開を追加する。

## 2026-07-10 ～ 2026-07-12

- Work done:
  - ケーブル、露出形コンセント、遮断器、差し込みコネクタ、端子台、引掛シーリング、連用取付枠、スイッチ、コンセントへ欠陥を拡張。
  - リングスリーブの刻印、サイズ、差し込み不足、絶縁被覆かみ込みを追加。
  - 差し込みコネクタの差し込み不足、接続本数不適合を追加。
  - 欠陥SVGを部品ごとのファイルへ分割。
  - 候補問題No.1～No.13を公式番号に合わせて整理。
  - 施工チェック、複線図、欠陥判定の3モードに変更し、施工チェックを初期画面に設定。
  - 候補問題、工作部分、欠陥をラウンドごとにランダム化。
  - GitHub ActionsによるGitHub Pages公開を追加。
- Errors encountered and fixes:
  - ランプレセプタクルSVGの崩れを修正。
  - GitHub CLIとNode.jsの環境を更新。
- Ideas:
  - 候補問題の材料条件をボックス内接続へ連動する。

## 2026-07-13

- Work done:
  - 複線図の接続点をアウトレットボックス／ジョイントボックスとして選ぶ構成へ変更。
  - ボックス内配線図にリングスリーブ2件、差し込みコネクタ2件を配置。
  - ボックス内接続部から欠陥2～3件をランダム設定。
  - ランプ、スイッチ、コンセントなどを複線図から直接選ぶ経路を追加。
  - Android Chrome向けに選択枠を太くし、SVG文字がタップを妨げないようpointer-eventsを調整。
- Errors encountered and fixes:
  - ボックスのみ選択可能になり、既存器具を選べなくなった。
    - 直接選択器具の型とホットスポットを追加。
  - 説明文と型だけ更新され、directPartsがラウンドと画面へ渡っていなかった。
    - BoxInspectionRound、全採点対象、CandidateSvgへのprops、右側の器具判定表示を接続。
  - CSS修正だけでは直らないことを、Android画面の回答 0 / 4から特定。
- Ideas:
  - Android Chromeで候補問題No.1～No.13を一通りタップ確認する。
  - 直接選択器具へ部品別の欠陥テンプレートを割り当てる。
  - ボックス内配線を候補問題の実配線条件へ近づける。

---

## Entry Template

- Date: YYYY-MM-DD
- Work done:
  - [What changed?]
- Errors encountered and fixes:
  - [Error] -> [Fix]
- Ideas:
  - [Idea]
