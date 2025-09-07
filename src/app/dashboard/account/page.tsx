"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { authClient } from "~/lib/auth-client";
import { redirect } from "next/navigation";
import Card from "~/components/ui/card";
import Button from "~/components/ui/button";
import { useToast } from "~/components/ui/toast";
import { config } from "~/lib/config";
import ApiKeyManagement from "~/components/dashboard/api-key-management";
import AvatarUpload from "~/components/dashboard/avatar-upload";
import {
  User,
  Mail,
  Calendar,
  Shield,
  Key,
  Settings,
  Trash2,
  Edit,
  Save,
  X,
  Eye,
  EyeOff,
} from "lucide-react";

export default function AccountPage() {
  const { data: session, isPending } = authClient.useSession();
  const { addToast } = useToast();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userAvatarUrl, setUserAvatarUrl] = useState<string>("");

  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    avatarUrl: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [preferences, setPreferences] = useState({
    theme: "system",
    language: "en",
    timezone: "UTC",
    compactMode: false,
    autoSave: true,
    showAnalytics: true,
  });

  const loadUserData = async () => {
    try {
      const response = await fetch("/api/account");
      if (response.ok) {
        const userData = await response.json();
        setProfileForm({
          name: userData.name || "",
          email: userData.email || "",
          avatarUrl: userData.avatarUrl || "",
        });
        setUserAvatarUrl(userData.avatarUrl || "");
        return userData;
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
    }
    return null;
  };

  const loadPreferences = async () => {
    try {
      const response = await fetch("/api/account/preferences");
      if (response.ok) {
        const prefs = await response.json();
        setPreferences(prefs);
      }
    } catch (error) {
      console.error("Failed to load preferences:", error);
    }
  };

  useEffect(() => {
    if (session?.user) {
      loadUserData();
      loadPreferences();
    }
  }, [session?.user]);

  if (isPending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const user = session.user;

  const handleEditProfile = () => {
    setProfileForm({
      name: user.name || "",
      email: user.email || "",
      avatarUrl: userAvatarUrl,
    });
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    try {
      const response = await fetch("/api/account", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileForm),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update profile");
      }

      addToast({
        type: "success",
        title: "Profile updated",
        description: "Your profile information has been saved.",
      });
      setIsEditingProfile(false);

      await loadUserData();
    } catch (error) {
      addToast({
        type: "error",
        title: "Update failed",
        description:
          error instanceof Error ? error.message : "Failed to update profile",
      });
    }
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setProfileForm({ name: "", email: "", avatarUrl: "" });
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      addToast({
        type: "error",
        title: "Password mismatch",
        description: "New passwords do not match.",
      });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      addToast({
        type: "error",
        title: "Password too short",
        description: "Password must be at least 8 characters long.",
      });
      return;
    }

    try {
      const response = await fetch("/api/account/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to change password");
      }

      addToast({
        type: "success",
        title: "Password changed",
        description: "Your password has been updated successfully.",
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setIsChangingPassword(false);
    } catch (error) {
      addToast({
        type: "error",
        title: "Password change failed",
        description:
          error instanceof Error ? error.message : "Failed to change password",
      });
    }
  };

  const handleUpdatePreferences = async () => {
    try {
      const response = await fetch("/api/account/preferences", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update preferences");
      }

      addToast({
        type: "success",
        title: "Preferences saved",
        description: "Your preferences have been updated.",
      });

      await loadPreferences();
    } catch (error) {
      addToast({
        type: "error",
        title: "Update failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update preferences",
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (
      confirm(
        "Are you sure you want to delete your account? This action cannot be undone.",
      )
    ) {
      try {
        const response = await fetch("/api/account/delete", {
          method: "DELETE",
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to delete account");
        }

        addToast({
          type: "success",
          title: "Account deleted",
          description: "Your account has been successfully deleted.",
        });

        await authClient.signOut();
        redirect("/");
      } catch (error) {
        addToast({
          type: "error",
          title: "Deletion failed",
          description:
            error instanceof Error ? error.message : "Failed to delete account",
        });
      }
    }
  };

  const handleAvatarUpdate = async (avatarUrl: string) => {
    setUserAvatarUrl(avatarUrl);
    await loadUserData();

    window.location.reload();
  };

  return (
    <div className="space-y-8">
      <motion.div
        className="space-y-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Account Settings
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Manage your account information and preferences.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card>
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                <User className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Profile Information
                </h3>
                <p className="text-sm text-muted-foreground">
                  Update your account details
                </p>
              </div>
            </div>
            <AnimatePresence>
              {!isEditingProfile && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEditProfile}
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mb-6">
            <AvatarUpload
              user={{
                id: user.id,
                name: user.name,
                image: user.image,
                avatarUrl: userAvatarUrl,
              }}
              onAvatarUpdate={handleAvatarUpdate}
            />
          </div>

          <AnimatePresence mode="wait">
            {isEditingProfile ? (
              <motion.div
                key="editing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          name: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground transition-all duration-200"
                      placeholder="Enter your full name"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground transition-all duration-200"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveProfile} size="sm">
                      <Save className="w-4 h-4" />
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </Button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="viewing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">{user.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">
                      Member since{" "}
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
              <Shield className="w-6 h-6 text-secondary-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Security
              </h3>
              <p className="text-sm text-muted-foreground">
                Manage your account security settings
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-card/30">
              <div className="flex items-center gap-3">
                <Key className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">Password</p>
                  <p className="text-sm text-muted-foreground">
                    Last updated 30 days ago
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsChangingPassword(!isChangingPassword)}
              >
                {isChangingPassword ? "Cancel" : "Change Password"}
              </Button>
            </div>

            <AnimatePresence>
              {isChangingPassword && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="p-4 border border-border rounded-lg bg-card/30 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          value={passwordForm.currentPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              currentPassword: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 pr-10 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground transition-all duration-200"
                          placeholder="Enter current password"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={passwordForm.newPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              newPassword: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 pr-10 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground transition-all duration-200"
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                        >
                          {showNewPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={passwordForm.confirmPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              confirmPassword: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 pr-10 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground transition-all duration-200"
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleChangePassword} size="sm">
                        Update Password
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsChangingPassword(false);
                          setPasswordForm({
                            currentPassword: "",
                            newPassword: "",
                            confirmPassword: "",
                          });
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
      >
        <Card>
          <ApiKeyManagement />
        </Card>
      </motion.div>

      <AnimatePresence>
        {config.features.dashboardAccountPreferences && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                  <Settings className="w-6 h-6 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Preferences
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Customize your experience
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-border rounded-lg bg-card/30">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Theme
                    </label>
                    <select
                      value={preferences.theme}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          theme: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground transition-all duration-200"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System</option>
                    </select>
                  </div>

                  <div className="p-4 border border-border rounded-lg bg-card/30">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Language
                    </label>
                    <select
                      value={preferences.language}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          language: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground transition-all duration-200"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>

                  <div className="p-4 border border-border rounded-lg bg-card/30">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Timezone
                    </label>
                    <select
                      value={preferences.timezone}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          timezone: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground transition-all duration-200"
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                    </select>
                  </div>

                  <div className="p-4 border border-border rounded-lg bg-card/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">
                          Compact Mode
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Use less spacing in the interface
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={preferences.compactMode}
                          onChange={(e) =>
                            setPreferences({
                              ...preferences,
                              compactMode: e.target.checked,
                            })
                          }
                        />
                        <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-border rounded-lg bg-card/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">Auto Save</p>
                        <p className="text-sm text-muted-foreground">
                          Automatically save changes
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={preferences.autoSave}
                          onChange={(e) =>
                            setPreferences({
                              ...preferences,
                              autoSave: e.target.checked,
                            })
                          }
                        />
                        <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </div>

                  <div className="p-4 border border-border rounded-lg bg-card/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">
                          Show Analytics
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Display usage analytics
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={preferences.showAnalytics}
                          onChange={(e) =>
                            setPreferences({
                              ...preferences,
                              showAnalytics: e.target.checked,
                            })
                          }
                        />
                        <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Button onClick={handleUpdatePreferences} size="sm">
                    Save Preferences
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.4,
          delay: config.features.dashboardAccountPreferences ? 0.4 : 0.3,
        }}
      >
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-destructive flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-destructive-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Danger Zone
              </h3>
              <p className="text-sm text-muted-foreground">
                Irreversible and destructive actions
              </p>
            </div>
          </div>

          <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Delete Account</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all associated data
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteAccount}
                className="border-destructive/20 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
                Delete Account
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
