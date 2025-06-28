
import { useState, useEffect } from 'react';
import { ProductCard } from './ProductCard';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';

interface ProductGridProps {
  selectedCategory: string;
}

export const ProductGrid = ({ selectedCategory }: ProductGridProps) => {
  const { products, loading } = useProducts();
  const { categories } = useCategories();
  const [filteredProducts, setFilteredProducts] = useState(products);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredProducts(products);
    } else {
      // Find category by name
      const category = categories.find(cat => cat.name === selectedCategory);
      if (category) {
        setFilteredProducts(products.filter(product => product.category_id === category.id));
      } else {
        setFilteredProducts(products);
      }
    }
  }, [selectedCategory, products, categories]);

  if (loading) {
    return (
      <section id="products" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-xl text-gray-600">Cargando productos...</p>
          </div>
        </div>
      </section>
    );
  }

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
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No hay productos disponibles</h3>
            <p className="text-gray-600">
              {selectedCategory !== 'all' 
                ? 'No hay productos en esta categoría por el momento.' 
                : 'Próximamente agregaremos productos increíbles.'
              }
            </p>
          </div>
        )}

        {/* Load More - Only show if we have products */}
        {filteredProducts.length > 0 && (
          <div className="text-center mt-12">
            <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-colors">
              Cargar Más Productos
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
