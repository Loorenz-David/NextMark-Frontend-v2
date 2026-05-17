import type { jsPDF } from "jspdf";
import { AirplaneIconSrc, HelpToCarryIconSrc } from "@/assets/icons";

type SevenByTenItemData = {
  delivery_date?: string | null;
  order_scalar_id?: string | null;
  article_number?: string | null;
  reference_number?: string | null;
  item_type?: string | null;
  quantity?: number | null;
  properties?: Record<string, unknown> | null;
  order_notes?: unknown;
  help_to_carry?: boolean | null;
  order_plan_objective?: string | null;
};

// ─── Helpers ────────────────────────────────────────────────────────────────

const safe = (v: unknown): string => {
  if (v == null) return "--";
  const s = String(v).trim();
  return s || "--";
};

// Distance from baseline to top of capital letter (cm).
// baseline = boxCenter + capH(pt)/2 to visually centre text in a box.
const capH = (pt: number) => pt * 0.026;

const DARK: [number, number, number] = [17, 17, 17];
const MID: [number, number, number] = [55, 55, 55];

const FS = {
  identity: 20.45,
  week: 17.16,
  date: 20.76,
  article: 21,
  label: 7,
  value: 9,
  notesValue: 8,
} as const;

function setFont(
  pdf: jsPDF,
  pt: number,
  bold: boolean,
  color: [number, number, number],
) {
  pdf.setFont("helvetica", bold ? "bold" : "normal");
  pdf.setFontSize(pt);
  pdf.setTextColor(color[0], color[1], color[2]);
}

const fmtWeek = (dateInput?: string | null): string => {
  if (!dateInput) return "V--";
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "V--";
  const utcDate = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const day = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(
    ((utcDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );
  return `V${weekNo}`;
};

const fmtDateLabel = (dateInput?: string | null): string => {
  if (!dateInput) return "missing date";

  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "missing date";

  const year = date.getFullYear();
  const shortYear = String(year).slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const currentYear = new Date().getFullYear();

  return year === currentYear
    ? `${month}-${day}`
    : `${shortYear}-${month}-${day}`;
};

const fmtItemProps = (properties?: Record<string, unknown> | null): string => {
  if (!properties) return "--";
  const parts: string[] = [];
  for (const [k, v] of Object.entries(properties)) {
    if (k.toLowerCase() === "notes") continue;
    if (v == null) continue;
    if (typeof v === "object") {
      const rec = v as Record<string, unknown>;
      if ("name" in rec && "value" in rec) {
        parts.push(`${String(rec.name)}: ${String(rec.value)}`);
      } else {
        const nested = Object.values(rec).map(String).join(", ");
        if (nested) parts.push(`${k}: ${nested}`);
      }
    } else {
      parts.push(`${k}: ${String(v)}`);
    }
  }
  return parts.length ? parts.join("   ·   ") : "--";
};

const fmtOrderNotes = (notes: unknown): string => {
  const entries = Array.isArray(notes) ? notes : notes != null ? [notes] : [];
  const general = entries
    .map((note) => {
      if (typeof note === "string") return note.trim();
      if (!note || typeof note !== "object") return "";
      const typed = note as { content?: unknown; type?: unknown };
      if (String(typed.type ?? "GENERAL").toUpperCase() !== "GENERAL")
        return "";
      return typeof typed.content === "string" ? typed.content.trim() : "";
    })
    .filter(Boolean);
  return general.length ? general.join(" ") : "--";
};

const HELP_TO_CARRY_ICON_PATH =
  HelpToCarryIconSrc.match(/<path[^>]*\sd="([^"]+)"/)?.[1] ?? "";
const AIRPLANE_ICON_PATH =
  AirplaneIconSrc.match(/<path[^>]*\sd="([^"]+)"/)?.[1] ?? "";

const HELP_TO_CARRY_VIEWBOX = {
  x: 0,
  y: -64,
  size: 640,
} as const;

