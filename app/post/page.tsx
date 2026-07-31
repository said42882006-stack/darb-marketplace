import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import PostAdFlow from "@/components/PostAdFlow";

export default async function PostPage({ searchParams }: { searchParams: { plan?: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect(`/login?next=/post${searchParams.plan ? `?plan=${searchParams.plan}` : ""}`);
  }
  return <PostAdFlow initialPlanId={searchParams.plan} />;
}
