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
import { LeaderBoard } from "@/pages/leader-board"
import { WalletIntegration } from "@/pages/wallet-integration"
import { ReseauxSociaux } from "@/pages/reseaux-sociaux"
import { SocialManager } from "@/pages/social-manager"
import { TopTweets } from "@/pages/top-yap"
import { Agents } from "@/pages/agents"
import { PullAdminPage } from "@/pages/pull-manager"

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
        path: "leaderboard",
        element: (
          <Suspense fallback={<Loader />}>
            <ProtectedRoute>
              <LeaderBoard />
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
        path: "social-manager",
        element: (
          <Suspense fallback={<Loader />}>
            <ProtectedRoute>
              <RoleGuard requiredRoute="social-manager">
                <SocialManager />
              </RoleGuard>
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "pull-management",
        element: (
          <Suspense fallback={<Loader />}>
            <ProtectedRoute>
              <PullAdminPage />
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