
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';
import { Product } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { addItem } = useCart();

  const discountPercentage = product.original_price 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  const categoryIcons: Record<string, string> = {
    'guantes': '🥊',
    'protection': '🛡️',
    'clothing': '👕',
    'equipment': '🏋️',
    'accessories': '⚡'
  };

  const categoryNames: Record<string, string> = {
    'guantes': 'Guantes',
    'protection': 'Protecciones',
    'clothing': 'Ropa',
    'equipment': 'Equipos',
    'accessories': 'Accesorios'
  };

  const handleAddToCart = () => {
    addItem(product);
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden">
        <img 
          src={product.image_url || '/placeholder.svg'} 
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col space-y-2">
          {product.is_on_sale && (
            <Badge className="bg-red-600 text-white">
              -{discountPercentage}% OFF
            </Badge>
          )}
          {product.rating >= 4.5 && (
            <Badge className="bg-gold-500 text-black">
              ⭐ TOP
            </Badge>
          )}
        </div>

        {/* Quick Add Button */}
        <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <Button 
            className="bg-gold-500 hover:bg-gold-600 text-black font-bold"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Agregar al Carrito
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        <div className="text-sm text-gray-500 mb-2 capitalize">
          {product.category?.icon || categoryIcons[product.category?.name || '']} {' '}
          {product.category?.name ? categoryNames[product.category.name] || product.category.name : 'Sin categoría'}
        </div>

        {/* Title */}
        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Rating */}
        <div className="flex items-center mb-3">
          <div className="flex text-yellow-400">
            {'★'.repeat(Math.floor(product.rating))}
            {'☆'.repeat(5 - Math.floor(product.rating))}
          </div>
          <span className="text-sm text-gray-500 ml-2">
            {product.rating} ({product.reviews_count} reseñas)
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-red-600">
              ${product.price}
            </span>
            {product.original_price && (
              <span className="text-lg text-gray-400 line-through">
                ${product.original_price}
              </span>
            )}
          </div>
          
          <Button 
            size="sm" 
            variant="outline"
            className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

