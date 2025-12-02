import { supabase } from "../lib/supabase";

export const ensureConversation = async (currentUserId: string, otherUserId: string): Promise<string> => {
  if (currentUserId === otherUserId) {
    throw new Error("Cannot start a conversation with yourself.");
  }

  const { data: currentConversations } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("profile_id", currentUserId);

  const { data: otherConversations } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("profile_id", otherUserId);

  const existing = currentConversations?.find((mine) =>
    otherConversations?.some((theirs) => theirs.conversation_id === mine.conversation_id),
  );

  if (existing) {
    return existing.conversation_id;
  }

  const { data: conversation, error } = await supabase
    .from("conversations")
    .insert({})
    .select("id")
    .single();

  if (error || !conversation) {
    throw new Error("Failed to create conversation");
  }

  await supabase.from("conversation_participants").insert([
    { conversation_id: conversation.id, profile_id: currentUserId },
    { conversation_id: conversation.id, profile_id: otherUserId },
  ]);

  return conversation.id;
};
