import { useEffect, useState, type SyntheticEvent } from "react";
import type { CandidateDiagram } from "../data/candidateDiagrams";
import { getCandidateMaterials } from "../data/candidateMaterials";
import { CandidateConstructionConditions } from "./CandidateConstructionConditions";
import { CandidateMaterials } from "./CandidateMaterials";

type PanelState = {
  conditions: boolean;
  materials: boolean;
};

const storageKey = "denko-construction-reference-panels";

export function ConstructionReferencePanel({
  candidateNo,
  conditions,
}: {
  candidateNo: number;
  conditions: CandidateDiagram["constructionConditions"];
}) {
  const [expanded, setExpanded] = useState<PanelState>(readInitialState);
  const materialGroups = getCandidateMaterials(candidateNo);
  const materialCount = materialGroups.reduce((total, group) => total + group.items.length, 0);
  const allExpanded = expanded.conditions && expanded.materials;

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(expanded));
  }, [expanded]);

  function setPanel(panel: keyof PanelState, event: SyntheticEvent<HTMLDetailsElement>) {
    const open = event.currentTarget.open;
    setExpanded((current) => current[panel] === open ? current : { ...current, [panel]: open });
  }

  function setAll(open: boolean) {
    setExpanded({ conditions: open, materials: open });
  }

  return (
    <section className="construction-reference" aria-label="施工条件と支給部材">
      <div className="construction-reference-toolbar">
        <strong>施工情報</strong>
        <button onClick={() => setAll(!allExpanded)} type="button">
          {allExpanded ? "すべて縮小" : "すべて表示"}
        </button>
      </div>
      <details className="reference-details" onToggle={(event) => setPanel("conditions", event)} open={expanded.conditions}>
        <summary>
          <span>施工条件</span>
          <small>{conditions.length}件</small>
        </summary>
        <CandidateConstructionConditions conditions={conditions} />
      </details>
      <details className="reference-details" onToggle={(event) => setPanel("materials", event)} open={expanded.materials}>
        <summary>
          <span>支給部材</span>
          <small>{materialGroups.length}分類・{materialCount}項目</small>
        </summary>
        <CandidateMaterials candidateNo={candidateNo} />
      </details>
    </section>
  );
}

function readInitialState(): PanelState {
  const stored = window.localStorage.getItem(storageKey);
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as Partial<PanelState>;
      if (typeof parsed.conditions === "boolean" && typeof parsed.materials === "boolean") {
        return { conditions: parsed.conditions, materials: parsed.materials };
      }
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }
  const open = window.matchMedia("(min-width: 721px)").matches;
  return { conditions: open, materials: open };
}
