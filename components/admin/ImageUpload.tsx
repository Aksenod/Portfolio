'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { getStaticPath } from '@/lib/utils/paths';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label: string;
  required?: boolean;
  placeholder?: string;
}

export function ImageUpload({
  value,
  onChange,
  label,
  required = false,
  placeholder = '/images/image.jpg',
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Проверка валидности пути к изображению
  const isValidImagePath = (path: string): boolean => {
    if (!path || !path.trim()) return false;
    const trimmedPath = path.trim();
    // Проверяем, что путь начинается с /images/ или является валидным URL
    // Также разрешаем пути, начинающиеся с /, но только если они не пустые
    return trimmedPath.startsWith('/images/') || 
           trimmedPath.startsWith('http://') || 
           trimmedPath.startsWith('https://') ||
           (trimmedPath.startsWith('/') && trimmedPath.length > 1);
  };

  // Генерируем URL из имени файла
  const generateUrlFromFileName = (fileName: string): string => {
    // Убираем расширение
    const ext = fileName.substring(fileName.lastIndexOf('.'));
    const baseName = fileName.substring(0, fileName.lastIndexOf('.'));
    
    // Очищаем имя файла
    const cleanName = baseName
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    return `/images/${cleanName}${ext}`;
  };

  const handleFile = async (file: File) => {
    // Проверяем тип файла
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Недопустимый тип файла. Разрешены: JPEG, PNG, WebP, GIF');
      return;
    }

    // Проверяем размер файла (максимум 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError('Размер файла превышает 10MB');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Получаем basePath для правильного пути к API
      const basePath = typeof window !== 'undefined' 
        ? (process.env.NEXT_PUBLIC_BASE_PATH || '/Portfolio')
        : '/Portfolio';
      
      const response = await fetch(`${basePath}/api/admin/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data?.url) {
        // Автоматически устанавливаем URL из результата загрузки
        // API возвращает путь без basePath (например, /images/file.jpg)
        // При отображении будет использоваться getStaticPath для добавления basePath
        const imageUrl = result.data.url;
        
        // Проверяем, что URL валидный (не пустой и не только расширение)
        const invalidPatterns = ['/images/.jpg', '/images/.png', '/images/.webp', '/images/.gif', '/images/.jpeg'];
        if (!imageUrl || invalidPatterns.includes(imageUrl.toLowerCase())) {
          setError('Ошибка: не удалось сгенерировать корректное имя файла. Попробуйте переименовать файл перед загрузкой.');
          console.error('Invalid image URL generated:', imageUrl);
          setIsUploading(false);
          return;
        }
        
        console.log('Image uploaded successfully:', imageUrl);
        onChange(imageUrl);
        setError(null); // Очищаем ошибки при успехе
      } else {
        const errorMessage = result.error || 'Ошибка загрузки файла';
        setError(errorMessage);
        console.error('Upload error:', result);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки файла';
      setError(errorMessage);
      console.error('Upload exception:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <label className="block text-foreground/80 text-sm font-medium mb-2">
        {label} {required && '*'}
      </label>

      {/* Drag and Drop зона */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          relative border-2 border-dashed rounded cursor-pointer transition-colors min-h-[200px]
          ${isDragging 
            ? 'border-accent bg-accent/10' 
            : 'border-border-base/20 hover:border-border-base/50'
          }
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isUploading}
        />

        {/* Превью загруженного изображения */}
        {value && value.trim() && isValidImagePath(value) && !isUploading ? (
          <div className="relative w-full h-full min-h-[200px] p-2">
            <div className="w-full h-full rounded overflow-hidden border border-border-base/20 bg-base-secondary">
              <img
                src={value.startsWith('/') ? getStaticPath(value) : value}
                alt="Preview"
                className="w-full h-full object-contain max-h-[300px] mx-auto"
                onError={(e) => {
                  // Если изображение не загружается, показываем ошибку через состояние
                  const imagePath = value.startsWith('/') ? getStaticPath(value) : value;
                  console.error('Image load error:', value, 'Tried path:', imagePath);
                  setError('Изображение не найдено. Проверьте путь к файлу.');
                }}
                onLoad={() => {
                  // Очищаем ошибку при успешной загрузке
                  if (error === 'Изображение не найдено. Проверьте путь к файлу.') {
                    setError(null);
                  }
                }}
              />
            </div>
            <div className="absolute top-4 right-4 bg-base/80 backdrop-blur-sm px-3 py-1 rounded text-xs text-foreground/80">
              Нажмите для замены
            </div>
          </div>
        ) : (
          <div className="p-6 text-center">
            {isUploading ? (
              <div className="text-foreground/60 text-sm">Загрузка...</div>
            ) : (
              <>
                <div className="text-foreground/60 text-sm mb-2">
                  Перетащите изображение сюда или нажмите для выбора
                </div>
                <div className="text-foreground/40 text-xs">
                  JPEG, PNG, WebP, GIF (макс. 10MB)
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Поле для ввода/редактирования URL */}
      <div className="mt-3">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            const newValue = e.target.value;
            onChange(newValue);
            // Очищаем ошибку при изменении значения
            // Но если путь невалидный и не пустой, не показываем ошибку сразу
            // (ошибка появится только при попытке загрузить изображение)
            if (!newValue || !newValue.trim() || isValidImagePath(newValue)) {
              setError(null);
            }
          }}
          onBlur={(e) => {
            // При потере фокуса проверяем валидность пути, если он заполнен
            const trimmedValue = e.target.value.trim();
            if (trimmedValue && !isValidImagePath(trimmedValue)) {
              setError('Некорректный путь к изображению. Путь должен начинаться с /images/ или быть валидным URL.');
            }
          }}
          className="w-full bg-base-secondary border border-border-base/20 px-4 py-3 rounded text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-focus-ring/50 focus:border-accent transition-colors"
          placeholder={placeholder}
          required={required}
          disabled={isUploading}
        />
        {error && (
          <div className="mt-2 text-sm text-red-500">{error}</div>
        )}
        {value && (
          <div className="mt-2 text-xs text-foreground/60">
            URL будет автоматически сгенерирован из имени файла при загрузке
          </div>
        )}
      </div>
    </div>
  );
}
