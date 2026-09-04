document.addEventListener("DOMContentLoaded", function () {
	setupWhyNovaxCarousel();
	setupStatCounters();
	setupElegantCursor();
	setupLazySmoothScroll();
});

function setupLazySmoothScroll() {
	if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
		return;
	}

	var currentY = window.scrollY || window.pageYOffset;
	var targetY = currentY;
	var maxScroll = 0;
	var ticking = false;

	function updateMaxScroll() {
		maxScroll = Math.max(
			document.documentElement.scrollHeight,
			document.body.scrollHeight
		) - window.innerHeight;
	}

	updateMaxScroll();
	window.addEventListener("resize", updateMaxScroll);

	window.addEventListener(
		"wheel",
		function (event) {
			event.preventDefault();
			updateMaxScroll();
			targetY += event.deltaY * 0.55;
			targetY = Math.max(0, Math.min(targetY, maxScroll));

			if (!ticking) {
				ticking = true;
				window.requestAnimationFrame(render);
			}
		},
		{ passive: false }
	);

	window.addEventListener("scroll", function () {
		if (!ticking) {
			currentY = window.scrollY || window.pageYOffset;
			targetY = currentY;
		}
	});

	function render() {
		currentY += (targetY - currentY) * 0.09;

		if (Math.abs(targetY - currentY) < 0.5) {
			currentY = targetY;
			window.scrollTo(0, currentY);
			ticking = false;
			return;
		}

		window.scrollTo(0, currentY);
		window.requestAnimationFrame(render);
	}
}

function setupElegantCursor() {
	var dot = document.querySelector(".cursor-dot");
	var ring = document.querySelector(".cursor-ring");
	if (!dot || !ring || window.matchMedia("(hover: none)").matches) {
		return;
	}

	var targetX = window.innerWidth / 2;
	var targetY = window.innerHeight / 2;
	var ringX = targetX;
	var ringY = targetY;
	var hasMoved = false;
	var hoverSelector = "a, button, .why-feature, .stat-item, input, textarea, [role='button']";

	document.addEventListener("mousemove", function (event) {
		targetX = event.clientX;
		targetY = event.clientY;

		if (!hasMoved) {
			hasMoved = true;
			ringX = targetX;
			ringY = targetY;
			dot.classList.add("is-active");
			ring.classList.add("is-active");
		}

		dot.style.transform = "translate(" + targetX + "px, " + targetY + "px)";

		var hoveredEl = event.target.closest ? event.target.closest(hoverSelector) : null;
		dot.classList.toggle("is-hovering", !!hoveredEl);
		ring.classList.toggle("is-hovering", !!hoveredEl);
	});

	document.addEventListener("mouseleave", function () {
		dot.classList.remove("is-active");
		ring.classList.remove("is-active");
	});

	document.addEventListener("mouseenter", function () {
		if (hasMoved) {
			dot.classList.add("is-active");
			ring.classList.add("is-active");
		}
	});

	function render() {
		ringX += (targetX - ringX) * 0.18;
		ringY += (targetY - ringY) * 0.18;
		ring.style.transform = "translate(" + ringX + "px, " + ringY + "px)";
		window.requestAnimationFrame(render);
	}

	window.requestAnimationFrame(render);
}

function setupWhyNovaxCarousel() {
	var track = document.querySelector(".why-novax-track");
	if (!track || track.dataset.cloned === "true") {
		return;
	}

	var items = Array.from(track.children);
	items.forEach(function (item) {
		var clone = item.cloneNode(true);
		clone.setAttribute("aria-hidden", "true");
		track.appendChild(clone);
	});

	track.dataset.cloned = "true";
}

function setupStatCounters() {
	var counters = Array.from(document.querySelectorAll(".stat-counter"));
	if (!counters.length) {
		return;
	}

	var strip = document.querySelector(".ecosystem-strip");
	if (!strip) {
		animateCounters(counters);
		return;
	}

	var observer = new IntersectionObserver(
		function (entries) {
			entries.forEach(function (entry) {
				if (entry.isIntersecting) {
					animateCounters(counters);
					observer.disconnect();
				}
			});
		},
		{ threshold: 0.35 }
	);

	observer.observe(strip);
}

function animateCounters(counters) {
	var duration = 1800;
	var startTime = null;

	function step(timestamp) {
		if (!startTime) {
			startTime = timestamp;
		}

		var progress = Math.min((timestamp - startTime) / duration, 1);
		var eased = 1 - Math.pow(1 - progress, 3);

		counters.forEach(function (counter) {
			var target = parseInt(counter.dataset.target || "0", 10);
			var prefix = counter.dataset.prefix || "";
			var suffix = counter.dataset.suffix || "";
			var format = counter.dataset.format || "plain";
			var value = Math.floor(target * eased);
			counter.textContent = prefix + formatCounterValue(value, format) + suffix;
		});

		if (progress < 1) {
			window.requestAnimationFrame(step);
		}
	}

	window.requestAnimationFrame(step);
}

function formatCounterValue(value, format) {
	if (format === "comma") {
		return value.toLocaleString("en-US");
	}

	return String(value);
}
