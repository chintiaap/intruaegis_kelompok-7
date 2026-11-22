"use client";

import { useMemo, useState } from "react";
import { Search, ShieldCheck, TriangleAlert, Activity } from "lucide-react";
import { useDetection } from "@/lib/detection-context";

export default function ResultsPage() {
  const { result } = useDetection();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    if (!result) return [];
    return result.detections.filter((item) => {
      const kind = item.label === "BENIGN" ? "NORMAL" : "ATTACK";
      return (filter === "ALL" || kind === filter) && (item.label.toLowerCase().includes(query.toLowerCase()) || String(item.row).includes(query));
    });
  }, [result, filter, query]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const shown = filtered.slice((page - 1) * pageSize, page * pageSize);

  if (!result) return <div className="card flex min-h-[420px] flex-col items-center justify-center p-8 text-center"><span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#E1E8F1] bg-[#EDF3FA] text-[#628BC0]"><Activity /></span><h1 className="page-title">Belum ada hasil prediksi</h1><p className="mt-2 max-w-md text-sm leading-6 text-[#77869B]">Lakukan analisis CSV pada halaman Traffic Detection. Hasil terakhir akan tampil di sini untuk sesi browser ini.</p></div>;

  return <div className="space-y-6"><div><p className="text-sm font-semibold text-[#547FB5]">Prediction Output</p><h1 className="mt-1 text-2xl font-bold">Detection Results</h1></div>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[["Total",result.total,"#315F9F","bg-[#EDF3FA]"],["Normal",result.normal,"#238B68","bg-[#EAF7F2]"],["Attack",result.attacks,"#D95360","bg-[#FDEEEF]"],["Attack Ratio",`${(result.attack_ratio*100).toFixed(2)}%`,"#D99A38","bg-[#FFF8E8]"]].map(([l,v,c]) => <div key={String(l)} className="card p-5"><p className="text-sm text-[#718096]">{l}</p><p className="mt-2 text-3xl font-bold" style={{color:String(c)}}>{v}</p></div>)}</section>
    <section className="card overflow-hidden"><div className="flex flex-col gap-3 border-b border-[#E3EAF3] p-5 md:flex-row md:items-center md:justify-between"><div className="relative max-w-md flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]" size={17}/><input value={query} onChange={(e)=>{setQuery(e.target.value);setPage(1)}} placeholder="Cari label atau nomor baris" className="w-full rounded-xl border border-[#DCE5F0] py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#547FB5]"/></div><div className="flex gap-2">{["ALL","NORMAL","ATTACK"].map((v)=><button key={v} onClick={()=>{setFilter(v);setPage(1)}} className={`rounded-lg px-3 py-2 text-xs font-bold ${filter===v?"bg-[#315F9F] text-white":"bg-[#F1F5F9] text-[#718096]"}`}>{v}</button>)}</div></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-[#F8FAFD] text-xs uppercase text-[#718096]"><tr><th className="px-5 py-3">Nomor Baris</th><th className="px-5 py-3">Nama Label</th><th className="px-5 py-3">Confidence</th><th className="px-5 py-3">Status</th></tr></thead><tbody>{shown.map((item)=><tr key={item.row} className="border-t border-[#EDF1F6]"><td className="px-5 py-4 font-medium">{item.row}</td><td className="px-5 py-4">{item.label}</td><td className="px-5 py-4"><span className="font-semibold">{(item.confidence*100).toFixed(2)}%</span><p className="mt-1 text-xs text-[#718096]">Tingkat keyakinan model pada prediksi ini</p></td><td className="px-5 py-4">{item.label === "BENIGN"?<span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF7F2] px-3 py-1.5 text-xs font-bold text-[#238B68]"><ShieldCheck size={14}/>Normal</span>:<span className="inline-flex items-center gap-1.5 rounded-full bg-[#FDEEEF] px-3 py-1.5 text-xs font-bold text-[#D95360]"><TriangleAlert size={14}/>Attack</span>}</td></tr>)}</tbody></table></div>
      {filtered.length===0&&<div className="p-10 text-center text-sm text-[#718096]">Tidak ada hasil sesuai pencarian atau filter.</div>}<div className="flex items-center justify-between border-t border-[#E3EAF3] p-4 text-sm"><span className="text-[#718096]">{filtered.length} hasil</span><div className="flex gap-2"><button disabled={page===1} onClick={()=>setPage(p=>p-1)} className="rounded-lg border px-3 py-2 disabled:opacity-40">Sebelumnya</button><span className="px-2 py-2">{page}/{pages}</span><button disabled={page===pages} onClick={()=>setPage(p=>p+1)} className="rounded-lg border px-3 py-2 disabled:opacity-40">Berikutnya</button></div></div>
    </section></div>;
}
