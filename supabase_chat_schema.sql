-- قم بتشغيل هذا الكود في Supabase SQL Editor لإنشاء جدول الرسائل

CREATE TABLE messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) NOT NULL,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'text' NOT NULL, -- 'text', 'goal_share', 'achievement', 'session_invite'
    metadata JSONB, -- لبيانات إضافية مثل goal_id أو duration
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Messages are viewable by everyone" ON messages FOR SELECT USING (true);
CREATE POLICY "Users can insert own messages" ON messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Enable real-time replication for the messages table
begin;
  -- remove the supabase_realtime publication
  drop publication if exists supabase_realtime;
  -- re-create it
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table messages;
