export type Message = {
  id: string;
  username: string;
  content: string;
  time: string;
  userId: string;
};

export type Community = {
  id: string;
  name: string;
  description: string | null;
  owner_id: string | null;
  created_at: string;
};
