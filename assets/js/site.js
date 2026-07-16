(function () {
  const cards = document.querySelectorAll('.focus-card, .project-tile, .blog-card, .demo-card, .method-card, .publication-card');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.style.transform = 'translateY(0)';
          entry.target.style.opacity = '1';
          observer.unobserve(entry.target);
        }
      }
    }, { threshold: 0.12 });
    cards.forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(18px)';
      card.style.transitionDelay = `${Math.min(i * 35, 260)}ms`;
      observer.observe(card);
    });
  }
})();
