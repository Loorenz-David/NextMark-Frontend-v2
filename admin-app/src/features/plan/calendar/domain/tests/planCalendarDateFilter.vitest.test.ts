import { describe, expect, it } from "vitest";

import {
  buildDateFilterGrid,
  buildMonthGrid,
  formatDateFilterTitle,
  resolveCalendarDateFilterBounds,
  toLocalDateFromDayKey,
} from "../planCalendar.domain";

const TODAY = "2026-10-25";

describe("resolveCalendarDateFilterBounds", () => {
  it("treats an empty To as a single day", () => {
    expect(
      resolveCalendarDateFilterBounds({ fromKey: "2026-10-14", toKey: null }),
    ).toEqual({ startKey: "2026-10-14", endKey: "2026-10-14" });
  });

  it("orders a reversed range", () => {
    expect(
      resolveCalendarDateFilterBounds({
        fromKey: "2026-11-08",
        toKey: "2026-10-12",
      }),
    ).toEqual({ startKey: "2026-10-12", endKey: "2026-11-08" });
  });
});

describe("buildDateFilterGrid", () => {
  it("shows the one Monday-first week around a single day, focusing only that day", () => {
    const cells = buildDateFilterGrid({ fromKey: "2026-10-14", toKey: null }, TODAY);

    expect(cells).toHaveLength(7);
    expect(cells[0].dateKey).toBe("2026-10-12");
    expect(cells[6].dateKey).toBe("2026-10-18");
    expect(cells.filter((cell) => cell.inMonth).map((cell) => cell.dateKey)).toEqual([
      "2026-10-14",
    ]);
  });

  it("covers whole weeks across a month boundary and focuses the range", () => {
    const cells = buildDateFilterGrid(
      { fromKey: "2026-10-28", toKey: "2026-11-03" },
      TODAY,
    );

    expect(cells).toHaveLength(14);
    expect(cells[0].dateKey).toBe("2026-10-26");
    expect(cells[13].dateKey).toBe("2026-11-08");
    expect(cells.filter((cell) => cell.inMonth)).toHaveLength(7);
  });

  it("returns no cells for an unparseable day", () => {
    expect(buildDateFilterGrid({ fromKey: "not-a-date", toKey: null }, TODAY)).toEqual([]);
  });
});

describe("buildMonthGrid", () => {
  it("still focuses only the cursor month", () => {
    const cells = buildMonthGrid({ year: 2026, month: 10 }, TODAY);

    expect(cells[0].dateKey).toBe("2026-09-28");
    expect(cells.filter((cell) => cell.inMonth)).toHaveLength(31);
  });
});

describe("formatDateFilterTitle", () => {
  it("formats a single day", () => {
    expect(formatDateFilterTitle({ fromKey: "2026-10-14", toKey: null })).toBe(
      "14 Oct 2026",
    );
  });

  it("formats a range in one year with the year once", () => {
    expect(
      formatDateFilterTitle({ fromKey: "2026-10-12", toKey: "2026-11-08" }),
    ).toBe("12 Oct – 8 Nov 2026");
  });

  it("names both years when the range crosses a year", () => {
    expect(
      formatDateFilterTitle({ fromKey: "2026-12-28", toKey: "2027-01-03" }),
    ).toBe("28 Dec 2026 – 3 Jan 2027");
  });
});

describe("toLocalDateFromDayKey", () => {
  it("builds local midnight for the day", () => {
    const date = toLocalDateFromDayKey("2026-10-14");
    expect(date?.getFullYear()).toBe(2026);
    expect(date?.getMonth()).toBe(9);
    expect(date?.getDate()).toBe(14);
    expect(date?.getHours()).toBe(0);
  });

  it("returns null for an empty key", () => {
    expect(toLocalDateFromDayKey(null)).toBeNull();
  });
});
