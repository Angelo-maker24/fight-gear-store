
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, userData?: any) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Check if user is admin - use setTimeout to avoid deadlock
          setTimeout(async () => {
            try {
              const { data: profile, error } = await supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', session.user.id)
                .single();
              
              console.log('Profile data:', profile, 'Error:', error);
              
              if (error) {
                console.error('Error checking admin status:', error);
                // If profile doesn't exist, create it
                if (error.code === 'PGRST116') {
                  console.log('Profile not found, creating one...');
                  const { error: insertError } = await supabase
                    .from('profiles')
                    .insert([
                      { 
                        id: session.user.id,
                        first_name: session.user.user_metadata?.first_name,
                        last_name: session.user.user_metadata?.last_name,
                        phone: session.user.user_metadata?.phone,
                        is_admin: session.user.email === 'admin@boxeomax.com'
                      }
                    ]);
                  
                  if (insertError) {
                    console.error('Error creating profile:', insertError);
                    setIsAdmin(false);
                  } else {
                    setIsAdmin(session.user.email === 'admin@boxeomax.com');
                  }
                } else {
                  setIsAdmin(false);
                }
              } else {
                setIsAdmin(profile?.is_admin || false);
              }
            } catch (error) {
              console.error('Error in admin check:', error);
              setIsAdmin(false);
            }
          }, 0);
        } else {
          setIsAdmin(false);
        }
        
        setIsLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: userData
        }
      });
      
      if (error) {
        console.error('SignUp error:', error);
        toast.error(error.message);
      } else {
        toast.success('¡Cuenta creada exitosamente! Revisa tu email para confirmar.');
      }
      
      return { error };
    } catch (error: any) {
      console.error('SignUp catch error:', error);
      toast.error('Error al crear cuenta');
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign in with:', email);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('SignIn error:', error);
        toast.error(error.message);
      } else {
        toast.success('¡Sesión iniciada exitosamente!');
      }
      
      return { error };
    } catch (error: any) {
      console.error('SignIn catch error:', error);
      toast.error('Error al iniciar sesión');
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      toast.success('Sesión cerrada');
    } catch (error) {
      console.error('SignOut error:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isLoading,
      isAdmin,
      signUp,
      signIn,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

