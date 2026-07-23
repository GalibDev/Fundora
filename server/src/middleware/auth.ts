import {NextFunction,Request,Response} from "express";import jwt from "jsonwebtoken";
export type AuthRequest=Request&{user?:{id:string;email:string;role:"supporter"|"creator"|"admin";name:string}};
export function auth(req:AuthRequest,res:Response,next:NextFunction){const token=req.headers.authorization?.replace("Bearer ","");if(!token)return res.status(401).json({message:"Authentication required"});try{req.user=jwt.verify(token,process.env.JWT_SECRET!) as AuthRequest["user"];next()}catch{return res.status(401).json({message:"Invalid or expired token"})}}
export const allow=(...roles:string[])=>(req:AuthRequest,res:Response,next:NextFunction)=>req.user&&roles.includes(req.user.role)?next():res.status(403).json({message:"You do not have permission for this action"});
