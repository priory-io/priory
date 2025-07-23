import Link from "next/link";
import { config } from "~/lib/config";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center gap-y-8 px-4 md:px-6 lg:px-8 min-h-[70vh]">
      <div className="text-center space-y-4">
        <span className="text-6xl text-primary font-mono font-medium">{config.site.name}<span className="text-muted-foreground text-4xl">.io</span></span>
        <p className="text-lg mt-4 text-muted-foreground/70">
          {config.site.description} <Link href="https://github.com/keircn" target="_blank" className="text-primary hover:text-primary/80 hover:underline transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded" aria-label="Visit Keiran's GitHub profile">Keiran</Link>
        </p>
      </div>

      <p className="text-xl md:text-2xl text-foreground text-center max-w-3xl leading-relaxed tracking-wide text-justify font-medium">
        Priory is passionate about its mission to make open source the vibrant,
        indiscriminately collaborative haven it once was. We write genuinely
        useful software and not only maintain it but encourage the users to
        contribute in order to build a decentralised organisation of projects and
        libraries by the community for the community.
      </p>

      <code className="bg-muted/30 p-4 py-3 rounded border border-muted">
        Coming Soon...
      </code>
    </div>
  );
}
