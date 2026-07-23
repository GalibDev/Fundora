const configuredApi=(process.env.NEXT_PUBLIC_API_URL||"http://localhost:5000/api").trim().replace(/\/+$/,"");
const API=configuredApi.endsWith("/api")?configuredApi:`${configuredApi}/api`;
export async function api<T>(path:string, init:RequestInit = {}):Promise<T> {
 const token = typeof window !== "undefined" ? localStorage.getItem("fundora_token") : null;
 const request=()=>fetch(`${API}${path}`, { ...init, headers:{ "Content-Type":"application/json", ...(token ? {Authorization:`Bearer ${token}`} : {}), ...init.headers } });
 let response=await request();
 let text=await response.text();
 const isGatewayHtml=text.trimStart().startsWith("<");
 if(isGatewayHtml||[502,503,504].includes(response.status)){
   await new Promise(resolve=>setTimeout(resolve,1800));
   response=await request();
   text=await response.text();
 }
 let data:unknown;
 try{data=text?JSON.parse(text):{}}catch{throw new Error(response.ok?"The server returned an invalid response":"The backend is waking up. Please try again in a few seconds.")}
 if (!response.ok) throw new Error((data as {message?:string}).message || "Something went wrong");
 return data as T;
}
