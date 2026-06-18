import { describe, expect, it } from "vitest";
import { useAtlasStore } from "@/store/atlasStore";

describe("atlasStore", () => {
  it("exports JSON with countries and areas", () => {
    const json = useAtlasStore.getState().exportJson();
    const parsed = JSON.parse(json) as { countries: unknown[]; areas: unknown[] };
    expect(Array.isArray(parsed.countries)).toBe(true);
    expect(Array.isArray(parsed.areas)).toBe(true);
  });

  it("imports JSON in overwrite mode", () => {
    const res = useAtlasStore
      .getState()
      .importJson(
        JSON.stringify({
          countries: [
            {
              id: "test",
              iso2: "TT",
              name: "Testland",
              description: "x",
              harvestMonths: [],
              typicalFlavors: [],
              links: [],
            },
          ],
          areas: [],
        }),
        "overwrite",
      );
    expect(res.ok).toBe(true);
    expect(useAtlasStore.getState().data.countries.some((c) => c.id === "test")).toBe(true);
  });
});

