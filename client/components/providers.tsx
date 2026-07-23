"use client";
import { QueryClient,QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/auth";
export default function Providers({children}:{children:React.ReactNode}){const [client]=useState(()=>new QueryClient());return <QueryClientProvider client={client}><AuthProvider>{children}<Toaster richColors position="top-right"/></AuthProvider></QueryClientProvider>}
