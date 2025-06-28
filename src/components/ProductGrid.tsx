
import { useState, useEffect } from 'react';
import { ProductCard } from './ProductCard';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  description: string;
  isOnSale?: boolean;
  rating: number;
  reviews: number;
}

// Sample products data
const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Guantes de Boxeo Profesionales',
    price: 45.99,
    originalPrice: 65.99,
    image: '/placeholder.svg',
    category: 'gloves',
    description: 'Guantes profesionales de cuero genuino con relleno de espuma de alta densidad.',
    isOnSale: true,
    rating: 4.8,
    reviews: 124
  },
  {
    id: '2',
    name: 'Protector Bucal Premium',
    price: 12.99,
    image: '/placeholder.svg',
    category: 'protection',
    description: 'Protector bucal moldeable de grado profesional para máxima protección.',
    rating: 4.6,
    reviews: 89
  },
  {
    id: '3',
    name: 'Shorts de Boxeo Thai',
    price: 28.99,
    originalPrice: 39.99,
    image: '/placeholder.svg',
    category: 'clothing',
    description: 'Shorts tradicionales tailandeses con bordados auténticos y tela satinada.',
    isOnSale: true,
    rating: 4.9,
    reviews: 67
  },
  {
    id: '4',
    name: 'Saco de Boxeo Pesado 120lbs',
    price: 89.99,
    image: '/placeholder.svg',
    category: 'equipment',
    description: 'Saco de entrenamiento profesional relleno de tela compactada.',
    rating: 4.7,
    reviews: 156
  },
  {
    id: '5',
    name: 'Vendas de Mano Elásticas',
    price: 8.99,
    image: '/placeholder.svg',
    category: 'accessories',
    description: 'Vendas elásticas de 4.5m para protección de muñecas y nudillos.',
    rating: 4.5,
    reviews: 203
  },
  {
    id: '6',
    name: 'Casco de Entrenamiento',
    price: 55.99,
    image: '/placeholder.svg',
    category: 'protection',
    description: 'Casco acolchado con protección facial y ventilación superior.',
    rating: 4.4,
    reviews: 78
  }
];

interface ProductGridProps {
  selectedCategory: string;
}

export const ProductGrid = ({ selectedCategory }: ProductGridProps) => {
  const [products, setProducts] = useState<Product[]>(sampleProducts);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(sampleProducts);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(product => product.category === selectedCategory));
    }
  }, [selectedCategory, products]);

  return (
    <section id="products" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Nuestros Productos
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Encuentra el equipo perfecto para tu entrenamiento y competencias
          </p>
          <div className="w-24 h-1 bg-gold-500 mx-auto mt-6"></div>
        </div>

        {/* Filters */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-2 shadow-lg">
            <div className="flex space-x-2">
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold">
                🔥 En Oferta
              </button>
              <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                ⭐ Mejor Valorados
              </button>
              <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                💰 Precio: Menor a Mayor
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-colors">
            Cargar Más Productos
          </button>
        </div>
      </div>
    </section>
  );
};
