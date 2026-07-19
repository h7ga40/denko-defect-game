import type { CandidateDiagram } from "../data/candidateDiagrams";

export function CandidateConstructionConditions({
  conditions,
}: {
  conditions: CandidateDiagram["constructionConditions"];
}) {
  return (
    <section className="candidate-conditions" aria-label="施工条件">
      <h3>施工条件</h3>
      <ul>
        {conditions.map((condition) => <li key={condition}>{condition}</li>)}
      </ul>
    </section>
  );
}
