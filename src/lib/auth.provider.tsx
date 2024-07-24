import { AuthContext } from "@/lib/auth.context"
import React, { useEffect } from "react"
import { getClient } from "./supabase"
import { globalStore as useGlobalStore } from "./global.store"

// założenia logowania 
// 1. Po zalogowaniu przekierowanie do albums
// 2. Po odświeżeniu jest zalogowany
// 3. po wylogowaniu przekierowanie do login
// 4. po wpisaniu ścieżki login jak jest zalogowany, przekierowanie 
//

const supabase = getClient()
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setSession = useGlobalStore(state => state.setSession)
  const setRole = useGlobalStore(state => state.setRole)
  useGlobalStore.setState(state => {
    return {
      ...state,
      auth: {
        ...state.auth,
        supabase
      }
    }
  })
  const { session, role } = useGlobalStore(state => state.auth)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        supabase.from("profiles").select("role")
        .eq("user_id", session.user.id).single()
        .then((response) => { response.data ? setRole(response.data.role) : null })
      }
      if (!session) {
        setRole(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [setSession, setRole])
  return (
    <AuthContext.Provider value={{ supabase, session, role }}>
      {children}
    </AuthContext.Provider>
  )
}
