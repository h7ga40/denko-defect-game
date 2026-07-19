# AI Handoff Notes: 電気工事士2種技能試験ゲーム

## 1. プロジェクトの現在のゴール

- 第二種電気工事士技能試験の候補問題、施工後チェック、欠陥判定をスマートフォンとPCで反復学習できるWebアプリを作る。
- 中心機能は、候補問題の複線図から器具またはボックスを選び、最後にまとめて採点する施工チェックゲーム。
- 公開先は https://h7ga40.github.io/denko-defect-game/ 。

## 2. 現在の実装状況とアーキテクチャ

- Vite 8 + React 19 + TypeScript 7。
- App.tsxに施工チェック、複線図、欠陥判定の3モード。初期モードは施工チェック。
- candidateDiagrams.tsに公式番号対応の候補問題No.1～No.13を定義。
- candidateCableStocks.tsにHOZAN過去出題例を基にした支給電線、candidateMaterials.tsに支給器具・接続材料を定義。使用要否と使用箇所は画面で伏せる。
- cableSpecifications.tsで支給電線1件から複数の加工後区間を参照する1対N関係、HOZAN図上寸法、余長込み切断長を管理する。
- boxWiringSpecifications.tsにボックス端の全心線、正しい結線ID、2～4芯の結線グループを定義。
- boxInspectionGame.tsが施工チェックのランダムラウンドを生成。candidateとseedのURLクエリーで候補固定と決定的再現が可能。
- WorkInspectionGame.tsxが回答、欠陥選択一覧、採点、再出題を管理。
- CandidateSvgはボックスと直接選択器具のホットスポットを表示。
- BoxWiringDiagram.tsxは外周ケーブル、内周折曲点、中央周辺の結線部を放射状に配置し、施工結果どおりに心線を接続。
- problems.tsに欠陥判定モードの18問とDefectTypeを定義。
- WiringDiagram.tsxは欠陥タイプをsvg/diagrams/の個別SVGへ振り分ける。
- 欠陥判定モードの最高得点だけをlocalStorageへ保存。
- deploy.ymlがmasterプッシュ時にdist/をGitHub Pagesへ公開。

## 3. 直近で解決した課題・決定事項

- リングスリーブと差込形コネクタは複線図上で直接選ばず、アウトレットボックス／ジョイントボックス内で選ぶ。
- ランプ、スイッチ、コンセント、遮断器、端子台などは複線図から直接選ぶ。
- connector型の接続点はアウトレットボックス、box型はジョイントボックスとして扱う。
- 候補問題の簡略複線図から接続部数、芯数、線径、線色、スリーブ刻印、コネクタ極数を生成し、その中から欠陥2～3件をランダム設定する。
- 各心線はケーブルIDと芯番号で一意に識別し、`correctConnectionId`で正しい所属結線を保持する。
- CandidateDiagramの`boxWirings`で候補問題別の正しい結線を明示でき、未入力時は芯位置から推定する。
- `BoxWiringInstallation.actualConnectionIds`で正解データとは別に施工結果を保持する。
- 施工チェックは毎回、2結線間の心線入替えまたは心線未接続を最低1件含む。
- 誤結線は影響する2結線を欠陥として数え、未接続心線は遊び線として表示する。
- 直接選択器具は現時点では正常施工として出題する。
- 回答直後は答え合わせせず、完了ボタンでまとめて採点する。
- Android ChromeではSVG内文字がタップを奪うため、装飾のpointer-eventsを無効化し、ホットスポットを操作対象にする。
- 2026-07-13にdirectPartsの型だけ追加され実行経路へ渡っていない不具合を修正。回答総数がボックス4問だけなら不具合、直接選択器具を含んで4より多ければ正常。
- HOZANの候補問題No.1～13と施工寸法一覧を参照し、98区間中86区間を支給電線IDへ関連付けた。残りは施工省略側・器具内の論理接続。
- No.11・12の電線管内は黒・白・赤の単芯IVを独立した物理電線として保持する。
- `diagramLengthMm`は器具間寸法、`lengthMm`は接続余長を含む切断長。支給長とは別の値として扱う。
- No.3はアウトレットボックス1～2がVVF 1.6mm 3心、アウトレットボックス2～タイムスイッチがVVF 1.6mm 2心。
- No.3のdeviceWiringsは、S1=ボックス2側黒、S2=ボックス2側白+引掛シーリングローゼット側白、L1=引掛シーリングローゼット側黒。S2のmaxConductorsは2。
- No.7はボックス1～2がVVF 1.6mm 3心、ボックス2～4路スイッチがVVF 1.6mm 2心2本、右側3路スイッチがVVF 1.6mm 3心。右上Rは施工省略。

## 4. 次に取り組むべきタスク（Next Actions）

- 候補問題No.1～No.13について、Android Chromeで各器具と各ボックスをタップ確認する。
- 直接選択器具へ部品別の欠陥あり／なしテンプレートを割り当てる。
- 候補問題ごとの正しい結線を公式資料と照合し、CandidateConnectionの`id`と`boxWirings`を入力する。
- 最大5ケーブル・5結線の放射状表示をAndroid Chrome実機で確認する。
- 条件からリングスリーブのサイズと刻印、差込形コネクタ極数を決定する。
- 公式材料表を転記し、現在の簡略複線図ベースの算出値を厳密な接続条件へ置き換える。
- 公式資料との差異を定期的に見直す。

## 5. 既知の注意点・制約事項

- Windows PowerShellを使用する。
- テキストはUTF-8（BOMなし）。読み込みはGet-Content -Encoding UTF8を使う。
- 文字化け時はCP932を再確認する。
- PowerShellの実行ポリシー対策としてビルドはnpm.cmd run buildを使用できる。
- 複線図とSVGは学習用簡略図であり公式図そのものではない。ボックス結線も現時点では芯位置からの推定値。
- HOZAN由来の器具間寸法と切断長も過去出題に基づく練習用想定値であり、当日の施工条件を優先する。
- 直接選択器具はまだ正常施工のみ。欠陥2～3件はボックス内接続部に設定される。
- boxInspectionGame.ts変更時は、型だけでなく次の実行経路を確認する。
  - createBoxInspectionRound()の戻り値にdirectPartsがある
  - partsにdirectPartsが含まれる
  - WorkInspectionGameからCandidateSvgへ渡される
  - 選択時に右側がDirectDeviceDiagramへ切り替わる
- モバイルのSVGでは、ホットスポットより後の文字・図形がタップを奪わないようpointer-eventsを確認する。
- GitHub Pages反映はActions完了まで時間差がある。Android確認時は再読み込みする。
- 作業前にgit statusを確認し、ユーザーの変更を上書きしない。
