import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "./prisma";

const SECRET = process.env.NEXTAUTH_SECRET!;

export function signMobileToken(userId: string) {
  return jwt.sign({ sub: userId }, SECRET, { expiresIn: "60d" });
}

function verifyMobileToken(token: string): string | null {
  try {
    const payload = jwt.verify(token, SECRET) as { sub: string };
    return payload.sub;
  } catch {
    return null;
  }
}

// Extracts the userId from a mobile app request's "Authorization: Bearer <token>" header.
export function getMobileUserIdFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  return verifyMobileToken(authHeader.slice(7));
}

// Shared by every route that needs "whoever is calling this, web or mobile" —
// tries the web session (cookie) first, falls back to a mobile bearer token.
export async function resolveUserId(req: NextRequest): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (session?.user) return (session.user as any).id as string;
  const userId = getMobileUserIdFromRequest(req);
  return userId;
}
