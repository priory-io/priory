export interface Shortlink {
  id: string;
  shortCode: string;
  originalUrl: string;
  title?: string;
  description?: string;
  password?: string;
  expiresAt?: string;
  isActive: boolean;
  clickCount: number;
  createdAt: string;
}

export interface CreateShortlinkData {
  originalUrl: string;
  customCode: string;
  title: string;
  description: string;
  password: string;
  expiresAt: string;
}

export interface ShortlinkCardProps {
  shortlink: Shortlink;
  onCopy: (shortCode: string) => void;
  onDelete: (id: string) => void;
}

export interface CreateShortlinkFormProps {
  onSubmit: (data: CreateShortlinkData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}
