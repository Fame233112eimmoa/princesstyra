const header = document.querySelector("#site-header");
const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector("#site-nav");

const galleryGrid = document.querySelector("#gallery-grid");
const galleryFilters = document.querySelector("#gallery-filters");
const galleryCount = document.querySelector("#gallery-count");
const galleryEmpty = document.querySelector("#gallery-empty");
const galleryLoadMore = document.querySelector("#gallery-load-more");
const lightboxDialog = document.querySelector("#lightbox-dialog");
const lightboxTitle = document.querySelector("#lightbox-title");
const lightboxDate = document.querySelector("#lightbox-date");
const lightboxContent = document.querySelector("#lightbox-content");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const galleryContent = window.siteContent?.gallery ?? {
  targetCount: 50,
  batchSize: 12,
  filters: [{ id: "all", label: "All" }],
  items: []
};

const galleryState = {
  activeFilter: "all",
  visibleCount: galleryContent.batchSize
};

function matchesFilter(item, filterId) {
  if (filterId === "all") {
    return true;
  }

  if (filterId === "photo") {
    return item.type === "image";
  }

  if (filterId === "video") {
    return item.type === "video";
  }

  return item.filters?.includes(filterId);
}

function getFilteredItems() {
  return galleryContent.items.filter((item) => matchesFilter(item, galleryState.activeFilter));
}

function getDerivedVideoPoster(src) {
  const filename = src?.split("/").pop();

  if (!filename) {
    return "assets/memory-film.svg";
  }

  return `media/posters/${filename}.png`;
}

function getEffectiveVideoPoster(item) {
  if (item.poster && !item.poster.includes("memory-film.svg")) {
    return item.poster;
  }

  return getDerivedVideoPoster(item.src);
}

function createImagePreview(item, button) {
  const image = document.createElement("img");
  image.src = item.thumbnail ?? item.src;
  image.alt = item.alt ?? item.caption ?? "";
  image.loading = "lazy";

  if (item.fallback) {
    image.addEventListener("error", () => {
      image.src = item.fallback;
      button.dataset.src = item.fallback;
    }, { once: true });
  }

  return image;
}

function createVideoPreview(item, button) {
  const poster = getEffectiveVideoPoster(item);
  const image = document.createElement("img");
  image.src = poster;
  image.alt = item.alt ?? item.caption ?? "";
  image.loading = "lazy";

  image.addEventListener("load", () => {
    button.style.setProperty("--media-ratio", `${image.naturalWidth} / ${image.naturalHeight}`);
    button.dataset.orientation = image.naturalHeight > image.naturalWidth ? "portrait" : "landscape";
  }, { once: true });

  image.addEventListener("error", () => {
    image.src = item.fallback ?? "assets/memory-film.svg";
  }, { once: true });

  return image;
}

function openLightbox(item) {
  if (!item?.src || !item?.type) {
    return;
  }

  lightboxTitle.textContent = item.caption ?? "";
  lightboxDate.textContent = item.date ?? "";
  lightboxContent.innerHTML = "";

  const figure = document.createElement("figure");
  figure.className = `lightbox-figure lightbox-figure--${item.type}`;

  if (item.type === "video") {
    const video = document.createElement("video");
    video.src = item.src;
    video.controls = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.autoplay = true;

    video.poster = getEffectiveVideoPoster(item);

    figure.appendChild(video);
  } else {
    const image = document.createElement("img");
    image.src = item.src;
    image.alt = item.alt ?? item.caption ?? "";
    figure.appendChild(image);
  }

  const figcaption = document.createElement("figcaption");
  figcaption.textContent = item.caption ?? "";
  figure.appendChild(figcaption);

  lightboxContent.appendChild(figure);
  lightboxDialog.showModal();
}

