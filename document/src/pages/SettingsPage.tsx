import { useState, useEffect, useRef } from "react";
import { SideNavBar } from "@/components/SideNavBar";
import { TopAppBar } from "@/components/TopAppBar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/components/ThemeProvider";
import { useI18n } from "@/components/I18nProvider";
import { useToast } from "@/components/Toast";
import { useAuth } from "@/auth";
import { api } from "@/api";
import { Sun, Moon, Languages, User, Camera, Info, Loader2 } from "lucide-react";
import type { NavId } from "@/App";

interface SettingsPageProps {
  activeNav?: NavId;
  onNavChange?: (id: NavId) => void;
  onLogout?: () => void;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export function SettingsPage({ activeNav = "settings", onNavChange, onLogout, sidebarCollapsed = false, onToggleSidebar }: SettingsPageProps) {
  const { theme, toggleTheme } = useTheme();
  const { t, lang, toggleLang } = useI18n();
  const { toast } = useToast();
  const { user, updateUser } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateProfile({ name });
      updateUser({ name });
      toast(t("settings.saved"), "success");
    } catch (error: any) {
      toast(error.message || t("toast.saveFailed"), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast(t("toast.avatarTooBig"), "error");
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await api.uploadAvatar(base64);
      updateUser({ avatar: res.user.avatar });
      toast(t("toast.avatarSuccess"), "success");
    } catch (error: any) {
      toast(error.message || t("toast.avatarFailed"), "error");
    } finally {
      setUploading(false);
      // Reset input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const avatarUrl = user?.avatar
    ? `http://localhost:3000/uploads/${user.avatar}`
    : null;

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-white dark:bg-surface-950">
      <TopAppBar variant="settings" onLogout={onLogout} sidebarCollapsed={sidebarCollapsed} onToggleSidebar={onToggleSidebar} />
      <div className="flex flex-1 overflow-hidden">
        <SideNavBar activeNav={activeNav} onNavChange={onNavChange ?? (() => {})} collapsed={sidebarCollapsed} />
        <div className="flex-1 overflow-y-auto bg-surface-50 dark:bg-surface-950">
          <div className="mx-auto max-w-[720px] px-20 py-20">
            <h2 className="text-[28px] font-bold leading-tight text-surface-900 dark:text-surface-100 mb-8">
              {t("settings.title")}
            </h2>

            <div className="flex flex-col gap-6">
              {/* Profile Section */}
              <section className="rounded-xl border border-surface-200 bg-white p-6 dark:border-surface-800 dark:bg-surface-900">
                <div className="flex items-center gap-3 mb-6">
                  <User className="h-5 w-5 text-surface-500" />
                  <h3 className="text-base font-semibold text-surface-900 dark:text-surface-100">
                    {t("settings.profile")}
                  </h3>
                </div>

                {/* Avatar */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="avatar"
                        className="h-16 w-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-500 text-xl font-bold text-white">
                        {initials || "?"}
                      </div>
                    )}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-surface-200 border-2 border-white hover:bg-surface-300 cursor-pointer dark:bg-surface-700 dark:border-surface-900 dark:hover:bg-surface-600"
                    >
                      {uploading ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Camera className="h-3 w-3" />
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-surface-800 dark:text-surface-200">
                      {t("settings.name")}
                    </p>
                    <p className="text-xs text-surface-500 mt-0.5">{t("settings.avatarHint")}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs font-medium text-surface-500 mb-1 block">
                      {t("settings.name")}
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-surface-300 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-100"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-surface-500 mb-1 block">
                      {t("settings.email")}
                    </label>
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full rounded-lg border border-surface-200 bg-surface-100 px-3 py-2 text-sm text-surface-500 cursor-not-allowed dark:border-surface-700 dark:bg-surface-800 dark:text-surface-500"
                    />
                  </div>
                </div>
              </section>

              {/* Appearance Section */}
              <section className="rounded-xl border border-surface-200 bg-white p-6 dark:border-surface-800 dark:bg-surface-900">
                <div className="flex items-center gap-3 mb-6">
                  {theme === "light" ? (
                    <Sun className="h-5 w-5 text-surface-500" />
                  ) : (
                    <Moon className="h-5 w-5 text-surface-500" />
                  )}
                  <h3 className="text-base font-semibold text-surface-900 dark:text-surface-100">
                    {t("settings.appearance")}
                  </h3>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-surface-800 dark:text-surface-200">
                        {t("settings.theme")}
                      </p>
                      <p className="text-xs text-surface-500 mt-0.5">{t("settings.themeDesc")}</p>
                    </div>
                    <button
                      onClick={toggleTheme}
                      className="relative h-7 w-12 rounded-full bg-surface-200 transition-colors hover:bg-surface-300 cursor-pointer dark:bg-surface-700 dark:hover:bg-surface-600"
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm transition-transform ${
                          theme === "dark" ? "translate-x-5" : ""
                        }`}
                      >
                        {theme === "light" ? (
                          <Sun className="h-3.5 w-3.5 text-amber-500" />
                        ) : (
                          <Moon className="h-3.5 w-3.5 text-brand-500" />
                        )}
                      </span>
                    </button>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-surface-800 dark:text-surface-200">
                        {t("settings.language")}
                      </p>
                      <p className="text-xs text-surface-500 mt-0.5">{t("settings.languageDesc")}</p>
                    </div>
                    <button
                      onClick={toggleLang}
                      className="flex items-center gap-2 rounded-lg border border-surface-200 px-3 py-1.5 text-sm font-medium text-surface-700 hover:bg-surface-50 active:scale-[0.97] transition-all cursor-pointer dark:border-surface-700 dark:text-surface-300 dark:hover:bg-surface-800"
                    >
                      <Languages className="h-4 w-4" />
                      {lang === "zh" ? "中文" : "English"}
                    </button>
                  </div>
                </div>
              </section>

              {/* About Section */}
              <section className="rounded-xl border border-surface-200 bg-white p-6 dark:border-surface-800 dark:bg-surface-900">
                <div className="flex items-center gap-3 mb-6">
                  <Info className="h-5 w-5 text-surface-500" />
                  <h3 className="text-base font-semibold text-surface-900 dark:text-surface-100">
                    {t("settings.about")}
                  </h3>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-surface-700 dark:text-surface-300">MythWriter</span>
                  <span className="text-sm text-surface-500">{t("settings.version")} 1.0.0</span>
                </div>
              </section>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : t("settings.save")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
