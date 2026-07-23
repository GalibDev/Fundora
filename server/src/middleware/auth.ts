import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/index.js";
export type AuthRequest = Request & {
  user?: {
    id: string;
    email: string;
    role: "supporter" | "creator" | "admin";
    name: string;
  };
};
export async function auth(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token)
    return res.status(401).json({ message: "Authentication required" });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as NonNullable<
      AuthRequest["user"]
    >;
    const current = await User.findById(payload.id).select("name email role");
    if (!current)
      return res.status(401).json({ message: "Account no longer exists" });
    req.user = {
      id: String(current._id),
      email: current.email,
      role: current.role as "supporter" | "creator" | "admin",
      name: current.name,
    };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
export const allow =
  (...roles: string[]) =>
  (req: AuthRequest, res: Response, next: NextFunction) =>
    req.user && roles.includes(req.user.role)
      ? next()
      : res
          .status(403)
          .json({ message: "You do not have permission for this action" });
