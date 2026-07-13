import { getCandidateMaterials } from "../data/candidateMaterials";

export function CandidateMaterials({ candidateNo }: { candidateNo: number }) {
  const groups = getCandidateMaterials(candidateNo);

  return (
    <section className="candidate-materials" aria-label={"候補問題No." + candidateNo + "の支給部材"}>
      <div className="candidate-materials-heading">
        <h3>支給部材</h3>
        <span>使用要否・使用箇所は非表示</span>
      </div>
      <p className="candidate-materials-note">
        公表候補問題図から確認できる部材と規格です。数量・長さ・詳細な施工条件は本試験問題で指定されます。
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
