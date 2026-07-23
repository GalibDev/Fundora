"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import { Campaign } from "@/lib/types";

export default function CampaignCard({ campaign }: { campaign: Campaign }) {
  const percentage = Math.min(100, Math.round(((campaign.raised || 0) / (campaign.goal || 1)) * 100));
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -7 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.28 }}
      className="card group h-full overflow-hidden shadow-sm transition-shadow hover:shadow-xl"
    >
      <div className="relative h-52 overflow-hidden sm:h-56">
        <Image src={campaign.image} alt={campaign.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" />
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold backdrop-blur">{campaign.category}</span>
      </div>
      <div className="flex h-[230px] flex-col p-5 sm:p-6">
        <p className="text-xs font-bold text-forest">by {campaign.creatorName}</p>
        <h3 className="mt-2 line-clamp-2 text-xl font-black leading-tight">{campaign.title}</h3>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-black/5"><div className="h-full rounded-full bg-forest transition-all duration-500" style={{ width: `${percentage}%` }} /></div>
        <div className="mt-3 flex justify-between text-sm"><strong>{(campaign.raised || 0).toLocaleString()} credits raised</strong><span className="text-black/50">{percentage}%</span></div>
        <div className="mt-1 text-xs text-black/45">Funding goal: {(campaign.goal || 0).toLocaleString()} credits</div>
        <div className="mt-auto flex items-center justify-between gap-2 pt-4"><span className="flex items-center gap-1 text-xs text-black/45"><CalendarDays size={14} />{new Date(campaign.deadline).toLocaleDateString()}</span><Link href={`/campaigns/${campaign._id}`} className="btn-lime shrink-0 !px-4 !py-2 text-sm">View details <ArrowUpRight className="ml-1" size={15} /></Link></div>
      </div>
    </motion.article>
  );
}
