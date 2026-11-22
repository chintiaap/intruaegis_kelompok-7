"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, ArrowRight, CircleHelp, ShieldCheck, TriangleAlert, Wifi, WifiOff, Zap } from "lucide-react";
import { BarChart, Bar, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getHealth } from "@/lib/api";
import { useDetection } from "@/lib/detection-context";

export default function DashboardPage() {
  const { result } = useDetection();
  const [health, setHealth] = useState<"checking" | "connected" | "disconnected">("checking");

  useEffect(() => {
    getHealth().then(() => setHealth("connected")).catch(() => setHealth("disconnected"));
  }, []);

  const statusInfo = {
    checking: { label: "Checking", cls: "border-[#E7DDBD] bg-[#FFF9EA] text-[#B77D1F]", icon: Activity },
    connected: { label: "Connected", cls: "border-[#CAE8DC] bg-[#EFF8F4] text-[#238B68]", icon: Wifi },
    disconnected: { label: "Disconnected", cls: "border-[#ECCFD3] bg-[#FFF2F3] text-[#C94D59]", icon: WifiOff },
  }[health];
  const StatusIcon = statusInfo.icon;

  const benign = result?.normal ?? 0;
  const attacks = result?.attacks ?? 0;
  const chartData = result ? [{ name: "BENIGN", label: "Normal", value: benign }, { name: "ATTACK", label: "Serangan", value: attacks }] : [];
  const cards = [
    { label: "Total Traffic Analyzed", value: result ? result.total.toLocaleString("id-ID") : "—", note: "Valid flow rows analyzed", tooltip: "Jumlah baris lalu lintas valid yang diproses model.", icon: Activity, tone: "text-[#315F9F] bg-[#EDF3FA]" },
    { label: "Normal Traffic", value: result ? result.normal.toLocaleString("id-ID") : "—", note: "Classified as BENIGN", tooltip: "Lalu lintas yang diklasifikasikan BENIGN.", icon: ShieldCheck, tone: "text-[#238B68] bg-[#EAF7F2]" },
    { label: "Detected Attacks", value: result ? result.attacks.toLocaleString("id-ID") : "—", note: "Non-BENIGN classifications", tooltip: "Semua prediksi yang bukan BENIGN.", icon: TriangleAlert, tone: "text-[#C94D59] bg-[#FFF2F3]" },
    { label: "Attack Ratio", value: result ? `${(result.attack_ratio * 100).toFixed(2)}%` : "—", note: "Share of detected attacks", tooltip: "Persentase traffic terdeteksi sebagai serangan.", icon: Zap, tone: "text-[#B77D1F] bg-[#FFF8E8]" },
  ];

  return (
    <div className="space-y-5">
      <section className="card relative min-h-[154px] overflow-hidden p-5 md:p-6">
        <div className="absolute right-0 top-0 hidden h-full w-[34%] overflow-hidden md:block" aria-hidden="true">
          <svg viewBox="0 0 420 190" className="h-full w-full" fill="none">
            <circle cx="330" cy="94" r="62" stroke="#E8EEF6" strokeWidth="1" /><circle cx="330" cy="94" r="38" stroke="#E8EEF6" strokeWidth="1" />
            <path d="M62 132C112 118 124 62 186 75C232 84 235 132 292 112C324 101 346 55 386 48" stroke="#BCD0E8" strokeWidth="1.5" strokeDasharray="5 7" />
            {[{x:62,y:132},{x:186,y:75},{x:292,y:112},{x:386,y:48},{x:330,y:94}].map((p,i)=><g key={i}><circle cx={p.x} cy={p.y} r="5" fill="#FFFFFF" stroke="#628BC0" strokeWidth="2"/><circle cx={p.x} cy={p.y} r="2" fill="#628BC0"/></g>)}
          </svg>
        </div>
        <div className="relative z-10 flex h-full flex-col justify-between gap-4 md:w-[66%]">
          <div><p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#628BC0]">Intelligent Network Defense</p><h1 className="page-title">Welcome to IntruAegis</h1><p className="mt-1.5 max-w-xl text-sm leading-6 text-[#77869B]">Monitor hasil analisis traffic dan evaluasi model deteksi intrusi dalam satu workspace.</p></div>
          <div className="flex flex-wrap gap-2"><span className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold ${statusInfo.cls}`}><StatusIcon size={14}/>Backend: {statusInfo.label}</span><span className="flex items-center gap-2 rounded-lg border border-[#DDE6F0] bg-white px-3 py-2 text-xs font-bold text-[#315F9F]"><ShieldCheck size={14}/>Model: Available</span></div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, note, tooltip, icon: Icon, tone }) => (
          <div key={label} className="card card-hover p-4">
            <div className="flex items-start justify-between"><div><p className="flex items-center gap-1.5 text-xs font-medium text-[#77869B]">{label}<button className="tooltip-trigger text-[#A2AEC0]" data-tooltip={tooltip} aria-label={tooltip}><CircleHelp size={13}/></button></p><p className="mt-2 text-[27px] font-bold leading-none tracking-tight text-[#192B45]">{value}</p></div><span className={`flex h-9 w-9 items-center justify-center rounded-[10px] ${tone}`}><Icon size={18}/></span></div>
            <p className="mt-3 border-t border-[#EEF2F7] pt-3 text-[11px] text-[#77869B]">{result ? note : "Data belum tersedia"}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        <div className="card p-5">
          <div className="flex items-start justify-between"><div><h2 className="text-sm font-bold text-[#192B45]">Recent Detection Summary</h2><p className="mt-1 text-xs text-[#77869B]">Hasil analisis terakhir pada sesi ini</p></div>{result && <Link href="/results" className="group flex items-center gap-1 text-xs font-bold text-[#315F9F]">Lihat detail <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5"/></Link>}</div>
          {result ? <div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-[10px] border border-[#EEF2F7] bg-[#FAFCFE] p-3"><p className="text-[11px] text-[#77869B]">Rows Dropped</p><p className="mt-1 text-lg font-bold">{result.rows_dropped}</p></div><div className="rounded-[10px] border border-[#EEF2F7] bg-[#FAFCFE] p-3"><p className="text-[11px] text-[#77869B]">Valid Results</p><p className="mt-1 text-lg font-bold">{result.total}</p></div><div className="rounded-[10px] border border-[#EEF2F7] bg-[#FAFCFE] p-3"><p className="text-[11px] text-[#77869B]">Shown to Table</p><p className="mt-1 text-lg font-bold">{result.detections.length}</p></div></div> : <div className="mt-5 flex h-[148px] items-center gap-4 rounded-[10px] border border-dashed border-[#D7E1EE] bg-[#FAFCFE] px-5"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EDF3FA] text-[#628BC0]"><Activity size={21}/></span><div><p className="text-sm font-bold text-[#192B45]">Belum ada hasil analisis</p><p className="mt-1 max-w-sm text-xs leading-5 text-[#77869B]">Unggah file CSV pada Traffic Detection untuk menampilkan ringkasan lalu lintas nyata.</p></div></div>}
        </div>

        <div className="card p-5"><div className="flex items-start justify-between"><div><h2 className="text-sm font-bold text-[#192B45]">Traffic Distribution</h2><p className="mt-1 text-xs text-[#77869B]">Normal dibanding serangan</p></div>{result && <span className="rounded-md bg-[#F3F6FB] px-2 py-1 text-[10px] font-bold text-[#77869B]">REAL RESULT</span>}</div>{chartData.length ? <><div className="mt-3 h-[148px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} margin={{top:8,right:4,left:-20,bottom:0}}><CartesianGrid stroke="#EEF2F7" vertical={false}/><XAxis dataKey="label" tick={{fontSize:11,fill:"#77869B"}} axisLine={false} tickLine={false}/><YAxis allowDecimals={false} tick={{fontSize:10,fill:"#77869B"}} axisLine={false} tickLine={false}/><Tooltip/><Bar dataKey="value" radius={[6,6,0,0]} barSize={48}>{chartData.map((entry)=><Cell key={entry.name} fill={entry.name === "BENIGN" ? "#628BC0" : "#D95360"}/>)}</Bar></BarChart></ResponsiveContainer></div><p className="text-[11px] leading-5 text-[#77869B]">BENIGN menunjukkan trafik normal. Semua label lain dikategorikan sebagai serangan.</p></> : <div className="mt-5 flex h-[148px] flex-col items-center justify-center rounded-[10px] border border-dashed border-[#D7E1EE] bg-[#FAFCFE] text-center"><div className="mb-2 flex items-end gap-1.5" aria-hidden="true"><span className="h-5 w-3 rounded-sm bg-[#DDE6F0]"/><span className="h-9 w-3 rounded-sm bg-[#CBD9EA]"/><span className="h-7 w-3 rounded-sm bg-[#BFD0E5]"/></div><p className="text-xs font-semibold text-[#77869B]">Distribusi akan tersedia setelah analisis</p></div>}</div>
      </section>

      <section className="card flex flex-col gap-4 bg-[#192B45] p-5 text-white sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#9FB2CB]">Start network analysis</p><h2 className="mt-1 text-base font-bold">Analyze a CSV containing 69 network features</h2></div><Link href="/detection" className="flex items-center justify-center gap-2 rounded-[10px] bg-white px-4 py-2.5 text-xs font-bold text-[#315F9F] transition hover:bg-[#EDF3FA]">Traffic Detection <ArrowRight size={15}/></Link></section>
    </div>
  );
}
