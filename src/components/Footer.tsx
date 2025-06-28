
export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-gold-500 p-2 rounded-full">
                <span className="text-2xl font-bold text-white">🥊</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">BoxeoMax</h3>
                <p className="text-gold-300 text-sm">Equipos de Campeones</p>
              </div>
            </div>
            <p className="text-gray-400">
              La mejor tienda online de equipos para boxeo y artes marciales en Venezuela. 
              Calidad profesional garantizada.
            </p>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-gold-500">Contacto</h4>
            <div className="space-y-2 text-gray-400">
              <p className="flex items-center">
                <span className="mr-2">📞</span>
                +58 412-345-6789
              </p>
              <p className="flex items-center">
                <span className="mr-2">📧</span>
                info@boxeomax.com
              </p>
              <p className="flex items-center">
                <span className="mr-2">📍</span>
                Caracas, Venezuela
              </p>
              <p className="flex items-center">
                <span className="mr-2">🕒</span>
                Lun-Vie: 8AM-6PM
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-gold-500">Enlaces Rápidos</h4>
            <div className="space-y-2">
              <a href="#" className="block text-gray-400 hover:text-gold-500 transition-colors">
                Sobre Nosotros
              </a>
              <a href="#" className="block text-gray-400 hover:text-gold-500 transition-colors">
                Política de Envíos
              </a>
              <a href="#" className="block text-gray-400 hover:text-gold-500 transition-colors">
                Política de Devoluciones
              </a>
              <a href="#" className="block text-gray-400 hover:text-gold-500 transition-colors">
                Términos y Condiciones
              </a>
              <a href="#" className="block text-gray-400 hover:text-gold-500 transition-colors">
                Política de Privacidad
              </a>
            </div>
          </div>

          {/* Payment & Social */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-gold-500">Síguenos</h4>
            <div className="flex space-x-4">
              <a href="#" className="bg-blue-600 p-2 rounded-full hover:bg-blue-700 transition-colors">
                <span className="text-white">📘</span>
              </a>
              <a href="#" className="bg-pink-500 p-2 rounded-full hover:bg-pink-600 transition-colors">
                <span className="text-white">📷</span>
              </a>
              <a href="#" className="bg-green-500 p-2 rounded-full hover:bg-green-600 transition-colors">
                <span className="text-white">💬</span>
              </a>
            </div>

            <div className="space-y-2">
              <h5 className="font-semibold">Métodos de Pago</h5>
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="bg-gray-800 px-2 py-1 rounded">💳 Zelle</span>
                <span className="bg-gray-800 px-2 py-1 rounded">📱 Pago Móvil</span>
                <span className="bg-gray-800 px-2 py-1 rounded">🏦 Transferencia</span>
                <span className="bg-gray-800 px-2 py-1 rounded">₿ Binance</span>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <h4 className="text-xl font-bold text-center mb-8 text-gold-500">
            Lo que dicen nuestros clientes
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gold-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">M</span>
                </div>
                <div className="ml-3">
                  <h5 className="font-semibold">Miguel Rodríguez</h5>
                  <div className="text-yellow-400">⭐⭐⭐⭐⭐</div>
                </div>
              </div>
              <p className="text-gray-400">
                "Excelente calidad en los guantes, llegaron súper rápido. El mejor precio del mercado."
              </p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gold-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">A</span>
                </div>
                <div className="ml-3">
                  <h5 className="font-semibold">Ana García</h5>
                  <div className="text-yellow-400">⭐⭐⭐⭐⭐</div>
                </div>
              </div>
              <p className="text-gray-400">
                "Perfectos para mi entrenamiento de kickboxing. Atención al cliente impecable."
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gold-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">L</span>
                </div>
                <div className="ml-3">
                  <h5 className="font-semibold">Luis Fernández</h5>
                  <div className="text-yellow-400">⭐⭐⭐⭐⭐</div>
                </div>
              </div>
              <p className="text-gray-400">
                "Como entrenador profesional, recomiendo totalmente sus productos. Calidad garantizada."
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="bg-black py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
            <p className="text-gray-400 text-sm">
              © 2024 BoxeoMax. Todos los derechos reservados.
            </p>
            <p className="text-gray-400 text-sm mt-2 md:mt-0">
              🚚 Envíos gratis en compras mayores a $50 | 🔒 Compra 100% segura
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
