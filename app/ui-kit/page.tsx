'use client';

import { TransitionLink, useTransitionContext } from '@/components/pageTransition';
import { CaseHero } from '@/components/CaseHero';
import { Header } from '@/components/Header';
import Image from 'next/image';

export default function UIKitPage() {
  const { navigate } = useTransitionContext();

  return (
    <main className="min-h-screen bg-base">
      <Header />
      
      <div className="pt-24 pb-20 px-6 md:px-10 max-w-7xl mx-auto">
        {/* Заголовок страницы */}
        <div className="mb-20">
          <h1 className="text-foreground text-5xl md:text-6xl lg:text-7xl font-bold md:font-[900] tracking-tight mb-4">
            UI Kit
          </h1>
          <p className="text-foreground/60 text-lg md:text-xl max-w-2xl">
            Полное описание дизайн-системы проекта. Все цвета, типографика, компоненты и паттерны использования.
          </p>
        </div>

        {/* Раздел: Цветовая палитра */}
        <section id="colors" className="mb-32">
          <h2 className="text-foreground text-3xl md:text-4xl font-bold tracking-tight mb-8">
            Цветовая палитра
          </h2>
          
          <div className="space-y-12">
            {/* Основные цвета фона */}
            <div>
              <h3 className="text-foreground/80 text-xl font-medium mb-6">Основные цвета фона</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-border-base/20 p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-base border border-border-base/20 rounded"></div>
                    <div>
                      <p className="text-foreground font-medium">Base</p>
                      <p className="text-foreground/60 text-sm font-mono">#000000</p>
                      <p className="text-foreground/60 text-sm">bg-base</p>
                    </div>
                  </div>
                  <code className="block text-foreground/60 text-sm bg-base-secondary p-3 rounded font-mono">
                    {`className="bg-base"`}
                  </code>
                </div>
                
                <div className="border border-border-base/20 p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-base-secondary border border-border-base/20 rounded"></div>
                    <div>
                      <p className="text-foreground font-medium">Base Secondary</p>
                      <p className="text-foreground/60 text-sm font-mono">#0A0A0A</p>
                      <p className="text-foreground/60 text-sm">bg-base-secondary</p>
                    </div>
                  </div>
                  <code className="block text-foreground/60 text-sm bg-base-secondary p-3 rounded font-mono">
                    {`className="bg-base-secondary"`}
                  </code>
                </div>
              </div>
            </div>

            {/* Цвета текста */}
            <div>
              <h3 className="text-foreground/80 text-xl font-medium mb-6">Цвета текста</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="border border-border-base/20 p-6">
                  <p className="text-foreground mb-4 font-medium">Foreground (100%)</p>
                  <code className="block text-foreground/60 text-sm bg-base-secondary p-3 rounded font-mono mb-2">
                    text-foreground
                  </code>
                  <p className="text-foreground text-base">Пример текста</p>
                </div>
                
                <div className="border border-border-base/20 p-6">
                  <p className="text-foreground/80 mb-4 font-medium">Foreground (80%)</p>
                  <code className="block text-foreground/60 text-sm bg-base-secondary p-3 rounded font-mono mb-2">
                    text-foreground/80
                  </code>
                  <p className="text-foreground/80 text-base">Пример текста</p>
                </div>
                
                <div className="border border-border-base/20 p-6">
                  <p className="text-foreground/60 mb-4 font-medium">Foreground (60%)</p>
                  <code className="block text-foreground/60 text-sm bg-base-secondary p-3 rounded font-mono mb-2">
                    text-foreground/60
                  </code>
                  <p className="text-foreground/60 text-base">Пример текста</p>
                </div>
                
                <div className="border border-border-base/20 p-6">
                  <p className="text-foreground/40 mb-4 font-medium">Foreground (40%)</p>
                  <code className="block text-foreground/60 text-sm bg-base-secondary p-3 rounded font-mono mb-2">
                    text-foreground/40
                  </code>
                  <p className="text-foreground/40 text-base">Пример текста</p>
                </div>
              </div>
            </div>

            {/* Акцентные цвета */}
            <div>
              <h3 className="text-foreground/80 text-xl font-medium mb-6">Акцентные цвета</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border border-border-base/20 p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-accent border border-border-base/20 rounded"></div>
                    <div>
                      <p className="text-foreground font-medium">Accent</p>
                      <p className="text-foreground/60 text-sm font-mono">#0066FF</p>
                      <p className="text-foreground/60 text-sm">bg-accent</p>
                    </div>
                  </div>
                  <code className="block text-foreground/60 text-sm bg-base-secondary p-3 rounded font-mono">
                    {`className="bg-accent"`}
                  </code>
                </div>
                
                <div className="border border-border-base/20 p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded" style={{ backgroundColor: '#0052CC' }}></div>
                    <div>
                      <p className="text-foreground font-medium">Accent Hover</p>
                      <p className="text-foreground/60 text-sm font-mono">#0052CC</p>
                      <p className="text-foreground/60 text-sm">accent-hover</p>
                    </div>
                  </div>
                  <code className="block text-foreground/60 text-sm bg-base-secondary p-3 rounded font-mono">
                    {`hover:bg-accent-hover`}
                  </code>
                </div>
                
                <div className="border border-border-base/20 p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded" style={{ backgroundColor: '#3385FF' }}></div>
                    <div>
                      <p className="text-foreground font-medium">Accent Focus</p>
                      <p className="text-foreground/60 text-sm font-mono">#3385FF</p>
                      <p className="text-foreground/60 text-sm">accent-focus</p>
                    </div>
                  </div>
                  <code className="block text-foreground/60 text-sm bg-base-secondary p-3 rounded font-mono">
                    {`focus:bg-accent-focus`}
                  </code>
                </div>
              </div>
            </div>

            {/* Границы и состояния */}
            <div>
              <h3 className="text-foreground/80 text-xl font-medium mb-6">Границы и состояния</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border border-border-base/20 p-6">
                  <div className="mb-4 p-4 border border-border-base/10 rounded">
                    <p className="text-foreground text-sm mb-2">border-border-base/10</p>
                  </div>
                  <div className="mb-4 p-4 border border-border-base/20 rounded">
                    <p className="text-foreground text-sm mb-2">border-border-base/20</p>
                  </div>
                  <code className="block text-foreground/60 text-sm bg-base-secondary p-3 rounded font-mono">
                    {`border-border-base/10 | /20 | /50`}
                  </code>
                </div>
                
                <div className="border border-border-base/20 p-6">
                  <div className="mb-4 p-4 focus-within:ring-2 focus-within:ring-focus-ring/50">
                    <p className="text-foreground text-sm mb-2">Focus Ring</p>
                  </div>
                  <code className="block text-foreground/60 text-sm bg-base-secondary p-3 rounded font-mono">
                    {`focus:ring-2 focus:ring-focus-ring/50`}
                  </code>
                </div>
                
                <div className="border border-border-base/20 p-6">
                  <p className="text-disabled/30 mb-4 font-medium">Disabled State</p>
                  <code className="block text-foreground/60 text-sm bg-base-secondary p-3 rounded font-mono">
                    {`text-disabled/30`}
                  </code>
                  <p className="text-disabled/30 text-base mt-2">Отключенный текст</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Раздел: Типографика */}
        <section id="typography" className="mb-32">
          <h2 className="text-foreground text-3xl md:text-4xl font-bold tracking-tight mb-8">
            Типографика
          </h2>
          
          <div className="space-y-12">
            {/* Шрифт */}
            <div>
              <h3 className="text-foreground/80 text-xl font-medium mb-6">Шрифт</h3>
              <div className="border border-border-base/20 p-6">
                <p className="text-foreground text-lg mb-2 font-medium">Craftwork Grotesk</p>
                <p className="text-foreground/60 text-sm mb-4">
                  Основной шрифт проекта. Используется для всех текстовых элементов.
                </p>
                <code className="block text-foreground/60 text-sm bg-base-secondary p-3 rounded font-mono">
                  {`font-family: 'Craftwork Grotesk'`}
                </code>
              </div>
            </div>

            {/* Веса шрифтов */}
            <div>
              <h3 className="text-foreground/80 text-xl font-medium mb-6">Веса шрифтов</h3>
              <div className="space-y-6">
                <div className="border border-border-base/20 p-6">
                  <p className="text-foreground font-normal text-2xl mb-2">Regular (400)</p>
                  <code className="block text-foreground/60 text-sm bg-base-secondary p-3 rounded font-mono">
                    {`font-normal`}
                  </code>
                </div>
                
                <div className="border border-border-base/20 p-6">
                  <p className="text-foreground font-medium text-2xl mb-2">Medium (500)</p>
                  <code className="block text-foreground/60 text-sm bg-base-secondary p-3 rounded font-mono">
                    {`font-medium`}
                  </code>
                </div>
                
                <div className="border border-border-base/20 p-6">
                  <p className="text-foreground font-semibold text-2xl mb-2">SemiBold (600)</p>
                  <code className="block text-foreground/60 text-sm bg-base-secondary p-3 rounded font-mono">
                    {`font-semibold`}
                  </code>
                </div>
                
                <div className="border border-border-base/20 p-6">
                  <p className="text-foreground font-bold text-2xl mb-2">Bold (700)</p>
                  <code className="block text-foreground/60 text-sm bg-base-secondary p-3 rounded font-mono">
                    {`font-bold`}
                  </code>
                </div>
                
                <div className="border border-border-base/20 p-6">
                  <p className="text-foreground text-2xl mb-2" style={{ fontWeight: 900 }}>Heavy (900)</p>
                  <code className="block text-foreground/60 text-sm bg-base-secondary p-3 rounded font-mono">
                    {`font-[900]`}
                  </code>
                </div>
              </div>
            </div>

            {/* Заголовки */}
            <div>
              <h3 className="text-foreground/80 text-xl font-medium mb-6">Заголовки</h3>
              <div className="space-y-6">
                <div className="border border-border-base/20 p-6">
                  <h1 className="text-foreground text-5xl md:text-6xl lg:text-7xl font-bold md:font-[900] tracking-tight mb-4">
                    Heading 1
                  </h1>
                  <code className="block text-foreground/60 text-sm bg-base-secondary p-3 rounded font-mono">
                    {`text-5xl md:text-6xl lg:text-7xl font-bold md:font-[900] tracking-tight`}
                  </code>
                </div>
                
                <div className="border border-border-base/20 p-6">
                  <h2 className="text-foreground text-3xl md:text-4xl font-bold tracking-tight mb-4">
                    Heading 2
                  </h2>
                  <code className="block text-foreground/60 text-sm bg-base-secondary p-3 rounded font-mono">
                    {`text-3xl md:text-4xl font-bold tracking-tight`}
                  </code>
                </div>
                
                <div className="border border-border-base/20 p-6">
                  <h3 className="text-foreground text-2xl md:text-3xl font-bold tracking-tight mb-4">
                    Heading 3
                  </h3>
                  <code className="block text-foreground/60 text-sm bg-base-secondary p-3 rounded font-mono">
                    {`text-2xl md:text-3xl font-bold tracking-tight`}
                  </code>
                </div>
                
                <div className="border border-border-base/20 p-6">
                  <h4 className="text-foreground text-xl md:text-2xl font-semibold tracking-tight mb-4">
                    Heading 4
                  </h4>
                  <code className="block text-foreground/60 text-sm bg-base-secondary p-3 rounded font-mono">
                    {`text-xl md:text-2xl font-semibold tracking-tight`}
                  </code>
                </div>
              </div>
            </div>

            {/* Стили текста */}
            <div>
              <h3 className="text-foreground/80 text-xl font-medium mb-6">Стили текста</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-border-base/20 p-6">
                  <p className="text-foreground text-base tracking-tight mb-4">Tracking Tight</p>
                  <code className="block text-foreground/60 text-sm bg-base-secondary p-3 rounded font-mono">
                    {`tracking-tight`}
                  </code>
                </div>
                
                <div className="border border-border-base/20 p-6">
                  <p className="text-foreground text-base tracking-wider uppercase mb-4">Uppercase Tracking Wider</p>
                  <code className="block text-foreground/60 text-sm bg-base-secondary p-3 rounded font-mono">
                    {`uppercase tracking-wider`}
                  </code>
                </div>
                
                <div className="border border-border-base/20 p-6">
                  <p className="text-foreground text-base mb-4">
                    Обычный текст для параграфов и описаний
                  </p>
                  <code className="block text-foreground/60 text-sm bg-base-secondary p-3 rounded font-mono">
                    {`text-base`}
                  </code>
                </div>
                
                <div className="border border-border-base/20 p-6">
                  <p className="text-foreground text-sm mb-4">
                    Малый текст для меток и подписей
                  </p>
                  <code className="block text-foreground/60 text-sm bg-base-secondary p-3 rounded font-mono">
                    {`text-sm`}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Раздел: Компоненты */}
        <section id="components" className="mb-32">
          <h2 className="text-foreground text-3xl md:text-4xl font-bold tracking-tight mb-8">
            Компоненты
          </h2>
          
          <div className="space-y-16">
            {/* TransitionLink */}
            <div>
              <h3 className="text-foreground/80 text-xl font-medium mb-6">TransitionLink</h3>
              <div className="border border-border-base/20 p-6 mb-6">
                <div className="flex flex-wrap gap-6 items-center">
                  <TransitionLink
                    href="/"
                    onNavigate={navigate}
                    className="text-base font-medium tracking-tight text-white hover:text-white/80 focus:text-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors"
                  >
                    Главная
                  </TransitionLink>
                  <TransitionLink
                    href="/portfolio"
                    onNavigate={navigate}
                    className="text-base text-white/80 font-medium hover:text-white focus:text-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors"
                  >
                    Portfolio
                  </TransitionLink>
                </div>
              </div>
              <code className="block text-foreground/60 text-sm bg-base-secondary p-4 rounded font-mono overflow-x-auto">
{`<TransitionLink
  href="/portfolio"
  onNavigate={navigate}
  className="text-base text-white/80 font-medium 
             hover:text-white 
             focus:text-white 
             focus:outline-none 
             focus:ring-2 
             focus:ring-white/50 
             transition-colors"
>
  Portfolio
</TransitionLink>`}
              </code>
            </div>

            {/* Header */}
            <div>
              <h3 className="text-foreground/80 text-xl font-medium mb-6">Header</h3>
              <div className="border border-border-base/20 p-6 mb-6">
                <div className="flex justify-between items-center">
                  <nav className="flex items-center gap-4">
                    <span className="text-base font-medium tracking-tight text-white">
                      Bugrov.space
                    </span>
                  </nav>
                  <nav className="flex items-center gap-6">
                    <span className="text-base text-white/80 font-medium">Portfolio</span>
                    <span className="text-base text-white/80 font-medium">Кейс</span>
                    <span className="text-base text-white/80 font-medium">UI Kit</span>
                  </nav>
                </div>
              </div>
              <code className="block text-foreground/60 text-sm bg-base-secondary p-4 rounded font-mono overflow-x-auto">
{`<header className="fixed top-0 left-0 right-0 z-[10001] 
                    flex justify-between items-center 
                    px-6 md:px-10 py-6 
                    pointer-events-none">
  <nav className="flex items-center gap-4 pointer-events-auto">
    <TransitionLink href="/" ...>Bugrov.space</TransitionLink>
  </nav>
  <nav className="flex items-center gap-6 pointer-events-auto">
    <TransitionLink href="/portfolio" ...>Portfolio</TransitionLink>
  </nav>
</header>`}
              </code>
            </div>

            {/* CaseHero */}
            <div>
              <h3 className="text-foreground/80 text-xl font-medium mb-6">CaseHero</h3>
              <div className="border border-border-base/20 p-6 mb-6">
                <div className="grid grid-cols-3 gap-5">
                  <div className="flex flex-col items-start gap-3">
                    <div className="flex flex-col gap-1">
                      <p className="text-foreground/60 uppercase tracking-wider text-xs font-medium leading-none">
                        (CASE)
                      </p>
                      <div className="w-6 h-px bg-foreground/20 mt-2 mb-1"></div>
                      <p className="text-foreground/50 text-xs font-normal leading-relaxed">
                        Веб-разработка
                      </p>
                    </div>
                  </div>
                  <div className="col-span-2 flex flex-col gap-8">
                    <div className="max-w-4xl">
                      <h1 className="text-foreground text-3xl font-medium leading-[1.1] tracking-tight">
                        Пример заголовка кейса
                      </h1>
                    </div>
                    <div className="relative w-full aspect-[4/3] bg-base-secondary border border-border-base/20 rounded overflow-hidden"></div>
                  </div>
                </div>
              </div>
              <code className="block text-foreground/60 text-sm bg-base-secondary p-4 rounded font-mono overflow-x-auto">
{`<CaseHero
  sectionLabel="(CASE)"
  caseType="Веб-разработка"
  headline="Great architecture isn't just about talent..."
  image="/images/photo-1.webp"
/>`}
              </code>
            </div>

          </div>
        </section>

        {/* Раздел: Отступы и сетка */}
        <section id="spacing-grid" className="mb-32">
          <h2 className="text-foreground text-3xl md:text-4xl font-bold tracking-tight mb-8">
            Отступы и сетка
          </h2>
          
          <div className="space-y-12">
            {/* Система отступов */}
            <div>
              <h3 className="text-foreground/80 text-xl font-medium mb-6">Система отступов</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="border border-border-base/20 p-6">
                  <div className="bg-accent/20 p-4 mb-4">
                    <p className="text-foreground text-sm">px-6 md:px-10</p>
                  </div>
                  <code className="block text-foreground/60 text-sm bg-base-secondary p-3 rounded font-mono">
                    {`px-6 md:px-10`}
                  </code>
                  <p className="text-foreground/60 text-xs mt-2">Горизонтальные отступы</p>
                </div>
                
                <div className="border border-border-base/20 p-6">
                  <div className="bg-accent/20 py-6 mb-4">
                    <p className="text-foreground text-sm">py-6</p>
                  </div>
                  <code className="block text-foreground/60 text-sm bg-base-secondary p-3 rounded font-mono">
                    {`py-6`}
                  </code>
                  <p className="text-foreground/60 text-xs mt-2">Вертикальные отступы</p>
                </div>
                
                <div className="border border-border-base/20 p-6">
                  <div className="flex gap-4 mb-4">
                    <div className="bg-accent/20 p-2"></div>
                    <div className="bg-accent/20 p-2"></div>
                  </div>
                  <code className="block text-foreground/60 text-sm bg-base-secondary p-3 rounded font-mono">
                    {`gap-4`}
                  </code>
                  <p className="text-foreground/60 text-xs mt-2">Малый отступ</p>
                </div>
                
                <div className="border border-border-base/20 p-6">
                  <div className="flex gap-12 mb-4">
                    <div className="bg-accent/20 p-2"></div>
                    <div className="bg-accent/20 p-2"></div>
                  </div>
                  <code className="block text-foreground/60 text-sm bg-base-secondary p-3 rounded font-mono">
                    {`gap-6 md:gap-12`}
                  </code>
                  <p className="text-foreground/60 text-xs mt-2">Большой отступ</p>
                </div>
              </div>
            </div>

            {/* Grid система */}
            <div>
              <h3 className="text-foreground/80 text-xl font-medium mb-6">Grid система</h3>
              <div className="space-y-6">
                <div className="border border-border-base/20 p-6">
                  <h4 className="text-foreground/80 text-lg font-medium mb-4">3 колонки (grid-cols-3)</h4>
                  <div className="grid grid-cols-3 gap-5">
                    <div className="bg-accent/20 p-4 border border-border-base/10 rounded">
                      <p className="text-foreground text-sm text-center">Колонка 1</p>
                    </div>
                    <div className="bg-accent/20 p-4 border border-border-base/10 rounded">
                      <p className="text-foreground text-sm text-center">Колонка 2</p>
                    </div>
                    <div className="bg-accent/20 p-4 border border-border-base/10 rounded">
                      <p className="text-foreground text-sm text-center">Колонка 3</p>
                    </div>
                  </div>
                  <code className="block text-foreground/60 text-sm bg-base-secondary p-3 rounded font-mono mt-4">
                    {`<div className="grid grid-cols-3 gap-5">...</div>`}
                  </code>
                </div>
                
                <div className="border border-border-base/20 p-6">
                  <h4 className="text-foreground/80 text-lg font-medium mb-4">2 колонки с span (col-span-2)</h4>
                  <div className="grid grid-cols-3 gap-5">
                    <div className="bg-accent/20 p-4 border border-border-base/10 rounded">
                      <p className="text-foreground text-sm text-center">Колонка 1</p>
                    </div>
                    <div className="col-span-2 bg-accent/20 p-4 border border-border-base/10 rounded">
                      <p className="text-foreground text-sm text-center">Колонки 2-3 (col-span-2)</p>
                    </div>
                  </div>
                  <code className="block text-foreground/60 text-sm bg-base-secondary p-3 rounded font-mono mt-4">
                    {`<div className="grid grid-cols-3 gap-5">
  <div>Колонка 1</div>
  <div className="col-span-2">Колонки 2-3</div>
</div>`}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Раздел: Анимации и переходы */}
        <section id="animations" className="mb-32">
          <h2 className="text-foreground text-3xl md:text-4xl font-bold tracking-tight mb-8">
            Анимации и переходы
          </h2>
          
          <div className="space-y-12">
            {/* Page Transitions */}
            <div>
              <h3 className="text-foreground/80 text-xl font-medium mb-6">Page Transitions</h3>
              <div className="border border-border-base/20 p-6 mb-6">
                <p className="text-foreground mb-4">
                  Переходы между страницами реализованы через GSAP с маской перехода.
                </p>
                <div className="space-y-4">
                  <div>
                    <p className="text-foreground/80 font-medium mb-2">Направление:</p>
                    <ul className="text-foreground/60 text-sm space-y-1 ml-4">
                      <li>• vertical — вертикальное движение</li>
                      <li>• horizontal — горизонтальное движение</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-foreground/80 font-medium mb-2">Длительность:</p>
                    <p className="text-foreground/60 text-sm ml-4">0.8 секунд (настраивается)</p>
                  </div>
                  <div>
                    <p className="text-foreground/80 font-medium mb-2">Easing:</p>
                    <p className="text-foreground/60 text-sm ml-4">power2.inOut (GSAP)</p>
                  </div>
                  <div>
                    <p className="text-foreground/80 font-medium mb-2">Цвет маски:</p>
                    <p className="text-foreground/60 text-sm ml-4">#FFFFFF (белый)</p>
                  </div>
                </div>
              </div>
              <code className="block text-foreground/60 text-sm bg-base-secondary p-4 rounded font-mono overflow-x-auto">
{`const transitionConfig: PageTransitionConfig = {
  direction: 'vertical',
  duration: 0.8,
  ease: 'power2.inOut',
  maskColor: '#ffffff',
};`}
              </code>
            </div>

            {/* GSAP Easing */}
            <div>
              <h3 className="text-foreground/80 text-xl font-medium mb-6">GSAP Easing функции</h3>
              <div className="border border-border-base/20 p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-base-secondary rounded">
                    <p className="text-foreground text-sm font-mono">power1</p>
                  </div>
                  <div className="p-3 bg-base-secondary rounded">
                    <p className="text-foreground text-sm font-mono">power2</p>
                  </div>
                  <div className="p-3 bg-base-secondary rounded">
                    <p className="text-foreground text-sm font-mono">power3</p>
                  </div>
                  <div className="p-3 bg-base-secondary rounded">
                    <p className="text-foreground text-sm font-mono">power4</p>
                  </div>
                  <div className="p-3 bg-base-secondary rounded">
                    <p className="text-foreground text-sm font-mono">expo</p>
                  </div>
                  <div className="p-3 bg-base-secondary rounded">
                    <p className="text-foreground text-sm font-mono">sine</p>
                  </div>
                  <div className="p-3 bg-base-secondary rounded">
                    <p className="text-foreground text-sm font-mono">back</p>
                  </div>
                  <div className="p-3 bg-base-secondary rounded">
                    <p className="text-foreground text-sm font-mono">elastic</p>
                  </div>
                </div>
                <p className="text-foreground/60 text-sm mt-4">
                  Доступны модификации: .in, .out, .inOut
                </p>
              </div>
            </div>

            {/* CSS Transitions */}
            <div>
              <h3 className="text-foreground/80 text-xl font-medium mb-6">CSS Transitions</h3>
              <div className="border border-border-base/20 p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-foreground/80 font-medium mb-2">Цветовые переходы:</p>
                    <code className="block text-foreground/60 text-sm bg-base-secondary p-3 rounded font-mono">
                      {`transition-colors`}
                    </code>
                    <div className="mt-2">
                      <button className="px-4 py-2 bg-base-secondary text-foreground hover:text-accent transition-colors border border-border-base/20 rounded">
                        Наведите для примера
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Раздел: Примеры использования */}
        <section id="examples" className="mb-32">
          <h2 className="text-foreground text-3xl md:text-4xl font-bold tracking-tight mb-8">
            Примеры использования
          </h2>
          
          <div className="space-y-12">
            {/* Пример: Hero секция */}
            <div>
              <h3 className="text-foreground/80 text-xl font-medium mb-6">Hero секция</h3>
              <div className="border border-border-base/20 p-6 mb-6">
                <div className="min-h-[400px] bg-base-secondary rounded flex items-center justify-center relative overflow-hidden">
                  <div className="text-center z-10">
                    <h1 className="text-foreground text-5xl md:text-6xl font-bold md:font-[900] tracking-tight mb-4">
                      Заголовок Hero
                    </h1>
                    <p className="text-foreground/60 text-lg max-w-xl">
                      Описание главной секции страницы
                    </p>
                  </div>
                </div>
              </div>
              <code className="block text-foreground/60 text-sm bg-base-secondary p-4 rounded font-mono overflow-x-auto">
{`<section className="min-h-screen bg-base">
  <div className="flex items-center justify-center">
    <h1 className="text-foreground text-5xl md:text-6xl 
                   font-bold md:font-[900] tracking-tight">
      Заголовок Hero
    </h1>
  </div>
</section>`}
              </code>
            </div>

            {/* Пример: Карточка */}
            <div>
              <h3 className="text-foreground/80 text-xl font-medium mb-6">Карточка</h3>
              <div className="border border-border-base/20 p-6 mb-6">
                <div className="bg-base-secondary border border-border-base/20 p-6 rounded max-w-md">
                  <div className="relative w-full aspect-[4/3] bg-base mb-4 rounded overflow-hidden">
                    <div className="absolute inset-0 bg-accent/20"></div>
                  </div>
                  <h3 className="text-foreground text-xl font-bold tracking-tight mb-2">
                    Заголовок карточки
                  </h3>
                  <p className="text-foreground/60 text-sm mb-4">
                    Описание карточки с текстом
                  </p>
                  <TransitionLink
                    href="/"
                    onNavigate={navigate}
                    className="text-foreground/80 hover:text-foreground text-sm font-medium transition-colors"
                  >
                    Подробнее →
                  </TransitionLink>
                </div>
              </div>
              <code className="block text-foreground/60 text-sm bg-base-secondary p-4 rounded font-mono overflow-x-auto">
{`<div className="bg-base-secondary border border-border-base/20 p-6 rounded">
  <div className="aspect-[4/3] bg-base mb-4 rounded"></div>
  <h3 className="text-foreground text-xl font-bold mb-2">
    Заголовок
  </h3>
  <p className="text-foreground/60 text-sm mb-4">
    Описание
  </p>
</div>`}
              </code>
            </div>
          </div>
        </section>

        {/* Навигация по разделам */}
        <div className="border-t border-border-base/20 pt-12">
          <nav className="flex flex-wrap gap-6" aria-label="Навигация по разделам">
            <a href="#colors" className="text-foreground/60 hover:text-foreground text-sm font-medium transition-colors">
              Цвета
            </a>
            <a href="#typography" className="text-foreground/60 hover:text-foreground text-sm font-medium transition-colors">
              Типографика
            </a>
            <a href="#components" className="text-foreground/60 hover:text-foreground text-sm font-medium transition-colors">
              Компоненты
            </a>
            <a href="#spacing-grid" className="text-foreground/60 hover:text-foreground text-sm font-medium transition-colors">
              Отступы и сетка
            </a>
            <a href="#animations" className="text-foreground/60 hover:text-foreground text-sm font-medium transition-colors">
              Анимации
            </a>
            <a href="#examples" className="text-foreground/60 hover:text-foreground text-sm font-medium transition-colors">
              Примеры
            </a>
          </nav>
        </div>
      </div>
    </main>
  );
}
