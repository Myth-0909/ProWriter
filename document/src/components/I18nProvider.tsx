import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

type Lang = "zh" | "en";

const translations = {
  // Sidebar
  "nav.documents": { zh: "文档", en: "Documents" },
  "nav.favorites": { zh: "收藏", en: "Favorites" },
  "nav.trash": { zh: "回收站", en: "Trash" },
  "nav.settings": { zh: "设置", en: "Settings" },
  "nav.darkMode": { zh: "深色模式", en: "Dark Mode" },
  "nav.lightMode": { zh: "浅色模式", en: "Light Mode" },

  // TopAppBar
  "topbar.language": { zh: "语言", en: "Language" },
  "topbar.zh": { zh: "中文", en: "EN" },
  "topbar.share": { zh: "分享", en: "Share" },
  "topbar.export": { zh: "导出", en: "Export" },
  "topbar.upgrade": { zh: "升级", en: "Upgrade" },
  "topbar.logout": { zh: "退出", en: "Logout" },
  "topbar.gridView": { zh: "网格视图", en: "Grid view" },
  "topbar.listView": { zh: "列表视图", en: "List view" },

  // Common / Actions
  "common.confirm": { zh: "确认", en: "Confirm" },
  "common.cancel": { zh: "取消", en: "Cancel" },
  "common.save": { zh: "保存", en: "Save" },
  "common.delete": { zh: "删除", en: "Delete" },
  "common.saved": { zh: "已保存", en: "Saved" },
  "common.copied": { zh: "已复制", en: "Copied" },
  "common.loading": { zh: "加载中...", en: "Loading..." },

  // Documents
  "documents.title": { zh: "文档", en: "Documents" },
  "documents.myDocuments": { zh: "我的文档", en: "My Documents" },
  "documents.subtitle": { zh: "管理和组织您的写作项目", en: "Manage and organize your writing projects in one place" },
  "documents.newDocument": { zh: "新建文档", en: "New Document" },
  "documents.writersFlow": { zh: "写作流", en: "Writer's Flow" },
  "documents.activity": { zh: "过去一周的写作活动", en: "Your writing activity over the past week" },
  "documents.search": { zh: "搜索文档...", en: "Search documents..." },
  "documents.upgrade": { zh: "升级到 Pro", en: "Upgrade to Pro" },
  "documents.upgradeDesc": { zh: "解锁无限文档存储、协作编辑和 AI 重写工具。", en: "Unlock unlimited document storage, collaborative editing, and AI rewriting tools." },
  "documents.upgradeNow": { zh: "立即升级", en: "Upgrade Now" },

  // Editor
  "editor.untitled": { zh: "未命名文档", en: "Untitled Document" },
  "editor.placeholder": { zh: "开始写作...", en: "Start writing..." },
  "editor.words": { zh: "字", en: "words" },
  "editor.characters": { zh: "字符", en: "characters" },
  "editor.avgChars": { zh: "平均字/词", en: "avg. chars/word" },
  "editor.title": { zh: "标题", en: "Title" },
  "editor.searchDocs": { zh: "搜索文档...", en: "Search documents..." },
  "editor.bold": { zh: "加粗", en: "Bold" },
  "editor.italic": { zh: "斜体", en: "Italic" },
  "editor.underline": { zh: "下划线", en: "Underline" },
  "editor.strikethrough": { zh: "删除线", en: "Strikethrough" },
  "editor.bulletList": { zh: "无序列表", en: "Bullet list" },
  "editor.orderedList": { zh: "有序列表", en: "Numbered list" },
  "editor.saving": { zh: "保存中...", en: "Saving..." },
  "editor.saved": { zh: "已自动保存", en: "Auto-saved" },

  // Share Modal
  "share.title": { zh: "分享与导出", en: "Share & Export" },
  "share.exportDocument": { zh: "导出文档", en: "Export Document" },
  "share.shareLink": { zh: "分享链接", en: "Share Link" },
  "share.copyLink": { zh: "复制链接", en: "Copy Link" },
  "share.cancel": { zh: "取消", en: "Cancel" },
  "share.exportBtn": { zh: "导出", en: "Export" },
  "share.pdfDesc": { zh: "适合打印和分享", en: "Best for printing and sharing" },
  "share.wordDesc": { zh: "可编辑文档格式", en: "Editable document format" },
  "share.mdDesc": { zh: "纯文本带格式", en: "Plain text with formatting" },

  // Login
  "login.signIn": { zh: "登录", en: "Sign In" },
  "login.register": { zh: "注册", en: "Register" },
  "login.welcomeBack": { zh: "欢迎回来", en: "Welcome back" },
  "login.createAccount": { zh: "创建您的账户", en: "Create your account" },
  "login.fullName": { zh: "姓名", en: "Full name" },
  "login.email": { zh: "邮箱地址", en: "Email address" },
  "login.password": { zh: "密码", en: "Password" },
  "login.forgot": { zh: "忘记密码？", en: "Forgot password?" },
  "login.createAccountBtn": { zh: "创建账户", en: "Create Account" },
  "login.orContinue": { zh: "或使用以下方式继续", en: "or continue with" },
  "login.noAccount": { zh: "还没有账户？", en: "Don't have an account?" },
  "login.hasAccount": { zh: "已有账户？", en: "Already have an account?" },

  // Trash Page
  "trash.title": { zh: "回收站", en: "Trash" },
  "trash.subtitle": { zh: "已删除的文档将在 30 天后自动清除", en: "Deleted documents are automatically purged after 30 days" },
  "trash.empty": { zh: "回收站为空", en: "Trash is empty" },
  "trash.emptyDesc": { zh: "删除的文档会出现在这里", en: "Deleted documents will appear here" },
  "trash.restore": { zh: "恢复", en: "Restore" },
  "trash.deleteForever": { zh: "永久删除", en: "Delete forever" },
  "trash.restored": { zh: "文档已恢复", en: "Document restored" },
  "trash.deleted": { zh: "文档已永久删除", en: "Document permanently deleted" },
  "trash.daysLeft": { zh: "天后自动清除", en: "days until auto-purge" },
  "trash.emptyTrash": { zh: "清空回收站", en: "Empty Trash" },
  "trash.confirmDelete": { zh: "此操作不可撤销，文档将被永久删除。", en: "This action cannot be undone. The document will be permanently deleted." },
  "trash.confirmEmpty": { zh: "回收站中的所有文档将被永久删除，此操作不可撤销。", en: "All documents in trash will be permanently deleted. This action cannot be undone." },

  // Settings Page
  "settings.title": { zh: "设置", en: "Settings" },
  "settings.profile": { zh: "个人资料", en: "Profile" },
  "settings.appearance": { zh: "外观", en: "Appearance" },
  "settings.language": { zh: "语言偏好", en: "Language Preference" },
  "settings.languageDesc": { zh: "选择界面显示语言", en: "Choose your interface language" },
  "settings.theme": { zh: "主题模式", en: "Theme Mode" },
  "settings.themeDesc": { zh: "切换浅色或深色主题", en: "Switch between light and dark theme" },
  "settings.account": { zh: "账户", en: "Account" },
  "settings.email": { zh: "邮箱地址", en: "Email address" },
  "settings.name": { zh: "显示名称", en: "Display name" },
  "settings.save": { zh: "保存更改", en: "Save changes" },
  "settings.saved": { zh: "设置已保存", en: "Settings saved" },
  "settings.about": { zh: "关于", en: "About" },
  "settings.version": { zh: "版本", en: "Version" },
  "settings.premium": { zh: "Premium 会员", en: "Premium Member" },
  "settings.active": { zh: "已激活", en: "Active" },

  // Document Card
  "card.edit": { zh: "编辑", en: "Edit" },
  "card.share": { zh: "分享", en: "Share" },
  "card.delete": { zh: "删除", en: "Delete" },
  "card.sciFi": { zh: "科幻小说", en: "Sci-Fi Novel" },
  "card.fantasy": { zh: "奇幻", en: "Fantasy" },
  "card.design": { zh: "设计", en: "Design" },
  "card.journal": { zh: "日记", en: "Journal" },
  "card.planning": { zh: "规划", en: "Planning" },
  "card.research": { zh: "研究", en: "Research" },

  // Favorites Page
  "favorites.empty": { zh: "暂无收藏文档", en: "No favorites yet" },
  "favorites.emptyDesc": { zh: "点击文档上的星标图标即可添加到此处", en: "Click the star icon on any document to add it here" },
  "favorites.subtitle": { zh: "个已收藏的文档", en: "starred document(s)" },

  // Confirm Modals
  "confirm.logoutTitle": { zh: "退出登录", en: "Logout" },
  "confirm.logoutDesc": { zh: "确定要退出登录吗？未保存的更改将会丢失。", en: "Are you sure you want to log out? Any unsaved changes will be lost." },
  "confirm.deleteTitle": { zh: "删除文档", en: "Delete Document" },
  "confirm.deleteDesc": { zh: "确定要删除此文档吗？您可以在 30 天内从回收站恢复。", en: "Are you sure you want to move this document to trash? You can restore it within 30 days." },

  // Toast messages
  "toast.logoutSuccess": { zh: "退出成功！", en: "Logged out successfully!" },
  "toast.loginSuccess": { zh: "登录成功！", en: "Logged in successfully!" },
  "toast.registerSuccess": { zh: "注册成功！", en: "Registered successfully!" },
  "toast.copySuccess": { zh: "链接已复制！", en: "Link copied!" },
  "toast.themeChanged": { zh: "主题已切换", en: "Theme changed" },
  "toast.langChanged": { zh: "语言已切换", en: "Language switched" },
  "toast.exportSuccess": { zh: "导出成功！", en: "Exported successfully!" },
  "toast.comingSoon": { zh: "功能开发中，敬请期待！", en: "Coming soon!" },
  "toast.favAdded": { zh: "已添加到收藏", en: "Added to favorites" },
  "toast.favRemoved": { zh: "已取消收藏", en: "Removed from favorites" },
  "toast.movedToTrash": { zh: "已移入回收站", en: "moved to trash" },
  "toast.newDocCreated": { zh: "新文档已创建", en: "New document created" },
} as const;

type TranslationKey = keyof typeof translations;

interface I18nContextType {
  lang: Lang;
  t: (key: TranslationKey) => string;
  toggleLang: () => void;
}

const I18nContext = createContext<I18nContextType>({
  lang: "zh",
  t: () => "",
  toggleLang: () => {},
});

export function useI18n() {
  return useContext(I18nContext);
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    const stored = localStorage.getItem("lang");
    if (stored === "zh" || stored === "en") return stored;
    return navigator.language.startsWith("zh") ? "zh" : "en";
  });

  const t = useCallback(
    (key: TranslationKey) => {
      return translations[key]?.[lang] ?? key;
    },
    [lang]
  );

  const toggleLang = useCallback(() => {
    setLang((prev) => {
      const next = prev === "zh" ? "en" : "zh";
      localStorage.setItem("lang", next);
      return next;
    });
  }, []);

  return (
    <I18nContext.Provider value={{ lang, t, toggleLang }}>
      {children}
    </I18nContext.Provider>
  );
}
