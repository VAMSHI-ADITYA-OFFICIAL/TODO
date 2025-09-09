import { Request, Response } from "express";

export function loginHandler(req: Request, res: Response) {
  res.send("Login");
}