const AIRPLANE_VIEWBOX = {
  x: 0,
  y: 0,
  size: 512,
} as const;

type PdfPathCommand = {
  op: "m" | "l" | "c" | "h";
  c: number[];
};

type SvgViewBox = {
  x: number;
  y: number;
  size: number;
};

const tokenizeSvgPath = (path: string) =>
  path.match(
    /[AaCcHhLlMmQqSsTtVvZz]|[-+]?(?:\d*\.\d+|\d+\.?)(?:e[-+]?\d+)?/gi,
  ) ?? [];

const isSvgCommand = (token: string) => /^[A-Za-z]$/.test(token);

const svgToPdfX = (
  value: number,
  x: number,
  size: number,
  viewBox: SvgViewBox,
) => x + ((value - viewBox.x) / viewBox.size) * size;

const svgToPdfY = (
  value: number,
  y: number,
  size: number,
  viewBox: SvgViewBox,
) => y + ((value - viewBox.y) / viewBox.size) * size;

const parseSvgIconPath = (
  path: string,
  x: number,
  y: number,
  size: number,
  viewBox: SvgViewBox,
): PdfPathCommand[] => {
  const tokens = tokenizeSvgPath(path);
  const commands: PdfPathCommand[] = [];
  let index = 0;
  let command = "";
  let currentX = 0;
  let currentY = 0;
  let startX = 0;
  let startY = 0;
  let lastControlX: number | null = null;
  let lastControlY: number | null = null;

  const hasNumber = () => index < tokens.length && !isSvgCommand(tokens[index]);
  const readNumber = () => Number(tokens[index++]);
  const point = (svgX: number, svgY: number) => [
    svgToPdfX(svgX, x, size, viewBox),
    svgToPdfY(svgY, y, size, viewBox),
  ];

  while (index < tokens.length) {
    if (isSvgCommand(tokens[index])) {
      command = tokens[index++];
    }

    const relative = command === command.toLowerCase();
    const op = command.toLowerCase();

    if (op === "m") {
      let first = true;
      while (hasNumber()) {
        const nextX = readNumber();
        const nextY = readNumber();
        currentX = relative ? currentX + nextX : nextX;
        currentY = relative ? currentY + nextY : nextY;
        const [px, py] = point(currentX, currentY);
        commands.push({ op: first ? "m" : "l", c: [px, py] });
        if (first) {
          startX = currentX;
          startY = currentY;
          first = false;
        }
      }
      lastControlX = null;
      lastControlY = null;
      continue;
    }

    if (op === "l") {
      while (hasNumber()) {
        const nextX = readNumber();
        const nextY = readNumber();
        currentX = relative ? currentX + nextX : nextX;
        currentY = relative ? currentY + nextY : nextY;
        commands.push({ op: "l", c: point(currentX, currentY) });
      }
      lastControlX = null;
      lastControlY = null;
      continue;
    }

    if (op === "h") {
      while (hasNumber()) {
        const nextX = readNumber();
        currentX = relative ? currentX + nextX : nextX;
        commands.push({ op: "l", c: point(currentX, currentY) });
      }
      lastControlX = null;
      lastControlY = null;
      continue;
    }

    if (op === "v") {
      while (hasNumber()) {
        const nextY = readNumber();
        currentY = relative ? currentY + nextY : nextY;
        commands.push({ op: "l", c: point(currentX, currentY) });
      }
      lastControlX = null;
      lastControlY = null;
      continue;
    }

    if (op === "c") {
      while (hasNumber()) {
        const c1x = readNumber();
        const c1y = readNumber();
        const c2x = readNumber();
        const c2y = readNumber();
        const endX = readNumber();
        const endY = readNumber();
        const control1X = relative ? currentX + c1x : c1x;
        const control1Y = relative ? currentY + c1y : c1y;
        const control2X = relative ? currentX + c2x : c2x;
        const control2Y = relative ? currentY + c2y : c2y;
        currentX = relative ? currentX + endX : endX;
        currentY = relative ? currentY + endY : endY;
        commands.push({
          op: "c",
          c: [
            ...point(control1X, control1Y),
            ...point(control2X, control2Y),
            ...point(currentX, currentY),
          ],
        });
        lastControlX = control2X;
        lastControlY = control2Y;
      }
      continue;
    }

    if (op === "s") {
      while (hasNumber()) {
        const reflectedX =
          lastControlX == null ? currentX : currentX * 2 - lastControlX;
        const reflectedY =
          lastControlY == null ? currentY : currentY * 2 - lastControlY;
        const c2x = readNumber();
        const c2y = readNumber();
        const endX = readNumber();
        const endY = readNumber();
        const control2X = relative ? currentX + c2x : c2x;
        const control2Y = relative ? currentY + c2y : c2y;
        currentX = relative ? currentX + endX : endX;
        currentY = relative ? currentY + endY : endY;
        commands.push({
          op: "c",
          c: [
            ...point(reflectedX, reflectedY),
            ...point(control2X, control2Y),
            ...point(currentX, currentY),
          ],
        });
        lastControlX = control2X;
        lastControlY = control2Y;
      }
      continue;
    }

    if (op === "z") {
      commands.push({ op: "h", c: [] });
      currentX = startX;
      currentY = startY;
      lastControlX = null;
      lastControlY = null;
      continue;
    }

    break;
  }

  return commands;
};

