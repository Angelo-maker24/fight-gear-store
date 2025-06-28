
import { Button } from '@/components/ui/button';
import { ArrowDown } from 'lucide-react';

export const Hero = () => {
  const scrollToProducts = () => {
    const productsSection = document.getElementById('products');
    productsSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative bg-gradient-to-br from-gray-900 via-red-900 to-black min-h-[70vh] flex items-center overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"4\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-white space-y-6">
            <div className="space-y-2">
              <div className="inline-block bg-gold-500 text-black px-4 py-2 rounded-full text-sm font-bold">
                🏆 EQUIPOS PROFESIONALES
              </div>
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                EQUÍPATE COMO UN
                <span className="text-gold-500 block">CAMPEÓN</span>
              </h1>
            </div>
            
            <p className="text-xl text-gray-300 max-w-lg">
              La mejor selección de equipos para boxeo y artes marciales. 
              Calidad profesional, precios competitivos y envíos a toda Venezuela.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-gold-500 hover:bg-gold-600 text-black font-bold px-8 py-4 text-lg"
                onClick={scrollToProducts}
              >
                🛒 COMPRAR AHORA
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-white text-white hover:bg-white hover:text-black font-bold px-8 py-4 text-lg"
              >
                📞 CONTACTAR
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-gold-500">500+</div>
                <div className="text-sm text-gray-400">Productos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gold-500">1000+</div>
                <div className="text-sm text-gray-400">Clientes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gold-500">24/7</div>
                <div className="text-sm text-gray-400">Soporte</div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="bg-gradient-to-r from-gold-500 to-gold-600 rounded-full p-8 shadow-2xl animate-pulse">
              <div className="text-8xl text-center">🥊</div>
            </div>
            <div className="absolute -top-4 -right-4 bg-red-600 rounded-full p-4 animate-bounce">
              <span className="text-2xl">⚡</span>
            </div>
            <div className="absolute -bottom-4 -left-4 bg-blue-600 rounded-full p-4 animate-bounce delay-300">
              <span className="text-2xl">🏆</span>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <button 
            onClick={scrollToProducts}
            className="text-white hover:text-gold-500 transition-colors animate-bounce"
          >
            <ArrowDown className="w-6 h-6" />
          </button>
        </div>
      </div>
    </section>
  );
};
