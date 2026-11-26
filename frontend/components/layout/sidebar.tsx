"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, ChartNoAxesCombined, LayoutDashboard, SearchCheck, ScanLine, ShieldCheck, Users, X } from "lucide-react";

const items = [
	{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
	{ href: "/detection", label: "Traffic Detection", icon: ScanLine },
	{ href: "/results", label: "Detection Results", icon: SearchCheck },
	{ href: "/performance", label: "Model Performance", icon: ChartNoAxesCombined },
	{ href: "/about", label: "About Developers", icon: Users },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
	const pathname = usePathname();
	return (
		<>
			{open && <button className="fixed inset-0 z-40 bg-[#101A30]/45 backdrop-blur-[2px] md:hidden" aria-label="Close navigation" onClick={onClose} />}
			<aside className={`fixed left-0 top-0 z-50 flex h-dvh w-[238px] flex-col bg-[#101A30] text-white transition-transform duration-300 md:sticky md:z-30 md:h-dvh md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
				<div className="flex h-[76px] items-center justify-between border-b border-white/[0.07] px-5">
					<Link href="/dashboard" className="flex items-center gap-3" onClick={onClose}>
						<span className="relative flex h-10 w-10 items-center justify-center rounded-[11px] border border-white/10 bg-[#315F9F] shadow-[0_8px_24px_rgba(49,95,159,.28)]">
							<ShieldCheck size={21} strokeWidth={1.8} />
							<span className="absolute -right-1 -top-1 h-2 w-2 rounded-full border-2 border-[#101A30] bg-[#628BC0]" />
						</span>
						<span><b className="block text-[14px] tracking-[0.01em]">IntruAegis</b><small className="mt-0.5 block text-[10px] uppercase tracking-[0.16em] text-[#91A1B8]">Network Defense</small></span>
					</Link>
					<button className="rounded-lg p-2 text-[#A8B5C7] hover:bg-white/[0.06] md:hidden" onClick={onClose} aria-label="Close menu"><X size={19} /></button>
				</div>
				<nav className="flex-1 space-y-1 px-3 py-5">
					<p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#6F819A]">Workspace</p>
					{items.map(({ href, label, icon: Icon }) => {
						const active = pathname === href || (href === "/dashboard" && pathname === "/");
						return (
							<Link key={href} href={href} onClick={onClose} className={`group relative flex items-center gap-3 rounded-[10px] px-3 py-3 text-[13px] font-medium transition-all duration-200 ${active ? "bg-[#315F9F] text-white shadow-[0_8px_20px_rgba(49,95,159,.18)]" : "text-[#AEBAD0] hover:translate-x-0.5 hover:bg-white/[0.055] hover:text-white"}`}>
								{active && <span className="absolute -left-3 h-6 w-[3px] rounded-r-full bg-[#86A9D4]" />}
								<Icon size={18} strokeWidth={active ? 2 : 1.7} />
								<span>{label}</span>
							</Link>
						);
					})}
				</nav>
				<div className="mx-3 mb-4 rounded-xl border border-white/[0.08] bg-white/[0.035] p-3.5">
					<div className="flex items-center gap-2"><Activity size={14} className="text-[#86A9D4]" /><p className="text-[10px] uppercase tracking-[0.14em] text-[#91A1B8]">System model</p></div>
					<p className="mt-1.5 text-[13px] font-semibold">Random Forest IDS</p>
				</div>
			</aside>
		</>
	);
}
