DROP POLICY "Enable read access only for own " ON public.profiles;

CREATE OR REPLACE FUNCTION is_admin ()
RETURNS BOOL AS $$
BEGIN
  PERFORM
  FROM public.profiles
  WHERE auth.uid() = public.profiles.user_id AND role = 'admin'::user_role;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY definer;

CREATE POLICY "Admin selects all profiles, user selects own profile"
ON public.profiles
FOR SELECT
USING (is_admin() OR auth.uid() = public.profiles.user_id);

DROP POLICY "Enable update for users based on email" ON public.profiles;

CREATE POLICY "Admin updates all profiles, active user updates own profile"
ON "public"."profiles"
FOR UPDATE
USING (is_admin() OR (auth.uid() = public.profiles.user_id AND public.profiles.active = TRUE));