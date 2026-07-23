const configuredApi=(process.env.NEXT_PUBLIC_API_URL||"http://localhost:5000/api").trim().replace(/\/+$/,"");
const API=configuredApi.endsWith("/api")?configuredApi:`${configuredApi}/api`;
export async function api<T>(path:string, init:RequestInit = {}):Promise<T> {
 const token = typeof window !== "undefined" ? localStorage.getItem("fundora_token") : null;
 const response = await fetch(`${API}${path}`, { ...init, headers:{ "Content-Type":"application/json", ...(token ? {Authorization:`Bearer ${token}`} : {}), ...init.headers } });
 const data = await response.json();
 if (!response.ok) throw new Error(data.message || "Something went wrong");
 return data;
}
