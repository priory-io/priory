"use client";

import { authClient } from "~/lib/auth-client";
import { NavbarContainer } from "./navbar/navbar-container";
import { Logo } from "./navbar/logo";
import { Divider } from "./navbar/divider";
import { SocialLinks } from "./navbar/social-links";
import { AuthSection } from "./navbar/auth-section";

export default function Navbar() {
  const { data: session } = authClient.useSession();

  return (
    <NavbarContainer>
      <div className="flex items-center">
        <Logo />
        <Divider />
        <SocialLinks />
      </div>
      <AuthSection session={session} />
    </NavbarContainer>
  );
}
