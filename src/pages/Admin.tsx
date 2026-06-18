import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Download,
  Upload,
  RotateCcw,
  Plus,
  Trash2,
  ArrowLeft,
  Save,
  Coffee,
} from "lucide-react";
import AdminGate from "@/components/admin/AdminGate";
import FlavorWheel from "@/components/atlas/FlavorWheel";
import { cn } from "@/lib/utils";
import { useAtlasStore } from "@/store/atlasStore";
import type { Country, BeanType, BeanLocation } from "@/types/atlas";
import { createId } from "@/utils/id";

function TextAreaField({
  label,
  value,
  onChange,
  rows,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <label className="block">
      <div className="text-[11px] uppercase tracking-[0.22em] text-[#1b1b16]/55">{label}</div>
      <textarea
        rows={rows ?? 3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full resize-none rounded-xl border border-black/15 bg-white/70 px-4 py-3 text-sm text-[#1b1b16] outline-none transition focus:border-black/35"
      />
    </label>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <div className="text-[11px] uppercase tracking-[0.22em] text-[#1b1b16]/55">{label}</div>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl border border-black/15 bg-white/70 px-4 py-3 text-sm text-[#1b1b16] outline-none transition focus:border-black/35"
      />
    </label>
  );
}

function parseList(s: string) {
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function toListString(a: string[]) {
  return a.join(", ");
}

export default function Admin() {
  const [unlocked, setUnlocked] = useState(false);
  if (!unlocked) return <AdminGate onUnlock={() => setUnlocked(true)} />;
  return <AdminEditor />;
}

function AdminEditor() {
  const data = useAtlasStore((s) => s.data);
  const upsertCountry = useAtlasStore((s) => s.upsertCountry);
  const deleteCountry = useAtlasStore((s) => s.deleteCountry);
  const upsertBean = useAtlasStore((s) => s.upsertBean);
  const deleteBean = useAtlasStore((s) => s.deleteBean);
  const exportJson = useAtlasStore((s) => s.exportJson);
  const importJson = useAtlasStore((s) => s.importJson);
  const resetToSeed = useAtlasStore((s) => s.resetToSeed);

  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(data.countries[0]?.id ?? null);
  const [selectedBeanId, setSelectedBeanId] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importMode, setImportMode] = useState<"overwrite" | "merge">("merge");
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);

  const selectedCountry = useMemo(() => {
    if (!selectedCountryId) return null;
    return data.countries.find((c) => c.id === selectedCountryId) ?? null;
  }, [data.countries, selectedCountryId]);

  const beansForCountry = useMemo(() => {
    if (!selectedCountry) return [];
    return data.beans.filter((b) => b.countryId === selectedCountry.id);
  }, [data.beans, selectedCountry]);

  const selectedBean = useMemo(() => {
    if (!selectedBeanId) return null;
    return beansForCountry.find((b) => b.id === selectedBeanId) ?? null;
  }, [beansForCountry, selectedBeanId]);

  const [countryDraft, setCountryDraft] = useState<Country | null>(selectedCountry);
  const [beanDraft, setBeanDraft] = useState<BeanType | null>(selectedBean);

  useEffect(() => {
    setCountryDraft(selectedCountry ? { ...selectedCountry } : null);
  }, [selectedCountry?.id]);

  useEffect(() => {
    setBeanDraft(selectedBean ? { ...selectedBean } : null);
  }, [selectedBean?.id]);

  return (
    <div className="h-dvh bg-[#f8f1e6] text-[#1b1b16]">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between gap-4 border-b border-black/10 bg-white/40 px-6 py-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#f8f1e6]/70 px-3 py-1 text-xs tracking-wide text-[#1b1b16]/80">
              <Coffee className="h-3.5 w-3.5" />
              Admin Editor
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#f8f1e6]/70 px-3 py-1 text-xs tracking-wide text-[#1b1b16]/80 transition hover:border-black/25 hover:bg-[#f8f1e6]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Map
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={async () => {
                const text = exportJson();
                try {
                  await navigator.clipboard.writeText(text);
                } catch {
                  setImportText(text);
                  setImportOpen(true);
                }
              }}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#1b1b16] px-4 py-2 text-xs tracking-wide text-[#f8f1e6] transition hover:bg-black"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            <button
              type="button"
              onClick={() => {
                setImportError(null);
                setImportText("");
                setImportOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#f8f1e6]/70 px-4 py-2 text-xs tracking-wide text-[#1b1b16]/85 transition hover:border-black/25 hover:bg-[#f8f1e6]"
            >
              <Upload className="h-4 w-4" />
              Import
            </button>
            <button
              type="button"
              onClick={() => {
                resetToSeed();
                setSelectedCountryId(useAtlasStore.getState().data.countries[0]?.id ?? null);
                setSelectedBeanId(null);
              }}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#f8f1e6]/70 px-4 py-2 text-xs tracking-wide text-[#1b1b16]/85 transition hover:border-black/25 hover:bg-[#f8f1e6]"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-[320px_1fr] overflow-hidden">
          <div className="border-r border-black/10 bg-white/30">
            <div className="flex items-center justify-between gap-3 p-5">
              <div className="text-[11px] uppercase tracking-[0.22em] text-[#1b1b16]/55">Countries</div>
              <button
                type="button"
                onClick={() => {
                  const next: Country = {
                    id: createId("country"),
                    iso2: "",
                    name: "New Country",
                    description: "",
                    links: [],
                  };
                  upsertCountry(next);
                  setSelectedCountryId(next.id);
                  setSelectedBeanId(null);
                }}
                className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#f8f1e6]/70 px-3 py-1 text-xs tracking-wide text-[#1b1b16]/85 transition hover:border-black/25 hover:bg-[#f8f1e6]"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </button>
            </div>

            <div className="h-[calc(100%-64px)] overflow-auto px-3 pb-5">
              <div className="space-y-1">
                {data.countries
                  .slice()
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setSelectedCountryId(c.id);
                        setSelectedBeanId(null);
                      }}
                      className={cn(
                        "w-full rounded-xl px-4 py-3 text-left transition",
                        selectedCountryId === c.id
                          ? "border border-black/10 bg-[#f8f1e6]/85 shadow-sm"
                          : "border border-transparent hover:border-black/10 hover:bg-[#f8f1e6]/55",
                      )}
                    >
                      <div className="truncate text-sm font-medium text-[#1b1b16]">{c.name}</div>
                      <div className="mt-1 truncate text-xs text-[#1b1b16]/60">
                        {c.iso2 ? `${c.iso2} · ` : ""}
                        {data.beans.filter((b) => b.countryId === c.id).length} bean types
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          </div>

          <div className="overflow-auto p-6">
            {countryDraft ? (
              <div className="mx-auto max-w-[920px] space-y-6">
                <div className="rounded-3xl border border-black/10 bg-white/45 p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.22em] text-[#1b1b16]/55">Country</div>
                      <div className="mt-1 text-xl font-semibold tracking-tight">{countryDraft.name}</div>
                      <div className="mt-1 text-xs text-[#1b1b16]/60">
                        Map name must match the atlas country list (e.g. Brazil, Colombia, Ethiopia).
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => upsertCountry(countryDraft)}
                        className="inline-flex items-center gap-2 rounded-full bg-[#1b1b16] px-4 py-2 text-xs tracking-wide text-[#f8f1e6] transition hover:bg-black"
                      >
                        <Save className="h-4 w-4" />
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          deleteCountry(countryDraft.id);
                          const nextId = useAtlasStore.getState().data.countries[0]?.id ?? null;
                          setSelectedCountryId(nextId);
                          setSelectedBeanId(null);
                        }}
                        className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#f8f1e6]/70 px-4 py-2 text-xs tracking-wide text-[#1b1b16]/85 transition hover:border-black/25 hover:bg-[#f8f1e6]"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <InputField label="Name" value={countryDraft.name} onChange={(v) => setCountryDraft({ ...countryDraft, name: v })} />
                    <InputField
                      label="ISO2"
                      value={countryDraft.iso2}
                      placeholder="BR"
                      onChange={(v) => setCountryDraft({ ...countryDraft, iso2: v.toUpperCase().slice(0, 2) })}
                    />
                    <div className="col-span-2">
                      <TextAreaField
                        label="Description"
                        value={countryDraft.description}
                        onChange={(v) => setCountryDraft({ ...countryDraft, description: v })}
                        rows={3}
                      />
                    </div>
                    <div className="col-span-2">
                      <InputField
                        label="Links (comma)"
                        value={toListString(countryDraft.links)}
                        onChange={(v) => setCountryDraft({ ...countryDraft, links: parseList(v) })}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-black/10 bg-white/45 p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.22em] text-[#1b1b16]/55">Bean Types</div>
                      <div className="mt-1 text-sm text-[#1b1b16]/70">{beansForCountry.length} beans</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const next: BeanType = {
                          id: createId("bean"),
                          countryId: countryDraft.id,
                          name: "New Bean Type",
                          description: "",
                          processes: [],
                          tastingNotes: [],
                          seasonality: "",
                          notes: "",
                          locations: [],
                          links: [],
                        };
                        upsertBean(next);
                        setSelectedBeanId(next.id);
                      }}
                      className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#f8f1e6]/70 px-4 py-2 text-xs tracking-wide text-[#1b1b16]/85 transition hover:border-black/25 hover:bg-[#f8f1e6]"
                    >
                      <Plus className="h-4 w-4" />
                      Add bean
                    </button>
                  </div>

                  <div className="mt-5 grid grid-cols-[280px_1fr] gap-5">
                    <div className="space-y-2">
                      {beansForCountry
                        .slice()
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => setSelectedBeanId(b.id)}
                            className={cn(
                              "w-full rounded-2xl border px-4 py-3 text-left transition",
                              selectedBeanId === b.id
                                ? "border-black/15 bg-[#f8f1e6]/85 shadow-sm"
                                : "border-black/10 bg-white/35 hover:border-black/20",
                            )}
                          >
                            <div className="truncate text-sm font-medium">{b.name}</div>
                            <div className="mt-1 truncate text-xs text-[#1b1b16]/60">
                              {b.processes.slice(0, 2).join(" · ") || "—"}
                            </div>
                          </button>
                        ))}
                    </div>

                    {beanDraft ? (
                      <div className="space-y-4 rounded-2xl border border-black/10 bg-white/35 p-5">
                        <div className="flex items-center justify-between gap-4">
                          <div className="text-lg font-medium tracking-tight">{beanDraft.name}</div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => upsertBean(beanDraft)}
                              className="inline-flex items-center gap-2 rounded-full bg-[#1b1b16] px-4 py-2 text-xs tracking-wide text-[#f8f1e6] transition hover:bg-black"
                            >
                              <Save className="h-4 w-4" />
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                deleteBean(beanDraft.id);
                                setSelectedBeanId(null);
                              }}
                              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#f8f1e6]/70 px-4 py-2 text-xs tracking-wide text-[#1b1b16]/85 transition hover:border-black/25 hover:bg-[#f8f1e6]"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        </div>

                        <InputField label="Name" value={beanDraft.name} onChange={(v) => setBeanDraft({ ...beanDraft, name: v })} />

                        <TextAreaField
                          label="Description"
                          value={beanDraft.description ?? ""}
                          onChange={(v) => setBeanDraft({ ...beanDraft, description: v })}
                          rows={2}
                        />

                        <InputField
                          label="Processes (comma)"
                          value={toListString(beanDraft.processes)}
                          onChange={(v) => setBeanDraft({ ...beanDraft, processes: parseList(v) })}
                          placeholder="Washed, Natural"
                        />
                        <div className="grid gap-6 md:grid-cols-2">
                          <div className="space-y-4">
                            <InputField
                              label="Tasting Notes (comma)"
                              value={toListString(beanDraft.tastingNotes)}
                              onChange={(v) => setBeanDraft({ ...beanDraft, tastingNotes: parseList(v) })}
                              placeholder="jasmine, lemon, peach"
                            />
                            <div className="text-[11px] uppercase tracking-[0.22em] text-[#1b1b16]/55">Flavor Wheel</div>
                            <div className="text-xs text-[#1b1b16]/60">Click on a flavor to add or remove it.</div>
                            <div className="flex justify-center rounded-2xl border border-black/10 bg-white/50 p-4">
                              <FlavorWheel
                                className="w-64 h-64"
                                highlightedNotes={beanDraft.tastingNotes}
                                onFlavorClick={(flavor) => {
                                  const current = beanDraft.tastingNotes;
                                  const lowerFlavor = flavor.toLowerCase();
                                  const exists = current.some((f) => f.toLowerCase() === lowerFlavor);
                                  const newNotes = exists
                                    ? current.filter((f) => f.toLowerCase() !== lowerFlavor)
                                    : [...current, flavor.toLowerCase()];
                                  setBeanDraft({ ...beanDraft, tastingNotes: newNotes });
                                }}
                              />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <TextAreaField
                              label="Seasonality"
                              value={beanDraft.seasonality ?? ""}
                              onChange={(v) => setBeanDraft({ ...beanDraft, seasonality: v })}
                              rows={2}
                            />
                            <TextAreaField
                              label="Notes"
                              value={beanDraft.notes ?? ""}
                              onChange={(v) => setBeanDraft({ ...beanDraft, notes: v })}
                              rows={3}
                            />
                            <InputField
                              label="Links (comma)"
                              value={toListString(beanDraft.links)}
                              onChange={(v) => setBeanDraft({ ...beanDraft, links: parseList(v) })}
                              placeholder="https://..."
                            />
                          </div>
                        </div>

                        <div className="mt-6 border-t border-black/10 pt-6">
                          <div className="mb-4 text-[11px] uppercase tracking-[0.22em] text-[#1b1b16]/55">Production Area</div>
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <InputField
                              label="Name"
                              value={beanDraft.locations[0]?.name ?? ""}
                              onChange={(v) => {
                                const newLoc = { ...(beanDraft.locations[0] ?? { lat: 0, lng: 0 }), name: v };
                                setBeanDraft({ ...beanDraft, locations: [newLoc] });
                              }}
                              placeholder="Farm/Region name"
                            />
                            <InputField
                              label="Latitude"
                              value={beanDraft.locations[0]?.lat?.toString() ?? ""}
                              onChange={(v) => {
                                const newLoc = { ...(beanDraft.locations[0] ?? { name: "", lng: 0 }), lat: parseFloat(v) || 0 };
                                setBeanDraft({ ...beanDraft, locations: [newLoc] });
                              }}
                              placeholder="0.0"
                            />
                            <InputField
                              label="Longitude"
                              value={beanDraft.locations[0]?.lng?.toString() ?? ""}
                              onChange={(v) => {
                                const newLoc = { ...(beanDraft.locations[0] ?? { name: "", lat: 0 }), lng: parseFloat(v) || 0 };
                                setBeanDraft({ ...beanDraft, locations: [newLoc] });
                              }}
                              placeholder="0.0"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid place-items-center rounded-2xl border border-black/10 bg-white/35 p-10 text-sm text-[#1b1b16]/70">
                        Select a bean type to edit.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid h-full place-items-center text-sm text-[#1b1b16]/70">Add a country to start.</div>
            )}
          </div>
        </div>
      </div>

      {importOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-6">
          <div className="w-[820px] max-w-[96vw] rounded-3xl border border-black/10 bg-[#f8f1e6] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.28)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-[#1b1b16]/55">Import / Export</div>
                <div className="mt-1 text-lg font-semibold tracking-tight">Dataset JSON</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setImportOpen(false);
                  setImportError(null);
                }}
                className="rounded-full border border-black/10 bg-white/60 px-4 py-2 text-xs tracking-wide text-[#1b1b16]/85 transition hover:border-black/25"
              >
                Close
              </button>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setImportMode("merge")}
                className={cn(
                  "rounded-full border px-4 py-2 text-xs tracking-wide transition",
                  importMode === "merge"
                    ? "border-black/25 bg-[#1b1b16] text-[#f8f1e6]"
                    : "border-black/10 bg-white/60 text-[#1b1b16]/85 hover:border-black/25",
                )}
              >
                Merge
              </button>
              <button
                type="button"
                onClick={() => setImportMode("overwrite")}
                className={cn(
                  "rounded-full border px-4 py-2 text-xs tracking-wide transition",
                  importMode === "overwrite"
                    ? "border-black/25 bg-[#1b1b16] text-[#f8f1e6]"
                    : "border-black/10 bg-white/60 text-[#1b1b16]/85 hover:border-black/25",
                )}
              >
                Overwrite
              </button>
              <div className="text-xs text-[#1b1b16]/60">
                Merge keeps existing items by id unless replaced by imported ids.
              </div>
            </div>

            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              className="mt-4 h-[44vh] w-full resize-none rounded-2xl border border-black/15 bg-white/70 p-4 font-mono text-xs text-[#1b1b16] outline-none focus:border-black/35"
              placeholder={'{\n  "countries": [],\n  "beans": []\n}'}
            />

            {importError ? <div className="mt-3 text-sm text-[#8a2a2a]">{importError}</div> : null}

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  const res = importJson(importText, importMode);
                  if (res.ok === false) {
                    setImportError(res.error);
                    return;
                  }
                  setImportError(null);
                  setImportOpen(false);
                }}
                className="inline-flex items-center gap-2 rounded-full bg-[#1b1b16] px-5 py-2.5 text-xs tracking-wide text-[#f8f1e6] transition hover:bg-black"
              >
                <Upload className="h-4 w-4" />
                Apply
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}