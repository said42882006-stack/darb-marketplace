import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FREE_LISTINGS_LIMIT, PLANS } from "@/lib/constants";
import PostAdFlow from "@/components/PostAdFlow";

export default async function PostPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect(`/login?next=/post`);
  }

  const userId = (session!.user as any).id as string;
  const [listingCount, user, activeSubscription] = await Promise.all([
    prisma.listing.count({ where: { userId } }),
    prisma.user.findUnique({ where: { id: userId }, select: { listingCredits: true } }),
    prisma.subscriber.findFirst({
      where: { userId, active: true, expiresAt: { gt: new Date() } },
      orderBy: { expiresAt: "desc" },
    }),
  ]);

  const freeRemaining = Math.max(0, FREE_LISTINGS_LIMIT - listingCount);
  const credits = user?.listingCredits ?? 0;
  const subscriptionPlanName = activeSubscription
    ? PLANS.find((p) => p.id === activeSubscription.planId)?.name ?? null
    : null;
  const subscriptionExpiresAt = activeSubscription?.expiresAt?.toISOString() ?? null;

  return (
    <PostAdFlow
      freeRemaining={freeRemaining}
      credits={credits}
      subscriptionPlanName={subscriptionPlanName}
      subscriptionExpiresAt={subscriptionExpiresAt}
    />
  );
}
