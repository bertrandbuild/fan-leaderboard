/**
 * @fileoverview Router configuration for the application using React Router
 * @module router
 */

import { Suspense } from "react"
import { createBrowserRouter } from "react-router-dom"
import App from "./App"
import { Login } from "@/pages/login"
import { Register } from "@/pages/register"
import Loader from "@/components/ui/Loader"
import ErrorElement from "@/components/ui/ErrorElement"
import ProtectedRoute from "@/components/hoc/ProtectedRoute"
import RoleGuard from "@/components/hoc/RoleGuard"

// Import pages directly (they use named exports)
import { Dashboard } from "@/pages/dashboard"
import { Classement } from "@/pages/classement"
import { WalletIntegration } from "@/pages/wallet-integration"
import { ReseauxSociaux } from "@/pages/reseaux-sociaux"
import { GroupesTelegram } from "@/pages/groupes-telegram"
import { TopTweets } from "@/pages/top-yap"
import { Agents } from "@/pages/agents"

/**
 * Router confirmation
 *
 * @description
 * Defines all routes in the application with their respective components
 * and protection levels
 */
export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorElement />,
    children: [
      {
        path: "/",
        element: (
          <Suspense fallback={<Loader />}>
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "login",
        element: (
          <Suspense fallback={<Loader />}>
            <Login />
          </Suspense>
        ),
      },
      {
        path: "register",
        element: (
          <Suspense fallback={<Loader />}>
            <Register />
          </Suspense>
        ),
      },
      {
        path: "dashboard",
        element: (
          <Suspense fallback={<Loader />}>
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "classement",
        element: (
          <Suspense fallback={<Loader />}>
            <ProtectedRoute>
              <Classement />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "agents",
        element: (
          <Suspense fallback={<Loader />}>
            <ProtectedRoute>
              <RoleGuard requiredRoute="agents">
                <Agents />
              </RoleGuard>
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "wallet-integration",
        element: (
          <Suspense fallback={<Loader />}>
            <ProtectedRoute>
              <WalletIntegration />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "reseaux-sociaux",
        element: (
          <Suspense fallback={<Loader />}>
            <ProtectedRoute>
              <ReseauxSociaux />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "groupes-telegram",
        element: (
          <Suspense fallback={<Loader />}>
            <ProtectedRoute>
              <RoleGuard requiredRoute="groupes-telegram">
                <GroupesTelegram />
              </RoleGuard>
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "yaps-ai",
        element: (
          <Suspense fallback={<Loader />}>
            <ProtectedRoute>
              <TopTweets />
            </ProtectedRoute>
          </Suspense>
        ),
      },
    ],
  },
]); 