import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from "lucide-react";
import { useI18n } from "@/components/I18nProvider";
import { useToast } from "@/components/Toast";

type Mode = "login" | "register";

interface LoginPageProps {
  onLogin?: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const { t } = useI18n();
  const { toast } = useToast();
  const [mode, setMode] = useState<Mode>("login");
  const [showPassword, setShowPassword] = useState(false);

  const switchMode = () => {
    setMode((prev) => (prev === "login" ? "register" : "login"));
  };

  const handleSubmit = () => {
    if (mode === "login") {
      toast(t("toast.loginSuccess"), "success");
    } else {
      toast(t("toast.registerSuccess"), "success");
    }
    onLogin?.();
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-surface-50 dark:bg-surface-950">
      <div className="w-full max-w-[420px] rounded-2xl border border-surface-200 bg-white p-8 shadow-lg dark:border-surface-800 dark:bg-surface-900">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-surface-100">
            ProWriter
          </h1>
          <p className="mt-1 text-sm text-surface-500">
            {mode === "login" ? t("login.welcomeBack") : t("login.createAccount")}
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex rounded-lg bg-surface-100 p-1 dark:bg-surface-800">
          <button
            onClick={() => setMode("login")}
            className={cn(
              "flex-1 rounded-md py-2 text-sm font-medium transition-all duration-200 cursor-pointer",
              "active:scale-[0.97]",
              mode === "login"
                ? "bg-white text-surface-900 shadow-sm dark:bg-surface-700 dark:text-surface-100"
                : "text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
            )}
          >
            {t("login.signIn")}
          </button>
          <button
            onClick={() => setMode("register")}
            className={cn(
              "flex-1 rounded-md py-2 text-sm font-medium transition-all duration-200 cursor-pointer",
              "active:scale-[0.97]",
              mode === "register"
                ? "bg-white text-surface-900 shadow-sm dark:bg-surface-700 dark:text-surface-100"
                : "text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
            )}
          >
            {t("login.register")}
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
          className="flex flex-col gap-4"
        >
          {mode === "register" && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
              <Input
                type="text"
                placeholder={t("login.fullName")}
                className="pl-10 h-10 text-sm"
                required
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
            <Input
              type="email"
              placeholder={t("login.email")}
              className="pl-10 h-10 text-sm"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder={t("login.password")}
              className="pl-10 pr-10 h-10 text-sm"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 cursor-pointer active:scale-90 transition-transform"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          {mode === "login" && (
            <div className="flex justify-end">
              <button
                type="button"
                className="text-xs text-surface-500 hover:text-surface-700 hover:underline cursor-pointer active:scale-[0.97] transition-transform dark:hover:text-surface-300"
              >
                {t("login.forgot")}
              </button>
            </div>
          )}

          <Button
            type="submit"
            className="mt-2 h-10 w-full font-medium active:scale-[0.98] transition-transform cursor-pointer"
          >
            {mode === "login" ? t("login.signIn") : t("login.createAccountBtn")}
          </Button>

          {/* Divider */}
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-200 dark:border-surface-700" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-surface-400 dark:bg-surface-900">
                {t("login.orContinue")}
              </span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-lg border border-surface-200 py-2.5 text-sm font-medium text-surface-700 transition-all duration-200 hover:bg-surface-50 active:scale-[0.97] cursor-pointer dark:border-surface-700 dark:text-surface-300 dark:hover:bg-surface-800"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-lg border border-surface-200 py-2.5 text-sm font-medium text-surface-700 transition-all duration-200 hover:bg-surface-50 active:scale-[0.97] cursor-pointer dark:border-surface-700 dark:text-surface-300 dark:hover:bg-surface-800"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </button>
          </div>

          {/* Switch mode */}
          <p className="mt-4 text-center text-xs text-surface-500">
            {mode === "login" ? (
              <>
                {t("login.noAccount")}{" "}
                <button
                  type="button"
                  onClick={switchMode}
                  className="font-medium text-surface-900 hover:underline cursor-pointer active:scale-[0.97] transition-transform dark:text-surface-300"
                >
                  {t("login.register")}
                  <ArrowRight className="ml-1 inline-block h-3 w-3" />
                </button>
              </>
            ) : (
              <>
                {t("login.hasAccount")}{" "}
                <button
                  type="button"
                  onClick={switchMode}
                  className="font-medium text-surface-900 hover:underline cursor-pointer active:scale-[0.97] transition-transform dark:text-surface-300"
                >
                  {t("login.signIn")}
                  <ArrowRight className="ml-1 inline-block h-3 w-3" />
                </button>
              </>
            )}
          </p>
        </form>
      </div>
    </div>
  );
}
