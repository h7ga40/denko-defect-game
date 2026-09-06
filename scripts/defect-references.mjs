export const referencePage = 'https://electrical-worklife.com/2025/06/15/defect/';
const base = 'https://electrical-worklife.com/wp-content/uploads/2022/06/';
const q = (quiz, note) => ({ quiz, note, match: note ? 'related' : 'matched' });
const c = (defectType, variant, note) => ({ construction: { defectType, variant }, note, match: note ? 'related' : 'matched' });
const sheets = [
  ['lamp-a', 'b28c40f47f4a8f149d8a7b774e747de4.jpg', 'lamp-entry-reference-1.jpg', 'ランプレセプタクル', 1, [
    ['白黒の接続先が逆', q('lamp-polarity')],
    ['電線が収まらずカバーを閉じられない', q('lamp-cover-cannot-close')],
    ['端子付近の裸銅線が長すぎる'],
    ['台座の通し穴を使わず結線', q('lamp-cable-entry-bypass')],
  ]],
  ['lamp-b', '4db6294e23992b6857785a6dddf166f3.jpg', 'lamp-entry-reference-2.jpg', 'ランプレセプタクル', 5, [
    ['ねじで絶縁被覆を挟んでいる'],
    ['ねじの固定不足・電線の抜け', q('lamp-terminal-screw-loose')],
    ['外装が短く台座外に絶縁電線が出る'],
  ]],
  ['exposed-a', '7cf425ffb1c0487a0cabef0a689427e5.jpg', 'exposed-blog-1.jpg', '露出形コンセント', 1, [
    ['W端子への電線色が逆', c('receptacle_polarity', 'exposed_receptacle')],
    ['長い電線がカバーに干渉'],
    ['端子付近の裸銅線が長すぎる'],
    ['台座の通し穴を使わず結線', q('exposed-receptacle-entry-bypass')],
  ]],
  ['exposed-b', '77ad89586709b0620af86a5b4df05d5f.jpg', 'exposed-blog-2.jpg', '露出形コンセント', 5, [
    ['ねじで絶縁被覆を挟んでいる'],
    ['ねじの固定不足・電線の抜け', c('terminal_screw_loose', 'exposed_receptacle')],
    ['外装が短く台座外に絶縁電線が出る', q('exposed-receptacle-sheath')],
  ]],
  ['terminal', 'bdc94fcacdbc09ea95447cd2f95152bc.jpg', null, '端子台', 1, [
    ['N・L端子の色対応が逆', q('terminal-block-wrong-terminal', '実装は端子番号誤り。参考写真のN・L逆接続そのものとは異なる。')],
    ['ねじの固定不足・電線の抜け', q('terminal-screw-loose')],
    ['端子から裸銅線が長く出ている'],
    ['ねじで絶縁被覆を挟んでいる'],
  ]],
  ['breaker', '96db86e071a6bbfa4eb2e0725f47bce6.jpg', null, '配線用遮断器', 1, [
    ['N・L端子の色対応が逆', { note: '電源側・負荷側誤りの問題はあるが、この極性誤りとは別の欠陥。' }],
    ['ねじの固定不足・電線の抜け', c('terminal_screw_loose', 'circuit_breaker', '施工チェックに出題あり。正面は汎用器具図のため締付不足の形状表現は要確認。')],
    ['端子から裸銅線が長く出ている'],
    ['ねじで絶縁被覆を挟んでいる'],
  ]],
  ['ceiling', 'f939a90bfe6e8e08561595fc7f53a4b0.jpg', null, '引掛シーリングローゼット', 1, [
    ['接地側表示と電線色が不一致', q('ceiling-connector-polarity')],
    ['挿入口から裸銅線が出ている'],
    ['台座の外まで絶縁電線が出る'],
  ]],
  ['embedded-a', '7b1d16b6ee35cbb0a09a0dad5479b006.jpg', null, '埋込器具・取付枠', 1, [
    ['差込端子の外に裸銅線が出る'],
    ['端子から電線が抜ける', q('push-in-retention-failure')],
    ['コンセントのW側の電線色が逆', q('receptacle-polarity')],
    ['3路スイッチの0端子の電線色が不適合', c('switch_wrong_terminal', 'three_way_switch', '指定端子の接続誤りとして出題。参考写真と同じ0端子・電線色になるとは限らない。')],
  ]],
  ['embedded-b', 'fd99f2db97e988fb9ee8a8ac225d49e9.jpg', null, '埋込器具・取付枠', 5, [
    ['器具や電線解除部の破損'],
    ['渡り線の電線色が不適合'],
    ['連用取付枠の欠落・器具の脱落', q('mounting-frame-loose', '実装は固定爪の掛かり不足。枠自体の付け忘れは未実装。')],
    ['取付枠内の器具配置が違う', q('mounting-frame-wrong-position')],
  ]],
  ['loop', '49a67cca90503dcb342c85174357902d.jpg', null, '輪づくり', 1, [
    ['ねじと逆方向に巻いている', q('lamp-loop-reverse')],
    ['輪の巻付きが不足'],
    ['輪の先端が重なっている'],
    ['ねじの外に裸銅線が長く出る'],
    ['ねじ頭に対して輪が大きすぎる'],
  ]],
  ['cable', 'f3aea900d6f3820fa079887887f0909b.jpg', null, '電線加工', 1, [
    ['シースの縦割りが残っている', { note: 'ケーブル外装の切り傷は実装済みだが、縦割り残りの形・長さ条件とは別。' }],
    ['絶縁被覆の傷から導体が見える', c('cable_insulation_damage')],
    ['導体に深い傷がある'],
  ]],
  ['ring-a', '6c0f3fe476e5771d3e1b3838eaeb22cb.jpg', null, 'リングスリーブ', 1, [
    ['先端の銅線が長く残っている', c('ring_sleeve_conductor_overhang')],
    ['スリーブ本体が壊れている'],
    ['圧着部に絶縁被覆が入っている', q('ring-sleeve-insulation-bite')],
    ['心線の差込みが足りない', q('ring-sleeve-insert')],
  ]],
  ['ring-b', '02ed6a716ef87fcd61b20c5fa97047a7.jpg', null, 'リングスリーブ', 5, [
    ['圧着刻印が接続条件に合わない', q('ring-sleeve-wrong-mark')],
    ['不要なスリーブが電線に残る'],
    ['外装端から接続部までの絶縁電線が短い'],
    ['スリーブ根元の裸銅線が長すぎる', { note: '先端の銅線突出とは位置が異なるため別扱い。' }],
  ]],
  ['push', '505fa5c057bcd02464bbf677429d0b73.jpg', null, '差込形コネクタ', 1, [
    ['挿入口の外に裸銅線が出る', c('push_connector_exposed_conductor')],
    ['心線が奥まで届いていない', q('push-connector-insert')],
  ]],
  ['box-a', '4d876e02f2b5dd5027bbfd0542bdb45f.jpg', null, 'アウトレットボックス・金属管', 1, [
    ['コネクタのロックナットがない', q('metal-conduit-locknut')],
    ['管端の絶縁ブッシングがない', q('metal-conduit-insulation-bushing')],
  ]],
  ['box-b', '80e697ee1974d3c173f255551672670d.jpg', null, 'アウトレットボックス・金属管', 3, [
    ['ねじなしコネクタの止めねじ頭が残る'],
    ['ボンド線の固定位置・固定方法が違う'],
    ['金属管がコネクタから抜ける・挿入不足', q('metal-conduit-insert')],
  ]],
];

export const referenceImages = sheets.map(([id, file, localFile]) => ({ id, file, localFile: localFile ?? file, url: base + file }));
export const referenceRows = sheets.flatMap(([image, , , group, start, entries]) =>
  entries.map(([title, mapping = {}], index) => ({
    id: `${image}-${start + index}`, image, group, number: start + index,
    panel: index, panels: entries.length, title, match: 'missing', ...mapping,
  })),
);
