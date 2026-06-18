import { useEffect, useMemo, useRef, useState } from "react";
import { feature } from "topojson-client";
import { geoPath, geoMercator } from "d3-geo";
import countriesUrl from "world-atlas/countries-110m.json?url";
import { cn } from "@/lib/utils";
import { useAtlasStore } from "@/store/atlasStore";
import { normalizeCountryName } from "@/lib/country";

function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      setSize({ width: rect.width, height: rect.height });
    });

    ro.observe(el);
    const rect = el.getBoundingClientRect();
    setSize({ width: rect.width, height: rect.height });

    return () => ro.disconnect();
  }, []);

  return { ref, size };
}

type WorldFeature = GeoJSON.Feature<
  GeoJSON.Geometry,
  {
    id: string;
    name: string;
  }
>;

export default function CountryPinsMap() {
  const selectedCountryName = useAtlasStore((s) => s.selectedCountryName);
  const data = useAtlasStore((s) => s.data);
  const { ref, size } = useElementSize<HTMLDivElement>();
  const [world, setWorld] = useState<{ features: WorldFeature[] } | null>(null);
  const [hoveredPin, setHoveredPin] = useState<{ name: string; beanName: string } | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const topoRes = await fetch(countriesUrl);
      const topo = (await topoRes.json()) as any;
      const fc = feature(topo, topo.objects.countries) as GeoJSON.FeatureCollection<GeoJSON.Geometry>;
      const features: WorldFeature[] = fc.features.map((f: any) => {
        const id = String(f.id ?? "");
        const name = String(f.properties?.name ?? `Unknown (${id || "?"})`);
        return {
          type: "Feature",
          geometry: f.geometry,
          properties: { id, name },
        };
      });

      if (!cancelled) setWorld({ features });
    }

    run().catch(() => setWorld({ features: [] }));
    return () => {
      cancelled = true;
    };
  }, []);

  const country = useMemo(() => {
    if (!selectedCountryName) return null;
    const key = normalizeCountryName(selectedCountryName);
    return data.countries.find((c) => normalizeCountryName(c.name) === key) ?? null;
  }, [data.countries, selectedCountryName]);

  const countryFeature = useMemo(() => {
    if (!world || !selectedCountryName) return null;
    const key = normalizeCountryName(selectedCountryName);
    return world.features.find((f) => normalizeCountryName(f.properties.name) === key) ?? null;
  }, [world, selectedCountryName]);

  const beans = useMemo(() => {
    if (!country) return [];
    return data.beans.filter((b) => b.countryId === country.id);
  }, [country, data.beans]);

  const pins = useMemo(() => {
    return beans.flatMap((b) => {
      if (!b.locations || b.locations.length === 0) return [];
      const loc = b.locations[0];
      return [{
        ...loc,
        beanName: b.name,
        beanId: b.id,
      }];
    });
  }, [beans]);

  const projection = useMemo(() => {
    if (!countryFeature || size.width <= 0 || size.height <= 0) return null;
    const p = geoMercator();
    // Use fitExtent to add some padding around the country
    p.fitExtent(
      [
        [60, 60],
        [size.width - 60, size.height - 60],
      ],
      countryFeature as any,
    );
    return p;
  }, [countryFeature, size.width, size.height]);

  const pathGen = useMemo(() => {
    if (!projection) return null;
    return geoPath(projection);
  }, [projection]);

  if (!selectedCountryName) return null;

  return (
    <div ref={ref} className="relative h-full w-full bg-[#c7dfea]">
      <svg
        width={size.width}
        height={size.height}
        className="absolute inset-0 block h-full w-full"
        onMouseMove={(e) => {
          if (tooltipRef.current) {
            // Keep tooltip within bounds approximately
            const x = Math.min(e.clientX + 12, size.width - 200);
            const y = e.clientY + 12;
            tooltipRef.current.style.left = `${x}px`;
            tooltipRef.current.style.top = `${y}px`;
          }
        }}
      >
        <defs>
          <radialGradient id="ocean-pins" cx="40%" cy="35%" r="80%">
            <stop offset="0%" stopColor="#d9ecf5" />
            <stop offset="55%" stopColor="#cfe6f1" />
            <stop offset="100%" stopColor="#c7dfea" />
          </radialGradient>
          <filter id="paper-pins">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.7  0 0 0 0 0.7  0 0 0 0 0.7  0 0 0 0.06 0" />
            <feBlend mode="multiply" in2="SourceGraphic" />
          </filter>
          <filter id="shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.25" />
          </filter>
        </defs>

        <rect x={0} y={0} width={size.width} height={size.height} fill="url(#ocean-pins)" />

        <g filter="url(#paper-pins)" style={{ pointerEvents: "none" }}>
          {countryFeature && pathGen && (
            <path
              d={pathGen(countryFeature as any) ?? ""}
              fill="#6f8f63"
              stroke="#1b1b16"
              strokeWidth={1.5}
            />
          )}
        </g>

        {projection &&
          pins.map((pin, i) => {
            const [x, y] = projection([pin.lng, pin.lat]) ?? [0, 0];
            return (
              <g
                key={`${pin.beanId}-${i}`}
                transform={`translate(${x},${y})`}
                onMouseEnter={() => setHoveredPin({ name: pin.name, beanName: pin.beanName })}
                onMouseLeave={() => setHoveredPin(null)}
                style={{ cursor: "pointer" }}
                filter="url(#shadow)"
              >
                <path
                  d="M0,0 C2.5,-3 7,-10 7,-14 C7,-18 4,-21 0,-21 C-4,-21 -7,-18 -7,-14 C-7,-10 -2.5,-3 0,0 Z"
                  fill="#facc15"
                  stroke="#1b1b16"
                  strokeWidth={1.5}
                />
                <circle cx={0} cy={-14} r={2.5} fill="#1b1b16" />
              </g>
            );
          })}
      </svg>

      {hoveredPin && (
        <div
          ref={tooltipRef}
          className="pointer-events-none absolute z-10 rounded-md border border-black/15 bg-[#f8f1e6]/95 px-3 py-2 shadow-lg backdrop-blur"
          style={{ left: -9999, top: -9999 }}
        >
          <div className="font-semibold text-[#1b1b16]">{hoveredPin.name}</div>
          <div className="text-sm text-[#1b1b16]/75">{hoveredPin.beanName}</div>
        </div>
      )}
    </div>
  );
}
