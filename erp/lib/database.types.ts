export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          city: string | null;
          country: string | null;
          bio: string | null;
          avatar_url: string | null;
          birthdate: string | null;
          gender: string | null;
          last_active_at: string | null;
          created_at: string | null;
          is_private: boolean | null;
        };
      };
      venues: {
        Row: {
          id: string;
          name: string;
          type: string;
          description: string | null;
          address: string | null;
          city: string | null;
          country: string | null;
          rating: number | null;
          image_url: string | null;
          cover_image_url: string | null;
          features: string[] | null;
          capacity: number | null;
          open_hours: string | null;
          updated_at: string | null;
          created_at: string | null;
        };
      };
      check_ins: {
        Row: {
          id: string;
          user_id: string | null;
          venue_id: string | null;
          expires_at: string;
          created_at: string | null;
        };
      };
      credit_transactions: {
        Row: {
          id: string;
          user_id: string | null;
          amount: number | null;
          price: number | null;
          description: string | null;
          type: string;
          created_at: string | null;
        };
      };
      conversations: {
        Row: {
          id: string;
          venue_id: string | null;
          created_at: string | null;
        };
      };
      conversation_participants: {
        Row: {
          conversation_id: string;
          profile_id: string;
          joined_at: string | null;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string | null;
          sender_id: string | null;
          receiver_id: string | null;
          body: string | null;
          sent_at: string | null;
          expires_at: string | null;
          is_read: boolean | null;
        };
      };
      connection_requests: {
        Row: {
          id: string;
          sender_id: string | null;
          receiver_id: string | null;
          status: string | null;
          created_at: string | null;
        };
      };
      user_activity: {
        Row: {
          id: string;
          user_id: string | null;
          title: string;
          description: string | null;
          created_at: string | null;
        };
      };
      admins: {
        Row: {
          id: string;
          profile_id: string | null;
          email: string;
          role: "super_admin" | "ops" | "moderator" | "finance" | "vendor_admin";
          is_active: boolean | null;
          last_login_at: string | null;
          created_at: string | null;
        };
      };
      referrals: {
        Row: {
          id: string;
          inviter_id: string | null;
          invitee_id: string | null;
          invitee_contact: string | null;
          referral_code: string;
          status: "pending" | "joined" | "rewarded" | "revoked";
          reward_inviter_credits: number | null;
          reward_invitee_credits: number | null;
          rewarded_at: string | null;
          joined_at: string | null;
          metadata: Json | null;
          created_at: string | null;
          updated_at: string | null;
        };
      };
      payouts: {
        Row: {
          id: string;
          venue_id: string | null;
          amount: number;
          status: "queued" | "approved" | "paid" | "rejected";
          scheduled_for: string | null;
          paid_at: string | null;
          notes: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
      };
      app_guides: {
        Row: {
          id: string;
          slug: string;
          title: string;
          subtitle: string | null;
          steps: Json | null;
          media_url: string | null;
          updated_at: string | null;
        };
      };
    };
  };
}
