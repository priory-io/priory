import Link from "next/link";
import { config } from "~/lib/config";

export default function Home() {
  return (
    <>
      <div className="min-h-screen px-4 text-foreground bg-background">
        <nav className="max-w-4xl mx-auto border border-border shadow rounded bg-card my-4 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link
                className="text-foreground text-2xl font-medium hover:text-foreground/80 transition-colors"
                href="/"
              >
                {config.site.name}
              </Link>
              <div className="h-6 w-px bg-muted-foreground/30 ml-6 mr-4" />
              <div className="flex items-center gap-x-4">
                <Link
                  className="hover:bg-primary/15 transition-colors rounded hover:shadow px-3 py-1 text-lg"
                  href={config.social.github}
                  target="_blank"
                >
                  GitHub
                </Link>
                <Link
                  className="hover:bg-primary/15 transition-colors rounded hover:shadow px-3 py-1 text-lg"
                  href={config.social.discord}
                  target="_blank"
                >
                  Discord
                </Link>
              </div>
            </div>
            <Link
              className="hover:bg-primary/15 transition-colors rounded hover:shadow px-3 py-1 text-lg"
              href={`${config.social.github}/www.git`}
              target="_blank"
            >
              Source
            </Link>
          </div>
        </nav>
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-4xl text-primary">Hello, {config.site.name}!</h1>
          <p className="text-xl text-muted-foreground">
            {config.site.description}
          </p>
        </div>
      </div>
    </>
  );
}
