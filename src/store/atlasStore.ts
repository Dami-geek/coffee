import { create } from "zustand";
import type { AtlasData, Country, BeanType } from "@/types/atlas";
import { seedData } from "@/data/seed";
import { normalizeCountryName } from "@/lib/country";

const STORAGE_KEY = "coffee-origin-atlas:data:v2";

function loadData(): AtlasData {
  if (typeof window === "undefined") return seedData;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return seedData;
  try {
    const parsed = JSON.parse(raw) as AtlasData;
    if (!parsed?.countries || !parsed?.beans) return seedData;
    return parsed;
  } catch {
    return seedData;
  }
}

function persistData(data: AtlasData) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

type AtlasState = {
  data: AtlasData;
  hoveredCountryName: string | null;
  selectedCountryName: string | null;

  setHoveredCountryName: (name: string | null) => void;
  selectCountryName: (name: string) => void;
  clearSelection: () => void;

  upsertCountry: (country: Country) => void;
  deleteCountry: (countryId: string) => void;
  upsertBean: (bean: BeanType) => void;
  deleteBean: (beanId: string) => void;

  exportJson: () => string;
  importJson: (raw: string, mode: "overwrite" | "merge") => { ok: true } | { ok: false; error: string };
  resetToSeed: () => void;
};

export const useAtlasStore = create<AtlasState>((set, get) => ({
  data: loadData(),
  hoveredCountryName: null,
  selectedCountryName: null,

  setHoveredCountryName: (name) => set({ hoveredCountryName: name }),
  selectCountryName: (name) => set({ selectedCountryName: name }),
  clearSelection: () => set({ selectedCountryName: null }),

  upsertCountry: (country) => {
    const { data } = get();
    const next: AtlasData = {
      ...data,
      countries: data.countries.some((c) => c.id === country.id)
        ? data.countries.map((c) => (c.id === country.id ? country : c))
        : [...data.countries, country],
    };
    persistData(next);
    set({ data: next });
  },
  deleteCountry: (countryId) => {
    const { data, selectedCountryName } = get();
    const country = data.countries.find((c) => c.id === countryId);
    const next: AtlasData = {
      countries: data.countries.filter((c) => c.id !== countryId),
      beans: data.beans.filter((b) => b.countryId !== countryId),
    };
    persistData(next);
    set({
      data: next,
      selectedCountryName:
        country?.name && selectedCountryName && normalizeCountryName(selectedCountryName) === normalizeCountryName(country.name)
          ? null
          : selectedCountryName,
    });
  },
  upsertBean: (bean) => {
    const { data } = get();
    const next: AtlasData = {
      ...data,
      beans: data.beans.some((b) => b.id === bean.id)
        ? data.beans.map((b) => (b.id === bean.id ? bean : b))
        : [...data.beans, bean],
    };
    persistData(next);
    set({ data: next });
  },
  deleteBean: (beanId) => {
    const { data } = get();
    const next: AtlasData = { ...data, beans: data.beans.filter((b) => b.id !== beanId) };
    persistData(next);
    set({ data: next });
  },

  exportJson: () => JSON.stringify(get().data, null, 2),
  importJson: (raw, mode) => {
    let parsed: AtlasData;
    try {
      parsed = JSON.parse(raw) as AtlasData;
    } catch {
      return { ok: false, error: "Invalid JSON." };
    }

    if (!Array.isArray(parsed?.countries) || !Array.isArray(parsed?.beans)) {
      return { ok: false, error: "JSON must contain { countries: [], beans: [] }." };
    }

    const current = get().data;
    const next: AtlasData =
      mode === "overwrite"
        ? { countries: parsed.countries, beans: parsed.beans }
        : {
            countries: mergeById(current.countries, parsed.countries),
            beans: mergeById(current.beans, parsed.beans),
          };

    persistData(next);
    set({ data: next });
    return { ok: true };
  },
  resetToSeed: () => {
    persistData(seedData);
    set({ data: seedData, selectedCountryName: null });
  },
}));

function mergeById<T extends { id: string }>(a: T[], b: T[]): T[] {
  const map = new Map<string, T>();
  for (const item of a) map.set(item.id, item);
  for (const item of b) map.set(item.id, item);
  return Array.from(map.values());
}
