document.addEventListener('DOMContentLoaded', function() {

  // Scroll reveal
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) e.target.classList.add('visible');
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(function(el) {
    observer.observe(el);
  });

});
