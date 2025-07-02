
import { useState, useEffect, createContext, useContext } from 'react';
import { toast } from 'sonner';
import { Product } from '@/hooks/useProducts';

// Interfaz para el item del carrito con cantidad
interface CartItem extends Product {
  quantity: number;
}

// Interfaz del contexto del carrito actualizada
interface CartContextType {
  items: CartItem[];  // Cambiado de 'cart' a 'items' para consistencia
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Cargar carrito desde localStorage al montar
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  // Función para agregar item al carrito
  const addItem = (product: Product, quantity = 1) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.id === product.id);
      
      if (existingItem) {
        toast.success(`Cantidad actualizada: ${product.name}`);
        return currentItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        toast.success(`Agregado al carrito: ${product.name}`);
        return [...currentItems, { ...product, quantity }];
      }
    });
  };

  // Función para remover item del carrito
  const removeItem = (productId: string) => {
    setItems(currentItems => {
      const item = currentItems.find(item => item.id === productId);
      if (item) {
        toast.success(`Eliminado del carrito: ${item.name}`);
      }
      return currentItems.filter(item => item.id !== productId);
    });
  };

  // Función para actualizar cantidad
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems(currentItems =>
      currentItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  // Función para limpiar carrito
  const clearCart = () => {
    setItems([]);
    toast.success('Carrito vaciado');
  };

  // Calcular totales
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  // Función getTotalPrice para compatibilidad
  const getTotalPrice = () => totalPrice;

  return (
    <CartContext.Provider value={{
      items,
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
