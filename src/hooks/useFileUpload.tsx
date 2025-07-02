import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseFileUploadProps {
  bucket: string;
  folder?: string;
}

export const useFileUpload = ({ bucket, folder }: UseFileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  
  const uploadFile = async (file: File): Promise<string | null> => {
    if (!file) {
      toast.error('No se ha seleccionado ningún archivo');
      return null;
    }

    // Validar tamaño del archivo (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('El archivo es demasiado grande. Máximo 5MB');
      return null;
    }

    // Validar tipo de archivo (solo imágenes)
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten archivos de imagen');
      return null;
    }

    setUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      console.log('Subiendo archivo:', filePath, 'al bucket:', bucket);

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        console.error('Error al subir archivo:', error);
        toast.error('Error al subir el archivo: ' + error.message);
        return null;
      }

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      console.log('Archivo subido exitosamente:', urlData.publicUrl);
      toast.success('Archivo subido exitosamente');
      
      return urlData.publicUrl;
    } catch (error: any) {
      console.error('Error inesperado al subir archivo:', error);
      toast.error('Error inesperado al subir el archivo');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (filePath: string): Promise<boolean> => {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) {
        console.error('Error al eliminar archivo:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error inesperado al eliminar archivo:', error);
      return false;
    }
  };

  return {
    uploadFile,
    deleteFile,
    uploading
  };
};
