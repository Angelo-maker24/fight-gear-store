
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ImageUploader } from './ImageUploader';
import { useCategories } from '@/hooks/useCategories';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Product } from '@/hooks/useProducts';

// Schema de validación para el formulario de producto
const productSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  description: z.string().optional(),
  price: z.string().min(1, 'El precio es obligatorio'),
  original_price: z.string().optional(),
  category_id: z.string().min(1, 'La categoría es obligatoria'),
  stock: z.string().min(0, 'El stock debe ser mayor o igual a 0').default('0'),
  is_active: z.boolean().default(true),
  is_on_sale: z.boolean().default(false),
  image_url: z.string().optional()
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  onSuccess: () => void;
}

export const ProductForm = ({ isOpen, onClose, product, onSuccess }: ProductFormProps) => {
  const { categories } = useCategories();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');

  // Configurar formulario con react-hook-form
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: '',
      original_price: '',
      category_id: '',
      stock: '0',
      is_active: true,
      is_on_sale: false,
      image_url: ''
    }
  });

  // Actualizar formulario cuando cambie el producto
  useEffect(() => {
    if (product) {
      console.log('Editando producto:', product);
      form.reset({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        original_price: product.original_price?.toString() || '',
        category_id: product.category_id || '',
        stock: product.stock?.toString() || '0',
        is_active: product.is_active ?? true,
        is_on_sale: product.is_on_sale ?? false,
        image_url: product.image_url || ''
      });
      setImageUrl(product.image_url || '');
    } else {
      console.log('Creando nuevo producto');
      form.reset({
        name: '',
        description: '',
        price: '',
        original_price: '',
        category_id: '',
        stock: '0',
        is_active: true,
        is_on_sale: false,
        image_url: ''
      });
      setImageUrl('');
    }
  }, [product, form]);

  // Manejar cambios en la imagen
  const handleImageUploaded = (url: string) => {
    console.log('Nueva imagen subida:', url);
    setImageUrl(url);
    form.setValue('image_url', url);
  };

  const handleImageRemoved = () => {
    console.log('Imagen removida');
    setImageUrl('');
    form.setValue('image_url', '');
  };

  // Validar datos numéricos
  const validateNumericField = (value: string | undefined): number => {
    if (!value || value.trim() === '' || isNaN(Number(value))) {
      return 0;
    }
    return Number(value);
  };

  // Enviar formulario
  const onSubmit = async (data: ProductFormData) => {
    setLoading(true);
    
    try {
      console.log('Enviando datos del producto:', data);

      // Preparar datos para inserción/actualización
      const productData = {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        price: validateNumericField(data.price),
        original_price: data.original_price ? validateNumericField(data.original_price) : null,
        category_id: data.category_id,
        stock: validateNumericField(data.stock),
        is_active: data.is_active,
        is_on_sale: data.is_on_sale,
        image_url: imageUrl || null,
        updated_at: new Date().toISOString()
      };

      console.log('Datos preparados para Supabase:', productData);

      let result;
      if (product) {
        // Actualizar producto existente
        console.log('Actualizando producto existente:', product.id);
        result = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id)
          .select()
          .single();
      } else {
        // Crear nuevo producto
        console.log('Creando nuevo producto');
        result = await supabase
          .from('products')
          .insert([productData])
          .select()
          .single();
      }

      if (result.error) {
        console.error('Error en operación de producto:', result.error);
        throw result.error;
      }

      console.log('Producto guardado exitosamente:', result.data);
      toast.success(product ? 'Producto actualizado exitosamente' : 'Producto creado exitosamente');
      onSuccess();
      onClose();
      
    } catch (error: any) {
      console.error('Error completo al guardar producto:', error);
      toast.error('Error al guardar producto: ' + (error?.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="product-form-description">
        <DialogHeader>
          <DialogTitle>
            {product ? 'Editar Producto' : 'Agregar Nuevo Producto'}
          </DialogTitle>
          <DialogDescription id="product-form-description">
            {product ? 'Modifica los datos del producto' : 'Completa la información del nuevo producto'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Subida de imagen */}
            <div className="space-y-2">
              <FormLabel>Imagen del Producto</FormLabel>
              <ImageUploader
                currentImageUrl={imageUrl}
                onImageUploaded={handleImageUploaded}
                onImageRemoved={handleImageRemoved}
                disabled={loading}
              />
            </div>

            {/* Nombre del producto */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Producto *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del producto..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Descripción */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descripción del producto..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Precio */}
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio (USD) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Precio original (para ofertas) */}
              <FormField
                control={form.control}
                name="original_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio Original (USD)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Solo si el producto está en oferta
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Categoría */}
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Stock */}
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        placeholder="0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Checkboxes */}
            <div className="flex items-center space-x-6">
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Producto Activo</FormLabel>
                      <FormDescription>
                        El producto aparecerá en la tienda
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_on_sale"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>En Oferta</FormLabel>
                      <FormDescription>
                        Mostrar como producto en oferta
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-4 pt-6">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Guardando...' : (product ? 'Actualizar' : 'Crear Producto')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
