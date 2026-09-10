document.addEventListener('DOMContentLoaded', function () {
    initScrollReveal();
    initStatCounters();
});

function initScrollReveal() {
    var selectors = [
        '.ecosystem-kicker',
        '.ecosystem-heading',
        '.ecosystem-description',
        '.why-novax-kicker',
        '.why-novax-heading',
        '.why-feature',
        '.tokenomics-kicker',
        '.tokenomics-heading',
        '.tokenomics-row',
        '.mission-kicker',
        '.mission-heading',
        '.mission-description p',
        '.roadmap-kicker',
        '.roadmap-phase-tag',
        '.roadmap-heading',
        '.roadmap-lead-list li',
        '.latest-news-kicker',
        '.latest-news-heading',
        '.latest-news-description',
        '.latest-news-link',
        '.news-card',
        '.ecosystem-cta-copy h2',
        '.ecosystem-cta-copy p',
        '.ecosystem-cta-action'
    ];

    var elements = document.querySelectorAll(selectors.join(','));
    if (!elements.length) {
        return;
    }

    if (!('IntersectionObserver' in window)) {
        elements.forEach(function (el) {
            el.classList.add('sr-fade-up', 'is-visible');
        });
        return;
    }

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    elements.forEach(function (el, index) {
        el.classList.add('sr-fade-up');
        el.style.transitionDelay = (index % 4) * 90 + 'ms';
        observer.observe(el);
    });
}

function initStatCounters() {
    var counters = document.querySelectorAll('.stat-counter');
    if (!counters.length) {
        return;
    }

    function formatValue(value, format) {
        if (format === 'comma') {
            return Math.round(value).toLocaleString('en-US');
        }
        return Math.round(value).toString();
    }

    function animateCounter(el) {
        var target = parseFloat(el.dataset.target) || 0;
        var prefix = el.dataset.prefix || '';
        var suffix = el.dataset.suffix || '';
        var format = el.dataset.format || 'plain';
        var duration = 1800;
        var startTime = null;

        function step(timestamp) {
            if (startTime === null) {
                startTime = timestamp;
            }
            var progress = Math.min((timestamp - startTime) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            var current = target * eased;
            el.textContent = prefix + formatValue(current, format) + suffix;

            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                el.textContent = prefix + formatValue(target, format) + suffix;
            }
        }

        window.requestAnimationFrame(step);
    }

    if (!('IntersectionObserver' in window)) {
        counters.forEach(animateCounter);
        return;
    }

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.4 });

    counters.forEach(function (el) {
        observer.observe(el);
    });
}
