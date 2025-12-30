/**
 * Projects Slider - загружает проекты из API и генерирует слайды
 */
(function() {
  'use strict';

  // API Configuration
  const API_BASE = window.__API_BASE || 'https://portfolio-backend-qm04.onrender.com';
  const ASSETS_BASE_URL = 'https://aksenod.github.io';

  // Convert legacy image extensions to WebP
  function toWebP(url) {
    if (!url) return url;
    return url.replace(/\.(jpg|jpeg|png|JPG|JPEG|PNG)$/i, '.webp');
  }

  // Normalize image URL - convert relative paths to absolute
  function normalizeImageUrl(url) {
    if (!url) return '';
    url = String(url).trim();

    // Convert to WebP format
    url = toWebP(url);

    // Already absolute URL
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // Data URLs
    if (url.startsWith('data:')) {
      return url;
    }

    // Relative path starting with /Portfolio/
    if (url.startsWith('/Portfolio/')) {
      return ASSETS_BASE_URL + url;
    }

    // Relative path starting with Portfolio/ (missing leading slash)
    if (url.startsWith('Portfolio/')) {
      return ASSETS_BASE_URL + '/' + url;
    }

    // Relative path starting with /assets/ (missing /Portfolio prefix)
    if (url.startsWith('/assets/')) {
      return ASSETS_BASE_URL + '/Portfolio' + url;
    }

    // Other relative paths starting with /
    if (url.startsWith('/')) {
      return ASSETS_BASE_URL + '/Portfolio' + url;
    }

    // Any other relative path (e.g. assets/..., images/...)
    return ASSETS_BASE_URL + '/' + url;
  }

  // Load projects from API
  async function loadProjects() {
    try {
      const response = await fetch(`${API_BASE}/projects`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const projects = await response.json();
      return projects.filter(p => p.enabled); // Only enabled projects
    } catch (error) {
      console.error('Failed to load projects:', error);
      return [];
    }
  }

  // Generate slide HTML
  function createSlideHTML(project, index) {
    const imageUrl = normalizeImageUrl(project.cover_image);
    const projectUrl = `/Portfolio/proekty/${project.slug}`;

    // First 3 images load eagerly for better LCP, rest lazy load
    const loadingAttr = index < 3 ? 'eager' : 'lazy';
    const fetchPriority = index === 0 ? 'high' : 'auto';

    return `
      <div role="listitem" class="hero-cli w-dyn-item">
        <div class="hero-slider-card">
          <div class="hero-slide-inner">
            <a href="${projectUrl}" class="image-wrap w-inline-block">
              <img loading="${loadingAttr}"
                   decoding="async"
                   fetchpriority="${fetchPriority}"
                   width="70"
                   alt="${project.title}"
                   src="${imageUrl}"
                   class="image-cover"/>
            </a>
            <div class="cs-label">
              <div class="cs-label in">
                <div>${project.category || 'Без категории'}</div>
              </div>
              <div class="cs-label in">
                <div>${project.title}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Preload first image for faster LCP
  function preloadFirstImage(projects) {
    if (projects.length > 0) {
      const firstImageUrl = normalizeImageUrl(projects[0].cover_image);
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = firstImageUrl;
      link.type = 'image/webp';
      document.head.appendChild(link);
    }
  }

  // Initialize slider
  function initSlider(projects) {
    // Try Webflow slider mask first (direct injection)
    const sliderMask = document.querySelector('.hero-slider-mask');
    const cmsContainer = document.querySelector('.hero-cl.w-dyn-items');

    if (!sliderMask && !cmsContainer) {
      console.error('Slider container not found');
      return;
    }

    // Generate slides
    if (projects.length === 0) {
      console.log('No projects to display');
      return;
    }

    // Add slides directly to Webflow slider mask
    if (sliderMask) {
      // Clear existing slides
      sliderMask.innerHTML = '';

      projects.forEach((project, index) => {
        const imageUrl = normalizeImageUrl(project.cover_image);
        const projectUrl = `/Portfolio/proekty/${project.slug}`;
        const loadingAttr = index < 3 ? 'eager' : 'lazy';

        const slide = document.createElement('div');
        slide.className = 'hero-slide w-slide';
        slide.innerHTML = `
          <a href="${projectUrl}" class="hero-slide-link w-inline-block">
            <div class="hero-slide-inner">
              <img loading="${loadingAttr}"
                   decoding="async"
                   alt="${project.title}"
                   src="${imageUrl}"
                   class="hero-slide-image"/>
              <div class="hero-slide-overlay"></div>
              <div class="hero-slide-content">
                <div class="hero-slide-category">${project.category || ''}</div>
                <div class="hero-slide-title">${project.title}</div>
              </div>
            </div>
          </a>
        `;
        sliderMask.appendChild(slide);
      });

      // Reinitialize Webflow slider
      if (window.Webflow) {
        window.Webflow.destroy();
        window.Webflow.ready();
        window.Webflow.require('slider').redraw();
      }
    }

    // Also populate CMS container for Finsweet (fallback)
    if (cmsContainer) {
      cmsContainer.innerHTML = '';
      projects.forEach((project, index) => {
        cmsContainer.insertAdjacentHTML('beforeend', createSlideHTML(project, index));
      });
    }

    console.log(`Loaded ${projects.length} projects into slider`);
  }

  // Main initialization
  async function init() {
    console.log('Initializing projects slider...');

    const projects = await loadProjects();
    preloadFirstImage(projects);
    initSlider(projects);
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