const drawCarryAssistIcon = (
  pdf: jsPDF,
  x: number,
  y: number,
  size: number,
) => {
  const iconPath = parseSvgIconPath(
    HELP_TO_CARRY_ICON_PATH,
    x,
    y,
    size,
    HELP_TO_CARRY_VIEWBOX,
  );
  if (!iconPath.length) return;

  pdf.setFillColor(17, 17, 17);
  pdf.path(iconPath);
  pdf.fill();
};

const drawAirplaneIcon = (pdf: jsPDF, x: number, y: number, size: number) => {
  const iconPath = parseSvgIconPath(
    AIRPLANE_ICON_PATH,
    x,
    y,
    size,
    AIRPLANE_VIEWBOX,
  );
  if (!iconPath.length) return;

  pdf.setFillColor(17, 17, 17);
  pdf.path(iconPath);
  pdf.fill();
};

// ─── Sample data for preview ────────────────────────────────────────────────

export const sevenByTenTemplateItemSampleData = {
  itemPayload: {
    delivery_date: "2026-05-03",
    item_type: "Dining Chair",
    order_scalar_id: "#1324",
    help_to_carry: true,
    order_plan_objective: "international_shipping",
    article_number: "A-1048",
    properties: { set: "of 4", color: "Oak" },
    order_notes: [
      { type: "GENERAL", content: "Deliver through the side entrance." },
    ],
    quantity: 1,
  },
};

// ─── Layout constants (cm) ──────────────────────────────────────────────────

const PAD = 0.24;
const TOP_ROW_H = 0.82;
const ARTICLE_ROW_H = 1.34;
const BODY_GAP = 0.22;
const COL_GAP = 0.24;
const LEFT_COL_W = 4.18;

// ─── Public draw function ────────────────────────────────────────────────────