function createMediaCard(item) {
  const button = document.createElement("button");
  button.className = `media-card media-card--${item.layout ?? "square"}`;
  button.type = "button";

  button.dataset.type = item.type;
  button.dataset.src = item.src;
  button.dataset.caption = item.caption ?? "";
  button.dataset.date = item.date ?? "";
  button.dataset.fallback = item.fallback ?? "";

  if (item.type === "video") {
    button.dataset.poster = getEffectiveVideoPoster(item);
  } else if (item.poster) {
    button.dataset.poster = item.poster;
  }

  if (item.type === "video") {
    button.classList.add("media-card--video");
    button.appendChild(createVideoPreview(item, button));
  } else {
    button.appendChild(createImagePreview(item, button));
  }

  if (item.type === "video") {
    const badge = document.createElement("span");
    badge.className = "media-card__badge";
    badge.textContent = "Video";
    button.appendChild(badge);
  }

  const meta = document.createElement("span");
  meta.className = "media-card__meta";

  const caption = document.createElement("span");
  caption.textContent = item.caption ?? "";

  const date = document.createElement("span");
  date.textContent = item.date ?? "";

  meta.append(caption, date);
  button.appendChild(meta);

  return button;
}

function renderFilters() {
  if (!galleryFilters) {
    return;
  }

  galleryFilters.innerHTML = "";

  galleryContent.filters.forEach((filter) => {
    const button = document.createElement("button");
    const count =
      filter.id === "all"
        ? galleryContent.items.length
        : galleryContent.items.filter((item) => matchesFilter(item, filter.id)).length;

    button.className = "gallery-filter";
    button.type = "button";
    button.dataset.filter = filter.id;
    button.setAttribute("aria-pressed", String(galleryState.activeFilter === filter.id));

    if (galleryState.activeFilter === filter.id) {
      button.classList.add("is-active");
    }

    button.innerHTML = `<span>${filter.label}</span><span>${count}</span>`;
    galleryFilters.appendChild(button);
  });
}

function renderGallery() {
  if (!galleryGrid) {
    return;
  }

  const filteredItems = getFilteredItems();
  const visibleItems = filteredItems.slice(0, galleryState.visibleCount);

  galleryGrid.innerHTML = "";
  visibleItems.forEach((item) => {
    galleryGrid.appendChild(createMediaCard(item));
  });

  if (galleryCount) {
    if (filteredItems.length) {
      galleryCount.textContent = `Showing ${visibleItems.length} of ${filteredItems.length} memories`;
    } else {
      galleryCount.textContent = "No memories match this view yet.";
    }
  }

  if (galleryEmpty) {
    galleryEmpty.hidden = filteredItems.length !== 0;
  }

  if (galleryLoadMore) {
    const hasMore = visibleItems.length < filteredItems.length;
    galleryLoadMore.hidden = !hasMore;
    galleryLoadMore.disabled = !hasMore;
  }
}

window.addEventListener("scroll", () => {
  header.classList.toggle("is-scrolled", window.scrollY > 24);
});

if (navToggle) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

if (!prefersReducedMotion && "IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  document.querySelectorAll(".reveal").forEach((element) => {
    revealObserver.observe(element);
  });
} else {
  document.querySelectorAll(".reveal").forEach((element) => {
    element.classList.add("is-visible");
  });
}

galleryFilters?.addEventListener("click", (event) => {
  const button = event.target.closest(".gallery-filter");

  if (!button) {
    return;
  }

  galleryState.activeFilter = button.dataset.filter ?? "all";
  galleryState.visibleCount = galleryContent.batchSize;
  renderFilters();
  renderGallery();
});

galleryLoadMore?.addEventListener("click", () => {
  galleryState.visibleCount += galleryContent.batchSize;
  renderGallery();
});

galleryGrid?.addEventListener("click", (event) => {
  const card = event.target.closest(".media-card");

  if (!card) {
    return;
  }

  openLightbox({
    type: card.dataset.type,
    src: card.dataset.src,
    poster: card.dataset.poster,
    caption: card.dataset.caption,
    date: card.dataset.date,
    alt: card.querySelector("img")?.alt ?? ""
  });
});

document.querySelector("[data-lightbox-close]")?.addEventListener("click", () => {
  lightboxDialog.close();
});

lightboxDialog?.addEventListener("close", () => {
  lightboxContent.querySelectorAll("video").forEach((video) => {
    video.pause();
    video.currentTime = 0;
  });
});

[lightboxDialog].forEach((dialog) => {
  dialog?.addEventListener("click", (event) => {
    const rect = dialog.getBoundingClientRect();
    const isInside =
      rect.top <= event.clientY &&
      event.clientY <= rect.top + rect.height &&
      rect.left <= event.clientX &&
      event.clientX <= rect.left + rect.width;

    if (!isInside) {
      dialog.close();
    }
  });
});

renderFilters();
renderGallery();
