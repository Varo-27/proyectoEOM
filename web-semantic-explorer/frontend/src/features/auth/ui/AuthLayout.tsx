import { Appearance } from "@/shared/ui/Appearance"
import { Logo } from "@/shared/ui/logo/Logo"

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center px-6 py-10">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <Appearance />
      </div>
      <Logo
        variant="full"
        className="h-auto w-[clamp(12rem,min(72vw,38vh),28rem)] max-w-full"
        asLink={false}
      />
      <div className="mt-8 w-full max-w-xs">{children}</div>
    </div>
  )
}
