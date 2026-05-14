import { SideNavBar } from "@/components/SideNavBar";
import { TopAppBar } from "@/components/TopAppBar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/components/ThemeProvider";
import { useI18n } from "@/components/I18nProvider";
import { useToast } from "@/components/Toast";
import { Sun, Moon, Languages, User, Shield, Info } from "lucide-react";
import type { NavId } from "@/App";

interface SettingsPageProps {
  activeNav?: NavId;
  onNavChange?: (id: NavId) => void;
  onLogout?: () => void;
}

export function SettingsPage({ activeNav = "settings", onNavChange, onLogout }: SettingsPageProps) {
  const { theme, toggleTheme } = useTheme();
  const { t, lang, toggleLang } = useI18n();
  const { toast } = useToast();

  const handleSave = () => {
    toast(t("settings.saved"), "success");
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-white dark:bg-surface-950">
      <TopAppBar variant="settings" onLogout={onLogout} />
      <div className="flex flex-1 overflow-hidden">
        <SideNavBar activeNav={activeNav} onNavChange={onNavChange ?? (() => {})} />
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
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-500 text-xl font-bold text-white">
                      JD
                    </div>
                    <div className="flex flex-col gap-3 flex-1">
                      <div>
                        <label className="text-xs font-medium text-surface-500 mb-1 block">
                          {t("settings.name")}
                        </label>
                        <input
                          type="text"
                          defaultValue="John Doe"
                          className="w-full rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-surface-300 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-100"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-surface-500 mb-1 block">
                          {t("settings.email")}
                        </label>
                        <input
                          type="email"
                          defaultValue="john@example.com"
                          className="w-full rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-surface-300 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-100"
                        />
                      </div>
                    </div>
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
                  {/* Theme Toggle */}
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

                  {/* Language Toggle */}
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

              {/* Account Section */}
              <section className="rounded-xl border border-surface-200 bg-white p-6 dark:border-surface-800 dark:bg-surface-900">
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="h-5 w-5 text-surface-500" />
                  <h3 className="text-base font-semibold text-surface-900 dark:text-surface-100">
                    {t("settings.account")}
                  </h3>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-surface-700 dark:text-surface-300">
                      {t("settings.premium")}
                    </span>
                    <span className="rounded-full bg-accent-100 px-3 py-0.5 text-xs font-semibold text-accent-600 dark:bg-accent-900 dark:text-accent-300">
                      {t("settings.active")}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-surface-700 dark:text-surface-300">
                      {t("settings.email")}
                    </span>
                    <span className="text-sm text-surface-500">john@example.com</span>
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
                  <span className="text-sm text-surface-700 dark:text-surface-300">ProWriter</span>
                  <span className="text-sm text-surface-500">{t("settings.version")} 1.0.0</span>
                </div>
              </section>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button onClick={handleSave}>{t("settings.save")}</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
