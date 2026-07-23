"use client";

import Link from "next/link";
import { Bell, Coins, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const closeMenu = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-cream/90 backdrop-blur-xl">
      <div className="container-app flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-2xl font-black tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-lime">F</span>
          Fundora
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/" className="font-semibold hover:text-forest">Home</Link>
          <Link href="/explore" className="font-semibold hover:text-forest">Explore campaigns</Link>
          <Link href="/#how-it-works" className="font-semibold hover:text-forest">How it works</Link>
          {user ? <>
            <Link href="/dashboard" className="font-semibold">Dashboard</Link>
            <span className="flex items-center gap-1 rounded-full bg-white px-3 py-2 text-sm font-bold"><Coins size={16} />{user.credits}</span>
            <Link aria-label="Notifications" href="/dashboard" className="grid size-9 place-items-center rounded-full bg-white"><Bell size={17} /></Link>
            <Link href="/dashboard" className="flex items-center gap-2"><img src={user.photo || "https://i.pravatar.cc/40"} alt={`${user.name} profile`} className="size-8 rounded-full object-cover" /><span className="text-xs"><b className="block">{user.name}</b><span className="capitalize text-black/45">{user.role}</span></span></Link>
            <button onClick={logout} className="font-semibold">Logout</button>
          </> : <>
            <Link href="/login" className="font-semibold">Login</Link>
            <Link href="/register" className="btn-primary !px-5 !py-2.5">Get started</Link>
          </>}
        </nav>
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X /> : <Menu />}</button>
      </div>
      {open && <nav className="container-app flex flex-col gap-4 border-t border-black/5 py-5 md:hidden">
        <Link href="/" onClick={closeMenu}>Home</Link>
        <Link href="/explore" onClick={closeMenu}>Explore campaigns</Link>
        <Link href="/#how-it-works" onClick={closeMenu}>How it works</Link>
        <Link href={user ? "/dashboard" : "/login"} onClick={closeMenu}>{user ? "Dashboard" : "Login"}</Link>
        {!user && <Link href="/register" onClick={closeMenu}>Register</Link>}
        {user && <button className="text-left" onClick={logout}>Logout</button>}
      </nav>}
    </header>
  );
}
