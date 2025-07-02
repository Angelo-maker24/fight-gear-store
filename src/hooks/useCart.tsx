
import { useState, useEffect, createContext, useContext } from 'react';
import { toast } from 'sonner';
import { Product } from '@/hooks/useProducts';

// Interfaz para el item del carrito con cantidad
interface CartItem extends Product {
  quantity: number;
}

// Interfaz del contexto del carrito actualizada
interface CartContextType {
  cart: CartItem[];  // Cambio de 'items' a 'cart' para coincidir con el uso
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  getTotalPrice: () => number;  // Función para obtener el precio total
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Cargar carrito desde localStorage al montar
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Función para agregar item al carrito
  const addItem = (product: Product, quantity = 1) => {
    setCart(currentCart => {
      const existingItem = currentCart.find(item => item.id === product.id);
      
      if (existingItem) {
        toast.success(`Cantidad actualizada: ${product.name}`);
        return currentCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        toast.success(`Agregado al carrito: ${product.name}`);
        return [...currentCart, { ...product, quantity }];
      }
    });
  };

  // Función para remover item del carrito
  const removeItem = (productId: string) => {
    setCart(currentCart => {
      const item = currentCart.find(item => item.id === productId);
      if (item) {
        toast.success(`Eliminado del carrito: ${item.name}`);
      }
      return currentCart.filter(item => item.id !== productId);
    });
  };

  // Función para actualizar cantidad
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setCart(currentCart =>
      currentCart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  // Función para limpiar carrito
  const clearCart = () => {
    setCart([]);
    toast.success('Carrito vaciado');
  };

  // Calcular totales
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  // Función getTotalPrice para compatibilidad
  const getTotalPrice = () => totalPrice;

  return (
    <CartContext.Provider value={{
      cart,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice,
      getTotalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
