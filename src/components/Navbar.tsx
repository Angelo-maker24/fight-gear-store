
export default function Navbar() {
  return (
    <nav className="bg-background text-primary flex justify-between items-center p-4 shadow-md">
      <div className="text-2xl font-semibold">Atelier Abstract</div>
      <ul className="flex space-x-4">
        <li>Inicio</li>
        <li>Galería</li>
        <li>Sobre Nosotros</li>
        <li>Contacto</li>
      </ul>
    </nav>
  );
}
