import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, KeyRound, Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { api } from "@/api";
import { useI18n } from "@/components/I18nProvider";
import { useToast } from "@/components/Toast";

interface ForgotPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultEmail?: string;
}

export function ForgotPasswordModal({ open, onOpenChange, defaultEmail = "" }: ForgotPasswordModalProps) {
  const { t } = useI18n();
  const { toast } = useToast();

  const [step, setStep] = useState<"email" | "reset" | "done">("email");
  const [email, setEmail] = useState(defaultEmail);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [returnedCode, setReturnedCode] = useState("");

  if (!open) return null;

  const reset = () => {
    setStep("email");
    setEmail(defaultEmail);
    setCode("");
    setNewPassword("");
    setReturnedCode("");
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(reset, 200);
  };

  const handleSendCode = async () => {
    if (!email) {
      toast(t("forgot.emailPlaceholder"), "error");
      return;
    }
    setLoading(true);
    try {
      const res = await api.forgotPassword({ email });
      setReturnedCode(res.code);
      toast(t("toast.exportSuccess"), "success");
      setStep("reset");
    } catch (error: any) {
      toast(error.message || t("toast.saveFailed"), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!code) {
      toast(t("forgot.codePlaceholder"), "error");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast(t("forgot.newPasswordPlaceholder"), "error");
      return;
    }
    setLoading(true);
    try {
      await api.resetPassword({ email, code, newPassword });
      toast(t("forgot.successMessage"), "success");
      setStep("done");
    } catch (error: any) {
      toast(error.message || t("toast.saveFailed"), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative z-10 w-full max-w-[400px] rounded-2xl border border-surface-200 bg-white p-6 shadow-2xl dark:border-surface-700 dark:bg-surface-900">
        {step === "done" ? (
          <>
            <div className="flex flex-col items-center text-center py-4">
              <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-2">
                {t("forgot.successTitle")}
              </h3>
              <p className="text-sm text-surface-500 mb-6">
                {t("forgot.successMessage")}
              </p>
              <Button onClick={handleClose} className="w-full">
                {t("forgot.backToLogin")}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-6">
              {step === "reset" && (
                <button
                  onClick={() => setStep("email")}
                  className="text-surface-400 hover:text-surface-600 cursor-pointer"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              )}
              <div>
                <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                  {step === "email" ? t("forgot.title") : t("forgot.resetPassword")}
                </h3>
                <p className="text-xs text-surface-500 mt-0.5">
                  {step === "email" ? t("forgot.subtitle") : t("forgot.resetSubtitle")}
                </p>
              </div>
            </div>

            {step === "email" ? (
              <form onSubmit={(e) => { e.preventDefault(); handleSendCode(); }}>
                <div className="relative mb-5">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
                  <Input
                    type="email"
                    placeholder={t("forgot.emailPlaceholder")}
                    className="pl-10 h-10 text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <Button type="submit" className="w-full h-10" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("forgot.sendCode")}
                </Button>
              </form>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); handleResetPassword(); }}>
                {returnedCode && (
                  <div className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                    {t("forgot.codePlaceholder").replace("请输入6位验证码", "验证码")}:{" "}
                    <span className="font-mono font-bold text-sm">{returnedCode}</span>
                    <span className="block mt-0.5 opacity-70">({t("forgot.devNotice")})</span>
                  </div>
                )}

                <div className="relative mb-3">
                  <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
                  <Input
                    type="text"
                    placeholder={t("forgot.codePlaceholder")}
                    className="pl-10 h-10 text-sm"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    maxLength={6}
                    required
                    autoFocus
                  />
                </div>

                <div className="relative mb-5">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
                  <Input
                    type="password"
                    placeholder={t("forgot.newPasswordPlaceholder")}
                    className="pl-10 h-10 text-sm"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full h-10" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("forgot.resetBtn")}
                </Button>
              </form>
            )}

            <button
              type="button"
              onClick={handleClose}
              className="mt-3 w-full text-center text-xs text-surface-400 hover:text-surface-600 cursor-pointer"
            >
              {t("forgot.backToLogin")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
