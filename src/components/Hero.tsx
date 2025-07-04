
import { Button } from '@/components/ui/button';
import { ArrowDown } from 'lucide-react';

export const Hero = () => {
  const scrollToProducts = () => {
    const productsSection = document.getElementById('products');
    productsSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative bg-gradient-to-br from-primary via-elegant to-primary min-h-[70vh] flex items-center overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSI0Ii8+PC9nPjwvZz48L3N2Zz4=)]"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-white space-y-6">
            <div className="space-y-2">
              <div className="inline-block bg-luxury text-luxury-foreground px-4 py-2 rounded-full text-sm font-bold font-['Inter']">
                🎨 ARTE EXCLUSIVO
              </div>
              <h1 className="text-5xl md:text-7xl font-bold leading-tight font-['Playfair_Display']">
                DESCUBRE EL ARTE
                <span className="text-luxury block">MÁS REFINADO</span>
              </h1>
            </div>
            
            <p className="text-xl text-gray-300 max-w-lg font-['Inter']">
              Obras únicas de artistas reconocidos. Pinturas, esculturas y arte contemporáneo 
              de la más alta calidad con envíos seguros a toda Venezuela.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-luxury hover:bg-luxury/90 text-luxury-foreground font-bold px-8 py-4 text-lg font-['Inter']"
                onClick={scrollToProducts}
              >
                🛒 EXPLORAR COLECCIÓN
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-white text-white hover:bg-white hover:text-black font-bold px-8 py-4 text-lg font-['Inter']"
              >
                📞 ASESORÍA PERSONALIZADA
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-luxury font-['Playfair_Display']">200+</div>
                <div className="text-sm text-gray-400 font-['Inter']">Obras Únicas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-luxury font-['Playfair_Display']">50+</div>
                <div className="text-sm text-gray-400 font-['Inter']">Artistas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-luxury font-['Playfair_Display']">15+</div>
                <div className="text-sm text-gray-400 font-['Inter']">Años</div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="bg-gradient-to-r from-luxury to-elegant rounded-full p-8 shadow-2xl animate-pulse">
              <div className="text-8xl text-center">🎨</div>
            </div>
            <div className="absolute -top-4 -right-4 bg-elegant rounded-full p-4 animate-bounce">
              <span className="text-2xl">🖼️</span>
            </div>
            <div className="absolute -bottom-4 -left-4 bg-luxury rounded-full p-4 animate-bounce delay-300">
              <span className="text-2xl">✨</span>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <button 
            onClick={scrollToProducts}
            className="text-white hover:text-luxury transition-colors animate-bounce"
          >
            <ArrowDown className="w-6 h-6" />
          </button>
        </div>
      </div>
    </section>
  );
};
