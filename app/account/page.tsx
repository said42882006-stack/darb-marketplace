import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLANS } from "@/lib/constants";
import AccountDashboard from "@/components/AccountDashboard";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login?next=/account");
  }

  const userId = (session!.user as any).id as string;

  const [user, listings, activeSubscription] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.listing.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
    prisma.subscriber.findFirst({
      where: { userId, active: true, expiresAt: { gt: new Date() } },
      orderBy: { expiresAt: "desc" },
    }),
  ]);

  if (!user) redirect("/login?next=/account");

  const subscriptionPlanName = activeSubscription
    ? PLANS.find((p) => p.id === activeSubscription.planId)?.name ?? null
    : null;

  return (
    <AccountDashboard
      name={user.name}
      email={user.email}
      phone={user.phone}
      photo={user.photo}
      gender={user.gender}
      birthdate={user.birthdate?.toISOString().slice(0, 10) ?? null}
      accountType={user.accountType}
      subscriptionPlanName={subscriptionPlanName}
      subscriptionExpiresAt={activeSubscription?.expiresAt?.toISOString() ?? null}
      listings={listings.map((l) => ({
        id: l.id,
        title: l.title,
        category: l.category,
        price: l.price,
        createdAt: l.createdAt.toISOString(),
        expiresAt: l.expiresAt?.toISOString() ?? null,
      }))}
    />
  );
}
