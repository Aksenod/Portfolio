'use client';

import { useEffect, useState } from 'react';
import type { Case } from '@/lib/api/types';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { getBasePath } from '@/lib/utils/paths';
import { generateSlug } from '@/lib/utils/slug';

type ViewMode = 'list' | 'create' | 'edit' | 'animation';

interface AnimationConfigData {
  animationImages: [string, string, string, string, string];
  heroImage: string;
  heading: {
    line1: string;
    line2: string;
    line3: string;
  };
}

export default function AdminPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Форма
  const [formData, setFormData] = useState<Partial<Case>>({
    title: '',
    slug: '',
    year: new Date().getFullYear(),
    techStack: [],
    previewImage: '',
    heroImage: '',
    caseType: '',
    screenshotBlocks: [{ title: '', images: [''] }],
    published: false,
  });

  const [techStackInput, setTechStackInput] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);

  // Конфигурация анимации
  const [animationConfig, setAnimationConfig] = useState<AnimationConfigData>({
    animationImages: ['', '', '', '', ''],
    heroImage: '',
    heading: {
      line1: '',
      line2: '',
      line3: '',
    },
  });
  const [loadingAnimationConfig, setLoadingAnimationConfig] = useState(false);

  // Загрузка кейсов
  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      setLoading(true);
      const basePath = getBasePath();
      const response = await fetch(`${basePath}/api/admin/cases`);
      const result = await response.json();
      if (result.success) {
        setCases(result.data || []);
      } else {
        setError(result.error || 'Ошибка загрузки кейсов');
      }
    } catch (err) {
      console.error('Error loading cases:', err);
      setError('Ошибка загрузки кейсов');
    } finally {
      setLoading(false);
    }
  };

  // Режим создания
  const handleCreate = () => {
    setFormData({
      title: '',
      slug: '',
      year: new Date().getFullYear(),
      techStack: [],
      previewImage: '',
      heroImage: '',
      caseType: '',
      screenshotBlocks: [{ title: '', images: [''] }],
      published: false,
    });
    setTechStackInput('');
    setEditingCase(null);
    setViewMode('create');
    setError(null);
    setSuccess(null);
  };

  // Режим редактирования
  const handleEdit = async (id: string) => {
    try {
      setLoading(true);
      const basePath = getBasePath();
      const response = await fetch(`${basePath}/api/admin/cases/${id}`);
      const result = await response.json();
      if (result.success) {
        const caseData = result.data;
        setEditingCase(caseData);
        setFormData(caseData);
        setTechStackInput('');
        setViewMode('edit');
        setError(null);
        setSuccess(null);
      } else {
        setError(result.error || 'Ошибка загрузки кейса');
      }
    } catch (err) {
      console.error('Error loading case:', err);
      setError('Ошибка загрузки кейса');
    } finally {
      setLoading(false);
    }
  };

  // Удаление
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Вы уверены, что хотите удалить кейс "${title}"?`)) {
      return;
    }

    try {
      setLoadingAction(true);
      const basePath = getBasePath();
      const response = await fetch(`${basePath}/api/admin/cases/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        setSuccess('Кейс успешно удален');
        loadCases();
      } else {
        setError(result.error || 'Ошибка удаления кейса');
      }
    } catch (err) {
      console.error('Error deleting case:', err);
      setError('Ошибка удаления кейса');
    } finally {
      setLoadingAction(false);
    }
  };

  // Добавление технологии
  const addTechStack = () => {
    if (techStackInput.trim()) {
      setFormData({
        ...formData,
        techStack: [...(formData.techStack || []), techStackInput.trim()],
      });
      setTechStackInput('');
    }
  };

  // Удаление технологии
  const removeTechStack = (index: number) => {
    setFormData({
      ...formData,
      techStack: formData.techStack?.filter((_, i) => i !== index) || [],
    });
  };

  // Добавление блока скриншотов
  const addScreenshotBlock = () => {
    setFormData({
      ...formData,
      screenshotBlocks: [
        ...(formData.screenshotBlocks || []),
        { title: '', images: [''] },
      ],
    });
  };

  // Удаление блока скриншотов
  const removeScreenshotBlock = (index: number) => {
    const newBlocks = formData.screenshotBlocks?.filter((_, i) => i !== index) || [];
    if (newBlocks.length === 0) {
      newBlocks.push({ title: '', images: [''] });
    }
    setFormData({
      ...formData,
      screenshotBlocks: newBlocks,
    });
  };

  // Обновление блока скриншотов
  const updateScreenshotBlock = (blockIndex: number, field: 'title' | 'images', value: string | string[]) => {
    const newBlocks = [...(formData.screenshotBlocks || [])];
    newBlocks[blockIndex] = {
      ...newBlocks[blockIndex],
      [field]: value,
    };
    setFormData({
      ...formData,
      screenshotBlocks: newBlocks,
    });
  };

  // Добавление изображения в блок
  const addImageToBlock = (blockIndex: number) => {
    const newBlocks = [...(formData.screenshotBlocks || [])];
    newBlocks[blockIndex].images.push('');
    setFormData({
      ...formData,
      screenshotBlocks: newBlocks,
    });
  };

  // Удаление изображения из блока
  const removeImageFromBlock = (blockIndex: number, imageIndex: number) => {
    const newBlocks = [...(formData.screenshotBlocks || [])];
    const newImages = newBlocks[blockIndex].images.filter((_, i) => i !== imageIndex);
    if (newImages.length === 0) {
      newImages.push('');
    }
    newBlocks[blockIndex].images = newImages;
    setFormData({
      ...formData,
      screenshotBlocks: newBlocks,
    });
  };

  // Обновление изображения в блоке
  const updateImageInBlock = (blockIndex: number, imageIndex: number, value: string) => {
    const newBlocks = [...(formData.screenshotBlocks || [])];
    newBlocks[blockIndex].images[imageIndex] = value;
    setFormData({
      ...formData,
      screenshotBlocks: newBlocks,
    });
  };

  // Валидация для опубликованных кейсов
  const validatePublishedCase = (): string | null => {
    // Slug теперь генерируется автоматически, поэтому не проверяем его
    if (!formData.title || !formData.year || !formData.techStack || formData.techStack.length === 0 || !formData.previewImage || !formData.heroImage) {
      return 'Заполните все обязательные поля';
    }

    if (!formData.screenshotBlocks || formData.screenshotBlocks.length === 0) {
      return 'Добавьте хотя бы один блок скриншотов';
    }

    for (const block of formData.screenshotBlocks) {
      if (!block.title || block.images.length === 0 || block.images.some(img => !img.trim())) {
        return 'Каждый блок скриншотов должен иметь название и хотя бы одно изображение';
      }
    }

    return null;
  };

  // Сохранение (опубликованный или черновик)
  const handleSave = async (asDraft: boolean = false) => {
    setLoadingAction(true);
    setError(null);
    setSuccess(null);

    try {
      const basePath = getBasePath();
      const url = editingCase
        ? `${basePath}/api/admin/cases/${editingCase.id}`
        : `${basePath}/api/admin/cases`;
      const method = editingCase ? 'PUT' : 'POST';

      // Устанавливаем статус публикации
      const dataToSave = {
        ...formData,
        published: !asDraft,
      };

      // Валидация только для опубликованных кейсов
      if (!asDraft) {
        const validationError = validatePublishedCase();
        if (validationError) {
          setError(validationError);
          setLoadingAction(false);
          return;
        }
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSave),
      });

      const result = await response.json();

      if (result.success) {
        if (asDraft) {
          setSuccess(editingCase ? 'Черновик успешно обновлен' : 'Черновик успешно создан');
        } else {
          setSuccess(editingCase ? 'Кейс успешно обновлен' : 'Кейс успешно создан');
        }
        setViewMode('list');
        loadCases();
      } else {
        setError(result.error || 'Ошибка сохранения кейса');
      }
    } catch (err) {
      console.error('Error saving case:', err);
      setError('Ошибка сохранения кейса');
    } finally {
      setLoadingAction(false);
    }
  };

  // Сохранение (для формы)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Сохраняем с учетом статуса чекбокса published
    await handleSave(!formData.published);
  };

  // Сохранение как черновик
  const handleSaveDraft = async (e: React.MouseEvent) => {
    e.preventDefault();
    await handleSave(true);
  };

  // Отмена
  const handleCancel = () => {
    setViewMode('list');
    setEditingCase(null);
    setError(null);
    setSuccess(null);
  };

  // Загрузка конфигурации анимации
  const loadAnimationConfig = async () => {
    try {
      setLoadingAnimationConfig(true);
      const basePath = getBasePath();
      const response = await fetch(`${basePath}/api/admin/animation-config`);
      const result = await response.json();
      if (result.success && result.data) {
        setAnimationConfig(result.data);
      } else if (result.success && !result.data) {
        // Если конфигурации нет, используем значения по умолчанию из config.ts
        // Но для админки оставляем пустые значения, чтобы пользователь мог их заполнить
        setAnimationConfig({
          animationImages: ['', '', '', '', ''],
          heroImage: '',
          heading: {
            line1: '',
            line2: '',
            line3: '',
          },
        });
      } else {
        setError(result.error || 'Ошибка загрузки конфигурации анимации');
      }
    } catch (err) {
      console.error('Error loading animation config:', err);
      setError('Ошибка загрузки конфигурации анимации');
    } finally {
      setLoadingAnimationConfig(false);
    }
  };

  // Сохранение конфигурации анимации
  const handleSaveAnimationConfig = async () => {
    setLoadingAction(true);
    setError(null);
    setSuccess(null);

    try {
      // Валидация
      if (animationConfig.animationImages.some(img => !img || !img.trim())) {
        setError('Все изображения для анимации должны быть заполнены');
        setLoadingAction(false);
        return;
      }

      if (!animationConfig.heading.line1 || !animationConfig.heading.line2 || !animationConfig.heading.line3) {
        setError('Все строки заголовка должны быть заполнены');
        setLoadingAction(false);
        return;
      }

      const basePath = getBasePath();
      const response = await fetch(`${basePath}/api/admin/animation-config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(animationConfig),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Конфигурация анимации успешно сохранена');
        setViewMode('list');
      } else {
        setError(result.error || 'Ошибка сохранения конфигурации анимации');
      }
    } catch (err) {
      console.error('Error saving animation config:', err);
      setError('Ошибка сохранения конфигурации анимации');
    } finally {
      setLoadingAction(false);
    }
  };

  // Открытие формы управления анимацией
  const handleOpenAnimationConfig = () => {
    setError(null);
    setSuccess(null);
    setViewMode('animation');
    loadAnimationConfig();
  };

  // Форма управления анимацией
  if (viewMode === 'animation') {
    return (
      <main className="min-h-screen bg-base py-12 px-6 md:px-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-foreground text-3xl md:text-4xl font-bold tracking-tight mb-2">
              Управление анимацией
            </h1>
            <p className="text-foreground/60 text-base">
              Настройка изображений для анимации и главного экрана
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded text-foreground">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded text-foreground">
              {success}
            </div>
          )}

          {loadingAnimationConfig ? (
            <div className="text-foreground/60 text-center py-12">Загрузка...</div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); handleSaveAnimationConfig(); }} className="space-y-8">
              {/* Изображения для анимации */}
              <div className="space-y-6 border border-border-base/20 p-6 rounded">
                <h2 className="text-foreground text-xl font-semibold tracking-tight mb-4">
                  Изображения для анимации (5 шт.)
                </h2>
                <p className="text-foreground/60 text-sm mb-4">
                  Порядок изображений: [-2, -1, 0 (центральное), +1, +2]
                </p>
                
                <div className="space-y-4">
                  {animationConfig.animationImages.map((image, index) => (
                    <div key={index}>
                      <ImageUpload
                        value={image}
                        onChange={(url) => {
                          const newImages = [...animationConfig.animationImages] as [string, string, string, string, string];
                          newImages[index] = url;
                          setAnimationConfig({
                            ...animationConfig,
                            animationImages: newImages,
                            // Автоматически обновляем heroImage при изменении центрального изображения (индекс 2)
                            heroImage: index === 2 ? url : animationConfig.heroImage,
                          });
                        }}
                        label={`Изображение ${index === 2 ? '(центральное)' : index < 2 ? `(${index - 2})` : `(+${index - 2})`}`}
                        required
                        placeholder={`/images/photo-${index + 1}.webp`}
                      />
                      {index === 2 && (
                        <p className="mt-2 text-xs text-foreground/60">
                          Это изображение также используется на главном экране
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Изображение для главного экрана (синхронизировано с центральным) */}
              <div className="space-y-6 border border-border-base/20 p-6 rounded">
                <h2 className="text-foreground text-xl font-semibold tracking-tight mb-4">
                  Изображение для главного экрана
                </h2>
                <p className="text-foreground/60 text-sm mb-4">
                  Автоматически синхронизировано с центральным изображением анимации. 
                  Можно изменить вручную, если нужно использовать другое изображение.
                </p>
                
                <ImageUpload
                  value={animationConfig.heroImage}
                  onChange={(url) => {
                    setAnimationConfig({
                      ...animationConfig,
                      heroImage: url,
                      // Также обновляем центральное изображение в анимации
                      animationImages: [
                        ...animationConfig.animationImages.slice(0, 2),
                        url,
                        ...animationConfig.animationImages.slice(3),
                      ] as [string, string, string, string, string],
                    });
                  }}
                  label="Главное изображение (Hero)"
                  required
                  placeholder="/images/photo-3.webp"
                />
              </div>

              {/* Заголовок */}
              <div className="space-y-6 border border-border-base/20 p-6 rounded">
                <h2 className="text-foreground text-xl font-semibold tracking-tight mb-4">
                  Заголовок для hero-секции
                </h2>
                
                <div>
                  <label className="block text-foreground/80 text-sm font-medium mb-2">
                    Строка 1 *
                  </label>
                  <input
                    type="text"
                    value={animationConfig.heading.line1}
                    onChange={(e) =>
                      setAnimationConfig({
                        ...animationConfig,
                        heading: {
                          ...animationConfig.heading,
                          line1: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-base-secondary border border-border-base/20 px-4 py-3 rounded text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-focus-ring/50 focus:border-accent transition-colors"
                    placeholder="PRODUCT"
                    required
                  />
                </div>

                <div>
                  <label className="block text-foreground/80 text-sm font-medium mb-2">
                    Строка 2 *
                  </label>
                  <input
                    type="text"
                    value={animationConfig.heading.line2}
                    onChange={(e) =>
                      setAnimationConfig({
                        ...animationConfig,
                        heading: {
                          ...animationConfig.heading,
                          line2: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-base-secondary border border-border-base/20 px-4 py-3 rounded text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-focus-ring/50 focus:border-accent transition-colors"
                    placeholder="DESIGNER&"
                    required
                  />
                </div>

                <div>
                  <label className="block text-foreground/80 text-sm font-medium mb-2">
                    Строка 3 *
                  </label>
                  <input
                    type="text"
                    value={animationConfig.heading.line3}
                    onChange={(e) =>
                      setAnimationConfig({
                        ...animationConfig,
                        heading: {
                          ...animationConfig.heading,
                          line3: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-base-secondary border border-border-base/20 px-4 py-3 rounded text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-focus-ring/50 focus:border-accent transition-colors"
                    placeholder="VIBECODER"
                    required
                  />
                </div>
              </div>

              {/* Кнопки */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loadingAction}
                  className="bg-accent hover:bg-accent-hover text-white font-medium py-3 px-6 rounded focus:outline-none focus:ring-2 focus:ring-focus-ring/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingAction ? 'Сохранение...' : 'Сохранить'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('list');
                    setError(null);
                    setSuccess(null);
                  }}
                  className="bg-base-secondary hover:bg-base-secondary/80 border border-border-base/20 text-foreground font-medium py-3 px-6 rounded focus:outline-none focus:ring-2 focus:ring-focus-ring/50 transition-colors"
                >
                  Отмена
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    );
  }

  if (viewMode === 'create' || viewMode === 'edit') {
    return (
      <main className="min-h-screen bg-base py-12 px-6 md:px-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-foreground text-3xl md:text-4xl font-bold tracking-tight mb-2">
              {editingCase ? 'Редактировать кейс' : 'Создать новый кейс'}
            </h1>
            <p className="text-foreground/60 text-base">
              {editingCase ? 'Обновите информацию о кейсе' : 'Заполните форму для создания нового кейса'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded text-foreground">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded text-foreground">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Основные поля */}
            <div className="space-y-6 border border-border-base/20 p-6 rounded">
              <h2 className="text-foreground text-xl font-semibold tracking-tight">Основная информация</h2>
              
              <div>
                <label className="block text-foreground/80 text-sm font-medium mb-2">
                  Название проекта {formData.published && '*'}
                </label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    // Автоматически генерируем slug в режиме создания или если slug пустой в режиме редактирования
                    const shouldGenerateSlug = (!editingCase || !formData.slug) && newTitle;
                    const newSlug = shouldGenerateSlug ? generateSlug(newTitle) : formData.slug || '';
                    setFormData({ ...formData, title: newTitle, slug: newSlug });
                  }}
                  className="w-full bg-base-secondary border border-border-base/20 px-4 py-3 rounded text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-focus-ring/50 focus:border-accent transition-colors"
                  required={formData.published}
                />
              </div>

              <div>
                <label className="block text-foreground/80 text-sm font-medium mb-2">
                  Slug (URL) {formData.published && '*'}
                  <span className="text-foreground/40 text-xs font-normal ml-2">
                    {!editingCase ? '(генерируется автоматически)' : '(можно изменить)'}
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.slug || ''}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  readOnly={!editingCase}
                  className={`w-full bg-base-secondary border border-border-base/20 px-4 py-3 rounded text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-focus-ring/50 focus:border-accent transition-colors ${
                    !editingCase ? 'cursor-not-allowed opacity-70' : ''
                  }`}
                  placeholder="project-name-2024"
                  required={formData.published}
                />
              </div>

              <div>
                <label className="block text-foreground/80 text-sm font-medium mb-2">
                  Год создания {formData.published && '*'}
                </label>
                <input
                  type="number"
                  value={formData.year || ''}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || undefined })}
                  className="w-full bg-base-secondary border border-border-base/20 px-4 py-3 rounded text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-focus-ring/50 focus:border-accent transition-colors"
                  required={formData.published}
                />
              </div>

              <div>
                <label className="block text-foreground/80 text-sm font-medium mb-2">
                  Рабочий стек {formData.published && '*'}
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={techStackInput}
                    onChange={(e) => setTechStackInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTechStack();
                      }
                    }}
                    className="flex-1 bg-base-secondary border border-border-base/20 px-4 py-3 rounded text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-focus-ring/50 focus:border-accent transition-colors"
                    placeholder="Добавить технологию"
                  />
                  <button
                    type="button"
                    onClick={addTechStack}
                    className="bg-accent hover:bg-accent-hover text-white font-medium py-3 px-6 rounded focus:outline-none focus:ring-2 focus:ring-focus-ring/50 transition-colors"
                  >
                    Добавить
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.techStack?.map((tech, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 bg-base-secondary border border-border-base/20 px-3 py-1 rounded text-foreground/80 text-sm"
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => removeTechStack(index)}
                        className="text-foreground/60 hover:text-foreground"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-foreground/80 text-sm font-medium mb-2">
                  Тип кейса
                </label>
                <input
                  type="text"
                  value={formData.caseType || ''}
                  onChange={(e) => setFormData({ ...formData, caseType: e.target.value })}
                  className="w-full bg-base-secondary border border-border-base/20 px-4 py-3 rounded text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-focus-ring/50 focus:border-accent transition-colors"
                  placeholder="Web App, Mobile App и т.д."
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.published || false}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="w-4 h-4 accent-accent"
                  />
                  <span className="text-foreground/80 text-sm">Опубликован</span>
                </label>
              </div>
            </div>

            {/* Изображения */}
            <div className="space-y-6 border border-border-base/20 p-6 rounded">
              <h2 className="text-foreground text-xl font-semibold tracking-tight">Изображения</h2>
              
              <ImageUpload
                value={formData.previewImage || ''}
                onChange={(url) => setFormData({ ...formData, previewImage: url })}
                label={`Превью изображение (для карусели) ${formData.published ? '*' : ''}`}
                required={formData.published}
                placeholder="/images/preview.jpg"
              />

              <ImageUpload
                value={formData.heroImage || ''}
                onChange={(url) => setFormData({ ...formData, heroImage: url })}
                label={`Hero изображение ${formData.published ? '*' : ''}`}
                required={formData.published}
                placeholder="/images/hero.jpg"
              />
            </div>

            {/* Блоки скриншотов */}
            <div className="space-y-6 border border-border-base/20 p-6 rounded">
              <div className="flex items-center justify-between">
                <h2 className="text-foreground text-xl font-semibold tracking-tight">Блоки скриншотов</h2>
                <button
                  type="button"
                  onClick={addScreenshotBlock}
                  className="bg-accent hover:bg-accent-hover text-white font-medium py-2 px-4 rounded text-sm focus:outline-none focus:ring-2 focus:ring-focus-ring/50 transition-colors"
                >
                  + Добавить блок
                </button>
              </div>

              {formData.screenshotBlocks?.map((block, blockIndex) => (
                <div key={blockIndex} className="border border-border-base/10 p-4 rounded space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-foreground font-medium">Блок {blockIndex + 1}</h3>
                    {formData.screenshotBlocks && formData.screenshotBlocks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeScreenshotBlock(blockIndex)}
                        className="text-foreground/60 hover:text-foreground text-sm"
                      >
                        Удалить блок
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-foreground/80 text-sm font-medium mb-2">
                      Название блока {formData.published && '*'}
                    </label>
                    <input
                      type="text"
                      value={block.title}
                      onChange={(e) => updateScreenshotBlock(blockIndex, 'title', e.target.value)}
                      className="w-full bg-base-secondary border border-border-base/20 px-4 py-3 rounded text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-focus-ring/50 focus:border-accent transition-colors"
                      required={formData.published}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-foreground/80 text-sm font-medium">
                        Изображения {formData.published && '*'}
                      </label>
                      <button
                        type="button"
                        onClick={() => addImageToBlock(blockIndex)}
                        className="text-accent hover:text-accent-hover text-sm"
                      >
                        + Добавить изображение
                      </button>
                    </div>
                    {block.images.map((image, imageIndex) => (
                      <div key={imageIndex} className="mb-4">
                        <ImageUpload
                          value={image}
                          onChange={(url) => updateImageInBlock(blockIndex, imageIndex, url)}
                          label={`Изображение ${imageIndex + 1}${formData.published ? ' *' : ''}`}
                          required={formData.published}
                          placeholder="/images/screenshot.jpg"
                        />
                        {block.images.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeImageFromBlock(blockIndex, imageIndex)}
                            className="mt-2 text-foreground/60 hover:text-foreground text-sm"
                          >
                            Удалить изображение
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Кнопки */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loadingAction}
                className="bg-accent hover:bg-accent-hover text-white font-medium py-3 px-6 rounded focus:outline-none focus:ring-2 focus:ring-focus-ring/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingAction ? 'Сохранение...' : formData.published ? 'Опубликовать' : 'Сохранить'}
              </button>
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={loadingAction}
                className="bg-base-secondary hover:bg-base-secondary/80 border border-border-base/20 text-foreground font-medium py-3 px-6 rounded focus:outline-none focus:ring-2 focus:ring-focus-ring/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingAction ? 'Сохранение...' : 'Сохранить как черновик'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-base-secondary hover:bg-base-secondary/80 border border-border-base/20 text-foreground font-medium py-3 px-6 rounded focus:outline-none focus:ring-2 focus:ring-focus-ring/50 transition-colors"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      </main>
    );
  }

  // Список кейсов
  return (
    <main className="min-h-screen bg-base py-12 px-6 md:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-foreground text-3xl md:text-4xl font-bold tracking-tight mb-2">
              Админка кейсов
            </h1>
            <p className="text-foreground/60 text-base">
              Управление кейсами портфолио
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleOpenAnimationConfig}
              className="bg-base-secondary hover:bg-base-secondary/80 border border-border-base/20 text-foreground font-medium py-3 px-6 rounded focus:outline-none focus:ring-2 focus:ring-focus-ring/50 transition-colors"
            >
              Управление анимацией
            </button>
            <button
              onClick={handleCreate}
              className="bg-accent hover:bg-accent-hover text-white font-medium py-3 px-6 rounded focus:outline-none focus:ring-2 focus:ring-focus-ring/50 transition-colors"
            >
              + Создать кейс
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded text-foreground">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded text-foreground">
            {success}
          </div>
        )}

        {loading ? (
          <div className="text-foreground/60 text-center py-12">Загрузка...</div>
        ) : cases.length === 0 ? (
          <div className="text-center py-12 border border-border-base/20 rounded">
            <p className="text-foreground/60 mb-4">Нет кейсов</p>
            <button
              onClick={handleCreate}
              className="bg-accent hover:bg-accent-hover text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-focus-ring/50 transition-colors"
            >
              Создать первый кейс
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {cases.map((caseItem, index) => (
              <div
                key={`case-${index}-${caseItem.id || caseItem.slug || index}`}
                className="border border-border-base/20 p-6 rounded bg-base-secondary hover:bg-base-secondary/80 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-foreground text-xl font-semibold tracking-tight">
                        {caseItem.title}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          caseItem.published
                            ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                            : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                        }`}
                      >
                        {caseItem.published ? 'Опубликован' : 'Черновик'}
                      </span>
                    </div>
                    <p className="text-foreground/60 text-sm mb-2">
                      Slug: {caseItem.slug} • Год: {caseItem.year}
                    </p>
                    <p className="text-foreground/60 text-sm">
                      Технологии: {caseItem.techStack.join(', ')}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(caseItem.id)}
                      className="bg-base border border-border-base/20 hover:border-border-base/50 text-foreground font-medium py-2 px-4 rounded text-sm focus:outline-none focus:ring-2 focus:ring-focus-ring/50 transition-colors"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => handleDelete(caseItem.id, caseItem.title)}
                      disabled={loadingAction}
                      className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 font-medium py-2 px-4 rounded text-sm focus:outline-none focus:ring-2 focus:ring-focus-ring/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
