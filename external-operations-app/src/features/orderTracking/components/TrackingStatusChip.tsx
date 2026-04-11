interface Props {
  status: string | null;
  label: string | null;
}

interface StatusStyle {
  background: string;
  color: string;
}

function getStatusStyle(status: string | null): StatusStyle {
  switch ((status ?? "").toLowerCase()) {
    case "draft":
      return { background: "rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.55)" };
    case "confirmed":
      return { background: "rgba(100,150,255,0.20)", color: "rgba(140,170,255,0.95)" };
    case "preparing":
      return { background: "rgba(255,160,80,0.20)", color: "rgba(255,170,90,0.95)" };
    case "ready":
      return { background: "rgba(255,210,80,0.20)", color: "rgba(255,215,90,0.95)" };
    case "processing":
      return { background: "rgba(131,204,185,0.20)", color: "#83ccb9" };
    case "completed":
      return { background: "rgba(100,200,120,0.20)", color: "rgba(110,215,130,0.95)" };
    case "fail":
    case "failed":
      return { background: "rgba(255,80,80,0.20)", color: "rgba(255,100,100,0.95)" };
    case "cancelled":
    case "canceled":
      return { background: "rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.45)" };
    default:
      return { background: "rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.55)" };
  }
}

export function TrackingStatusChip({ status, label }: Props) {
  const { background, color } = getStatusStyle(status);
  const displayLabel = label ?? status ?? "Unknown";

  return (
    <span
      style={{ background, color }}
      className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide"
    >
      {displayLabel}
    </span>
  );
}
