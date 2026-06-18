import { Link } from "react-router-dom";
import { Settings2 } from "lucide-react";
import AtlasMap from "@/components/atlas/AtlasMap";
import CountryDetailPanel from "@/components/atlas/CountryDetailPanel";
import CountryPinsMap from "@/components/atlas/CountryPinsMap";
import { useAtlasStore } from "@/store/atlasStore";

export default function Home() {
  const selectedCountryName = useAtlasStore((s) => s.selectedCountryName);

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-[#c7dfea]">
      <AtlasMap className="absolute inset-0" />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-end p-6">
        <Link
          to="/admin"
          className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#f8f1e6]/75 px-4 py-2 text-xs tracking-wide text-[#1b1b16]/85 shadow-sm backdrop-blur transition hover:border-black/25 hover:bg-[#f8f1e6]"
        >
          <Settings2 className="h-4 w-4" />
          Admin
        </Link>
      </div>

      <CountryDetailPanel />

      {selectedCountryName ? (
        <>
          <div className="pointer-events-none absolute inset-0 bg-black/10" />
          <div 
            className="pointer-events-auto absolute inset-y-0 right-0 z-10 flex shadow-[-12px_0_50px_rgba(0,0,0,0.1)] transition-all duration-500"
            style={{ width: "calc(100vw - clamp(420px, 50vw, 760px))" }}
          >
            <CountryPinsMap />
          </div>
        </>
      ) : null}
    </div>
  );
}
