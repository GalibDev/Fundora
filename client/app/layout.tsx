import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/providers";
export const metadata:Metadata={title:"Fundora — Back brave ideas",description:"A transparent crowdfunding platform for projects that move communities forward."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><Providers>{children}</Providers></body></html>}
