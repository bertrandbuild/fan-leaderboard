import { Loader2 } from "lucide-react";

/**
 * Loader Component
 * 
 * A reusable loading spinner component that displays a rotating icon
 * with consistent styling across the application
 * 
 * @component
 * @returns {JSX.Element} The loader component
 */
const Loader = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <p className="text-slate-400 text-sm">Loading...</p>
      </div>
    </div>
  );
};

export default Loader; 