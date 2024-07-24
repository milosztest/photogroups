CREATE OR REPLACE FUNCTION "public"."create_profile_for_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    INSERT INTO public.profiles (created_at, user_id, active, role, name, surname)
    VALUES (now(), NEW.id, false, 'parent', NEW.raw_user_meta_data ->> 'firstName', NEW.raw_user_meta_data ->> 'lastName');
    RETURN NEW;
END;
$$;