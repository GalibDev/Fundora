"use client";
import { createContext,useContext,useEffect,useState } from "react";
import { User } from "./types";
import { api } from "./api";
type AuthContextValue={user:User|null;loading:boolean;login:(email:string,password:string)=>Promise<User>;register:(body:object)=>Promise<User>;logout:()=>void;refresh:()=>Promise<void>};
const AuthContext=createContext<AuthContextValue|null>(null);
export function AuthProvider({children}:{children:React.ReactNode}) {
 const [user,setUser]=useState<User|null>(null); const [loading,setLoading]=useState(true);
 const refresh=async()=>{try{const data=await api<{user:User}>("/auth/me");setUser(data.user)}catch{setUser(null)}finally{setLoading(false)}};
 useEffect(()=>{if(localStorage.getItem("fundora_token")) refresh();else setLoading(false)},[]);
 const save=(data:{token:string;user:User})=>{localStorage.setItem("fundora_token",data.token);setUser(data.user);return data.user};
 const login=async(email:string,password:string)=>save(await api("/auth/login",{method:"POST",body:JSON.stringify({email,password})}));
 const register=async(body:object)=>save(await api("/auth/register",{method:"POST",body:JSON.stringify(body)}));
 const logout=()=>{localStorage.removeItem("fundora_token");setUser(null);location.href="/"};
 return <AuthContext.Provider value={{user,loading,login,register,logout,refresh}}>{children}</AuthContext.Provider>
}
export const useAuth=()=>{const value=useContext(AuthContext);if(!value)throw new Error("useAuth must be inside AuthProvider");return value};
