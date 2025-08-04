"use client";

import { motion } from "framer-motion";
import Card from "~/components/ui/card";
import { User, Mail, Calendar } from "lucide-react";

interface UserType {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null | undefined;
  createdAt: Date;
}

interface AccountOverviewProps {
  user: UserType;
}

export function AccountOverview({ user }: AccountOverviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="bg-card/50 backdrop-blur-xl border-border/60">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name}
                className="w-full h-full rounded-xl object-cover"
              />
            ) : (
              <User className="w-10 h-10 text-white" />
            )}
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {user.name}
            </h2>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
