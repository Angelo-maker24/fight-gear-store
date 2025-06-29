
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Cart = ({ isOpen, onClose }: CartProps) => {
  const { items, updateQuantity, removeItem, totalPrice, totalItems, clearCart } = useCart();
  const { paymentMethods } = usePaymentMethods();

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <ShoppingBag className="w-5 h-5 mr-2" />
              Carrito de Compras
            </div>
            {items.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearCart}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Vaciar
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🛒</div>
                <h3 className="text-xl font-semibold mb-2">Tu carrito está vacío</h3>
                <p className="text-gray-500 mb-6">¡Agrega algunos productos increíbles!</p>
                <Button onClick={onClose} className="bg-red-600 hover:bg-red-700">
                  Continuar Comprando
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto py-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border-b">
                    <img 
                      src={item.image_url || '/placeholder.svg'} 
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{item.name}</h4>
                      <p className="text-sm text-gray-500">${item.price}</p>
                      {item.is_on_sale && item.original_price && (
                        <p className="text-xs text-red-600">
                          ¡Oferta! Antes: ${item.original_price}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Footer */}
              <div className="border-t pt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">
                    Total ({totalItems} {totalItems === 1 ? 'artículo' : 'artículos'}):
                  </span>
                  <span className="text-2xl font-bold text-red-600">${totalPrice.toFixed(2)}</span>
                </div>
                
                <div className="space-y-2">
                  <Button className="w-full bg-gold-500 hover:bg-gold-600 text-black font-bold">
                    🚀 Proceder al Checkout
                  </Button>
                  <Button variant="outline" className="w-full" onClick={onClose}>
                    Continuar Comprando
                  </Button>
                </div>

                {/* Payment Methods Preview */}
                <div className="text-center text-sm text-gray-500">
                  <p className="mb-2">Métodos de pago disponibles:</p>
                  <div className="flex justify-center space-x-3 flex-wrap">
                    {paymentMethods.slice(0, 4).map((method) => (
                      <span key={method.id} className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {method.type === 'mobile_payment' && '📱'} 
                        {method.type === 'bank_transfer' && '🏦'} 
                        {method.type === 'zelle' && '💳'} 
                        {method.type === 'binance' && '₿'} 
                        {method.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

