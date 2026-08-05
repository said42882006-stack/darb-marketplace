import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import ChatThread from "@/components/ChatThread";

export default async function ChatPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect(`/login?next=/chat/${params.id}`);
  }

  return <ChatThread conversationId={params.id} />;
}
