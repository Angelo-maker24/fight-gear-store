
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, UserCog, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'user' | 'admin';
}

export const AuthModal = ({ isOpen, onClose, type }: AuthModalProps) => {
  const { signIn, signUp } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: type === 'admin' ? 'admin@boxeomax.com' : '',
    password: type === 'admin' ? 'BoxeoMax2024!' : '',
    confirmPassword: type === 'admin' ? 'BoxeoMax2024!' : '',
    firstName: '',
    lastName: '',
    phone: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        if (!error) {
          onClose();
          resetForm();
        }
      } else {
        if (formData.password !== formData.confirmPassword) {
          alert('Las contraseñas no coinciden');
          setLoading(false);
          return;
        }

        const { error } = await signUp(formData.email, formData.password, {
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone
        });

        if (!error) {
          onClose();
          resetForm();
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    if (type === 'admin') {
      setFormData({
        email: 'admin@boxeomax.com',
        password: 'BoxeoMax2024!',
        confirmPassword: 'BoxeoMax2024!',
        firstName: '',
        lastName: '',
        phone: ''
      });
    } else {
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phone: ''
      });
    }
  };

  const isAdminMode = type === 'admin';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl">
            {isAdminMode ? (
              <>
                <UserCog className="w-6 h-6 mr-2 text-red-600" />
                Panel de Administrador
              </>
            ) : (
              <>
                <User className="w-6 h-6 mr-2 text-blue-600" />
                Acceso de Usuario
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className={`p-1 rounded-lg ${isAdminMode ? 'bg-red-100' : 'bg-blue-100'}`}>
          <div className={`p-4 rounded bg-white border-2 ${isAdminMode ? 'border-red-200' : 'border-blue-200'}`}>
            {isAdminMode && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 font-medium">
                  🔒 Credenciales Admin pre-cargadas - Solo inicia sesión o regístrate
                </p>
              </div>
            )}

            <Tabs value={isLogin ? 'login' : 'register'} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger 
                  value="login" 
                  onClick={() => setIsLogin(true)}
                  className={isAdminMode ? 'data-[state=active]:bg-red-600 data-[state=active]:text-white' : ''}
                >
                  Iniciar Sesión
                </TabsTrigger>
                <TabsTrigger 
                  value="register" 
                  onClick={() => setIsLogin(false)}
                  className={isAdminMode ? 'data-[state=active]:bg-red-600 data-[state=active]:text-white' : ''}
                >
                  Registrarse
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4 mt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="email">
                      {isAdminMode ? 'Email de Administrador' : 'Email'}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={isAdminMode ? 'admin@boxeomax.com' : 'tu@email.com'}
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Contraseña</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading}
                    className={`w-full font-bold ${
                      isAdminMode 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {loading ? 'Cargando...' : (isAdminMode ? '🔐 Acceder como Admin' : '🚀 Iniciar Sesión')}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="space-y-4 mt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isAdminMode && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">Nombre</Label>
                        <Input
                          id="firstName"
                          placeholder="Juan"
                          value={formData.firstName}
                          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Apellido</Label>
                        <Input
                          id="lastName"
                          placeholder="Pérez"
                          value={formData.lastName}
                          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                  )}

                  {!isAdminMode && (
                    <div>
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        placeholder="+58 412-345-6789"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        required
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={isAdminMode ? 'admin@boxeomax.com' : 'tu@email.com'}
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                      disabled={isAdminMode}
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Contraseña</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        required
                        disabled={isAdminMode}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {!isAdminMode && (
                    <div>
                      <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        required
                      />
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    disabled={loading}
                    className={`w-full font-bold ${
                      isAdminMode 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {loading ? 'Cargando...' : (isAdminMode ? '🔐 Crear Admin' : '🎯 Crear Cuenta')}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {!isAdminMode && (
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  ¿Problemas para acceder?{' '}
                  <button className="text-blue-600 hover:underline font-medium">
                    Recuperar contraseña
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
