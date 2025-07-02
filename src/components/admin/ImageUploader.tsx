
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useFileUpload } from '@/hooks/useFileUpload';
import { Upload, X, Image } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploaderProps {
  currentImageUrl?: string;
  onImageUploaded: (imageUrl: string) => void;
  onImageRemoved: () => void;
  disabled?: boolean;
}

export const ImageUploader = ({ 
  currentImageUrl, 
  onImageUploaded, 
  onImageRemoved,
  disabled = false 
}: ImageUploaderProps) => {
  const { uploadFile, uploading } = useFileUpload({ bucket: 'products', folder: 'product-images' });
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);

  // Manejar selección de archivo
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('Archivo seleccionado:', file.name, file.size, file.type);

    try {
      // Crear preview inmediato
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Subir archivo
      const uploadedUrl = await uploadFile(file);
      if (uploadedUrl) {
        console.log('Imagen subida exitosamente:', uploadedUrl);
        onImageUploaded(uploadedUrl);
        setPreviewUrl(uploadedUrl);
      } else {
        // Si falla la subida, remover preview
        setPreviewUrl(currentImageUrl || null);
        toast.error('Error al subir la imagen');
      }
    } catch (error) {
      console.error('Error al procesar imagen:', error);
      setPreviewUrl(currentImageUrl || null);
      toast.error('Error al procesar la imagen');
    }

    // Limpiar input
    event.target.value = '';
  };

  // Remover imagen
  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onImageRemoved();
  };

  return (
    <div className="space-y-4">
      {/* Vista previa de la imagen */}
      {previewUrl ? (
        <div className="relative group">
          <img
            src={previewUrl}
            alt="Vista previa del producto"
            className="w-full max-w-sm mx-auto rounded-lg border object-cover"
            style={{ maxHeight: '300px' }}
          />
          {!disabled && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              disabled={uploading}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      ) : (
        /* Área de subida */
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="image-upload"
            disabled={disabled || uploading}
          />
          
          {!disabled && (
            <label htmlFor="image-upload" className="cursor-pointer">
              <div className="space-y-4">
                <div className="flex justify-center">
                  {uploading ? (
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Image className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                
                <div>
                  <p className="text-lg font-medium text-gray-700">
                    {uploading ? 'Subiendo imagen...' : 'Subir imagen del producto'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    PNG, JPG hasta 5MB
                  </p>
                </div>
                
                {!uploading && (
                  <Button type="button" variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Seleccionar Imagen
                  </Button>
                )}
              </div>
            </label>
          )}
          
          {disabled && (
            <div className="space-y-4">
              <Image className="w-12 h-12 text-gray-400 mx-auto" />
              <p className="text-gray-500">Sin imagen</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
