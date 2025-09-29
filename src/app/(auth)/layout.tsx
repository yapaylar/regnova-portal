import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.svg" alt="Regnova" width={140} height={40} className="h-10 w-auto" />
            <span className="hidden text-sm text-muted-foreground md:block">Post-Market Surveillance Portal</span>
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-0 py-12 sm:px-6">
        <div className="flex w-full max-w-5xl overflow-hidden rounded-3xl border bg-card shadow-xl">
          <div className="hidden flex-1 flex-col justify-between bg-primary/5 p-10 lg:flex">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">Regnova Portal</h2>
              <p className="text-sm text-primary/80">
                Secure access for facilities, manufacturers, and admins to manage complaints, recalls, and post-market surveillance workflows.
              </p>
            </div>
            <div className="space-y-3 text-sm text-primary/70">
              <p>• Submit and track post-market reports in real time</p>
              <p>• Monitor recalls, PMS visits, and compliance actions</p>
              <p>• Collaborate with facilities and manufacturers in one place</p>
            </div>
          </div>
          <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
            <div className="w-full max-w-md space-y-6">{children}</div>
          </div>
        </div>
      </main>
    </div>
  );
}

