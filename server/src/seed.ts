import "dotenv/config";import mongoose from "mongoose";import bcrypt from "bcryptjs";import {Campaign,User} from "./models/index.js";
if(!process.env.MONGODB_URI)throw new Error("MONGODB_URI is required");
await mongoose.connect(process.env.MONGODB_URI);
const password=await bcrypt.hash(process.env.ADMIN_PASSWORD||"Admin123!",12);
await User.findOneAndUpdate({email:process.env.ADMIN_EMAIL||"admin@fundora.com"},{name:"Fundora Admin",email:process.env.ADMIN_EMAIL||"admin@fundora.com",password,photo:"https://i.pravatar.cc/160?img=68",role:"admin",credits:500},{upsert:true});
if(await Campaign.countDocuments()===0)await Campaign.insertMany([
 {title:"Solar water for Char Kukri",story:"A community-owned solar pumping system will bring safe water to 600 coastal families.",category:"Community",goal:120000,minimumContribution:20,deadline:"2026-12-20",reward:"Field notes and a name on the community wall",image:"https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1200&q=80",raised:87420,creatorName:"Nadia Rahman",creatorEmail:"nadia@fundora.demo",status:"approved"},
 {title:"Pocket Braille Reader",story:"An affordable open-source reader that turns digital text into refreshable Braille.",category:"Technology",goal:95000,minimumContribution:25,deadline:"2026-11-15",reward:"Early-access build updates",image:"https://images.unsplash.com/photo-1559757175-0eb30cd8c063?auto=format&fit=crop&w=1200&q=80",raised:69210,creatorName:"Arian Kabir",creatorEmail:"arian@fundora.demo",status:"approved"}
]);
console.log("Fundora seed complete");await mongoose.disconnect();
