import Link from "next/link";

export default function Home() {
  return (
    <>
      <div className="min-h-screen p-0 text-foreground bg-background">
        <nav className="max-w-4xl mx-auto border border-border shadow rounded bg-card my-4 p-4">
          <div className="flex items-center">
            <Link
              className="text-foreground text-2xl font-medium hover:text-foreground/80 transition-colors"
              href="/"
            >
              Priory
            </Link>
            <div className="h-6 w-px bg-muted-foreground/30 mx-4" />
            <div className="flex items-center gap-x-4">
              <Link
                className="hover:bg-primary/15 transition-colors rounded hover:shadow px-3 py-1"
                href="https://github.com/priory-io"
              >
                GitHub
              </Link>
              <Link
                className="hover:bg-primary/15 transition-colors rounded hover:shadow px-3 py-1"
                href="https://discord.gg/priory"
              >
                Discord
              </Link>
            </div>
          </div>
        </nav>
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-4xl text-primary">Hello, Priory!</h1>
          <p className="text-xl text-muted-foreground">This is text.</p>
        </div>
      </div>
    </>
  );
}
