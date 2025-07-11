import { AlertTriangle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, useRouteError } from "react-router-dom";

/**
 * ErrorElement Component
 * 
 * A component that displays error information when a route fails to load
 * Provides navigation back to the home page
 * 
 * @component
 * @returns {JSX.Element} The error element component
 */
const ErrorElement = () => {
  const error = useRouteError() as Error;
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white mx-auto mb-4">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <CardTitle className="text-white text-2xl">Error</CardTitle>
          <p className="text-slate-400">An unexpected error occurred</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-slate-700 p-4 rounded-lg">
            <p className="text-red-400 text-sm font-mono">
              {error?.message || "Unknown error"}
            </p>
          </div>
          <Button 
            onClick={() => navigate("/")} 
            className="w-full bg-orange-500 hover:bg-orange-600"
          >
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorElement; 