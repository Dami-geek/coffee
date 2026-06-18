import { useMemo, useState } from "react";
import { X, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { normalizeCountryName } from "@/lib/country";
import { useAtlasStore } from "@/store/atlasStore";
import FlavorWheel from "@/components/atlas/FlavorWheel";

function uniq(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs tracking-wide transition",
        selected
          ? "border-black/35 bg-[#1b1b16] text-[#f8f1e6]"
          : "border-black/15 bg-[#f8f1e6]/70 text-[#1b1b16] hover:border-black/30 hover:bg-[#f8f1e6]",
      )}
    >
      {label}
    </button>
  );
}

export default function CountryDetailPanel() {
  const selectedCountryName = useAtlasStore((s) => s.selectedCountryName);
  const clearSelection = useAtlasStore((s) => s.clearSelection);
  const data = useAtlasStore((s) => s.data);
  const [process, setProcess] = useState<string | null>(null);

  const country = useMemo(() => {
    if (!selectedCountryName) return null;
    const key = normalizeCountryName(selectedCountryName);
    return data.countries.find((c) => normalizeCountryName(c.name) === key) ?? null;
  }, [data.countries, selectedCountryName]);

  const beans = useMemo(() => {
    if (!country) return [];
    return data.beans.filter((b) => b.countryId === country.id);
  }, [country, data.beans]);

  const allProcesses = useMemo(() => uniq(beans.flatMap((b) => b.processes)), [beans]);

  const filteredBeans = useMemo(() => {
    return beans.filter((b) => {
      if (process && !b.processes.includes(process)) return false;
      return true;
    });
  }, [beans, process]);

  const open = Boolean(selectedCountryName);

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-y-0 left-0 z-20 w-[50vw] min-w-[420px] max-w-[760px] transition duration-500",
        open ? "translate-x-0 opacity-100" : "-translate-x-6 opacity-0",
      )}
    >
      <div
        className={cn(
          open ? "pointer-events-auto" : "pointer-events-none",
          "h-full border-r border-black/10 bg-[#f8f1e6]/92 shadow-[12px_0_50px_rgba(0,0,0,0.18)] backdrop-blur",
          "relative overflow-hidden",
        )}
      >
        <div className="relative flex h-full flex-col">
          <div className="flex items-start justify-between gap-6 p-8 pb-5">
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-[0.22em] text-[#1b1b16]/60">Coffee Origin</div>
              <h1 className="font-display mt-2 truncate text-3xl font-semibold tracking-tight text-[#1b1b16]">
                {selectedCountryName}
              </h1>
              {country ? (
                <p className="mt-3 max-w-[52ch] text-sm leading-relaxed text-[#1b1b16]/75">{country.description}</p>
              ) : (
                <p className="mt-3 max-w-[52ch] text-sm leading-relaxed text-[#1b1b16]/75">
                  No origin details yet. Add this country in the admin editor.
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setProcess(null);
                clearSelection();
              }}
              className="rounded-full border border-black/15 bg-[#f8f1e6]/70 p-2 text-[#1b1b16] transition hover:border-black/30 hover:bg-[#f8f1e6]"
              aria-label="Close country details"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {country ? (
            <div className="px-8 pb-6">
              {country.links.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {country.links.map((l) => (
                    <a
                      key={l}
                      href={l}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/35 px-3 py-1 text-xs text-[#1b1b16]/85 transition hover:border-black/25"
                    >
                      Source <ExternalLink className="h-3 w-3" />
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="flex-1 overflow-auto px-8 pb-10">
            {beans.length ? (
              <>
                <div className="sticky top-0 z-10 -mx-8 bg-gradient-to-b from-[#f8f1e6] via-[#f8f1e6]/96 to-[#f8f1e6]/0 px-8 pb-4 pt-2">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-[#1b1b16]/60">Filter</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {allProcesses.map((p) => (
                      <Chip key={`p:${p}`} label={p} selected={process === p} onClick={() => setProcess(process === p ? null : p)} />
                    ))}
                  </div>
                </div>

                <div className="mt-4 space-y-8">
                  {filteredBeans.map((b) => (
                    <div key={b.id} className="rounded-2xl border border-black/10 bg-white/40 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-[11px] uppercase tracking-[0.22em] text-[#1b1b16]/60">Bean Type</div>
                          <div className="text-xl font-medium tracking-tight text-[#1b1b16] mt-1">{b.name}</div>
                        </div>
                      </div>

                      {b.description ? (
                        <div className="mt-3 text-sm leading-relaxed text-[#1b1b16]/78">
                          {b.description}
                        </div>
                      ) : null}

                      <div className="mt-4 flex flex-wrap gap-2">
                        {b.processes.map((p) => (
                          <span key={`${b.id}:proc:${p}`} className="rounded-full border border-black/10 bg-[#f8f1e6]/70 px-3 py-1 text-xs text-[#1b1b16]/85">
                            {p}
                          </span>
                        ))}
                      </div>

                      <div className="mt-6 flex gap-6 items-start">
                        <div className="flex-1">
                          <div className="text-[11px] uppercase tracking-[0.22em] text-[#1b1b16]/55">Flavor Profile</div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {b.tastingNotes.map((note) => (
                              <span key={note} className="rounded-md bg-white/60 border border-black/5 px-2 py-1 text-xs text-[#1b1b16]">
                                {note}
                              </span>
                            ))}
                          </div>
                          
                          {b.seasonality ? (
                            <div className="mt-4 text-sm leading-relaxed text-[#1b1b16]/78">
                              <div className="text-[11px] uppercase tracking-[0.22em] text-[#1b1b16]/55">Seasonality</div>
                              <div className="mt-1">{b.seasonality}</div>
                            </div>
                          ) : null}

                          {b.notes ? (
                            <div className="mt-4 text-sm leading-relaxed text-[#1b1b16]/78">
                              <div className="text-[11px] uppercase tracking-[0.22em] text-[#1b1b16]/55">Notes</div>
                              <div className="mt-1">{b.notes}</div>
                            </div>
                          ) : null}
                        </div>
                        
                        <div className="w-[180px] shrink-0 relative">
                          <FlavorWheel 
                            highlightedNotes={b.tastingNotes} 
                            className="transition-all duration-300 origin-right hover:scale-[2] hover:z-50 relative z-10 bg-[#f8f1e6]/90 rounded-full backdrop-blur-md cursor-crosshair hover:shadow-2xl hover:-translate-y-4"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="mt-6 rounded-2xl border border-black/10 bg-white/35 p-6 text-sm text-[#1b1b16]/75">
                Add bean types in the admin editor to populate this country.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
