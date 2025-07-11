import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { ThemeProvider } from "./hooks/theme-provider";
import { AuthProvider } from "./hooks/AuthProvider";
import { WalletProvider } from "./hooks/WalletProvider";
import "./styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WalletProvider>
      <AuthProvider>
        <ThemeProvider defaultTheme="dark" storageKey="chiliz-theme">
          <RouterProvider router={router} />
        </ThemeProvider>
      </AuthProvider>
    </WalletProvider>
  </React.StrictMode>
);