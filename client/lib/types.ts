export type Role = "supporter" | "creator" | "admin";
export type User = { _id?: string; name: string; email: string; photo?: string; role: Role; credits: number; token?: string };
export type Campaign = { _id: string; title: string; story: string; category: string; goal: number; minimumContribution: number; deadline: string; reward: string; image: string; raised: number; creatorName: string; creatorEmail: string; status: string };
