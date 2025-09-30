import React, { useEffect } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/components/SessionContextProvider';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { session, isLoading } = useSession();

  useEffect(() => {
    if (!isLoading && session) {
      navigate('/lobby'); // Redirect to lobby after successful login
    }
  }, [session, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-lime-100 to-emerald-200">
        <p className="text-xl text-gray-700">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-lime-100 to-emerald-200 p-4">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border-4 border-lime-400">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-lime-600 to-emerald-800 mb-6 text-center">
          CaipiQuest Login
        </h1>
        <Auth
          supabaseClient={supabase}
          providers={[]} // No third-party providers for simplicity
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'hsl(var(--primary))',
                  brandAccent: 'hsl(var(--primary-foreground))',
                },
              },
            },
          }}
          theme="light"
          redirectTo={window.location.origin + '/lobby'} // Redirect to lobby after auth
        />
      </div>
    </div>
  );
};

export default Login;