"use client";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { api } from "@/lib/api";
import { Campaign } from "@/lib/types";
import { Calendar, CheckCircle2, Flag, Gift, Loader2, X } from "lucide-react";
import Link from "next/link";
import { campaigns as demo } from "@/lib/data";
export default function Details() {
  const { id } = useParams<{ id: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [amount, setAmount] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [report, setReport] = useState(false);
  const [reason, setReason] = useState("");
  useEffect(() => {
    api<Campaign>(`/campaigns/${id}`)
      .then((c) => {
        setCampaign(c);
        setAmount(c.minimumContribution);
      })
      .catch((e) => {
        const fallback = demo.find((item) => item._id === id);
        if (fallback) {
          setCampaign(fallback);
          setAmount(fallback.minimumContribution);
        } else setError(e.message);
      })
      .finally(() => setLoading(false));
  }, [id]);
  const contribute = async () => {
    if (!campaign || busy) return;
    setBusy(true);
    try {
      await api("/contributions", {
        method: "POST",
        headers: { "Idempotency-Key": crypto.randomUUID() },
        body: JSON.stringify({ campaignId: campaign._id, amount, message }),
      });
      toast.success("Contribution submitted for creator review");
      setMessage("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Contribution failed");
    } finally {
      setBusy(false);
    }
  };
  const submitReport = async () => {
    try {
      await api(`/campaigns/${id}/report`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      });
      toast.success("Report submitted for admin review");
      setReport(false);
      setReason("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not submit report");
    }
  };
  if (loading)
    return (
      <>
        <Navbar />
        <main className="container-app py-10">
          <div className="h-[70vh] animate-pulse rounded-[2.5rem] bg-black/5" />
        </main>
      </>
    );
  if (error || !campaign)
    return (
      <>
        <Navbar />
        <main className="container-app py-24 text-center">
          <h1 className="text-4xl font-black">Campaign not found</h1>
          <p className="mt-3 text-black/50">{error}</p>
          <Link href="/explore" className="btn-primary mt-6">
            Explore campaigns
          </Link>
        </main>
      </>
    );
  return (
    <>
      <Navbar />
      <main className="container-app py-10">
        <div className="relative h-[45vh] min-h-80 overflow-hidden rounded-[2.5rem]">
          <Image
            src={campaign.image}
            alt={campaign.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-8 left-8 text-white md:left-12">
            <span className="rounded-full bg-lime px-3 py-1 text-xs font-bold text-ink">
              {campaign.category}
            </span>
            <h1 className="mt-4 max-w-3xl text-4xl font-black md:text-6xl">
              {campaign.title}
            </h1>
          </div>
        </div>
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
          <section>
            <p className="text-xl leading-9 text-black/70">{campaign.story}</p>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                [
                  Calendar,
                  "Deadline",
                  new Date(campaign.deadline).toLocaleDateString(),
                ],
                [Gift, "Reward", campaign.reward],
                [CheckCircle2, "Creator", campaign.creatorName],
              ].map(([Icon, l, v]) => (
                <div className="card p-5" key={String(l)}>
                  <Icon size={20} />
                  <small className="mt-3 block text-black/40">
                    {String(l)}
                  </small>
                  <b className="mt-1 block">{String(v)}</b>
                </div>
              ))}
            </div>
            <button
              onClick={() => setReport(true)}
              className="mt-8 flex items-center gap-2 text-sm font-bold text-red-700"
            >
              <Flag size={16} />
              Report this campaign
            </button>
          </section>
          <aside className="card h-fit p-7 lg:sticky lg:top-28">
            <div className="text-3xl font-black">
              {campaign.raised.toLocaleString()} credits
            </div>
            <p className="text-sm text-black/50">
              raised of {campaign.goal.toLocaleString()} goal
            </p>
            <div className="my-5 h-3 overflow-hidden rounded-full bg-black/5">
              <div
                className="h-full bg-lime"
                style={{
                  width: `${Math.min(100, (campaign.raised / campaign.goal) * 100)}%`,
                }}
              />
            </div>
            <label className="text-sm font-bold">
              Contribution amount
              <input
                className="input mt-2"
                type="number"
                min={campaign.minimumContribution}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </label>
            <label className="mt-4 block text-sm font-bold">
              Message to creator
              <textarea
                className="input mt-2 min-h-24"
                maxLength={500}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Why are you backing this idea?"
              />
            </label>
            <button
              disabled={busy || amount < campaign.minimumContribution}
              onClick={contribute}
              className="btn-primary mt-4 w-full disabled:opacity-50"
            >
              {busy ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Back this project"
              )}
            </button>
            <p className="mt-3 text-center text-xs text-black/40">
              Minimum {campaign.minimumContribution} credits · creator approval
              required
            </p>
          </aside>
        </div>
      </main>
      <Footer />
      {report && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-black/50 p-5">
          <div className="card w-full max-w-md p-7">
            <div className="flex justify-between">
              <h2 className="text-2xl font-black">Report campaign</h2>
              <button onClick={() => setReport(false)}>
                <X />
              </button>
            </div>
            <label className="mt-5 block text-sm font-bold">
              Reason
              <textarea
                className="input mt-2 min-h-28"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain what seems suspicious"
              />
            </label>
            <button
              disabled={reason.trim().length < 10}
              onClick={submitReport}
              className="btn-primary mt-4 w-full disabled:opacity-40"
            >
              Submit report
            </button>
          </div>
        </div>
      )}
    </>
  );
}
