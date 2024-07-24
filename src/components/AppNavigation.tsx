import { Link } from '@tanstack/react-router'
import { Badge, Camera, Settings, ShoppingCart, UserRound, UserRoundCog } from 'lucide-react'

function ActiveBadge() {
  return (
    <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
    </Badge>
  )
}

const pages: [string, string, JSX.Element, boolean][] = [
  ['/albums', "Albumy", <Camera className="h-5 w-5" />, true],
  ['/orders', "Zamówienia", <ShoppingCart className="h-5 w-5" />, false],
  ['/setting', "Ustawienia", <Settings className="h-5 w-5" />, false],
  ['/account', "Moje dane", <UserRound className="h-5 w-5" />, true],
  ['/admin', "Panel administracyjny", <UserRoundCog className="h-5 w-5" />, true],
] as const


export default function AppNavigation({ role }: { role?: string | null }) {
  return (
    <nav className="grid gap-2 text-lg font-medium p-2  pt-4">
      {pages.filter(page => !(page[0] == '/admin' && role != 'admin')).map(page => (
        <Link
          key={page[0]}
          to={page[0]}
          disabled={page[3] === false}
          className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-foreground hover:text-foreground"
          activeProps={{
            className: 'bg-muted',
          }}
        >{(state) => (
          <>
            {page[2]} {page[1]}
            {state.isActive && <ActiveBadge />}
          </>
        )}
        </Link>

      ))}
    </nav>
  )
}
