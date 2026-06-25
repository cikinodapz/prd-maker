"use server";

import { db } from "@/db";
import { prds } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/auth";

export async function getPrds() {
  const session = await auth();
  if (!session?.user?.id) {
    return { data: null, error: "Unauthorized" };
  }

  try {
    const data = await db
      .select()
      .from(prds)
      .where(eq(prds.userId, session.user.id))
      .orderBy(desc(prds.createdAt));
      
    return { data, error: null };
  } catch (e: any) {
    return { data: null, error: e.message };
  }
}

export async function savePrd(prdData: any) {
  const session = await auth();
  console.log("savePrd session:", session);
  if (!session?.user?.id) {
    console.error("savePrd error: Unauthorized (no session.user.id)");
    return { data: null, error: "Unauthorized" };
  }

  try {
    if (prdData.id) {
      // Update existing PRD
      const [updated] = await db
        .update(prds)
        .set({
          ...prdData,
          updatedAt: new Date(),
        })
        .where(eq(prds.id, prdData.id))
        .returning();
      return { data: updated, error: null };
    } else {
      // Insert new PRD
      const [inserted] = await db
        .insert(prds)
        .values({
          ...prdData,
          userId: session.user.id,
        })
        .returning();
      return { data: inserted, error: null };
    }
  } catch (e: any) {
    return { data: null, error: e.message };
  }
}

export async function deletePrd(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { data: null, error: "Unauthorized" };
  }

  try {
    const [deleted] = await db
      .delete(prds)
      .where(eq(prds.id, id))
      .returning();
    return { data: deleted, error: null };
  } catch (e: any) {
    return { data: null, error: e.message };
  }
}
