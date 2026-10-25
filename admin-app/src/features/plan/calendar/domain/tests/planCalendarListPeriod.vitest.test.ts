import { describe, expect, it } from "vitest";

import { buildPlanListFiltersFromCalendarPeriod } from "../planCalendarListPeriod";

describe("buildPlanListFiltersFromCalendarPeriod", () => {
  it("covers the whole month in focus", () => {
    expect(buildPlanListFiltersFromCalendarPeriod({ year: 2026, month: 10 }, null)).toEqual({
      mode: "month",
      start_date: "2026-10-01",
      end_date: "2026-10-31",
    });
  });

  it("ends February on its last day, leap years included", () => {
    expect(buildPlanListFiltersFromCalendarPeriod({ year: 2028, month: 2 }, null).end_date).toBe(
      "2028-02-29",
    );
    expect(buildPlanListFiltersFromCalendarPeriod({ year: 2026, month: 2 }, null).end_date).toBe(
      "2026-02-28",
    );
  });

  it("narrows to the filtered day", () => {
    expect(
      buildPlanListFiltersFromCalendarPeriod(
        { year: 2026, month: 10 },
        { fromKey: "2026-11-03", toKey: null },
      ),
    ).toEqual({ mode: "date", start_date: "2026-11-03", end_date: "2026-11-03" });
  });

  it("narrows to the filtered range, in order", () => {
    expect(
      buildPlanListFiltersFromCalendarPeriod(
        { year: 2026, month: 10 },
        { fromKey: "2026-11-08", toKey: "2026-10-12" },
      ),
    ).toEqual({ mode: "range", start_date: "2026-10-12", end_date: "2026-11-08" });
  });
});
