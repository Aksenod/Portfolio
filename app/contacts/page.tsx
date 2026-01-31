'use client';

import { useState, FormEvent } from 'react';
import { Header } from '@/components/Header';
import { TransitionLink, useTransitionContext } from '@/components/pageTransition';

export default function ContactsPage() {
  const { navigate } = useTransitionContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    projectType: 'разработает',
    websiteType: '',
    deadline: '',
    budget: '',
    canCall: false,
    additionalInfo: '',
    privacyAgreement: false,
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const basePath = typeof window !== 'undefined' 
        ? (process.env.NEXT_PUBLIC_BASE_PATH || '')
        : '';

      const response = await fetch(`${basePath}/api/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus('success');
        // Очищаем форму
        setFormData({
          name: '',
          company: '',
          projectType: 'разработает',
          websiteType: '',
          deadline: '',
          budget: '',
          canCall: false,
          additionalInfo: '',
          privacyAgreement: false,
        });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <main className="min-h-screen bg-base">
      <Header />
      
      <div className="pt-24 pb-20 px-6 md:px-10 max-w-7xl mx-auto">
        {/* Заголовок и описание */}
        <div className="mb-16">
          <h1 className="text-foreground text-5xl md:text-6xl lg:text-7xl font-bold md:font-semibold tracking-tight mb-6">
            Контакты
          </h1>
          <p className="text-foreground/60 text-lg md:text-xl max-w-2xl">
            Свяжитесь с нами удобным для вас способом. На сообщения отвечаем в течение 30 минут, на звонки — моментально.
          </p>
        </div>

        {/* Контактная информация */}
        <div className="mb-20 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col gap-1">
            <p className="text-foreground/60 text-sm uppercase tracking-wider mb-2">почта</p>
            <a 
              href="mailto:Dan.bugrov@yandex.ru" 
              className="text-foreground text-lg font-medium hover:text-foreground/80 transition-colors focus:text-foreground focus:outline-none focus:ring-2 focus:ring-focus-ring/50"
            >
              Dan.bugrov@yandex.ru
            </a>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-foreground/60 text-sm uppercase tracking-wider mb-2">телефон, whatsapp</p>
            <a 
              href="tel:+79388697830" 
              className="text-foreground text-lg font-medium hover:text-foreground/80 transition-colors focus:text-foreground focus:outline-none focus:ring-2 focus:ring-focus-ring/50"
            >
              +7 (938) 869-78-30
            </a>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-foreground/60 text-sm uppercase tracking-wider mb-2">telegram</p>
            <a 
              href="https://t.me/BugrovStudio" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground text-lg font-medium hover:text-foreground/80 transition-colors focus:text-foreground focus:outline-none focus:ring-2 focus:ring-focus-ring/50"
            >
              @BugrovStudio
            </a>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-foreground/60 text-sm uppercase tracking-wider mb-2">адрес</p>
            <p className="text-foreground text-lg font-medium">
              354000, г. Сочи, ул. Московская, 10б, 4 этаж
            </p>
          </div>
        </div>

        {/* Форма заявки */}
        <div className="max-w-3xl">
          <h2 className="text-foreground text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Заявка на проект
          </h2>
          <p className="text-foreground/60 text-lg mb-12">
            заполни форму ниже:
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Имя */}
            <div>
              <label htmlFor="name" className="block text-foreground text-base mb-3">
                Привет! Меня зовут
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-0 py-4 bg-transparent border-0 border-b border-border-base/20 text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-border-base/50 transition-colors"
                placeholder=""
              />
            </div>

            {/* Компания */}
            <div>
              <label htmlFor="company" className="block text-foreground text-base mb-3">
                и я работаю в
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="w-full px-0 py-4 bg-transparent border-0 border-b border-border-base/20 text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-border-base/50 transition-colors"
                placeholder=""
              />
            </div>

            {/* Проект тип - переключатель */}
            <div>
              <label className="block text-foreground text-base mb-4">
                Я ищу команду, которая мне
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, projectType: 'разработает' }))}
                  className={`px-6 py-3 rounded border transition-all focus:outline-none focus:ring-2 focus:ring-focus-ring/50 ${
                    formData.projectType === 'разработает'
                      ? 'bg-accent border-accent text-foreground'
                      : 'bg-transparent border-border-base/20 text-foreground/60 hover:text-foreground hover:border-border-base/50'
                  }`}
                >
                  разработает
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, projectType: 'разрабатывает' }))}
                  className={`px-6 py-3 rounded border transition-all focus:outline-none focus:ring-2 focus:ring-focus-ring/50 ${
                    formData.projectType === 'разрабатывает'
                      ? 'bg-accent border-accent text-foreground'
                      : 'bg-transparent border-border-base/20 text-foreground/60 hover:text-foreground hover:border-border-base/50'
                  }`}
                >
                  разрабатывает
                </button>
              </div>
            </div>

            {/* Тип сайта */}
            <div>
              <label htmlFor="websiteType" className="block text-foreground text-base mb-3">
                выбери Тип сайта
              </label>
              <div className="relative">
                <select
                  id="websiteType"
                  name="websiteType"
                  value={formData.websiteType}
                  onChange={handleChange}
                  className="w-full px-0 py-4 pr-6 bg-transparent border-0 border-b border-border-base/20 text-foreground focus:outline-none focus:border-border-base/50 transition-colors appearance-none cursor-pointer"
                >
                  <option value="">Select one...</option>
                  <option value="сайт-визитка">сайт-визитка</option>
                  <option value="сайт-каталог">сайт-каталог</option>
                  <option value="корпоративный сайт">корпоративный сайт</option>
                  <option value="лендинг">лендинг</option>
                  <option value="Дизайн сервиса/приложения">Дизайн сервиса/приложения</option>
                  <option value="другое">другое</option>
                </select>
              </div>
            </div>

            {/* Дата выполнения */}
            <div>
              <label htmlFor="deadline" className="block text-foreground text-base mb-3">
                Мне бы хотелось, чтобы это было выполнено к
              </label>
              <input
                type="date"
                id="deadline"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="w-full px-0 py-4 bg-transparent border-0 border-b border-border-base/20 text-foreground focus:outline-none focus:border-border-base/50 transition-colors [color-scheme:dark]"
              />
            </div>

            {/* Бюджет */}
            <div>
              <label htmlFor="budget" className="block text-foreground text-base mb-3">
                Мой бюджет на данный проект составляет
              </label>
              <input
                type="text"
                id="budget"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                className="w-full px-0 py-4 bg-transparent border-0 border-b border-border-base/20 text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-border-base/50 transition-colors"
                placeholder=""
              />
            </div>

            {/* Чекбокс "Вы можете мне позвонить" */}
            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="canCall"
                name="canCall"
                checked={formData.canCall}
                onChange={handleChange}
                className="w-5 h-5 bg-base-secondary border border-border-base/20 rounded focus:ring-2 focus:ring-focus-ring/50 focus:outline-none transition-all accent-accent cursor-pointer"
              />
              <label htmlFor="canCall" className="text-foreground text-base cursor-pointer">
                Вы можете мне позвонить для обсуждения.
              </label>
            </div>

            {/* Дополнительная информация */}
            <div>
              <label htmlFor="additionalInfo" className="block text-foreground text-base mb-3">
                Также я хочу сообщить о
              </label>
              <textarea
                id="additionalInfo"
                name="additionalInfo"
                value={formData.additionalInfo}
                onChange={handleChange}
                rows={4}
                className="w-full px-0 py-4 bg-transparent border-0 border-b border-border-base/20 text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-border-base/50 transition-colors resize-none"
                placeholder=""
              />
            </div>

            {/* Чекбокс согласия */}
            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="privacyAgreement"
                name="privacyAgreement"
                required
                checked={formData.privacyAgreement}
                onChange={handleChange}
                className="w-5 h-5 bg-base-secondary border border-border-base/20 rounded focus:ring-2 focus:ring-focus-ring/50 focus:outline-none transition-all accent-accent cursor-pointer"
              />
              <label htmlFor="privacyAgreement" className="text-foreground text-base cursor-pointer">
                Я согласен с политикой приватности
              </label>
            </div>

            {/* Статус отправки */}
            {submitStatus === 'success' && (
              <div className="p-4 bg-base-secondary border border-border-base/20 rounded">
                <p className="text-foreground text-sm font-medium">
                  Спасибо! Ваша заявка успешно отправлена
                </p>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="p-4 bg-base-secondary border border-border-base/20 rounded">
                <p className="text-foreground/80 text-sm font-medium">
                  Oops! Something went wrong while submitting the form.
                </p>
              </div>
            )}

            {/* Кнопка отправки */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-4 bg-accent text-foreground font-medium rounded hover:bg-accent-hover focus:bg-accent-focus focus:outline-none focus:ring-2 focus:ring-focus-ring/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Отправка...' : 'отправить'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}