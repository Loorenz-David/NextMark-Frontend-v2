import type { CSSProperties } from "react";

import type { Item } from "@/features/order/item/types/item";
import { getIsoWeekLabel } from "@/shared/utils/formatIsoDate";
import type { availableOrientations } from "../../../types";

type ExtraProps = {
  delivery_date: string;
  order_notes?: unknown;
  order_scalar_id: number | null;
};

export type SevenByTenTemplateItemProps = {
  itemPayload?: Partial<Item & ExtraProps>;
  orientation: availableOrientations;
};

const labelRootStyle: CSSProperties = {
  width: "10cm",
  height: "7cm",
  backgroundColor: "#fff",
  border: "1px solid #111",
  boxSizing: "border-box",
  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  color: "#111",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  padding: "0.18cm 0.2cm 0.18cm",
};

export const SevenByTenTemplateItem = ({
  itemPayload,
  orientation,
}: SevenByTenTemplateItemProps) => {
  const item = itemPayload ?? dummyItem;

  const dateLabel = formatDateLabel(item?.delivery_date);
  const weekLabel = getIsoWeekLabel(item?.delivery_date) ?? "V --";
  const orderLabel =
    item?.order_scalar_id != null ? String(item.order_scalar_id) : "--";
  const articleLabel = toSafeText(
    item?.article_number || item?.reference_number,
  );
  const typeLabel = toSafeText(item?.item_type);
  const propertiesLabel = formatProperties(item?.properties);
  const notesLabel = formatGeneralOrderNotes(item?.order_notes);

  return (
    <div
      data-template="seven-by-ten-item"
      data-orientation={orientation}
      style={labelRootStyle}
    >
      <style>{`
        @media print {
          [data-template="seven-by-ten-item"] {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>

      <div
        style={{
          height: "0.86cm",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.72cm",
        }}
      >
        <span
          style={{
            fontSize: "0.52cm",
            lineHeight: "0.64cm",
            fontWeight: 800,
            whiteSpace: "nowrap",
          }}
        >
          Id: {orderLabel}
        </span>
        <span
          style={{
            fontSize: "0.52cm",
            lineHeight: "0.64cm",
            fontWeight: 800,
            whiteSpace: "nowrap",
          }}
        >
          {dateLabel}
        </span>
      </div>

      <div
        style={{
          height: "1.28cm",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontSize: "1.02cm",
            lineHeight: "1.18cm",
            fontWeight: 900,
            letterSpacing: 0,
          }}
        >
          {weekLabel}
        </span>
      </div>

      <div
        style={{
          height: "0.82cm",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.26cm",
          minWidth: 0,
        }}
      >
        <span
          style={{ fontSize: "0.5cm", lineHeight: "0.62cm", fontWeight: 900 }}
        >
          Art:
        </span>
        <span
          style={{
            fontSize: "0.48cm",
            lineHeight: "0.72cm",
            fontWeight: 900,
            whiteSpace: "nowrap",
          }}
        >
          {articleLabel}
        </span>
      </div>

      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 3.62cm",
          columnGap: "0.46cm",
          minHeight: 0,
          paddingTop: "0.04cm",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            minWidth: 0,
            maxWidth: "100%",
            overflow: "hidden",
            paddingLeft: "0.06cm",
            paddingTop: "0.1cm",
          }}
        >
          <div
            style={{
              fontSize: "0.4cm",
              lineHeight: "0.9cm",
              fontWeight: 400,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              paddingBottom: "0.04cm",
            }}
          >
            {typeLabel}
          </div>
          <div
            style={{
              display: "-webkit-box",
              maxHeight: "1.18cm",
              overflow: "hidden",
              paddingBottom: "0.08cm",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
              wordBreak: "break-word",
              overflowWrap: "anywhere",
              fontSize: "0.3cm",
              lineHeight: "0.54cm",
              fontWeight: 400,
            }}
          >
            {propertiesLabel}
          </div>

          <div
            style={{
              marginTop: "0.26cm",
              display: "flex",
              alignItems: "baseline",
              gap: "0.3cm",
              minWidth: 0,
            }}
          >
            <span
              style={{
                fontSize: "0.28cm",
                lineHeight: "0.36cm",
                fontWeight: 800,
              }}
            >
              Notes:
            </span>
            <span
              style={{
                fontSize: "0.32cm",
                lineHeight: "0.46cm",
                fontWeight: 500,
                whiteSpace: "nowrap",
              }}
            >
              {notesLabel}
            </span>
          </div>
        </div>

        <div
          style={{
            alignSelf: "end",
            width: "3.62cm",
            height: "2.62cm",
            border: "1px solid #111",
            boxSizing: "border-box",
          }}
        />
      </div>
    </div>
  );
};

const dummyItem: Partial<Item & ExtraProps> = {
  delivery_date: "2026.05.03",
  item_type: "Dining Chair",
  order_notes: ["Deliver through the side entrance."],
  order_scalar_id: 1324,
  article_number: "A-1048",
  properties: { set: "of 4" },
  quantity: 1,
};

const toSafeText = (value: unknown) => {
  if (value == null || !value) return "--";
  const text = String(value).trim();
  return text.length > 0 ? text : "--";
};

const formatDateLabel = (value: unknown) => {
  const safeValue = toSafeText(value);
  return safeValue === "--" ? "missing date" : safeValue.replaceAll("-", ".");
};

const formatProperties = (properties?: Record<string, unknown> | null) => {
  if (!properties) return "--";

  const values = Object.entries(properties)
    .filter(([key]) => key.toLowerCase() !== "notes")
    .map(([key, value]) => {
      const safeValue = toSafeText(value);
      return `${key} ${safeValue}`;
    })
    .filter(Boolean);

  if (values.length === 0) return "--";
  return values.join("\u00A0\u00A0\u00A0·\u00A0\u00A0\u00A0");
};

const formatGeneralOrderNotes = (notes: unknown) => {
  const noteEntries = Array.isArray(notes)
    ? notes
    : notes != null
      ? [notes]
      : [];
  const generalNotes = noteEntries
    .map((note) => {
      if (typeof note === "string") return note.trim();
      if (!note || typeof note !== "object") return "";

      const typedNote = note as { content?: unknown; type?: unknown };
      const noteType = String(typedNote.type ?? "GENERAL").toUpperCase();
      if (noteType !== "GENERAL") return "";
      return typeof typedNote.content === "string"
        ? typedNote.content.trim()
        : "";
    })
    .filter(Boolean);

  if (generalNotes.length === 0) return "--";
  return generalNotes.join("\n");
};

export default SevenByTenTemplateItem;
