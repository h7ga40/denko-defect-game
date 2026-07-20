import type {
  InspectionAction,
  InspectionObservation,
  InspectionViewpoint,
  PhysicalInspectionModel,
  PhysicalInspectionSession,
} from "../data/physicalInspection";
import { resolveInspectionAction } from "../data/physicalInspection";
import "./physicalInspection.css";

const svgViewpoints = ["front", "back", "left", "right"] as const satisfies InspectionViewpoint[];
const viewpointLabels: Record<(typeof svgViewpoints)[number], string> = {
  front: "正面",
  back: "背面",
  left: "左側面",
  right: "右側面",
};

type Props = {
  model: PhysicalInspectionModel;
  session: PhysicalInspectionSession;
  onChange: (session: PhysicalInspectionSession) => void;
};

export function PhysicalInspectionControls({ model, session, onChange }: Props) {
  const viewAction = model.actions.find((action) => action.kind === "view");
  const viewpoints = viewAction
    ? svgViewpoints.filter((viewpoint) => viewAction.viewpoints.includes(viewpoint))
    : [];
  const inspectionActions = model.actions.filter((action) => action.kind !== "view");
  const latestObservation = session.observations.at(-1);

  function selectViewpoint(viewpoint: InspectionViewpoint) {
    if (!viewAction) return;
    const observation = resolveInspectionAction(model, viewAction, viewpoint);
    onChange({
      ...session,
      selectedActionId: viewAction.id,
      viewpoint,
      observations: [...session.observations, observation],
    });
  }

  function runAction(action: InspectionAction) {
    const observation = resolveInspectionAction(model, action, session.viewpoint);
    onChange({
      ...session,
      selectedActionId: action.id,
      observations: [...session.observations, observation],
    });
  }

  return (
    <section className="physical-inspection-controls" aria-label="検査操作">
      {viewpoints.length > 0 && (
        <div className="inspection-control-group">
          <strong>表示方向</strong>
          <div className="inspection-viewpoint-buttons">
            {viewpoints.map((viewpoint) => (
              <button
                aria-pressed={session.viewpoint === viewpoint}
                className={session.viewpoint === viewpoint ? "selected" : ""}
                key={viewpoint}
                onClick={() => selectViewpoint(viewpoint)}
                type="button"
              >
                {viewpointLabels[viewpoint]}
              </button>
            ))}
          </div>
        </div>
      )}
      {inspectionActions.length > 0 && (
        <div className="inspection-control-group">
          <strong>検査操作</strong>
          <div className="inspection-action-buttons">
            {inspectionActions.map((action) => (
              <button key={action.id} onClick={() => runAction(action)} type="button">
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="inspection-observation" aria-live="polite">
        <strong>観察結果</strong>
        <p>{latestObservation ? observationText(latestObservation, session.viewpoint) : "表示方向や検査操作を選択してください。"}</p>
      </div>
    </section>
  );
}

function observationText(observation: InspectionObservation, viewpoint: InspectionViewpoint) {
  switch (observation.result) {
    case "visible":
      return `${viewpointLabel(viewpoint)}から確認しています。`;
    case "not_visible":
      return `${viewpointLabel(viewpoint)}から確認できる変化はありません。`;
    case "retained":
      return "軽く引いても固定されたままです。";
    case "released":
      return "軽く引くと対象が固定部から外れました。";
    case "stable":
      return "固定部にがたつきはありません。";
    case "movement_detected":
      return "固定部にがたつきがあります。";
    case "cover_removed":
      return "カバーを外し、内部を確認できる状態にしました。";
  }
}

function viewpointLabel(viewpoint: InspectionViewpoint) {
  if (viewpoint === "front") return "正面";
  if (viewpoint === "back") return "背面";
  if (viewpoint === "left") return "左側面";
  if (viewpoint === "right") return "右側面";
  if (viewpoint === "top") return "上面";
  if (viewpoint === "bottom") return "下面";
  return "自由視点";
}