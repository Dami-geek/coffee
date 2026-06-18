import { useEffect, useMemo, useRef, useState } from "react";
import { feature } from "topojson-client";
import { geoPath } from "d3-geo";
import { geoRobinson } from "d3-geo-projection";
import countriesUrl from "world-atlas/countries-110m.json?url";
import { cn } from "@/lib/utils";
import { normalizeCountryName } from "@/lib/country";
import { useAtlasStore } from "@/store/atlasStore";

type WorldFeature = GeoJSON.Feature<
  GeoJSON.Geometry,
  {
    id: string;
    name: string;
  }
>;

type LoadedWorld = {
  features: WorldFeature[];
};

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

export default function AtlasMap({ className }: { className?: string }) {
  const { ref, size } = useElementSize<HTMLDivElement>();
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [world, setWorld] = useState<LoadedWorld | null>(null);
  const hoveredCountryName = useAtlasStore((s) => s.hoveredCountryName);
  const selectedCountryName = useAtlasStore((s) => s.selectedCountryName);
  const setHoveredCountryName = useAtlasStore((s) => s.setHoveredCountryName);
  const selectCountryName = useAtlasStore((s) => s.selectCountryName);
  const countries = useAtlasStore((s) => s.data.countries);
  const countriesWithData = useMemo(() => new Set(countries.map((c) => normalizeCountryName(c.name))), [countries]);

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

  const projection = useMemo(() => {
    if (!world || size.width <= 0 || size.height <= 0) return null;
    const p = geoRobinson();
    p.fitSize([size.width, size.height], {
      type: "FeatureCollection",
      features: world.features as any,
    });
    return p;
  }, [size.height, size.width, world]);

  const pathGen = useMemo(() => {
    if (!projection) return null;
    return geoPath(projection);
  }, [projection]);

  const hovered = hoveredCountryName;
  const selected = selectedCountryName;

  // We sort visual features so that hovered or selected countries are drawn last (on top)
  const visualFeatures = useMemo(() => {
    if (!world?.features) return [];
    return [...world.features].sort((a, b) => {
      const aTop = a.properties.name === hovered || a.properties.name === selected ? 1 : 0;
      const bTop = b.properties.name === hovered || b.properties.name === selected ? 1 : 0;
      return aTop - bTop;
    });
  }, [world?.features, hovered, selected]);

  return (
    <div ref={ref} className={cn("relative h-full w-full", className)}>
      <svg
        width={size.width}
        height={size.height}
        className="absolute inset-0 block h-full w-full"
        onMouseMove={(e) => {
          if (tooltipRef.current) {
            tooltipRef.current.style.left = `${e.clientX + 12}px`;
            tooltipRef.current.style.top = `${e.clientY + 12}px`;
          }
          const target = e.target as Element | null;
          const hit = (target?.closest?.("path[data-country-name]") as SVGPathElement | null) ?? null;
          const name = hit?.getAttribute("data-country-name");
          if (name !== hoveredCountryName) {
            setHoveredCountryName(name || null);
          }
        }}
        onClick={(e) => {
          const target = e.target as Element | null;
          const hit = (target?.closest?.("path[data-country-name]") as SVGPathElement | null) ?? null;
          const name = hit?.getAttribute("data-country-name");
          if (name) selectCountryName(name);
        }}
        onMouseLeave={() => {
          setHoveredCountryName(null);
        }}
      >
        <defs>
          <radialGradient id="ocean" cx="40%" cy="35%" r="80%">
            <stop offset="0%" stopColor="#d9ecf5" />
            <stop offset="55%" stopColor="#cfe6f1" />
            <stop offset="100%" stopColor="#c7dfea" />
          </radialGradient>
          <filter id="paper">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.7  0 0 0 0 0.7  0 0 0 0 0.7  0 0 0 0.06 0" />
            <feBlend mode="multiply" in2="SourceGraphic" />
          </filter>
        </defs>

        <rect x={0} y={0} width={size.width} height={size.height} fill="url(#ocean)" />

        {/* Visual Layer - Pointer events disabled so hit testing passes through */}
        <g filter="url(#paper)" style={{ pointerEvents: "none" }}>
          {visualFeatures.map((f) => {
            const name = f.properties.name;
            const d = pathGen?.(f as any) ?? "";
            const hasData = countriesWithData.has(normalizeCountryName(name));
            const isHovered = hovered === name;
            const isSelected = selected === name;

            return (
              <path
                key={`visual:${f.properties.id || normalizeCountryName(name)}`}
                d={d}
                fill={hasData ? "#6f8f63" : "#d2d7cf"}
                opacity={selected ? (isSelected ? 1 : 0.22) : 1}
                stroke={isHovered || isSelected ? "#1b1b16" : "#5e655b"}
                strokeWidth={isHovered || isSelected ? 1.9 : 0.6}
                style={{ transition: "opacity 300ms ease, stroke-width 160ms ease, stroke 160ms ease" }}
              />
            );
          })}
        </g>

        {/* Hit-test Layer - Invisible but captures all mouse events */}
        <g>
          {world?.features.map((f) => {
            const name = f.properties.name;
            const d = pathGen?.(f as any) ?? "";

            return (
              <path
                key={`hit:${f.properties.id || normalizeCountryName(name)}`}
                d={d}
                data-country-name={name}
                fill="rgba(0,0,0,0)"
                stroke="rgba(0,0,0,0)"
                strokeWidth={4}
                style={{ pointerEvents: "all", cursor: "pointer" }}
              />
            );
          })}
        </g>
      </svg>

      {hovered && (
        <div
          ref={tooltipRef}
          data-testid="hover-tooltip"
          className="pointer-events-none absolute z-10 rounded-md border border-black/15 bg-[#f8f1e6]/90 px-2 py-1 text-xs tracking-wide text-[#1b1b16] shadow-sm backdrop-blur"
          style={{ left: -9999, top: -9999 }}
        >
          {hovered}
        </div>
      )}
    </div>
  );
}
