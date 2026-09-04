document.addEventListener("DOMContentLoaded", function () {
	setupWhyNovaxCarousel();
	setupStatCounters();
});

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
