const links = document.querySelectorAll('.has-tooltip');
let activeTooltip = null;

links.forEach(function(link) {
  link.addEventListener('click', function(event) {
    event.preventDefault();

    if (activeTooltip) {
      activeTooltip.remove();
      activeTooltip = null;
    }

    const tooltip = document.createElement('div');
    tooltip.classList.add('tooltip', 'tooltip_active');
    tooltip.textContent = link.getAttribute('title');

    const rect = link.getBoundingClientRect();
    tooltip.style.position = 'absolute';
    tooltip.style.left = rect.left + window.scrollX + 'px';
    tooltip.style.top = rect.bottom + window.scrollY + 5 + 'px';

    document.body.appendChild(tooltip);
    activeTooltip = tooltip;
  });
});

document.addEventListener('click', function(event) {
  if (activeTooltip && !event.target.classList.contains('has-tooltip')) {
    activeTooltip.remove();
    activeTooltip = null;
  }
});
