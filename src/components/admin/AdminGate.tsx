import { useMemo, useState } from "react";
import { Lock, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function AdminGate({
  onUnlock,
  className,
}: {
  onUnlock: () => void;
  className?: string;
}) {
  const expected = useMemo(() => import.meta.env.VITE_ADMIN_PASSCODE || "coffee", []);
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <div className={cn("grid h-dvh place-items-center bg-[#f8f1e6]", className)}>
      <div className="w-[420px] max-w-[92vw] rounded-3xl border border-black/10 bg-white/55 p-7 shadow-[0_18px_60px_rgba(0,0,0,0.12)] backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#f8f1e6]/70 px-3 py-1 text-xs tracking-wide text-[#1b1b16]/80">
            <Lock className="h-3.5 w-3.5" />
            Admin
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#f8f1e6]/70 px-3 py-1 text-xs tracking-wide text-[#1b1b16]/80 transition hover:border-black/25 hover:bg-[#f8f1e6]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Link>
        </div>

        <h1 className="font-display mt-5 text-2xl font-semibold tracking-tight text-[#1b1b16]">
          Unlock editor
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[#1b1b16]/70">
          This is an MVP passcode gate. For real publishing, add proper authentication + server storage.
        </p>

        <form
          className="mt-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (passcode.trim() === expected) {
              setError(null);
              onUnlock();
              return;
            }
            setError("Incorrect passcode.");
          }}
        >
          <label className="block text-[11px] uppercase tracking-[0.22em] text-[#1b1b16]/55">Passcode</label>
          <input
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            className="mt-2 w-full rounded-xl border border-black/15 bg-white/70 px-4 py-3 text-sm text-[#1b1b16] outline-none transition focus:border-black/35"
            type="password"
            autoFocus
          />

          {error ? <div className="mt-3 text-sm text-[#8a2a2a]">{error}</div> : null}

          <button
            type="submit"
            className="mt-5 w-full rounded-xl bg-[#1b1b16] px-4 py-3 text-sm font-medium text-[#f8f1e6] transition hover:bg-black"
          >
            Unlock
          </button>
        </form>
      </div>
    </div>
  );
}
