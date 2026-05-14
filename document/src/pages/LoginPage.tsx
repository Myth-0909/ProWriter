import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ForgotPasswordModal } from "@/components/ForgotPasswordModal";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { useI18n } from "@/components/I18nProvider";
import { useToast } from "@/components/Toast";
import { api, setToken } from "@/api";

type Mode = "login" | "register";

interface LoginPageProps {
  onLogin?: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const { t } = useI18n();
  const { toast } = useToast();
  const [mode, setMode] = useState<Mode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Forgot password
  const [forgotOpen, setForgotOpen] = useState(false);

  const switchMode = () => {
    setMode((prev) => (prev === "login" ? "register" : "login"));
    setPassword("");
  };

  const handleSubmit = async () => {
    if (submitting) return;

    if (!email || !password) {
      toast("请填写邮箱和密码", "error");
      return;
    }

    if (mode === "register" && !name) {
      toast("请填写姓名", "error");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "login") {
        const res = await api.login({ email, password });
        setToken(res.token);
        toast(`欢迎回来，${res.user.name}`, "success");
        onLogin?.();
      } else {
        const res = await api.register({ name, email, password });
        setToken(res.token);
        toast(`注册成功，欢迎你，${res.user.name}`, "success");
        onLogin?.();
      }
    } catch (error: any) {
      const errMsg = error.message || "操作失败";

      // Not registered → switch to register mode with email pre-filled
      if (mode === "login" && errMsg === "该邮箱尚未注册") {
        toast("该邮箱尚未注册，请先创建账户", "info");
        setMode("register");
        return;
      }

      toast(errMsg, "error");
    } finally {
      setSubmitting(false);
    }
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
                value={name}
                onChange={(e) => setName(e.target.value)}
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder={t("login.password")}
              className="pl-10 pr-10 h-10 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
                onClick={() => setForgotOpen(true)}
                className="text-xs text-surface-500 hover:text-surface-700 hover:underline cursor-pointer active:scale-[0.97] transition-transform dark:hover:text-surface-300"
              >
                {t("login.forgot")}
              </button>
            </div>
          )}

          <Button
            type="submit"
            className="mt-2 h-10 w-full font-medium active:scale-[0.98] transition-transform cursor-pointer"
            disabled={submitting}
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : mode === "login" ? (
              t("login.signIn")
            ) : (
              t("login.createAccountBtn")
            )}
          </Button>

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

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        open={forgotOpen}
        onOpenChange={setForgotOpen}
        defaultEmail={email}
      />
    </div>
  );
}
