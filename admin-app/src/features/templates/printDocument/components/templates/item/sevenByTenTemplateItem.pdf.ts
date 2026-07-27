import type { jsPDF } from "jspdf";
import type { ItemProperty } from "@shared-domain";
import { normalizeItemProperties } from "@shared-domain";
import { HelpToCarryIconSrc } from "@/assets/icons";

type SevenByTenItemData = {
  delivery_date?: string | null;
  order_scalar_id?: string | null;
  article_number?: string | null;
  reference_number?: string | null;
  item_type?: string | null;
  quantity?: number | null;
  properties?: ItemProperty[] | Record<string, unknown> | null;
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
  objective: 16,
  article: 21,
  weekDate: 21 * 1.3,
  weekDateWithoutNotes: 21 * 1.6,
  // Item qualities — enlarged (with wider row spacing) to fill the body.
  // Notes stays compact per design.
  label: 10.5,
  value: 14,
  notesLabel: 9.1,
  notesValue: 10.4,
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

  const dateOnlyMatch = dateInput
    .trim()
    .match(/^(\d{4})-(\d{2})-(\d{2})(?:T|$)/);
  if (dateOnlyMatch) {
    return `${dateOnlyMatch[3]}-${dateOnlyMatch[2]}`;
  }

  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "missing date";

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${day}-${month}`;
};

// Keys are stored snake_case; only the first word is shown so a long key
// cannot eat the line. A single word longer than the cap is still truncated
// with ".." (Latin-1 safe for the built-in Helvetica font).
const PROP_NAME_MAX_CHARS = 14;

const capPropName = (name: string): string => {
  const firstWord = name.split("_")[0] ?? name;
  return firstWord.length > PROP_NAME_MAX_CHARS
    ? `${firstWord.slice(0, PROP_NAME_MAX_CHARS - 2)}..`
    : firstWord;
};

const fmtItemPropEntries = (
  properties?: SevenByTenItemData["properties"],
): Array<{ name: string; value: string }> => {
  const entries = normalizeItemProperties(properties) ?? [];
  return entries
    .filter((entry) => entry.name.toLowerCase() !== "notes" && entry.value != null)
    .map((entry) => ({ name: capPropName(entry.name), value: String(entry.value) }));
};

const fmtPlanObjective = (objective?: string | null): string => {
  switch (objective) {
    case "international_shipping":
      return "International";
    case "local_delivery":
      return "Local";
    case "store_pickup":
      return "Pickup";
    default:
      return "";
  }
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
  return general.join(" ");
};

const HELP_TO_CARRY_ICON_PATH =
  HelpToCarryIconSrc.match(/<path[^>]*\sd="([^"]+)"/)?.[1] ?? "";

const HELP_TO_CARRY_VIEWBOX = {
  x: 0,
  y: -64,
  size: 640,
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

// ─── Sample data for preview ────────────────────────────────────────────────

export const sevenByTenTemplateItemSampleData = {
  itemPayload: {
    delivery_date: "2026-05-03",
    item_type: "Dining Chair",
    order_scalar_id: "#1324",
    help_to_carry: true,
    order_plan_objective: "international_shipping",
    article_number: "A-1048",
    properties: [
      { name: "set", value: "of 4" },
      { name: "color", value: "Oak" },
    ],
    order_notes: [
      { type: "GENERAL", content: "Deliver through the side entrance." },
    ],
    quantity: 1,
  },
};

// ─── Layout constants (reference-frame cm, designed for a 10×7 canvas) ───────
// The whole layout is authored in this reference frame and then scaled
// uniformly to fit the actual page, so the design prints 1:1 at any label size.

const REF_W = 10;
const REF_H = 7;
const PAD = 0.24;
const TOP_ROW_H = 0.82;
const ARTICLE_ROW_H = 1.34;
const BODY_GAP = 0.22;
const COL_GAP = 0.24;
const LEFT_COL_W = 4.18;
const SECTION_GAP = 0.42;
const LABEL_GAP = 0.16;
const LINE_EXTRA = 0.11;
const WEEK_DATE_GAP = 0.3;
const LINE_W = 0.025;

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

  // Uniform scale that fits the 10×7 design into the actual page, centered.
  const s = Math.min(widthCm / REF_W, heightCm / REF_H);
  const contentW = REF_W * s;
  const contentH = REF_H * s;
  const left = (widthCm - contentW) / 2;
  const top = (heightCm - contentH) / 2;
  const right = left + contentW;
  const bottom = top + contentH;

  const sf = (pt: number) => pt * s; // reference pt → scaled pt

  const pad = PAD * s;
  const topRowH = TOP_ROW_H * s;
  const articleRowH = ARTICLE_ROW_H * s;
  const bodyGap = BODY_GAP * s;
  const colGap = COL_GAP * s;
  const leftColW = LEFT_COL_W * s;
  const sectionGap = SECTION_GAP * s;
  const labelGap = LABEL_GAP * s;
  const lineExtra = LINE_EXTRA * s;
  const weekDateGap = WEEK_DATE_GAP * s;
  const lineW = LINE_W * s;

  const topY = top + pad;
  const articleY = topY + topRowH;
  const bodyY = articleY + articleRowH + bodyGap;
  const bodyBottom = bottom - pad;
  const bodyH = Math.max(0, bodyBottom - bodyY);
  const leftX = left + pad;
  const rightX = leftX + leftColW + colGap;
  const rightW = right - pad - rightX;
  const midX = left + contentW / 2;

  // Outer border (page edges)
  pdf.setDrawColor(17, 17, 17);
  pdf.setLineWidth(lineW);
  pdf.rect(0, 0, widthCm, heightCm, "S");

  // ─── Top row: identity / plan objective ────────────────────────────────────
  const idText = safe(data.order_scalar_id);
  const objectiveText = fmtPlanObjective(data.order_plan_objective);
  const topBaseY = topY + topRowH / 2 + capH(sf(FS.identity)) / 2;

  setFont(pdf, sf(FS.identity), true, DARK);
  pdf.text(idText, leftX, topBaseY);

  if (objectiveText) {
    setFont(pdf, sf(FS.objective), true, DARK);
    pdf.text(objectiveText, right - pad, topBaseY, { align: "right" });
  }

  // ─── Article row ───────────────────────────────────────────────────────────
  const articleText = safe(data.article_number || data.reference_number);
  const articleBaseY = articleY + articleRowH / 2 + capH(sf(FS.article)) / 2;

  setFont(pdf, sf(FS.article), true, DARK);
  const articleLines = pdf.splitTextToSize(
    articleText,
    contentW - pad * 2,
  ) as string[];
  pdf.text(String(articleLines[0] ?? "--"), midX, articleBaseY, {
    align: "center",
  });

  // ─── Body row: info + drawing box ─────────────────────────────────────────
  // Drawing box: 30% smaller than the previous 0.72 / 0.864 footprint,
  // kept anchored to the bottom-right of the body.
  const drawBoxW = rightW * 0.72 * 0.7;
  const drawBoxH = bodyH * 0.864 * 0.7;
  const drawBoxX = rightX + rightW - drawBoxW;
  const drawBoxY = bodyBottom - drawBoxH;

  // Shared value column so every quality's value aligns under the same x.
  setFont(pdf, sf(FS.label), true, DARK);
  const valueColX =
    leftX +
    Math.max(
      pdf.getTextWidth("Type:"),
      pdf.getTextWidth("Prop:"),
      pdf.getTextWidth("Notes:"),
    ) +
    labelGap;
  // Values wrap into the free space up to the (now smaller) draw box.
  const valueMaxW = drawBoxX - colGap - valueColX;

  let cursorY = bodyY;

  const drawField = (
    label: string,
    labelFontSize: number,
    value: string,
    valueFontSize: number,
    maxLines: number,
  ) => {
    const baseY = cursorY + capH(sf(valueFontSize));

    setFont(pdf, sf(labelFontSize), true, DARK);
    pdf.text(`${label}:`, leftX, baseY);

    setFont(pdf, sf(valueFontSize), false, MID);
    const lines = pdf.splitTextToSize(value, valueMaxW) as string[];
    const shown = lines.slice(0, maxLines);
    const lineH = capH(sf(valueFontSize)) + lineExtra;
    shown.forEach((line, idx) => {
      pdf.text(String(line), valueColX, baseY + idx * lineH);
    });
    cursorY += lineH * Math.max(shown.length, 1) + sectionGap;
  };

  // Truncate a value with a trailing ".." so it never runs into the key.
  // Assumes the caller has already selected the value font.
  const clampToWidth = (text: string, maxW: number): string => {
    if (pdf.getTextWidth(text) <= maxW) return text;
    let clipped = text;
    while (clipped.length > 1 && pdf.getTextWidth(`${clipped}..`) > maxW) {
      clipped = clipped.slice(0, -1);
    }
    return `${clipped}..`;
  };

  const drawInlineNotes = (value: string) => {
    const baseY = cursorY + capH(sf(FS.notesValue));
    const lineH = capH(sf(FS.notesValue)) + lineExtra;

    setFont(pdf, sf(FS.notesLabel), true, DARK);
    pdf.text("Notes:", leftX, baseY);

    setFont(pdf, sf(FS.notesValue), false, MID);
    pdf.text(clampToWidth(value, valueMaxW), valueColX, baseY);
    cursorY += lineH + sectionGap;
  };

  // Props render as a two-column list: key left-aligned, value right-aligned
  // to the column edge so the values line up in a tidy right rail.
  const drawPropField = (
    label: string,
    entries: Array<{ name: string; value: string }>,
    maxLines: number,
  ) => {
    const baseY = cursorY + capH(sf(FS.value));
    const lineH = capH(sf(FS.value)) + lineExtra;

    setFont(pdf, sf(FS.label), true, DARK);
    pdf.text(`${label}:`, leftX, baseY);

    setFont(pdf, sf(FS.value), false, MID);

    if (!entries.length) {
      pdf.text("--", valueColX, baseY);
      cursorY += lineH + sectionGap;
      return;
    }

    const rightEdge = valueColX + valueMaxW;
    const shown = entries.slice(0, maxLines);
    shown.forEach((entry, idx) => {
      const y = baseY + idx * lineH;
      const keyText = `${entry.name}:`;
      pdf.text(keyText, valueColX, y);
      const avail = valueMaxW - pdf.getTextWidth(`${keyText}  `);
      pdf.text(clampToWidth(entry.value, avail), rightEdge, y, {
        align: "right",
      });
    });
    cursorY += lineH * shown.length + sectionGap;
  };

  const propEntries = fmtItemPropEntries(data.properties);
  const notesText = fmtOrderNotes(data.order_notes);

  // Type row carries the quantity in parentheses: "item_type (quantity)".
  const typeValue = safe(data.item_type);
  const typeWithQty =
    data.quantity == null ? typeValue : `${typeValue} (${data.quantity})`;
  drawField("Type", FS.label, typeWithQty, FS.value, 1);
  drawPropField("Prop", propEntries, 3);
  const hasNotes = notesText.length > 0;
  if (hasNotes) {
    drawInlineNotes(notesText);
  }

  // Week + date expands into the space released by the compact notes row.
  const weekText = fmtWeek(data.delivery_date);
  const dateText = fmtDateLabel(data.delivery_date);
  const weekDateBaseY = bodyBottom;
  const weekDateFs = hasNotes ? FS.weekDate : FS.weekDateWithoutNotes;
  const responsiveWeekDateGap = weekDateGap * (weekDateFs / FS.article);
  setFont(pdf, sf(weekDateFs), true, DARK);
  pdf.text(weekText, leftX, weekDateBaseY);
  const weekW = pdf.getTextWidth(weekText);
  setFont(pdf, sf(weekDateFs), false, MID);
  pdf.text(dateText, leftX + weekW + responsiveWeekDateGap, weekDateBaseY);

  pdf.setDrawColor(17, 17, 17);
  pdf.setLineWidth(lineW);
  pdf.rect(drawBoxX, drawBoxY, drawBoxW, drawBoxH, "S");

  if (data.help_to_carry === true) {
    const iconSize = Math.min(0.86 * s, Math.max(0.62 * s, drawBoxW * 0.22));
    drawCarryAssistIcon(
      pdf,
      drawBoxX + drawBoxW - iconSize - 0.18 * s,
      drawBoxY + drawBoxH - iconSize - 0.16 * s,
      iconSize,
    );
  }
};
