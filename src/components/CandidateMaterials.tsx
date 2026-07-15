import { getCandidateMaterials } from "../data/candidateMaterials";

export function CandidateMaterials({ candidateNo }: { candidateNo: number }) {
  const groups = getCandidateMaterials(candidateNo);

  return (
    <section className="candidate-materials" aria-label={"候補問題No." + candidateNo + "の支給部材"}>
      <div className="candidate-materials-heading">
        <h3>支給部材</h3>
        <span>過去出題を基にした想定値</span>
      </div>
      <p className="candidate-materials-note">
        HOZANの過去出題例を参考にした練習用の想定支給部材です。本試験では数量・長さ・接続方法・器具仕様が変わる場合があります。使用要否と使用箇所は表示していません。
      </p>
      <div className="candidate-material-groups">
        {groups.map((group) => (
          <div className="candidate-material-group" key={group.category}>
            <strong>{group.category}</strong>
            <ul>
              {group.items.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
