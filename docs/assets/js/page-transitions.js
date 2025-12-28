// Page Transitions with Barba.js and GSAP
(function() {
  'use strict';

  // Initialize Barba.js when DOM is ready
  document.addEventListener('DOMContentLoaded', function() {

    // Initialize Barba
    barba.init({
      transitions: [{
        name: 'curtain-transition',

        // Before leaving current page
        async leave(data) {
          const done = this.async();

          // Animate curtain in
          const tl = gsap.timeline({
            onComplete: done
          });

          tl.to('.page-transition-curtain', {
            duration: 0.6,
            scaleY: 1,
            transformOrigin: 'bottom',
            ease: 'power3.inOut'
          });

          // Fade out current content
          tl.to(data.current.container, {
            duration: 0.4,
            opacity: 0,
            ease: 'power2.out'
          }, '-=0.3');
        },

        // Before entering new page
        async enter(data) {
          const done = this.async();

          // Scroll to top
          window.scrollTo(0, 0);

          // Set initial state for new content
          gsap.set(data.next.container, {
            opacity: 0
          });

          // Animate curtain out and fade in new content
          const tl = gsap.timeline({
            onComplete: done
          });

          tl.to('.page-transition-curtain', {
            duration: 0.6,
            scaleY: 0,
            transformOrigin: 'top',
            ease: 'power3.inOut'
          });

          tl.to(data.next.container, {
            duration: 0.6,
            opacity: 1,
            ease: 'power2.in'
          }, '-=0.4');
        },

        // After transition is complete
        async after(data) {
          // Reinitialize Webflow interactions if needed
          if (window.Webflow) {
            window.Webflow.destroy();
            window.Webflow.ready();
            window.Webflow.require('ix2').init();
          }
        }
      }],

      // Prevent transitions on specific links
      prevent: ({ el }) => {
        // Don't transition for external links
        if (el.classList && el.classList.contains('no-transition')) {
          return true;
        }
        // Don't transition for anchor links
        if (el.href && el.href.indexOf('#') > -1) {
          return true;
        }
        return false;
      }
    });

    // Optional: Add custom cursor interaction during transition
    barba.hooks.enter(() => {
      document.body.style.cursor = 'wait';
    });

    barba.hooks.after(() => {
      document.body.style.cursor = 'default';
    });
  });
})();
