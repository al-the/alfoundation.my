/*
 * Adds an iOS-style elastic "rubber band" bounce when the page is scrolled
 * past its top or bottom boundary with a mouse wheel / trackpad.
 * Targets the element with class "rb-scroll" on the page, if present.
 */
(function () {
  var target = document.querySelector('.rb-scroll');
  if (!target) return;

  var RESISTANCE = 0.55;

  function rubberband(delta, dimension) {
    return (delta * dimension * RESISTANCE) / (dimension + RESISTANCE * delta);
  }

  var pull = 0;
  var rafId = null;
  var settleTimer = null;

  function apply(value) {
    target.style.transform = value ? 'translateY(' + value + 'px)' : '';
  }

  function atTop() {
    return (window.scrollY || document.documentElement.scrollTop) <= 0;
  }

  function atBottom() {
    var doc = document.documentElement;
    return Math.ceil(window.scrollY + window.innerHeight) >= doc.scrollHeight;
  }

  function settle() {
    cancelAnimationFrame(rafId);
    (function step() {
      pull *= 0.8;
      if (Math.abs(pull) < 0.5) {
        pull = 0;
        apply(0);
        return;
      }
      apply(pull);
      rafId = requestAnimationFrame(step);
    })();
  }

  window.addEventListener('wheel', function (e) {
    var goingUp = e.deltaY < 0;
    var goingDown = e.deltaY > 0;
    var overscrolling = (goingUp && atTop()) || (goingDown && atBottom());

    if (overscrolling) {
      e.preventDefault();
      cancelAnimationFrame(rafId);
      var raw = pull - e.deltaY * 0.6;
      pull = Math.sign(raw) * rubberband(Math.abs(raw), window.innerHeight);
      apply(pull);
    }

    clearTimeout(settleTimer);
    settleTimer = setTimeout(function () {
      if (pull !== 0) settle();
    }, 120);
  }, { passive: false });
})();
