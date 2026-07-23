export async function sendEmail(to:string,subject:string,html:string){
  if(!process.env.RESEND_API_KEY)return;
  await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Authorization":`Bearer ${process.env.RESEND_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({from:process.env.EMAIL_FROM||"Fundora <onboarding@resend.dev>",to,subject,html})}).catch(()=>undefined);
}
