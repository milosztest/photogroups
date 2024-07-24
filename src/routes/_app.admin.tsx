import { Button } from '@/components/ui/button';
import { globalStore } from '@/lib/global.store';
import { queryOptions, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';

const allProfilesQuery = () => {
  return queryOptions({
    queryKey: ['all_profiles'],
    queryFn: async () => {
      const { supabase } = globalStore.getState().auth
      if (!supabase) {
        throw new Error('No supabase')
      }
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('id, role, active, name, surname')
        .order('created_at', { ascending: false })
      if (error) {
        console.log(error)
      }
      return profileData
    }
  })
}

export const Route = createFileRoute('/_app/admin')({
  beforeLoad: async () => {
    const { supabase } = globalStore.getState().auth
    if (!supabase) {
      throw new Error('No supabase')
    }
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", globalStore.getState().auth.session?.user.id ?? "")
      .single()
    if (data?.role != 'admin') {
      throw redirect({ to: '/login' })
    }
  },
  loader: async ({ context }) => {
    return context.queryClient.ensureQueryData(allProfilesQuery())
  },
  component: AccountPage
})

function AccountPage() {
  const query = useSuspenseQuery(allProfilesQuery())
  const profiles = query.data
  const auth = globalStore(state => state.auth)
  const queryClient = useQueryClient();
  const activateUser = useCallback(async (id: number) => {
    if (!auth.supabase) { return }
    const { error } = await auth.supabase
      .from('profiles')
      .update({ active: true })
      .eq('id', id)
    if (error) {
      console.error(error)
    }
    queryClient.invalidateQueries({ queryKey: ['all_profiles'] });
  }, [auth, queryClient])
  const { handleSubmit } = useForm();
  return (
    <div className="max-md border rounded-md p-4">
      <div className="text-lg my-3">Nowi użytkownicy</div>
      <div>
        <div className="grid grid-cols-7 gap-4 items-center mb-2 px-3 py-1 font-bold">
          <div className="col-span-1">ID</div>
          <div className="col-span-2">Imię</div>
          <div className="col-span-2">Nazwisko</div>
          <div className="col-span-1">Rola</div>
          <div className="col-span-1"></div>
        </div>
        {profiles?.filter(profile => !profile.active).map((profile, i) => 
          <form key={profile.id} onSubmit={handleSubmit(() => activateUser(profile.id))}
            className={`grid grid-cols-7 gap-4 items-center mb-2 px-3 py-1 ${i % 2 ? 'bg-gray-50' : ''}`}>
            <div className="col-span-1">{profile.id}</div>
            <div className="col-span-2">{profile.name}</div>
            <div className="col-span-2">{profile.surname}</div>
            <div className="col-span-1">{profile.role}</div>
            <Button className="col-span-1" type="submit">Aktywuj</Button>
          </form>
        )}
      </div>
    </div>
  )
}

