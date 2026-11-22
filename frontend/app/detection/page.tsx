"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, FileSpreadsheet, Loader2, ShieldCheck, Upload } from "lucide-react";
import { predictTraffic } from "@/lib/api";
import { useDetection } from "@/lib/detection-context";

export default function DetectionPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const { result, setResult } = useDetection();

  function selectFile(next: File | undefined) {
    setError(""); setToast("");
    if (!next) return;
    if (!next.name.toLowerCase().endsWith(".csv") && next.type !== "text/csv") { setError("Format file harus CSV (.csv)."); return; }
    if (next.size > 100 * 1024 * 1024) { setError("Ukuran file melebihi batas 100 MB."); return; }
    setFile(next);
  }

  async function analyze() {
    if (!file) { setError("Pilih file CSV terlebih dahulu."); return; }
    setLoading(true); setError(""); setToast("");
    try {
      const response = await predictTraffic(file);
      setResult(response);
      setToast("Analisis selesai. Hasil siap ditinjau.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analisis gagal diproses.");
    } finally { setLoading(false); }
  }

  return (
    <div className="space-y-5">
      {toast && <div className="fixed bottom-5 right-5 z-[70] flex items-center gap-2 rounded-[10px] bg-[#238B68] px-4 py-3 text-sm font-semibold text-white shadow-xl" role="status"><CheckCircle2 size={17}/>{toast}</div>}
      <div><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#628BC0]">File Analysis</p><h1 className="page-title mt-1">Traffic Detection</h1><p className="mt-1.5 text-sm text-[#77869B]">Klasifikasikan aliran jaringan menggunakan model Random Forest.</p></div>
      <div className="grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
        <section className="card p-5">
          <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); selectFile(e.dataTransfer.files[0]); }} className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-[#C9D6E6] bg-[#FAFCFE] px-5 text-center transition hover:border-[#628BC0] hover:bg-[#F7FAFD]">
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-[#DDE6F0] bg-white text-[#315F9F] shadow-sm"><Upload size={22}/></span>
            <h2 className="text-sm font-bold text-[#192B45]">Tarik dan letakkan file CSV di sini</h2><p className="mt-1 text-xs text-[#77869B]">atau pilih file dari perangkat Anda</p>
            <button onClick={() => inputRef.current?.click()} className="mt-4 rounded-[9px] bg-[#315F9F] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#274D82]">Pilih File CSV</button>
            <input ref={inputRef} className="hidden" type="file" accept=".csv,text/csv" onChange={(e) => selectFile(e.target.files?.[0])}/>
            {file && <p className="mt-4 flex items-center gap-2 text-xs font-semibold text-[#238B68]"><FileSpreadsheet size={15}/>{file.name}</p>}
          </div>
          {error && <div className="mt-3 rounded-[9px] border border-[#ECCFD3] bg-[#FFF2F3] px-4 py-3 text-xs font-medium text-[#B94854]" role="alert">{error}</div>}
          {loading && <div className="mt-4 space-y-2"><div className="h-1.5 overflow-hidden rounded-full bg-[#EDF2F7]"><div className="h-full w-2/3 animate-pulse rounded-full bg-[#628BC0]"/></div><p className="text-xs text-[#77869B]">Memproses file dan menjalankan prediksi model...</p></div>}
          <button onClick={analyze} disabled={loading} className="mt-4 flex w-full items-center justify-center gap-2 rounded-[9px] bg-[#315F9F] px-4 py-3 text-xs font-bold text-white transition hover:bg-[#274D82] disabled:cursor-not-allowed disabled:opacity-60">{loading ? <><Loader2 className="animate-spin" size={16}/> Menganalisis traffic...</> : <><ShieldCheck size={16}/> Analyze Traffic</>}</button>
        </section>
        <aside className="space-y-4">
          <div className="card p-5"><h2 className="text-sm font-bold">Format file yang diperlukan</h2><ul className="mt-4 space-y-3 text-xs leading-5 text-[#77869B]"><li className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#628BC0]"/><span>Harus memiliki <b className="text-[#192B45]">69 kolom fitur</b> sesuai urutan feature_names.json.</span></li><li className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#628BC0]"/><span>Kolom <b className="text-[#192B45]">Label</b> pada contoh diperbolehkan sebagai metadata tambahan.</span></li><li className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#628BC0]"/><span>Nilai kosong atau tak terhingga dibuang oleh backend.</span></li><li className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#628BC0]"/><span>Ukuran maksimum <b className="text-[#192B45]">100 MB</b>.</span></li></ul></div>
          <div className="card p-5"><p className="text-sm font-bold">Contoh data uji</p><p className="mt-2 text-xs leading-5 text-[#77869B]">Gunakan sampel dengan 109 baris sebagai referensi format data.</p><a href="/sample_flows.csv" download className="mt-3 inline-flex items-center gap-2 rounded-[8px] border border-[#DDE6F0] px-3 py-2 text-xs font-bold text-[#315F9F] transition hover:bg-[#EDF3FA]">Unduh sample_flows.csv</a></div>
        </aside>
      </div>
      {result && <section className="card p-5"><div className="mb-4 flex items-center justify-between"><h2 className="text-sm font-bold">Analisis Terakhir</h2><Link href="/results" className="text-xs font-bold text-[#315F9F]">Buka hasil lengkap</Link></div><div className="grid grid-cols-2 gap-3 lg:grid-cols-5">{[["Total rows",result.total_rows],["Rows dropped",result.rows_dropped],["Normal",result.normal],["Attacks",result.attacks],["Attack ratio",`${(result.attack_ratio*100).toFixed(2)}%`]].map(([l,v])=><div key={String(l)} className="rounded-[9px] border border-[#EEF2F7] bg-[#FAFCFE] p-3"><p className="text-[10px] text-[#77869B]">{l}</p><p className="mt-1 text-lg font-bold">{v}</p></div>)}</div></section>}
    </div>
  );
}
