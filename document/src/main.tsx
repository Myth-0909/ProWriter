import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ToastProvider } from "@/components/Toast";
import { I18nProvider } from "@/components/I18nProvider";
import { DocumentStoreProvider } from "@/store";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <I18nProvider>
      <ThemeProvider>
        <ToastProvider>
          <DocumentStoreProvider>
            <App />
          </DocumentStoreProvider>
        </ToastProvider>
      </ThemeProvider>
    </I18nProvider>
  </React.StrictMode>,
);
