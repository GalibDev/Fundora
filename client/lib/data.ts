import { Campaign } from "./types";
const featuredCampaigns: Campaign[] = [
 { _id:"solar-water",title:"Solar water for Char Kukri",story:"A community-owned solar pumping system will bring safe water to 600 coastal families while creating local maintenance jobs.",category:"Community",goal:120000,minimumContribution:20,deadline:"2026-12-20",reward:"Field notes and a name on the community wall",image:"https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1200&q=80",raised:87420,creatorName:"Nadia Rahman",creatorEmail:"nadia@fundora.demo",status:"approved"},
 { _id:"braille-reader",title:"Pocket Braille Reader",story:"An affordable open-source reader that turns digital text into refreshable Braille for students across Bangladesh.",category:"Technology",goal:95000,minimumContribution:25,deadline:"2026-11-15",reward:"Early-access build updates",image:"https://images.unsplash.com/photo-1559757175-0eb30cd8c063?auto=format&fit=crop&w=1200&q=80",raised:69210,creatorName:"Arian Kabir",creatorEmail:"arian@fundora.demo",status:"approved"},
 { _id:"pottery-studio",title:"Rebuild Shila's Pottery Studio",story:"Restore a flood-damaged artisan studio and train twelve young makers in traditional terracotta craft.",category:"Art",goal:60000,minimumContribution:10,deadline:"2026-10-28",reward:"Handmade postcard from the studio",image:"https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1200&q=80",raised:51340,creatorName:"Shila Rani",creatorEmail:"shila@fundora.demo",status:"approved"},
 { _id:"mobile-clinic",title:"Mobile Clinic for Tea Gardens",story:"Equip a weekly mobile clinic with diagnostics, maternal care supplies and telemedicine access.",category:"Health",goal:180000,minimumContribution:50,deadline:"2027-01-30",reward:"Quarterly impact report",image:"https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",raised:118900,creatorName:"Dr. Farhana Islam",creatorEmail:"farhana@fundora.demo",status:"approved"},
 { _id:"river-library",title:"The Floating River Library",story:"Turn a wooden boat into a solar-powered library serving children in hard-to-reach river islands.",category:"Education",goal:80000,minimumContribution:15,deadline:"2026-09-25",reward:"Digital founding supporter badge",image:"https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80",raised:44070,creatorName:"Rafi Ahmed",creatorEmail:"rafi@fundora.demo",status:"approved"},
 { _id:"jute-packaging",title:"Jute Packaging, Reimagined",story:"Pilot compostable jute packaging that helps small retailers replace single-use plastic.",category:"Environment",goal:140000,minimumContribution:30,deadline:"2026-12-05",reward:"Sample kit for qualifying supporters",image:"https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80",raised:93200,creatorName:"Tasmia Noor",creatorEmail:"tasmia@fundora.demo",status:"approved"}
];
const projectIdeas = [
  ["Smart Farming Sensor Network","Technology","Help small farms monitor soil health, rainfall and crop disease with low-cost connected sensors.","https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1200&q=80"],
  ["Community Kitchen for Working Mothers","Community","Build a cooperative kitchen that provides affordable meals and creates flexible local employment.","https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1200&q=80"],
  ["Rural Telemedicine Booth","Health","Connect remote villages with doctors through a solar-powered diagnostic and consultation booth.","https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80"],
  ["Young Artists Print Lab","Art","Create a shared printmaking studio where emerging artists can learn, produce and exhibit their work.","https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=1200&q=80"],
  ["Mangrove Restoration Crew","Environment","Train and equip coastal volunteers to restore protective mangrove belts and monitor wildlife.","https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1200&q=80"],
  ["Girls' Science Learning Bus","Education","Turn a bus into a travelling science laboratory serving schools without practical learning facilities.","https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80"],
  ["Flood-Resilient Family Homes","Community","Pilot affordable raised homes using local materials for families in seasonal flood zones.","https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1200&q=80"],
  ["Bangla Speech Learning App","Technology","Develop an accessible speech practice app for children who need language and pronunciation support.","https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80"],
  ["Safe Birth Equipment Fund","Health","Supply trained rural midwives with sterile equipment, emergency kits and portable monitoring tools.","https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1200&q=80"],
  ["Revive the Village Theatre","Art","Restore an open-air community theatre and fund a season of locally written performances.","https://images.unsplash.com/photo-1507924538820-ede94a04019d?auto=format&fit=crop&w=1200&q=80"],
  ["Plastic-Free Market Pilot","Environment","Help one busy market replace disposable packaging with a community return-and-reuse system.","https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1200&q=80"],
  ["Library Corners for Primary Schools","Education","Place bright, locally curated reading corners in primary schools and train volunteer reading mentors.","https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1200&q=80"]
] as const;
const regions = ["Dhaka","Chattogram","Khulna","Rajshahi","Sylhet","Barishal"];
const generatedCampaigns: Campaign[] = regions.flatMap((region,regionIndex)=>projectIdeas.map((idea,ideaIndex)=>({
  _id:`${idea[1].toLowerCase()}-${region.toLowerCase()}-${ideaIndex+1}`,
  title:`${idea[0]} — ${region}`,
  story:idea[2],
  category:idea[1],
  goal:50000+((ideaIndex+regionIndex)%8)*25000,
  minimumContribution:10+((ideaIndex+regionIndex)%5)*10,
  deadline:`2027-${String(((ideaIndex+regionIndex)%9)+1).padStart(2,"0")}-${String(12+(ideaIndex%15)).padStart(2,"0")}`,
  reward:["Digital supporter badge","Monthly field updates","Founding supporter certificate","Community thank-you wall"][ideaIndex%4],
  image:idea[3],
  raised:12000+((ideaIndex*11731+regionIndex*7901)%110000),
  creatorName:["Samira Hasan","Tanvir Rahman","Nusrat Jahan","Imran Hossain","Maliha Noor","Sakib Ahmed"][(ideaIndex+regionIndex)%6],
  creatorEmail:`creator${regionIndex}-${ideaIndex}@fundora.demo`,
  status:"approved"
})));
export const campaigns: Campaign[] = [...featuredCampaigns,...generatedCampaigns];
export const testimonials = [
 {name:"Mahin Chowdhury",role:"Supporter",quote:"I can see exactly where each credit goes. The updates make supporting a project feel personal.",photo:"https://i.pravatar.cc/160?img=12"},
 {name:"Sadia Karim",role:"Creator",quote:"Fundora gave our small idea a credible home and a community that believed in the first prototype.",photo:"https://i.pravatar.cc/160?img=47"},
 {name:"Rashed Alam",role:"Supporter",quote:"The clear milestones and local focus make this the easiest way to back meaningful work.",photo:"https://i.pravatar.cc/160?img=14"}
];
