import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuthContext } from "@/hooks/useAuthContext"

export function Login() {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login } = useAuthContext();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!credentials.username || !credentials.password) {
      alert("Please enter username and password");
      return;
    }

    setIsLoggingIn(true);
    
    try {
      const success = await login(credentials.username, credentials.password);
      
      if (success) {
        // Redirect to dashboard after successful login
        navigate("/dashboard");
      } else {
        alert("Invalid credentials. Use admin/admin or user/user");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred during login. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
            C
          </div>
          <CardTitle className="text-white text-2xl">Chiliz Admin</CardTitle>
          <p className="text-slate-400">Connect to your account</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Username"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                required
                disabled={isLoggingIn}
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                required
                disabled={isLoggingIn}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? "Logging in..." : "Login"}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-slate-400 text-sm">
              Don't have an account?{" "}
              <Link 
                to="/register" 
                className="text-orange-400 hover:text-orange-300 font-medium"
              >
                Create account
              </Link>
            </p>
          </div>
          
          <div className="space-y-2 text-sm text-slate-400 text-center">
            <p className="font-medium text-slate-300">Demo accounts:</p>
            <div className="grid grid-cols-2 gap-4 p-3 bg-slate-700 rounded-lg">
              <div>
                <p className="text-orange-400 font-medium">Admin</p>
                <p>admin/admin</p>
                <p className="text-xs text-slate-500">Full access</p>
              </div>
              <div>
                <p className="text-blue-400 font-medium">User</p>
                <p>user/user</p>
                <p className="text-xs text-slate-500">Limited access</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 