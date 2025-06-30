
import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { ProductGrid } from '@/components/ProductGrid';
import { Cart } from '@/components/Cart';
import { Footer } from '@/components/Footer';
import { AuthModal } from '@/components/AuthModal';

const Index = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const handleAuthOpen = () => {
    setIsAuthOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        onCartOpen={() => setIsCartOpen(true)}
        onAuthOpen={handleAuthOpen}
        onCategorySelect={setSelectedCategory}
        selectedCategory={selectedCategory}
      />
      
      <Hero />
      
      <ProductGrid selectedCategory={selectedCategory} />
      
      <Footer />
      
      <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />
      
      <AuthModal 
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </div>
  );
};

export default Index;
