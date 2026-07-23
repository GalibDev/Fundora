"use client";
import Link from "next/link";
import { Coins, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
export default function Navbar(){
 const {user,logout}=useAuth();const [open,setOpen]=useState(false);
 return <header className="sticky top-0 z-50 border-b border-black/5 bg-cream/90 backdrop-blur-xl"><div className="container-app flex h-20 items-center justify-between">
  <Link href="/" className="flex items-center gap-2 text-2xl font-black tracking-tight"><span className="grid h-9 w-9 place-items-center rounded-full bg-lime">F</span>Fundora</Link>
  <nav className="hidden items-center gap-7 md:flex"><Link href="/explore" className="font-semibold hover:text-forest">Explore campaigns</Link>{user?<><Link href="/dashboard" className="font-semibold">Dashboard</Link><span className="flex items-center gap-1 rounded-full bg-white px-3 py-2 text-sm font-bold"><Coins size={16}/>{user.credits}</span><button onClick={logout} className="font-semibold">Logout</button></>:<><Link href="/login" className="font-semibold">Login</Link><Link href="/register" className="btn-primary !px-5 !py-2.5">Get started</Link></>}<a href="https://github.com/GalibDev/Fundora" target="_blank" className="text-sm font-bold underline decoration-lime decoration-4 underline-offset-4">Join as developer</a></nav>
  <button className="md:hidden" onClick={()=>setOpen(!open)} aria-label="Menu">{open?<X/>:<Menu/>}</button>
 </div>{open&&<nav className="container-app flex flex-col gap-4 border-t border-black/5 py-5 md:hidden"><Link href="/explore">Explore campaigns</Link><Link href={user?"/dashboard":"/login"}>{user?"Dashboard":"Login"}</Link><Link href="/register">Register</Link><a href="https://github.com/GalibDev/Fundora">Join as developer</a></nav>}</header>
}
