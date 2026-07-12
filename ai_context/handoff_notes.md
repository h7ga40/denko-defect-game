# AI Handoff Notes: 電気工事士2種技能試験ゲーム

## 1. プロジェクトの現在のゴール

- 第二種電気工事士技能試験の候補問題、施工後チェック、欠陥判定をスマートフォンとPCで反復学習できるWebアプリを作る。
- 中心機能は、候補問題の複線図から器具またはボックスを選び、最後にまとめて採点する施工チェックゲーム。
- 公開先は https://h7ga40.github.io/denko-defect-game/ 。

## 2. 現在の実装状況とアーキテクチャ

- Vite 8 + React 19 + TypeScript 7。
- App.tsxに施工チェック、複線図、欠陥判定の3モード。初期モードは施工チェック。
- candidateDiagrams.tsに公式番号対応の候補問題No.1～No.13を定義。
- boxInspectionGame.tsが施工チェックのランダムラウンドを生成。
- WorkInspectionGame.tsxが回答、欠陥選択一覧、採点、再出題を管理。
- CandidateSvgはボックスと直接選択器具のホットスポットを表示。
- BoxWiringDiagram.tsxは候補問題の接続本数に応じて2～5接続部、各2～4芯を可変表示。
- problems.tsに欠陥判定モードの18問とDefectTypeを定義。
- WiringDiagram.tsxは欠陥タイプをsvg/diagrams/の個別SVGへ振り分ける。
- 欠陥判定モードの最高得点だけをlocalStorageへ保存。
- deploy.ymlがmasterプッシュ時にdist/をGitHub Pagesへ公開。

## 3. 直近で解決した課題・決定事項

- リングスリーブと差し込みコネクタは複線図上で直接選ばず、アウトレットボックス／ジョイントボックス内で選ぶ。
- ランプ、スイッチ、コンセント、遮断器、端子台などは複線図から直接選ぶ。
- connector型の接続点はアウトレットボックス、box型はジョイントボックスとして扱う。
- 候補問題の簡略複線図から接続部数、芯数、線径、線色、スリーブ刻印、コネクタ極数を生成し、その中から欠陥2～3件をランダム設定する。
- 直接選択器具は現時点では正常施工として出題する。
- 回答直後は答え合わせせず、完了ボタンでまとめて採点する。
- Android ChromeではSVG内文字がタップを奪うため、装飾のpointer-eventsを無効化し、ホットスポットを操作対象にする。
- 2026-07-13にdirectPartsの型だけ追加され実行経路へ渡っていない不具合を修正。回答総数がボックス4問だけなら不具合、直接選択器具を含んで4より多ければ正常。

## 4. 次に取り組むべきタスク（Next Actions）

- 候補問題No.1～No.13について、Android Chromeで各器具と各ボックスをタップ確認する。
- 直接選択器具へ部品別の欠陥あり／なしテンプレートを割り当てる。
- 候補問題ごとのケーブル太さ、本数、接続条件をデータ化する。
- 条件からリングスリーブのサイズと刻印、差し込みコネクタ極数を決定する。
- 公式材料表を転記し、現在の簡略複線図ベースの算出値を厳密な接続条件へ置き換える。
- 公式資料との差異を定期的に見直す。

## 5. 既知の注意点・制約事項

- Windows PowerShellを使用する。
- テキストはUTF-8（BOMなし）。読み込みはGet-Content -Encoding UTF8を使う。
- 文字化け時はCP932を再確認する。
- PowerShellの実行ポリシー対策としてビルドはnpm.cmd run buildを使用できる。
- 複線図とSVGは学習用簡略図であり公式図そのものではない。可変芯数も現時点では簡略複線図からの算出値。
- 直接選択器具はまだ正常施工のみ。欠陥2～3件はボックス内接続部に設定される。
- boxInspectionGame.ts変更時は、型だけでなく次の実行経路を確認する。
  - createBoxInspectionRound()の戻り値にdirectPartsがある
  - partsにdirectPartsが含まれる
  - WorkInspectionGameからCandidateSvgへ渡される
  - 選択時に右側がDirectDeviceDiagramへ切り替わる
- モバイルのSVGでは、ホットスポットより後の文字・図形がタップを奪わないようpointer-eventsを確認する。
- GitHub Pages反映はActions完了まで時間差がある。Android確認時は再読み込みする。
- 作業前にgit statusを確認し、ユーザーの変更を上書きしない。
