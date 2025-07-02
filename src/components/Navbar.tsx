
import { useState } from 'react';
import { ShoppingCart, Search, User, UserCog, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useCategories } from '@/hooks/useCategories';
import { useCart } from '@/hooks/useCart';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  onCartOpen: () => void;
  onAuthOpen: () => void;
  onCategorySelect: (category: string) => void;
  selectedCategory: string;
}

const defaultCategories = [
  { id: 'all', name: 'all', description: 'Todos los productos', icon: '🥊' },
  { id: 'gloves', name: 'guantes', description: 'Guantes de boxeo', icon: '🥊' },
  { id: 'protection', name: 'protection', description: 'Protecciones', icon: '🛡️' },
  { id: 'clothing', name: 'clothing', description: 'Ropa deportiva', icon: '👕' },
  { id: 'equipment', name: 'equipment', description: 'Equipos', icon: '🏋️' },
  { id: 'accessories', name: 'accessories', description: 'Accesorios', icon: '⚡' }
];

export const Navbar = ({ onCartOpen, onAuthOpen, onCategorySelect, selectedCategory }: NavbarProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { user, isAdmin, signOut } = useAuth();
  const { categories } = useCategories();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  // Combine default categories with dynamic ones
  const allCategories = [
    { id: 'all', name: 'all', description: 'Todos', icon: '🥊' },
    ...categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      description: cat.name.charAt(0).toUpperCase() + cat.name.slice(1),
      icon: cat.icon
    }))
  ];

  const displayCategories = allCategories.length > 1 ? allCategories : defaultCategories;

  return (
    <nav className="bg-gradient-to-r from-red-900 via-red-700 to-red-900 shadow-lg sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-gray-900 text-white py-2">
        <div className="container mx-auto px-4 flex justify-between items-center text-sm">
          <span>🚚 Envíos a toda Venezuela | 📞 WhatsApp: +58 412-345-6789</span>
          <div className="flex space-x-4">
            
            
           {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gold-400">
                  Hola, {user.email}
                  {isAdmin && ' (Admin)'}
                </span>
                {isAdmin && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate('/admin')}
                    className="text-white hover:text-gold-400 transition-colors"
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    Panel Admin
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={signOut}
                  className="text-white hover:text-gold-400 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Salir
                </Button>
              </div>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onAuthOpen}
                className="text-white hover:text-gold-400 transition-colors"
              >
                <User className="w-4 h-4 mr-1" />
                Iniciar Sesión
              </Button>
            )}
          </div>
        </div>
      </div>

      
      
      {/* Main navigation */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="bg-gold-500 p-2 rounded-full">
              <span className="text-2xl font-bold text-white">🥊</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">BoxeoMax</h1>
              <p className="text-gold-300 text-xs">Equipos de Campeones</p>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/90 border-0 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Cart */}
          <Button
            onClick={onCartOpen}
            className="bg-gold-500 hover:bg-gold-600 text-white relative"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Carrito
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Button>
        </div>

        {/* Categories */}
        <div className="mt-4 flex space-x-2 overflow-x-auto pb-2">
          {displayCategories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.name ? "secondary" : "ghost"}
              onClick={() => onCategorySelect(category.name)}
              className={`whitespace-nowrap ${
                selectedCategory === category.name 
                  ? 'bg-gold-500 text-white hover:bg-gold-600' 
                  : 'text-white hover:bg-white/20'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.description}
            </Button>
          ))}
        </div>
      </div>
    </nav>
  );
};