export const drawSevenByTenTemplateItem = (
  pdf: jsPDF,
  rawData: unknown,
  widthCm: number,
  heightCm: number,
): void => {
  const wrapper = rawData as { itemPayload?: SevenByTenItemData };
  const data: SevenByTenItemData =
    wrapper.itemPayload ?? (rawData as SevenByTenItemData);
  const W = widthCm;
  const H = heightCm;

  const topY = PAD;
  const articleY = topY + TOP_ROW_H;
  const bodyY = articleY + ARTICLE_ROW_H + BODY_GAP;
  const bodyBottom = H - PAD;
  const bodyH = Math.max(0, bodyBottom - bodyY);
  const leftX = PAD;
  const rightX = leftX + LEFT_COL_W + COL_GAP;
  const rightW = W - rightX - PAD;
  const midX = W / 2;

  // Outer border
  pdf.setDrawColor(17, 17, 17);
  pdf.setLineWidth(0.025);
  pdf.rect(0, 0, W, H, "S");

  // ─── Top row: identity / week + date ───────────────────────────────────────
  const idText = safe(data.order_scalar_id);
  const weekText = fmtWeek(data.delivery_date);
  const dateText = fmtDateLabel(data.delivery_date);
  const topBaseY = topY + TOP_ROW_H / 2 + capH(FS.identity) / 2;

  setFont(pdf, FS.identity, true, DARK);
  pdf.text(idText, PAD, topBaseY);
  if (data.order_plan_objective === "international_shipping") {
    const airplaneSize = 0.58;
    drawAirplaneIcon(
      pdf,
      PAD + pdf.getTextWidth(idText) + 0.27,
      topBaseY - airplaneSize + capH(FS.identity) * 0.15,
      airplaneSize,
    );
  }

  setFont(pdf, FS.week, true, DARK);
  const weekW = pdf.getTextWidth(weekText);
  const dateGap = 0.75;
  const dateRightX = W - PAD;
  const weekX = dateRightX - pdf.getTextWidth(dateText) - dateGap - weekW;
  pdf.text(weekText, weekX, topBaseY);
  setFont(pdf, FS.date, false, MID);
  pdf.text(dateText, dateRightX, topBaseY, { align: "right" });

  // ─── Article row ───────────────────────────────────────────────────────────
  const articleText = safe(data.article_number || data.reference_number);
  const articleBaseY = articleY + ARTICLE_ROW_H / 2 + capH(FS.article) / 2;

  setFont(pdf, FS.article, true, DARK);
  const articleLines = pdf.splitTextToSize(
    articleText,
    W - PAD * 2,
  ) as string[];
  pdf.text(String(articleLines[0] ?? "--"), midX, articleBaseY, {
    align: "center",
  });

  // ─── Body row: info + drawing box ─────────────────────────────────────────
  const sectionGap = 0.2;
  const textMaxW = LEFT_COL_W;
  const drawBoxW = rightW * 0.72;
  const drawBoxH = bodyH * 0.864;
  const drawBoxX = rightX + rightW - drawBoxW;
  const drawBoxY = bodyBottom - drawBoxH;
  let cursorY = drawBoxY;

  const drawField = (
    label: string,
    value: string,
    valueFontSize: number,
    maxLines: number,
  ) => {
    setFont(pdf, FS.label, true, DARK);
    pdf.text(`${label}:`, leftX, cursorY + capH(FS.label));
    cursorY += 0.36;

    setFont(pdf, valueFontSize, false, MID);
    const lines = pdf.splitTextToSize(value, textMaxW) as string[];
    const lineH = capH(valueFontSize) + 0.11;
    lines.slice(0, maxLines).forEach((line, idx) => {
      pdf.text(
        String(line),
        leftX,
        cursorY + capH(valueFontSize) + idx * lineH,
      );
    });
    cursorY +=
      lineH * Math.min(Math.max(lines.length, 1), maxLines) + sectionGap;
  };

  drawField("Quantity", safe(data.quantity), FS.value, 1);

  const propsLabel = fmtItemProps(data.properties);
  const notesText = fmtOrderNotes(data.order_notes);
  drawField("Properties", propsLabel, FS.value, 3);
  drawField("Notes", notesText, FS.notesValue, 4);

  pdf.setDrawColor(17, 17, 17);
  pdf.setLineWidth(0.025);
  pdf.rect(drawBoxX, drawBoxY, drawBoxW, drawBoxH, "S");

  if (data.help_to_carry === true) {
    const iconSize = Math.min(0.86, Math.max(0.62, drawBoxW * 0.22));
    drawCarryAssistIcon(
      pdf,
      drawBoxX + drawBoxW - iconSize - 0.18,
      drawBoxY + drawBoxH - iconSize - 0.16,
      iconSize,
    );
  }
};
