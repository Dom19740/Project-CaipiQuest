import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom"; // Removed Navigate
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Lobby from "./pages/Lobby";
import GameRoom from "./pages/GameRoom";
import { useSession } from "./components/SessionContextProvider"; // Still needed for user.id

const queryClient = new QueryClient();

// Removed ProtectedRoute component as login is no longer enforced

const App = () => {
  // We still need useSession to get the user.id for database operations,
  // even if we're not forcing an explicit login flow.
  // Supabase will provide an anonymous user.id if no user is logged in.
  const { isLoading } = useSession();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-lime-100 to-emerald-200">
        <p className="text-xl text-gray-700">Loading application...</p>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/lobby" element={<Lobby />} /> {/* Lobby is now directly accessible */}
            <Route path="/game/:roomId" element={<GameRoom />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;