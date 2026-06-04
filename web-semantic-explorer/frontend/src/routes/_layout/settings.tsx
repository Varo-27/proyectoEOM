import { createFileRoute, redirect } from "@tanstack/react-router"

import { ChangePassword, DeleteAccount, UserInformation } from "@/pages/settings"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"
import useAuth from "@/features/auth"
import { isLoggedIn } from "@/shared/auth"

const tabsConfig = [
  { value: "my-profile", title: "Mi perfil", component: UserInformation },
  { value: "password", title: "Contraseña", component: ChangePassword },
  { value: "danger-zone", title: "Zona de peligro", component: DeleteAccount },
]

export const Route = createFileRoute("/_layout/settings")({
  component: UserSettings,
  beforeLoad: async () => {
    if (!isLoggedIn()) {
      throw redirect({ to: "/login" })
    }
  },
  head: () => ({
    meta: [
      {
        title: "Ajustes - Semantic Explorer",
      },
    ],
  }),
})

function UserSettings() {
  const { user: currentUser } = useAuth()
  const finalTabs = currentUser?.is_superuser
    ? tabsConfig.slice(0, 3)
    : tabsConfig

  if (!currentUser) {
    return null
  }

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 max-w-7xl mx-auto w-full">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ajustes de cuenta</h1>
        <p className="text-muted-foreground">
          Edita tu perfil, contraseña y preferencias de la cuenta.
        </p>
      </div>

      <Tabs defaultValue="my-profile">
        <TabsList>
          {finalTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.title}
            </TabsTrigger>
          ))}
        </TabsList>
        {finalTabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            <tab.component />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
