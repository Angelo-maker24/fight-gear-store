
import { useState, useEffect } from 'react';
import { useCategories } from '@/hooks/useCategories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Product } from '@/hooks/useProducts';

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  onSuccess: () => void;
}

export const ProductForm = ({ isOpen, onClose, product, onSuccess }: ProductFormProps) => {
  const { categories } = useCategories();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    original_price: '',
    category_id: '',
    stock: '',
    is_on_sale: false,
    is_active: true,
    image_url: ''
  });

  // Función para validar y limpiar datos numéricos antes de enviar a Supabase
  const validateNumericField = (value: string | number | null | undefined): number => {
    if (value === null || value === undefined || value === '' || isNaN(Number(value))) {
      return 0;
    }
    return Number(value);
  };

  // Función para limpiar strings y evitar valores null/undefined
  const cleanStringField = (value: string | null | undefined): string | null => {
    if (!value || value.trim() === '') {
      return null;
    }
    return value.trim();
  };

  useEffect(() => {
    if (product) {
      // Cargar datos del producto existente
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '0',
        original_price: product.original_price?.toString() || '',
        category_id: product.category_id || '',
        stock: product.stock?.toString() || '0',
        is_on_sale: product.is_on_sale || false,
        is_active: product.is_active ?? true,
        image_url: product.image_url || ''
      });
    } else {
      // Resetear formulario para nuevo producto
      setFormData({
        name: '',
        description: '',
        price: '',
        original_price: '',
        category_id: '',
        stock: '',
        is_on_sale: false,
        is_active: true,
        image_url: ''
      });
    }
  }, [product, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Preparar datos con validación numérica y limpieza de strings
      const productData = {
        name: cleanStringField(formData.name) || 'Producto sin nombre',
        description: cleanStringField(formData.description),
        price: validateNumericField(formData.price),
        original_price: formData.original_price ? validateNumericField(formData.original_price) : null,
        category_id: formData.category_id || null,
        stock: validateNumericField(formData.stock),
        is_on_sale: formData.is_on_sale,
        is_active: formData.is_active,
        image_url: cleanStringField(formData.image_url),
        updated_at: new Date().toISOString()
      };

      console.log('Enviando datos del producto:', productData);

      let error;

      if (product) {
        // Actualizar producto existente
        const result = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);
        error = result.error;
        console.log('Resultado actualización:', result);
      } else {
        // Crear nuevo producto
        const result = await supabase
          .from('products')
          .insert([productData]);
        error = result.error;
        console.log('Resultado inserción:', result);
      }

      if (error) {
        console.error('Error en operación Supabase:', error);
        throw error;
      }

      toast.success(product ? 'Producto actualizado exitosamente' : 'Producto creado exitosamente');
      onSuccess();
    } catch (error: any) {
      console.error('Error completo:', error);
      toast.error('Error al guardar producto: ' + (error?.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* Corregir accesibilidad: agregar aria-describedby */}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="product-form-description">
        <DialogHeader>
          <DialogTitle>
            {product ? 'Editar Producto' : 'Agregar Nuevo Producto'}
          </DialogTitle>
          <p id="product-form-description" className="text-sm text-gray-600">
            {product ? 'Modifica los datos del producto seleccionado' : 'Completa la información para crear un nuevo producto'}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Fila 1: Nombre y Categoría */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nombre del Producto *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombre del producto"
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Categoría *</Label>
              <Select 
                value={formData.category_id} 
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Descripción del producto"
            />
          </div>

          {/* Fila 2: Precios y Stock */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="price">Precio ($) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <Label htmlFor="original_price">Precio Original ($)</Label>
              <Input
                id="original_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.original_price}
                onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="stock">Stock *</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="0"
                required
              />
            </div>
          </div>

          {/* URL de Imagen */}
          <div>
            <Label htmlFor="image_url">URL de Imagen</Label>
            <Input
              id="image_url"
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          </div>

          {/* Checkboxes */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_on_sale"
                checked={formData.is_on_sale}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, is_on_sale: checked as boolean })
                }
              />
              <Label htmlFor="is_on_sale">En oferta</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, is_active: checked as boolean })
                }
              />
              <Label htmlFor="is_active">Producto activo</Label>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : (product ? 'Actualizar' : 'Crear Producto')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
