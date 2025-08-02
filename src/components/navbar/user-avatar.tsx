import Image from "next/image";

interface UserAvatarProps {
  user: {
    name?: string | null | undefined;
    image?: string | null | undefined;
    avatarUrl?: string | null | undefined;
  };
  size?: number;
  className?: string;
}

export function UserAvatar({
  user,
  size = 32,
  className = "",
}: UserAvatarProps) {
  const avatarUrl =
    user.avatarUrl ||
    user.image ||
    `https://avatar.vercel.sh/${user.name || "user"}`;

  return (
    <Image
      src={avatarUrl}
      alt={user.name || "User avatar"}
      width={size}
      height={size}
      className={`rounded-full ${className}`}
    />
  );
}
