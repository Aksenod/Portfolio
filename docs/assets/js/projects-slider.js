/**
 * Projects Slider - загружает проекты из API и генерирует слайды
 */
(function() {
  'use strict';

  // API Configuration
  const API_BASE = window.__API_BASE || 'https://portfolio-backend-qm04.onrender.com';
  const ASSETS_BASE_URL = 'https://aksenod.github.io';

  // Normalize image URL - convert relative paths to absolute
  function normalizeImageUrl(url) {
    if (!url) return '';
    url = String(url).trim();

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
  function createSlideHTML(project) {
    const imageUrl = normalizeImageUrl(project.cover_image);
    const projectUrl = `/Portfolio/proekty/${project.slug}`;

    return `
      <div role="listitem" class="hero-cli w-dyn-item">
        <div class="hero-slider-card">
          <div class="hero-slide-inner">
            <a href="${projectUrl}" class="image-wrap w-inline-block">
              <img loading="lazy"
                   width="70"
                   alt="${project.title}"
                   src="${imageUrl}"
                   onerror="this.style.display='none'; console.error('Failed to load image for ${project.title}:', '${imageUrl}');"
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

  // Initialize slider
  function initSlider(projects) {
    const container = document.querySelector('.hero-cl.w-dyn-items');

    if (!container) {
      console.error('Slider container not found');
      return;
    }

    // Clear loading state
    container.innerHTML = '';

    // Generate slides
    if (projects.length === 0) {
      container.innerHTML = `
        <div class="hero-cli" style="padding: 40px; text-align: center; color: #888;">
          <p>Проекты загружаются...</p>
        </div>
      `;
      return;
    }

    // Add all project slides
    projects.forEach(project => {
      console.log(`Adding slide: ${project.title}, image: ${normalizeImageUrl(project.cover_image)}`);
      container.insertAdjacentHTML('beforeend', createSlideHTML(project));
    });

    // Reinitialize Webflow slider
    if (window.Webflow) {
      window.Webflow.destroy();
      window.Webflow.ready();
      window.Webflow.require('slider').redraw();
    }

    console.log(`✓ Loaded ${projects.length} projects into slider`);
  }

  // Main initialization
  async function init() {
    console.log('Initializing projects slider...');

    const projects = await loadProjects();
    initSlider(projects);
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
