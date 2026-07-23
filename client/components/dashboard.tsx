"use client";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { campaigns as demo } from "@/lib/data";
import { useRouter } from "next/navigation";
import {
  Bell,
  ArrowLeft,
  Coins,
  FolderKanban,
  Heart,
  Home,
  LogOut,
  Menu,
  PlusCircle,
  ReceiptText,
  ShieldCheck,
  Users,
  WalletCards,
  X,
  Check,
  Trash2,
  Edit3,
  Upload,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import ImageUpload from "./image-upload";
import { toast } from "sonner";
type Item = Record<string, any>;
const packs = [
  [100, 10],
  [300, 25],
  [800, 60],
  [1500, 110],
];
const navFor = (role: string) =>
  role === "admin"
    ? [
        [Home, "Overview"],
        [Users, "Manage users"],
        [ShieldCheck, "Campaign approvals"],
        [WalletCards, "Withdrawal requests"],
        [FolderKanban, "Manage campaigns"],
        [ReceiptText, "Reports"],
      ]
    : role === "creator"
      ? [
          [Home, "Overview"],
          [PlusCircle, "Add campaign"],
          [FolderKanban, "My campaigns"],
          [Heart, "My contributions"],
          [WalletCards, "Withdrawals"],
          [ReceiptText, "Payment history"],
        ]
      : [
          [Home, "Overview"],
          [Heart, "Explore campaigns"],
          [FolderKanban, "My contributions"],
          [Coins, "Purchase credits"],
          [ReceiptText, "Payment history"],
        ];
export default function Dashboard() {
  const { user, loading, logout, refresh } = useAuth();
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const [tab, setTab] = useState("Overview");
  const [items, setItems] = useState<Item[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [notifications, setNotifications] = useState<Item[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState<Item>({ name: "", photo: "" });
  const [campaign, setCampaign] = useState<Item>({
    title: "",
    story: "",
    category: "Technology",
    goal: 1000,
    minimumContribution: 20,
    deadline: "",
    reward: "",
    image: "",
  });
  const [withdraw, setWithdraw] = useState<Item>({
    credits: 200,
    paymentSystem: "Stripe",
    accountNumber: "",
  });
  const [search, setSearch] = useState("");
  const [dashboardStats, setDashboardStats] = useState<Item>({});
  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);
  useEffect(() => {
    if (user) {
      setProfile({ name: user.name, photo: user.photo || "" });
      loadTab("Overview");
    }
  }, [user]);
  if (loading || !user)
    return (
      <div className="grid min-h-screen place-items-center font-bold">
        Loading your workspace…
      </div>
    );
  const role = user.role;
  const nav = navFor(role);
  const loadTab = async (t: string, p = 1) => {
    setTab(t);
    setPage(p);
    try {
      if (t === "My contributions") {
        const r = await api<{ items: Item[]; pages: number }>(
          `/contributions?page=${p}`,
        );
        setItems(r.items);
        setPages(r.pages);
      } else if (t === "Payment history") {
        setItems(await api<Item[]>("/payments"));
      } else if (t === "Withdrawals" || t === "Withdrawal requests") {
        setItems(await api<Item[]>("/withdrawals"));
      } else if (t === "My campaigns") {
        setItems(await api<Item[]>("/campaigns/mine"));
      } else if (t === "Explore campaigns") {
        const result = await api<{ items: Item[] }>("/campaigns?limit=12");
        setItems(result.items);
      } else if (t === "Manage users") {
        setItems(await api<Item[]>("/admin/users"));
      } else if (t === "Campaign approvals") {
        setItems(await api<Item[]>("/admin/campaigns?status=pending"));
      } else if (t === "Manage campaigns") {
        setItems(await api<Item[]>("/admin/campaigns"));
      } else if (t === "Reports") {
        setItems(await api<Item[]>("/admin/reports"));
      } else if (t === "Overview") {
        setItems([]);
        setDashboardStats(
          role === "admin"
            ? await api<Item>("/admin/stats")
            : await api<Item>("/dashboard/stats"),
        );
      }
    } catch {
      if (t === "Explore campaigns") setItems(demo);
    }
  };
  const notify = async () => {
    try {
      setNotifications(await api<Item[]>("/notifications"));
    } catch {}
  };
  const createCampaign = async () => {
    try {
      await api("/campaigns", {
        method: "POST",
        body: JSON.stringify(campaign),
      });
      toast.success("Campaign submitted for approval");
      setCampaign({ ...campaign, title: "", story: "", image: "" });
      loadTab("My campaigns");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create campaign");
    }
  };
  const contribute = async (id: string, amount: number) => {
    try {
      await api("/contributions", {
        method: "POST",
        headers: { "Idempotency-Key": crypto.randomUUID() },
        body: JSON.stringify({ campaignId: id, amount }),
      });
      toast.success("Contribution sent for review");
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Contribution failed");
    }
  };
  const updateStatus = async (id: string, status: string) => {
    try {
      await api(`/contributions/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      toast.success(`Contribution ${status}`);
      loadTab("Overview");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action failed");
    }
  };
  const approveCampaign = async (id: string, status: string) => {
    await api(`/campaigns/${id}/review`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    toast.success(`Campaign ${status}`);
    loadTab(tab);
  };
  const updateUserRole = async (id: string, nextRole: string) => {
    await api(`/admin/users/${id}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role: nextRole }),
    });
    toast.success("User role updated");
    loadTab("Manage users");
  };
  const removeUser = async (id: string) => {
    if (!confirm("Remove this user permanently?")) return;
    await api(`/admin/users/${id}`, { method: "DELETE" });
    toast.success("User removed");
    loadTab("Manage users");
  };
  const approveWithdrawal = async (id: string) => {
    await api(`/withdrawals/${id}/approve`, { method: "PATCH" });
    toast.success("Withdrawal processed");
    loadTab("Withdrawal requests");
  };
  const resolveReport = async (id: string, action = "resolve") => {
    await api(`/admin/reports/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "resolved", action }),
    });
    toast.success(
      action === "suspend" ? "Campaign suspended" : "Report resolved",
    );
    loadTab("Reports");
  };
  const deleteCampaign = async (id: string) => {
    if (!confirm("Delete this campaign and refund approved supporters?"))
      return;
    await api(`/campaigns/${id}`, { method: "DELETE" });
    toast.success("Campaign deleted");
    loadTab(tab);
  };
  const editCampaign = async (item: Item) => {
    const title = prompt("Campaign title", item.title);
    if (title === null) return;
    const story = prompt("Campaign story", item.story);
    if (story === null) return;
    const reward = prompt("Reward information", item.reward || "");
    if (reward === null) return;
    await api(`/campaigns/${item._id}`, {
      method: "PATCH",
      body: JSON.stringify({ title, story, reward }),
    });
    toast.success("Campaign updated");
    loadTab("My campaigns");
  };
  const saveProfile = async () => {
    await api("/auth/me", { method: "PATCH", body: JSON.stringify(profile) });
    toast.success("Profile updated");
    setProfileOpen(false);
    refresh();
  };
  const requestWithdrawal = async () => {
    try {
      await api("/withdrawals", {
        method: "POST",
        body: JSON.stringify(withdraw),
      });
      toast.success("Withdrawal request submitted");
      loadTab("Withdrawals");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Withdrawal failed");
    }
  };
  const checkout = async (credits: number) => {
    try {
      const r = await api<{ url: string }>("/payments/checkout", {
        method: "POST",
        body: JSON.stringify({ credits }),
      });
      location.href = r.url;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Stripe is not configured");
    }
  };
  const filtered = items.filter((i) =>
    JSON.stringify(i).toLowerCase().includes(search.toLowerCase()),
  );
  const stats =
    role === "admin"
      ? [
          ["Total supporters", dashboardStats.supporters ?? 0],
          ["Active creators", dashboardStats.creators ?? 0],
          ["Available credits", dashboardStats.availableCredits ?? 0],
          ["Payments processed", `$${dashboardStats.payments ?? 0}`],
        ]
      : role === "creator"
        ? [
            ["Campaigns launched", dashboardStats.total ?? 0],
            ["Active campaigns", dashboardStats.active ?? 0],
            ["Credits raised", dashboardStats.raised ?? 0],
            ["Pending reviews", dashboardStats.pending ?? 0],
          ]
        : [
            ["Total contributions", dashboardStats.total ?? 0],
            ["Pending", dashboardStats.pending ?? 0],
            ["Approved credits", dashboardStats.approvedCredits ?? 0],
            ["Available credits", String(user.credits)],
          ];
  return (
    <div className="min-h-screen bg-[#f3f5ef]">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-ink p-6 text-white transition lg:translate-x-0 ${menu ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-black">
            <span className="text-lime">F</span>undora
          </Link>
          <button className="lg:hidden" onClick={() => setMenu(false)}>
            <X />
          </button>
        </div>
        <div className="mt-10 rounded-2xl bg-white/5 p-4">
          <p className="text-xs uppercase tracking-widest text-lime">{role}</p>
          <b className="mt-1 block">{user.name}</b>
          <p className="text-xs text-white/40">{user.email}</p>
        </div>
        <nav className="mt-7 space-y-2">
          {nav.map(([Icon, label]) => (
            <button
              key={String(label)}
              onClick={() => {
                loadTab(String(label));
                setMenu(false);
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold ${tab === label ? "bg-lime text-ink" : "text-white/60 hover:bg-white/5 hover:text-white"}`}
            >
              <Icon size={18} />
              {String(label)}
            </button>
          ))}
        </nav>
        <button
          onClick={logout}
          className="absolute bottom-7 flex items-center gap-3 text-sm font-bold text-white/60"
        >
          <LogOut size={18} />
          Log out
        </button>
      </aside>
      <main className="lg:ml-72">
        <header className="flex h-20 items-center justify-between border-b border-black/5 bg-white px-5 md:px-8">
          <div className="flex items-center gap-3">
            <button className="lg:hidden" onClick={() => setMenu(true)}>
              <Menu />
            </button>
            <Link
              href="/"
              className="flex items-center gap-2 rounded-full bg-cream px-3 py-2 text-sm font-bold"
            >
              <ArrowLeft size={16} /> Home
            </Link>
          </div>
          <div className="hidden md:block">
            <p className="text-xs text-black/40">Workspace</p>
            <b>{tab}</b>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                notify();
              }}
              className="relative grid size-10 place-items-center rounded-full bg-cream"
            >
              <Bell size={18} />
              <span className="absolute right-1 top-1 size-2 rounded-full bg-red-500" />
            </button>
            <button
              onClick={() => setProfileOpen(true)}
              className="hidden items-center gap-2 rounded-full bg-cream px-3 py-2 text-sm font-bold md:flex"
            >
              <img
                src={user.photo || "https://i.pravatar.cc/40"}
                className="size-6 rounded-full"
              />
              {user.name}
            </button>
            <div className="rounded-full bg-lime px-4 py-2 text-sm font-black">
              {user.credits} credits
            </div>
          </div>
          {showNotifications && (
            <div className="absolute right-5 top-16 z-40 w-80 rounded-2xl border border-black/5 bg-white p-3 shadow-soft">
              {notifications.length ? (
                <>
                  {notifications.map((n) => (
                    <button
                      key={n._id}
                      onClick={async () => {
                        await api(`/notifications/${n._id}/read`, {
                          method: "PATCH",
                        });
                        setShowNotifications(false);
                        if (n.actionRoute) router.push(n.actionRoute);
                        notify();
                      }}
                      className={`block w-full rounded-xl p-3 text-left text-sm ${n.isRead ? "" : "bg-cream"}`}
                    >
                      {n.message}
                      <small className="mt-1 block text-black/40">
                        {new Date(n.time || n.createdAt).toLocaleString()}
                      </small>
                    </button>
                  ))}
                  <button
                    onClick={() =>
                      api("/notifications/read-all", { method: "PATCH" }).then(
                        notify,
                      )
                    }
                    className="mt-2 w-full text-xs font-bold"
                  >
                    Mark all read
                  </button>
                </>
              ) : (
                <p className="p-4 text-sm text-black/50">
                  No notifications yet.
                </p>
              )}
            </div>
          )}
        </header>
        <div className="p-5 md:p-8">
          <p className="eyebrow">Good to see you</p>
          <h1 className="mt-2 text-3xl font-black md:text-4xl">
            {tab === "Overview"
              ? `Let’s move ideas forward, ${user.name.split(" ")[0]}.`
              : tab}
          </h1>
          {tab === "Overview" && (
            <>
              <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map(([l, v]) => (
                  <div key={l} className="card p-6">
                    <p className="text-sm text-black/45">{l}</p>
                    <p className="mt-2 text-3xl font-black">{v}</p>
                  </div>
                ))}
              </div>
              <div className="card mt-6 p-6">
                <p className="font-black">Your workspace is ready</p>
                <p className="mt-2 text-black/50">
                  Use the navigation to manage campaigns, contributions,
                  payments and profile settings.
                </p>
              </div>
            </>
          )}
          {tab === "Add campaign" && (
            <CampaignForm
              campaign={campaign}
              setCampaign={setCampaign}
              onSubmit={createCampaign}
            />
          )}{" "}
          {tab === "Purchase credits" && (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {packs.map(([c, p]) => (
                <div key={c} className="card p-6">
                  <Coins className="text-forest" />
                  <h3 className="mt-5 text-3xl font-black">{c}</h3>
                  <p className="text-black/50">credits</p>
                  <p className="mt-4 text-xl font-bold">${p}</p>
                  <button
                    onClick={() => checkout(c)}
                    className="btn-primary mt-5 w-full"
                  >
                    Pay with Stripe
                  </button>
                </div>
              ))}
            </div>
          )}
          {tab === "Withdrawals" && (
            <WithdrawalForm
              value={withdraw}
              setValue={setWithdraw}
              onSubmit={requestWithdrawal}
            />
          )}{" "}
          {tab === "My campaigns" && (
            <CampaignTable
              items={filtered}
              creator
              onDelete={deleteCampaign}
              onEdit={editCampaign}
            />
          )}{" "}
          {tab === "Explore campaigns" && (
            <ExploreTable items={filtered} onContribute={contribute} />
          )}{" "}
          {[
            "My contributions",
            "Payment history",
            "Withdrawal requests",
            "Manage users",
            "Campaign approvals",
            "Manage campaigns",
            "Reports",
          ].includes(tab) && (
            <DataTable
              tab={tab}
              items={filtered}
              search={search}
              setSearch={setSearch}
              page={page}
              pages={pages}
              onPage={(p) => loadTab(tab, p)}
              onStatus={updateStatus}
              onApprove={approveCampaign}
              onDelete={deleteCampaign}
              role={role}
              onUserRole={updateUserRole}
              onRemoveUser={removeUser}
              onWithdrawal={approveWithdrawal}
              onReport={resolveReport}
            />
          )}
        </div>
      </main>
      {profileOpen && (
        <ProfileModal
          value={profile}
          setValue={setProfile}
          onSave={saveProfile}
          onClose={() => setProfileOpen(false)}
        />
      )}
    </div>
  );
}
function CampaignForm({
  campaign,
  setCampaign,
  onSubmit,
}: {
  campaign: Item;
  setCampaign: (x: Item) => void;
  onSubmit: () => void;
}) {
  const f = (k: string) => (e: any) =>
    setCampaign({ ...campaign, [k]: e.target.value });
  return (
    <div className="card mt-8 max-w-3xl p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-bold">
          Campaign title
          <input
            className="input mt-2"
            value={campaign.title}
            onChange={f("title")}
            placeholder="A clear, human title"
          />
        </label>
        <label className="text-sm font-bold">
          Category
          <select
            className="input mt-2"
            value={campaign.category}
            onChange={f("category")}
          >
            <option>Technology</option>
            <option>Community</option>
            <option>Health</option>
            <option>Art</option>
            <option>Environment</option>
          </select>
        </label>
        <label className="text-sm font-bold md:col-span-2">
          Campaign story
          <textarea
            className="input mt-2 min-h-32"
            value={campaign.story}
            onChange={f("story")}
            placeholder="What are you building and who will it help?"
          />
        </label>
        <label className="text-sm font-bold">
          Funding goal
          <input
            type="number"
            className="input mt-2"
            value={campaign.goal}
            onChange={f("goal")}
          />
        </label>
        <label className="text-sm font-bold">
          Minimum contribution
          <input
            type="number"
            className="input mt-2"
            value={campaign.minimumContribution}
            onChange={f("minimumContribution")}
          />
        </label>
        <label className="text-sm font-bold">
          Deadline
          <input
            type="date"
            className="input mt-2"
            value={campaign.deadline}
            onChange={f("deadline")}
          />
        </label>
        <label className="text-sm font-bold">
          Reward info
          <input
            className="input mt-2"
            value={campaign.reward}
            onChange={f("reward")}
          />
        </label>
        <div className="md:col-span-2">
          <ImageUpload
            value={campaign.image}
            onChange={(image) => setCampaign({ ...campaign, image })}
          />
        </div>
      </div>
      <button onClick={onSubmit} className="btn-primary mt-5">
        <Upload size={17} className="mr-2" />
        Submit for approval
      </button>
    </div>
  );
}
function WithdrawalForm({
  value,
  setValue,
  onSubmit,
}: {
  value: Item;
  setValue: (x: Item) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="card mt-8 max-w-xl p-6">
      <h3 className="text-xl font-black">Request a withdrawal</h3>
      <p className="mt-1 text-sm text-black/50">
        Minimum 200 credits · 20 credits = $1
      </p>
      <label className="mt-6 block text-sm font-bold">
        Credits to withdraw
        <input
          type="number"
          min="200"
          className="input mt-2"
          value={value.credits}
          onChange={(e) =>
            setValue({ ...value, credits: Number(e.target.value) })
          }
        />
      </label>
      <div className="mt-3 rounded-2xl bg-lime p-4 font-black">
        You will receive ${(value.credits / 20).toFixed(2)}
      </div>
      <label className="mt-4 block text-sm font-bold">
        Payment system
        <select
          className="input mt-2"
          value={value.paymentSystem}
          onChange={(e) =>
            setValue({ ...value, paymentSystem: e.target.value })
          }
        >
          <option>Stripe</option>
          <option>Bkash</option>
          <option>Rocket</option>
          <option>Nagad</option>
        </select>
      </label>
      <label className="mt-4 block text-sm font-bold">
        Account number
        <input
          className="input mt-2"
          value={value.accountNumber}
          onChange={(e) =>
            setValue({ ...value, accountNumber: e.target.value })
          }
        />
      </label>
      <button onClick={onSubmit} className="btn-primary mt-5">
        Submit withdrawal
      </button>
    </div>
  );
}
function ExploreTable({
  items,
  onContribute,
}: {
  items: Item[];
  onContribute: (id: string, a: number) => void;
}) {
  return (
    <div className="mt-8 grid gap-5 md:grid-cols-2">
      {items.map((c) => (
        <div className="card p-5" key={c._id}>
          <h3 className="font-black">{c.title}</h3>
          <p className="mt-1 text-sm text-black/50">
            {c.creatorName} · {c.category}
          </p>
          <div className="mt-4 flex items-center justify-between">
            <b>
              {c.raised?.toLocaleString()} / {c.goal?.toLocaleString()} credits
            </b>
            <button
              onClick={() => onContribute(c._id, c.minimumContribution || 20)}
              className="btn-lime !px-4 !py-2"
            >
              Contribute
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
function CampaignTable({
  items,
  onDelete,
  onEdit,
}: {
  items: Item[];
  creator?: boolean;
  onDelete: (id: string) => void;
  onEdit: (item: Item) => void;
}) {
  return (
    <div className="card mt-8 overflow-x-auto p-5">
      <table className="w-full min-w-[600px] text-left text-sm">
        <thead>
          <tr className="border-b border-black/10 text-black/45">
            <th className="p-3">Campaign</th>
            <th className="p-3">Status</th>
            <th className="p-3">Raised</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((c) => (
            <tr className="border-b border-black/5" key={c._id}>
              <td className="p-3 font-bold">{c.title}</td>
              <td className="p-3">{c.status}</td>
              <td className="p-3">{c.raised || 0}</td>
              <td className="flex gap-2 p-3">
                <button
                  aria-label="Edit campaign"
                  onClick={() => onEdit(c)}
                  className="rounded-full bg-lime/30 p-2 text-forest"
                >
                  <Edit3 size={16} />
                </button>
                <button
                  onClick={() => onDelete(c._id)}
                  className="rounded-full bg-red-50 p-2 text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function DataTable({
  tab,
  items,
  search,
  setSearch,
  page,
  pages,
  onPage,
  onStatus,
  onApprove,
  onDelete,
  role,
  onUserRole,
  onRemoveUser,
  onWithdrawal,
  onReport,
}: {
  tab: string;
  items: Item[];
  search: string;
  setSearch: (s: string) => void;
  page: number;
  pages: number;
  onPage: (p: number) => void;
  onStatus: (id: string, s: string) => void;
  onApprove: (id: string, s: string) => void;
  onDelete: (id: string) => void;
  role: string;
  onUserRole: (id: string, role: string) => void;
  onRemoveUser: (id: string) => void;
  onWithdrawal: (id: string) => void;
  onReport: (id: string, action?: string) => void;
}) {
  return (
    <div className="mt-8">
      <input
        className="input max-w-sm"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search this table..."
      />
      <div className="card mt-4 overflow-x-auto p-5">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-black/10 text-black/45">
              <th className="p-3">Name / title</th>
              <th className="p-3">Details</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr className="border-b border-black/5" key={i._id}>
                <td className="p-3 font-bold">
                  {i.title ||
                    i.campaignTitle ||
                    i.name ||
                    i.creatorName ||
                    i.supporterName ||
                    i.email}
                </td>
                <td className="p-3">
                  {i.amount ?? i.credits ?? i.role ?? i.reason ?? "—"}
                </td>
                <td className="p-3">{i.status || "—"}</td>
                <td className="flex gap-2 p-3">
                  {role === "creator" &&
                    tab === "My contributions" &&
                    i.status === "pending" && (
                      <>
                        <button
                          onClick={() => onStatus(i._id, "approved")}
                          className="rounded-full bg-green-100 p-2 text-green-700"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => onStatus(i._id, "rejected")}
                          className="rounded-full bg-red-100 p-2 text-red-700"
                        >
                          <X size={16} />
                        </button>
                      </>
                    )}
                  {tab === "Campaign approvals" && (
                    <>
                      <button
                        onClick={() => onApprove(i._id, "approved")}
                        className="rounded-full bg-green-100 p-2 text-green-700"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => onApprove(i._id, "rejected")}
                        className="rounded-full bg-red-100 p-2 text-red-700"
                      >
                        <X size={16} />
                      </button>
                    </>
                  )}
                  {tab === "Manage users" && (
                    <>
                      <select
                        aria-label={`Role for ${i.name}`}
                        value={i.role}
                        onChange={(e) => onUserRole(i._id, e.target.value)}
                        className="rounded-xl bg-cream px-2 py-1"
                      >
                        <option value="supporter">Supporter</option>
                        <option value="creator">Creator</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button
                        aria-label="Remove user"
                        onClick={() => onRemoveUser(i._id)}
                        className="rounded-full bg-red-100 p-2 text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                  {tab === "Withdrawal requests" && i.status === "pending" && (
                    <button
                      onClick={() => onWithdrawal(i._id)}
                      className="rounded-full bg-green-100 px-3 py-2 text-xs font-bold text-green-700"
                    >
                      Payment success
                    </button>
                  )}
                  {tab === "Reports" && (
                    <>
                      <button
                        onClick={() => onReport(i._id)}
                        className="rounded-full bg-green-100 px-3 py-2 text-xs font-bold text-green-700"
                      >
                        Resolve
                      </button>
                      <button
                        onClick={() => onReport(i._id, "suspend")}
                        className="rounded-full bg-amber-100 px-3 py-2 text-xs font-bold text-amber-700"
                      >
                        Suspend
                      </button>
                    </>
                  )}
                  {tab === "Manage campaigns" && (
                    <button
                      onClick={() => onDelete(i._id)}
                      className="rounded-full bg-red-100 p-2 text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div className="mt-4 flex items-center gap-3">
          <button
            disabled={page <= 1}
            onClick={() => onPage(page - 1)}
            className="rounded-full bg-white p-2 disabled:opacity-40"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm">
            Page {page} of {pages}
          </span>
          <button
            disabled={page >= pages}
            onClick={() => onPage(page + 1)}
            className="rounded-full bg-white p-2 disabled:opacity-40"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
function ProfileModal({
  value,
  setValue,
  onSave,
  onClose,
}: {
  value: Item;
  setValue: (x: Item) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-5">
      <div className="card w-full max-w-md p-7">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black">Your profile</h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>
        <label className="mt-6 block text-sm font-bold">
          Name
          <input
            className="input mt-2"
            value={value.name}
            onChange={(e) => setValue({ ...value, name: e.target.value })}
          />
        </label>
        <label className="mt-4 block text-sm font-bold">
          Photo URL
          <input
            className="input mt-2"
            value={value.photo}
            onChange={(e) => setValue({ ...value, photo: e.target.value })}
          />
        </label>
        <div className="mt-4">
          <ImageUpload
            label="Upload profile picture"
            value={value.photo || ""}
            onChange={(photo) => setValue({ ...value, photo })}
          />
        </div>
        <button onClick={onSave} className="btn-primary mt-5 w-full">
          Save profile
        </button>
      </div>
    </div>
  );
}
