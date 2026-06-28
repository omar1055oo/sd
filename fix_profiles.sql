-- قم بتشغيل هذا الكود في Supabase SQL Editor لإضافة الحسابات التي قمت بإنشائها مسبقاً إلى جدول profiles
-- لأنك غالباً قمت بإنشاء الحسابات قبل أن تقوم بتشغيل كود إنشاء الجداول (والذي يحتوي على مشغل Trigger يقوم بهذه العملية تلقائياً).

INSERT INTO public.profiles (id, email, display_name, avatar_url)
SELECT 
  id, 
  email, 
  split_part(email, '@', 1),
  'https://api.dicebear.com/7.x/avataaars/svg?seed=' || id
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);
