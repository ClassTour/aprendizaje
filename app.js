/* =========================================================
   CLASS TOUR
   APP.JS — Completo (v3, corregido)
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  "use strict";

  /* =========================================================
     CONFIGURACIÓN
     ========================================================= */

  const CONFIG = {
    API_URL: "https://script.google.com/macros/s/AKfycbyvy0q2SbOL_141rS5viSYVBar4GkC0-G03sot0CXgLBk6lIg37-oAQmyPUqD8DUQQv/exec",
    WHATSAPP: "573143376229",
    EMAIL: "classtouraprendizaje@gmail.com",
    NOMBRE_PLATAFORMA: "CLASS TOUR",
    TIMEOUT_MS: 20000
  };
     const ICON_YT = `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="#FF0000" d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8z"/><path fill="#fff" d="M9.6 15.6V8.4l6.2 3.6z"/></svg>`;

  const ICON_360 = `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#2f5d46"/><text x="12" y="15.5" text-anchor="middle" font-size="9" font-weight="700" fill="#fff" font-family="Arial,sans-serif">360</text></svg>`;


  /* =========================================================
     REFERENCIAS AL DOM
     ========================================================= */

  const categoryGrid = document.getElementById("categoryGrid");
  const courseGrid = document.getElementById("courseGrid");
  const emptyState = document.getElementById("emptyState");

  const searchForm = document.getElementById("searchForm");
  const searchInput = document.getElementById("searchInput");
  const locationSelect = document.getElementById("locationSelect");

  const clearSearchBtn = document.getElementById("clearSearchBtn");
  const showAllBtn = document.getElementById("showAllBtn");
  const allCategoriesBtn = document.getElementById("allCategoriesBtn");

  const modal = document.getElementById("modal");
  const modalContent = document.getElementById("modalContent");
  const modalClose = document.getElementById("modalClose");
  const modalBackdrop = document.getElementById("modalBackdrop");

  const teachBtn = document.getElementById("teachBtn");
  const footerRegisterBtn = document.getElementById("footerRegisterBtn");

  const categoriasBtn = document.getElementById("categoriasBtn");
  const categoriasMenu = document.getElementById("categoriasMenu");

  const year = document.getElementById("year");


  /* =========================================================
     CATEGORÍAS
     ========================================================= */

  const categorias = [
    { nombre: "Artesanías", icono: "🧵" },
    { nombre: "Arte", icono: "🎨" },
    { nombre: "Música", icono: "🎵" },
    { nombre: "Danza", icono: "💃" },
    { nombre: "Cocina", icono: "🍳" },
    { nombre: "Fotografía", icono: "📷" },
    { nombre: "Diseño", icono: "✏️" },
    { nombre: "Moda", icono: "👗" },
    { nombre: "Madera", icono: "🪵" },
    { nombre: "Cuero", icono: "👜" },
    { nombre: "Cerámica", icono: "🏺" },
    { nombre: "Tatuajes", icono: "🖋️" },
    { nombre: "Tejidos", icono: "🧶" },
    { nombre: "Yoga", icono: "🧘" },
    { nombre: "Ballet", icono: "🩰" },
    { nombre: "Tango", icono: "💃" },
    { nombre: "Dibujo", icono: "✍️" },
    { nombre: "Pintura", icono: "🖌️" },
    { nombre: "Enología", icono: "🍷" },
    { nombre: "Ornamentación", icono: "🌿" },
    { nombre: "Carpintería", icono: "🔨" },
    { nombre: "Marroquinería", icono: "👜" },
    { nombre: "Manualidades", icono: "✂️" },
    { nombre: "Jardinería", icono: "🌱" },
    { nombre: "Escritura", icono: "📝" },
    { nombre: "Teatro", icono: "🎭" },
    { nombre: "Bienestar", icono: "🌿" },
    { nombre: "Otros", icono: "✨" }
  ];


  /* =========================================================
     ESTADO DE LA APLICACIÓN
     ========================================================= */

  let courses = [];
  let currentCourses = [];
  let currentSearch = "";
  let currentLocation = "";
  let currentCategory = "";
  let currentCourse = null;
  let categoriesExpanded = false;
  let loadFailed = false;
  let bookingInProgress = false;
  let teacherInProgress = false;
  let panoViewer = null;
  let pannellumPromise = null;


  /* =========================================================
     FUNCIONES AUXILIARES
     ========================================================= */

  function escapeHTML(value) {
    if (value === null || value === undefined) return "";
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalizeText(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function formatPrice(price) {
    const value = Number(price) || 0;
    if (value === 0) return "Consultar";
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0
    }).format(value);
  }

  function getWhatsAppUrl(message) {
    return "https://wa.me/" + CONFIG.WHATSAPP + "?text=" + encodeURIComponent(message);
  }

  function getMailtoUrl(subject, body) {
    return (
      "mailto:" + CONFIG.EMAIL +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(body)
    );
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function isValidPhone(phone) {
    return /^[0-9]{10,15}$/.test(String(phone).replace(/\D/g, ""));
  }

  function setStatus(el, message, isError) {
    if (!el) return;
    el.classList.toggle("error", !!isError);
    el.textContent = message;
  }

  // POST al Apps Script con tiempo límite. Devuelve el JSON ya validado.
  async function postToAPI(datos) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CONFIG.TIMEOUT_MS);

    try {
      const response = await fetch(CONFIG.API_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(datos),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error("Error HTTP " + response.status);
      }

      const text = await response.text();

      let result;
      try {
        result = JSON.parse(text);
      } catch {
        throw new Error("La respuesta del servidor no es JSON válido");
      }

      if (typeof result !== "object" || result === null) {
        throw new Error("Respuesta inválida del servidor");
      }

      return result;

    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error("Tiempo de espera agotado. Intenta nuevamente.");
      }
      throw error;

    } finally {
      clearTimeout(timeout);
    }
  }


  /* =========================================================
     VIDEO DE YOUTUBE Y FOTO 360°
     ========================================================= */

  function getYoutubeId(url) {
    try {
      const u = new URL(String(url || "").trim());
      const host = u.hostname.replace(/^www\.|^m\./, "");
      let id = null;

      if (host === "youtu.be") {
        id = u.pathname.slice(1);
      } else if (host === "youtube.com" || host === "music.youtube.com") {
        if (u.pathname === "/watch") {
          id = u.searchParams.get("v");
        } else {
          const m = u.pathname.match(/^\/(embed|shorts|live)\/([^/?]+)/);
          if (m) id = m[2];
        }
      }

      return id && /^[\w-]{11}$/.test(id) ? id : null;
    } catch (e) {
      return null;
    }
  }

  function loadPannellum() {
    if (window.pannellum) return Promise.resolve();
    if (pannellumPromise) return pannellumPromise;

    pannellumPromise = new Promise((resolve, reject) => {
      const css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = "https://cdnjs.cloudflare.com/ajax/libs/pannellum/2.5.6/pannellum.css";
      document.head.appendChild(css);

      const js = document.createElement("script");
      js.src = "https://cdnjs.cloudflare.com/ajax/libs/pannellum/2.5.6/pannellum.js";
      js.onload = resolve;
      js.onerror = () => {
        pannellumPromise = null;
        reject(new Error("No se pudo cargar el visor 360°"));
      };
      document.head.appendChild(js);
    });

    return pannellumPromise;
  }

  function destroyPano() {
    if (panoViewer) {
      try { panoViewer.destroy(); } catch (e) { }
      panoViewer = null;
    }
  }

  // Ventana compacta con el video o la foto 360° (sin scroll)
  async function showMediaModal(course, type) {
    if (!modal || !modalContent) return;

    destroyPano();
    currentCourse = course;

    const isVideo = type === "video";
    const title = course.title || "Actividad";

    modalContent.innerHTML = `
      <div class="media-modal">
        <h2 id="modalTitle">${isVideo ? "Video" : "Recorrido 360°"} · ${escapeHTML(title)}</h2>
        <div class="media-stage" id="mediaStage"></div>
        <p class="form-status" id="mediaStatus" aria-live="polite"></p>
        <div class="form-actions">
          <button type="button" class="btn btn-primary" id="mediaDetailBtn">Ver actividad</button>
          <button type="button" class="btn btn-light" id="mediaCloseBtn">Cerrar</button>
        </div>
      </div>
    `;

    document.getElementById("mediaDetailBtn").addEventListener("click", () => {
      destroyPano();
      showCourseDetail(course);
    });

    document.getElementById("mediaCloseBtn").addEventListener("click", closeModal);

    openModal();

    const stage = document.getElementById("mediaStage");
    const status = document.getElementById("mediaStatus");

    if (isVideo) {
      const id = getYoutubeId(course.youtubeUrl);

      if (!id) {
        setStatus(status, "El video no está disponible.", true);
        return;
      }

      const frame = document.createElement("iframe");
      frame.src = "https://www.youtube-nocookie.com/embed/" + id;
      frame.title = "Video de " + title;
      frame.allow = "encrypted-media; picture-in-picture; fullscreen";
      frame.allowFullscreen = true;
      frame.referrerPolicy = "strict-origin-when-cross-origin";
      stage.appendChild(frame);
      return;
    }

    setStatus(status, "Cargando foto 360°...", false);

    try {
      await loadPannellum();

      // Si cerraron la ventana mientras cargaba, no hacemos nada
      if (!document.getElementById("mediaStage")) return;

      panoViewer = window.pannellum.viewer("mediaStage", {
        type: "equirectangular",
        panorama: course.photo360,
        autoLoad: true,
        showControls: true,
        compass: false
      });

      setStatus(status, "", false);

    } catch (e) {
      setStatus(status, "No se pudo cargar la foto 360°.", true);
    }
  }


  /* =========================================================
     RENDERIZAR CATEGORÍAS
     ========================================================= */

  function renderCategories() {
    if (!categoryGrid) return;

    categoryGrid.innerHTML = "";

    categorias.forEach((categoria) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "category";
      button.dataset.category = categoria.nombre;
      button.innerHTML = `
        <span class="category-icon" aria-hidden="true">${categoria.icono}</span>
        <strong>${escapeHTML(categoria.nombre)}</strong>
      `;

      button.addEventListener("click", () => {
        currentCategory = categoria.nombre;
        currentSearch = "";
        currentLocation = "";

        if (searchInput) searchInput.value = "";
        if (locationSelect) locationSelect.value = "";

        applyFilters();
        scrollToCourses();
      });

      categoryGrid.appendChild(button);
    });

    applyCategoriesExpandedState();
  }

  function applyCategoriesExpandedState() {
    if (!categoryGrid) return;
    categoryGrid.classList.toggle("expanded", categoriesExpanded);
  }

  function scrollToCourses() {
    const cursos = document.getElementById("destacados");
    if (cursos) {
      cursos.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }


  /* =========================================================
     MENÚ DESPLEGABLE DE CATEGORÍAS
     ========================================================= */

  function renderCategoryMenu() {
    if (!categoriasMenu) return;

    categoriasMenu.innerHTML = "";

    categorias.forEach((categoria) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "categoria-opcion";
      button.setAttribute("role", "menuitem");
      button.dataset.category = categoria.nombre;
      button.innerHTML = `
        <span aria-hidden="true">${categoria.icono}</span>
        <span>${escapeHTML(categoria.nombre)}</span>
      `;

      button.addEventListener("click", () => {
        currentCategory = categoria.nombre;
        currentSearch = "";

        if (searchInput) searchInput.value = "";

        applyFilters();
        closeCategoryMenu();
        scrollToCourses();
      });

      categoriasMenu.appendChild(button);
    });
  }

  function openCategoryMenu() {
    if (!categoriasMenu || !categoriasBtn) return;
    categoriasMenu.classList.add("open");
    categoriasBtn.setAttribute("aria-expanded", "true");
    categoriasMenu.setAttribute("aria-hidden", "false");
  }

  function closeCategoryMenu() {
    if (!categoriasMenu || !categoriasBtn) return;
    categoriasMenu.classList.remove("open");
    categoriasBtn.setAttribute("aria-expanded", "false");
    categoriasMenu.setAttribute("aria-hidden", "true");
  }


  /* =========================================================
     FILTRAR CURSOS
     ========================================================= */

  function applyFilters() {
    const search = normalizeText(currentSearch);
    const location = normalizeText(currentLocation);
    const category = normalizeText(currentCategory);

    currentCourses = courses.filter((course) => {
      const searchable = normalizeText(
        [
          course.title,
          course.tutor,
          course.category,
          course.location,
          course.courseType,
          course.description
        ].join(" ")
      );

      const matchesSearch = !search || searchable.includes(search);
      const matchesLocation =
        !location || normalizeText(course.location) === location;
      const matchesCategory =
        !category ||
        normalizeText(course.category) === category ||
        normalizeText(course.title) === category;

      return matchesSearch && matchesLocation && matchesCategory;
    });

    renderCourses(currentCourses);
  }


  /* =========================================================
     RENDERIZAR CURSOS
     ========================================================= */

  function renderCourses(courseList) {
    if (!courseGrid) return;

    courseGrid.innerHTML = "";

    if (!courseList || courseList.length === 0) {
      if (emptyState) emptyState.classList.remove("hidden");
      return;
    }

    if (emptyState) emptyState.classList.add("hidden");

    const fragment = document.createDocumentFragment();

    courseList.forEach((course) => {
      const card = document.createElement("article");
      card.className = "course-card";

      const hasVideo = !!getYoutubeId(course.youtubeUrl);
      const has360 = !!(course.photo360 || "").trim();

      const category = course.category || "General";
      const courseType = course.courseType || "Actividad";
      const location = course.location || "Ubicación por confirmar";
      const tutor = course.tutor || "Instructor";
      const description = course.description || "";
      const title = course.title || "Actividad sin título";

      const imageHTML = course.image
        ? `<img class="course-image" src="${escapeHTML(course.image)}" alt="${escapeHTML(title)}" loading="lazy">`
        : `<div class="course-image-placeholder">
             <span aria-hidden="true">✨</span>
             <small>Sin imagen</small>
           </div>`;

      const videoBtn = hasVideo
        ? `<button type="button" class="course-media-btn" data-media="video" aria-label="Ver video de ${escapeHTML(title)}">${ICON_YT}<span>Video</span></button>`
        : "";

      const panoBtn = has360
        ? `<button type="button" class="course-media-btn" data-media="360" aria-label="Ver foto 360° de ${escapeHTML(title)}">${ICON_360}<span>360°</span></button>`
        : "";

      card.innerHTML = `
        <div class="course-image-wrap">
          ${imageHTML}
          <span class="course-badge">${escapeHTML(category)}</span>
          <span class="course-type-badge course-type-${normalizeText(courseType)}">${escapeHTML(courseType)}</span>
        </div>

        <div class="course-info">
          <div class="course-meta">
            <span>📍 ${escapeHTML(location)}</span>
            <span>${formatPrice(course.price)}</span>
          </div>

          <h3>${escapeHTML(title)}</h3>

          <p class="course-tutor">Por: ${escapeHTML(tutor)}</p>

          <p class="course-description">${escapeHTML(description)}</p>

          <div class="course-actions">
            <button type="button" class="course-view-btn">Ver actividad</button>
            ${videoBtn}
            ${panoBtn}
          </div>
        </div>
      `;

      const viewButton = card.querySelector(".course-view-btn");
      if (viewButton) {
        viewButton.addEventListener("click", () => showCourseDetail(course));
      }

      card.querySelectorAll(".course-media-btn").forEach((btn) => {
        btn.addEventListener("click", () => showMediaModal(course, btn.dataset.media));
      });

      fragment.appendChild(card);
    });

    courseGrid.appendChild(fragment);
  }


  /* =========================================================
     MODAL: ABRIR / CERRAR
     ========================================================= */

  function openModal() {
    if (!modal) return;
    modal.classList.remove("hidden");
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  }

  function closeModal() {
    if (!modal) return;

    destroyPano();

    modal.classList.remove("open");
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");

    if (modalContent) {
      modalContent.replaceChildren();
    }

    currentCourse = null;
  }

  if (modalClose) {
    modalClose.addEventListener("click", closeModal);
  }

  if (modalBackdrop) {
    modalBackdrop.addEventListener("click", closeModal);
  }

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    if (modal && modal.classList.contains("open")) {
      closeModal();
    }
    closeCategoryMenu();
  });


  /* =========================================================
     FICHA DEL CURSO
     ========================================================= */

  function showCourseDetail(course) {
    if (!modal || !modalContent) return;

    destroyPano();
    currentCourse = course;

    const title = course.title || "Actividad sin título";
    const tutor = course.tutor || "Instructor";
    const location = course.location || "Ubicación por confirmar";
    const category = course.category || "General";
    const courseType = course.courseType || "Actividad";
    const description = course.description || "No hay descripción disponible.";

    const imageHTML = course.image
      ? `<div class="course-detail-image">
           <img src="${escapeHTML(course.image)}" alt="${escapeHTML(title)}" loading="lazy">
         </div>`
      : `<div class="course-detail-image">
           <div class="course-image-placeholder course-detail-placeholder">
             <span aria-hidden="true">✨</span>
             <small>Sin imagen</small>
           </div>
         </div>`;

    const scheduleLine = course.schedule
      ? `<div class="detail-grid">
           <div>
             <small>Horario</small>
             <strong>🕐 ${escapeHTML(course.schedule)}</strong>
           </div>
         </div>`
      : "";

    modalContent.innerHTML = `
      <div class="course-detail">

        ${imageHTML}

        <div class="course-detail-content">

          <span class="course-detail-badge">
            ${escapeHTML(courseType)} · ${escapeHTML(category)}
          </span>

          <h2 id="modalTitle">${escapeHTML(title)}</h2>

          <p class="detail-tutor">
            Instructor: <strong>${escapeHTML(tutor)}</strong>
          </p>

          <div class="detail-grid">
            <div>
              <small>Ubicación</small>
              <strong>📍 ${escapeHTML(location)}</strong>
            </div>
            <div>
              <small>Categoría</small>
              <strong>${escapeHTML(category)}</strong>
            </div>
          </div>

          ${scheduleLine}

          <div class="detail-section">
            <h3>Descripción</h3>
            <p>${escapeHTML(description)}</p>
          </div>

          <div class="detail-price">
            <small>Valor</small>
            <strong>${formatPrice(course.price)}</strong>
          </div>

          <div class="cash-notice">
            💵 <strong>Pago en efectivo</strong> al finalizar la actividad.
            <br>
            <small>
              CLASS TOUR no procesa pagos.
              El pago se realiza directamente al instructor.
            </small>
          </div>

          <div class="booking-box">
            <div>
              <h3>¿Te interesa esta actividad?</h3>
              <p>Reserva tu cupo y nos pondremos en contacto contigo.</p>
            </div>
            <button type="button" id="modalReserveBtn">Quiero reservar</button>
          </div>

          <div class="booking-box">
            <div>
              <h3>¿Tienes preguntas?</h3>
              <p>Escríbenos por WhatsApp y resolveremos tus dudas.</p>
            </div>
            <button type="button" class="btn btn-light" id="modalWhatsAppBtn">
              Consultar por WhatsApp
            </button>
          </div>

        </div>
      </div>
    `;

    const reserveButton = document.getElementById("modalReserveBtn");
    if (reserveButton) {
      reserveButton.addEventListener("click", () => showBookingForm(course));
    }

    const whatsappButton = document.getElementById("modalWhatsAppBtn");
    if (whatsappButton) {
      whatsappButton.addEventListener("click", () => {
        const message =
          `Hola, CLASS TOUR. Estoy interesado en la actividad "${title}" impartida por ${tutor} en ${location}. Quisiera recibir más información.`;

        window.open(getWhatsAppUrl(message), "_blank", "noopener,noreferrer");
      });
    }

    openModal();
  }


  /* =========================================================
     FORMULARIO DE RESERVA
     ========================================================= */

    function showCourseDetail(course) {
    if (!modal || !modalContent) return;

    destroyPano();
    currentCourse = course;

    const title = course.title || "Actividad sin título";
    const tutor = course.tutor || "Instructor";
    const location = course.location || "Ubicación por confirmar";
    const category = course.category || "General";
    const courseType = course.courseType || "Actividad";
    const description = course.description || "No hay descripción disponible.";

    const imageHTML = course.image
      ? `<div class="course-detail-image">
           <img src="${escapeHTML(course.image)}" alt="${escapeHTML(title)}" loading="lazy">
         </div>`
      : `<div class="course-detail-image">
           <div class="course-image-placeholder course-detail-placeholder">
             <span aria-hidden="true">✨</span>
             <small>Sin imagen</small>
           </div>
         </div>`;

    const learningItems = Array.isArray(course.learning) ? course.learning : [];
    const learningHTML = learningItems.length
      ? `<div class="detail-section">
           <h3>¿Qué se aprende?</h3>
           <ul class="learning-list">
             ${learningItems.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}
           </ul>
         </div>`
      : "";

    const scheduleLine = course.schedule
      ? `<div class="detail-grid">
           <div>
             <small>Horario</small>
             <strong>🕐 ${escapeHTML(course.schedule)}</strong>
           </div>
         </div>`
      : "";

    modalContent.innerHTML = `
      <div class="course-detail">

        ${imageHTML}

        <div class="course-detail-content">

          <span class="course-detail-badge">
            ${escapeHTML(courseType)} · ${escapeHTML(category)}
          </span>

          <h2 id="modalTitle">${escapeHTML(title)}</h2>

          <p class="detail-tutor">
            Instructor: <strong>${escapeHTML(tutor)}</strong>
          </p>

          <div class="detail-grid">
            <div>
              <small>Ubicación</small>
              <strong>📍 ${escapeHTML(location)}</strong>
            </div>
            <div>
              <small>Categoría</small>
              <strong>${escapeHTML(category)}</strong>
            </div>
          </div>

          ${scheduleLine}

          <div class="detail-section">
            <h3>Descripción</h3>
            <p>${escapeHTML(description)}</p>
          </div>

          ${learningHTML}

          <div class="detail-price">
            <small>Valor</small>
            <strong>${formatPrice(course.price)}</strong>
          </div>

          <div class="cash-notice">
            💵 <strong>Pago en efectivo</strong> al finalizar la actividad.
            <br>
            <small>
              CLASS TOUR no procesa pagos.
              El pago se realiza directamente al instructor.
            </small>
          </div>

          <div class="booking-box">
            <div>
              <h3>¿Te interesa esta actividad?</h3>
              <p>Reserva tu cupo y nos pondremos en contacto contigo.</p>
            </div>
            <button type="button" id="modalReserveBtn">Quiero reservar</button>
          </div>

          <div class="booking-box">
            <div>
              <h3>¿Tienes preguntas?</h3>
              <p>Escríbenos por WhatsApp y resolveremos tus dudas.</p>
            </div>
            <button type="button" class="btn btn-light" id="modalWhatsAppBtn">
              Consultar por WhatsApp
            </button>
          </div>

        </div>
      </div>
    `;

    const reserveButton = document.getElementById("modalReserveBtn");
    if (reserveButton) {
      reserveButton.addEventListener("click", () => showBookingForm(course));
    }

    const whatsappButton = document.getElementById("modalWhatsAppBtn");
    if (whatsappButton) {
      whatsappButton.addEventListener("click", () => {
        const message =
          `Hola, CLASS TOUR. Estoy interesado en la actividad "${title}" impartida por ${tutor} en ${location}. Quisiera recibir más información.`;

        window.open(getWhatsAppUrl(message), "_blank", "noopener,noreferrer");
      });
    }

    openModal();
  }

  /* =========================================================
     ENVIAR RESERVA AL GOOGLE APPS SCRIPT
     ========================================================= */

  async function confirmBooking(course) {
    if (bookingInProgress) return;

    if (!course) {
      console.error("Curso no encontrado");
      return;
    }

    const nameInput = document.getElementById("bookingName");
    const emailInput = document.getElementById("bookingEmail");
    const phoneInput = document.getElementById("bookingPhone");
    const noteInput = document.getElementById("bookingNote");
    const consentInput = document.getElementById("bookingConsent");
    const status = document.getElementById("bookingStatus");
    const submitButton = document.getElementById("confirmBookingBtn");

    if (!nameInput || !emailInput || !phoneInput || !status) return;

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    const note = noteInput ? noteInput.value.trim() : "";
    const consent = consentInput ? consentInput.checked : false;

    if (!name || !email || !phone) {
      setStatus(status, "Por favor completa todos los campos obligatorios.", true);
      return;
    }

    if (!isValidEmail(email)) {
      setStatus(status, "Correo electrónico inválido.", true);
      return;
    }

    if (!isValidPhone(phone)) {
      setStatus(status, "Número de WhatsApp inválido. Usa de 10 a 15 dígitos.", true);
      return;
    }

    if (!consent) {
      setStatus(status, "Debes autorizar el tratamiento de tus datos personales.", true);
      return;
    }

    bookingInProgress = true;
    setStatus(status, "Enviando solicitud...", false);

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Enviando...";
    }

    // El backend lee el campo "curso"; "actividad" se envía por compatibilidad
    const datos = {
      tipo: "reserva",
      curso: course.title,
      actividad: course.title,
      instructor: course.tutor,
      ubicacion: course.location,
      horario: course.schedule || "",
      alumno: name,
      correo: email,
      whatsapp: phone,
      mensaje: note,
      consentimiento: true,
      fechaConsentimiento: new Date().toISOString()
    };

    try {
      const result = await postToAPI(datos);

      if (!result.ok) {
        // El servidor respondió, pero rechazó los datos: se queda en el formulario
        setStatus(
          status,
          result.mensaje || "No pudimos registrar tu solicitud. Revisa tus datos.",
          true
        );
        return;
      }

      showSendOptions(course, name, email, phone, note, result.id || "", true);

    } catch (error) {
      console.error("Error enviando reserva:", error);

      // Fallo de conexión: se ofrece WhatsApp, pero SIN decir que quedó registrada
      showSendOptions(course, name, email, phone, note, "", false);

    } finally {
      bookingInProgress = false;
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Enviar solicitud";
      }
    }
  }


  /* =========================================================
     OPCIONES DESPUÉS DE LA RESERVA
     ========================================================= */

  function showSendOptions(course, name, email, phone, note, reservationId, saved) {
    if (!modalContent) return;

    const title = (course && course.title) || "Actividad sin título";
    const tutor = (course && course.tutor) || "Instructor";
    const location = (course && course.location) || "Ubicación por confirmar";

    const scheduleLine = course && course.schedule
      ? "Horario: " + course.schedule
      : "Horario: Por confirmar";

    const message = [
      "Hola, CLASS TOUR.",
      "",
      "Estoy interesado en la siguiente actividad:",
      "",
      "Actividad: " + title,
      "Instructor: " + tutor,
      "Ubicación: " + location,
      scheduleLine,
      "",
      "Datos del participante:",
      "",
      "Nombre: " + name,
      "Correo: " + email,
      "WhatsApp: " + phone,
      "",
      "Mensaje:",
      note || "Sin mensaje",
      "",
      reservationId ? "Número de solicitud: " + reservationId : ""
    ].join("\n").trim();

    const whatsappUrl = getWhatsAppUrl(message);
    const emailUrl = getMailtoUrl("Solicitud de reserva - " + title, message);

    const modalTitle = saved
      ? "✅ ¡Solicitud enviada!"
      : "⚠️ Solicitud no registrada";

    const intro = saved
      ? "Tu solicitud quedó registrada correctamente en CLASS TOUR."
      : "No fue posible registrar tu solicitud automáticamente.";

    const notice = saved
      ? "Te contactaremos pronto para confirmar la disponibilidad y los detalles de la actividad."
      : "Para completar el proceso debes enviarnos tu solicitud por WhatsApp o correo electrónico.";

    const summaryHTML = saved && reservationId
      ? `<div class="booking-summary">
           <strong>Número de solicitud:</strong> ${escapeHTML(reservationId)}
         </div>`
      : "";

    modalContent.innerHTML = `
      <div class="reservation-success">

        <h2 id="modalTitle">${modalTitle}</h2>

        <p>${intro}</p>

        ${summaryHTML}

        <div class="cash-notice">${notice}</div>

        <div class="send-options">

          <h3>${saved ? "Canales de contacto" : "Completa tu solicitud"}</h3>

          <p>
            ${saved
              ? "Si lo deseas también puedes comunicarte directamente con nosotros."
              : "Usa alguno de los siguientes canales para que podamos gestionar tu reserva."}
          </p>

          <div class="send-options-buttons">
            <a href="${escapeHTML(whatsappUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
              WhatsApp
            </a>
            <a href="${escapeHTML(emailUrl)}" class="btn btn-light">
              Correo electrónico
            </a>
          </div>

          <div style="margin-top:20px;">
            <button type="button" class="btn btn-light" id="closeReservationModal">
              Cerrar
            </button>
          </div>

        </div>

      </div>
    `;

    const closeBtn = document.getElementById("closeReservationModal");
    if (closeBtn) {
      closeBtn.addEventListener("click", closeModal);
    }
  }


  /* =========================================================
     FORMULARIO "QUIERO ENSEÑAR"
     ========================================================= */

  function showTeacherForm() {
    if (!modal || !modalContent) return;

    destroyPano();
    currentCourse = null;

    const categoryOptions = categorias
      .map((c) => `<option value="${escapeHTML(c.nombre)}">${escapeHTML(c.nombre)}</option>`)
      .join("");

    modalContent.innerHTML = `
      <div class="teacher-modal">
        <h2 id="modalTitle">Quiero enseñar en CLASS TOUR</h2>

        <p>
          Cuéntanos sobre ti y sobre el oficio o conocimiento
          que quieres compartir. Revisaremos tu propuesta y
          nos pondremos en contacto contigo.
        </p>

        <form id="teacherForm" class="teacher-form">
          <div class="form-grid">

            <div class="form-group">
              <label for="teacherName">Nombre completo *</label>
              <input type="text" id="teacherName" name="nombre" required maxlength="100" autocomplete="name">
            </div>

            <div class="form-group">
              <label for="teacherEmail">Correo electrónico *</label>
              <input type="email" id="teacherEmail" name="correo" required maxlength="254" autocomplete="email">
            </div>

            <div class="form-group">
              <label for="teacherPhone">WhatsApp *</label>
              <input type="tel" id="teacherPhone" name="whatsapp" required maxlength="25" autocomplete="tel" placeholder="Ej. 3001234567">
            </div>

            <div class="form-group">
              <label for="teacherLocation">Ciudad o municipio</label>
              <input type="text" id="teacherLocation" name="ubicacion" maxlength="150" placeholder="Ej. Chía">
            </div>

            <div class="form-group">
              <label for="teacherCategory">Categoría *</label>
              <select id="teacherCategory" name="categoria" required>
                <option value="">Selecciona una categoría</option>
                ${categoryOptions}
              </select>
            </div>

            <div class="form-group">
              <label for="teacherSkill">Oficio o curso *</label>
              <input type="text" id="teacherSkill" name="oficio" required maxlength="150" placeholder="Ej. Carpintería, Bordado, Tango...">
            </div>

            <div class="form-group full">
              <label for="teacherExperience">Cuéntanos sobre tu experiencia</label>
              <textarea id="teacherExperience" name="experiencia" rows="4" maxlength="2000" placeholder="Ej. Llevo 15 años trabajando la madera y he enseñado a..."></textarea>
            </div>

          </div>

          <div class="legal-check">
            <label>
              <input type="checkbox" id="teacherConsent" required>
              <span>
                Autorizo a CLASS TOUR el tratamiento de mis datos
                personales conforme a la
                <a href="privacidad.html" target="_blank" rel="noopener">Política de Privacidad</a>,
                para evaluar mi propuesta y contactarme.
              </span>
            </label>
          </div>

          <div class="legal-check">
            <label>
              <input type="checkbox" id="teacherLegal" required>
              <span>
                Declaro que mi actividad es <strong>independiente, presencial y no supera las 160 horas</strong>.
                No expediré títulos ni certificaciones académicas. Entiendo que CLASS TOUR
                no es una institución educativa.
              </span>
            </label>
          </div>

          <div id="teacherStatus" class="form-status" aria-live="polite"></div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" id="confirmTeacherBtn">
              Enviar propuesta
            </button>
            <button type="button" class="btn btn-light" id="cancelTeacherBtn">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    `;

    const cancelButton = document.getElementById("cancelTeacherBtn");
    if (cancelButton) {
      cancelButton.addEventListener("click", closeModal);
    }

    const teacherForm = document.getElementById("teacherForm");
    if (teacherForm) {
      teacherForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        await confirmTeacher();
      });
    }

    openModal();
  }

  async function confirmTeacher() {
    if (teacherInProgress) return;

    const nameInput = document.getElementById("teacherName");
    const emailInput = document.getElementById("teacherEmail");
    const phoneInput = document.getElementById("teacherPhone");
    const locationInput = document.getElementById("teacherLocation");
    const categoryInput = document.getElementById("teacherCategory");
    const skillInput = document.getElementById("teacherSkill");
    const experienceInput = document.getElementById("teacherExperience");
    const consentInput = document.getElementById("teacherConsent");
    const legalInput = document.getElementById("teacherLegal");
    const status = document.getElementById("teacherStatus");
    const submitButton = document.getElementById("confirmTeacherBtn");

    if (!nameInput || !emailInput || !phoneInput || !categoryInput || !skillInput || !status) {
      return;
    }

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    const location = locationInput ? locationInput.value.trim() : "";
    const category = categoryInput.value;
    const skill = skillInput.value.trim();
    const experience = experienceInput ? experienceInput.value.trim() : "";
    const consent = consentInput ? consentInput.checked : false;
    const declaracionLegal = legalInput ? legalInput.checked : false;

    if (!name || !email || !phone || !category || !skill) {
      setStatus(status, "Por favor completa todos los campos obligatorios.", true);
      return;
    }

    if (!isValidEmail(email)) {
      setStatus(status, "Correo electrónico inválido.", true);
      return;
    }

    if (!isValidPhone(phone)) {
      setStatus(status, "Número de WhatsApp inválido. Usa de 10 a 15 dígitos.", true);
      return;
    }

    if (!consent) {
      setStatus(status, "Debes autorizar el tratamiento de tus datos personales.", true);
      return;
    }

    if (!declaracionLegal) {
      setStatus(status, "Debes aceptar la declaración legal para enviar tu propuesta.", true);
      return;
    }

    teacherInProgress = true;
    setStatus(status, "Enviando propuesta...", false);

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Enviando...";
    }

    const datos = {
      tipo: "instructor",
      nombre: name,
      correo: email,
      whatsapp: phone,
      ubicacion: location,
      categoria: category,
      oficio: skill,
      experiencia: experience,
      consentimiento: true,
      declaracionLegal: declaracionLegal,
      fechaConsentimiento: new Date().toISOString()
    };

    try {
      const result = await postToAPI(datos);

      if (!result.ok) {
        throw new Error(result.mensaje || "No fue posible registrar tu propuesta.");
      }

      status.classList.remove("error");
      status.innerHTML = `
        <strong>¡Propuesta enviada!</strong><br>
        Gracias por compartir tu conocimiento.
        Revisaremos tu información y te contactaremos pronto.
      `;

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Enviado ✓";
      }

    } catch (error) {
      console.error("Error enviando propuesta:", error);

      status.classList.add("error");
      status.textContent =
        error && error.message &&
        error.message !== "Failed to fetch" &&
        error.message !== "La respuesta del servidor no es JSON válido" &&
        error.name !== "AbortError"
          ? error.message
          : "No pudimos registrar tu propuesta. Por favor escríbenos por WhatsApp.";

      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Enviar propuesta";
      }

    } finally {
      teacherInProgress = false;
    }
  }


  /* =========================================================
     BÚSQUEDA
     ========================================================= */

  if (searchForm) {
    searchForm.addEventListener("submit", (event) => {
      event.preventDefault();

      currentSearch = searchInput ? searchInput.value.trim() : "";
      currentLocation = locationSelect ? locationSelect.value : "";
      currentCategory = "";

      applyFilters();
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      currentSearch = searchInput.value.trim();
      currentCategory = "";
      applyFilters();
    });
  }

  if (locationSelect) {
    locationSelect.addEventListener("change", () => {
      currentLocation = locationSelect.value;
      applyFilters();
    });
  }


  /* =========================================================
     BOTONES DE OFICIOS
     ========================================================= */

  document.querySelectorAll(".oficio-card").forEach((button) => {
    button.addEventListener("click", () => {
      const oficio = button.dataset.oficio || "";

      currentSearch = oficio;
      currentCategory = "";
      currentLocation = "";

      if (searchInput) searchInput.value = oficio;
      if (locationSelect) locationSelect.value = "";

      applyFilters();
      scrollToCourses();
    });
  });


  /* =========================================================
     MOSTRAR TODAS LAS CATEGORÍAS
     ========================================================= */

  if (allCategoriesBtn) {
    allCategoriesBtn.addEventListener("click", () => {
      categoriesExpanded = !categoriesExpanded;
      applyCategoriesExpandedState();

      allCategoriesBtn.textContent = categoriesExpanded
        ? "Ver menos categorías"
        : "Ver todas las categorías";

      const categoriasSection = document.getElementById("categorias");
      if (categoriasSection) {
        categoriasSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }


  /* =========================================================
     MOSTRAR TODOS LOS CURSOS / LIMPIAR BÚSQUEDA
     ========================================================= */

  function resetFilters() {
    currentSearch = "";
    currentLocation = "";
    currentCategory = "";

    if (searchInput) searchInput.value = "";
    if (locationSelect) locationSelect.value = "";
  }

  if (showAllBtn) {
    showAllBtn.addEventListener("click", () => {
      resetFilters();

      if (loadFailed) {
        loadCourses();
      } else {
        currentCourses = [...courses];
        renderCourses(currentCourses);
      }

      scrollToCourses();
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", () => {
      resetFilters();

      if (loadFailed) {
        loadCourses();
      } else {
        currentCourses = [...courses];
        renderCourses(currentCourses);
      }

      if (searchInput) searchInput.focus();
    });
  }


  /* =========================================================
     BOTONES "QUIERO ENSEÑAR"
     ========================================================= */

  function handleTeachClick(event) {
    if (event) event.preventDefault();
    showTeacherForm();
  }

  if (teachBtn) {
    teachBtn.addEventListener("click", handleTeachClick);
  }

  if (footerRegisterBtn) {
    footerRegisterBtn.addEventListener("click", handleTeachClick);
  }

  document.querySelectorAll("[data-teach-trigger]").forEach((el) => {
    el.addEventListener("click", handleTeachClick);
  });


  /* =========================================================
     MENÚ DE CATEGORÍAS
     ========================================================= */

  if (categoriasBtn) {
    categoriasBtn.addEventListener("click", (event) => {
      event.stopPropagation();

      const isOpen = categoriasMenu && categoriasMenu.classList.contains("open");

      if (isOpen) {
        closeCategoryMenu();
      } else {
        openCategoryMenu();
      }
    });
  }

  document.addEventListener("click", (event) => {
    if (
      categoriasMenu &&
      categoriasBtn &&
      !categoriasMenu.contains(event.target) &&
      !categoriasBtn.contains(event.target)
    ) {
      closeCategoryMenu();
    }
  });


  /* =========================================================
     AÑO DEL FOOTER
     ========================================================= */

  if (year) {
    year.textContent = new Date().getFullYear();
  }


  /* =========================================================
     CARGAR CURSOS
     ========================================================= */

  function normalizeCourse(raw) {
    const photos = Array.isArray(raw.photos) ? raw.photos : [];

    return {
      id: raw.id,
      title: raw.title || "",
      tutor: raw.tutor || "",
      category: raw.category || "",
      location: raw.location || "",
      price: Number(raw.price || 0),
      description: raw.description || "",
      image: raw.image || raw.imagen || "",
      images: photos.map((p) => p && p.url).filter(Boolean),
      whatsapp: CONFIG.WHATSAPP,
      hours: raw.hours || "",
      schedule: raw.schedule || "",
      level: raw.level || "",
      courseType: raw.courseType || "Curso",
      calUrl: raw.calUrl || "",
      youtubeUrl: raw.youtubeUrl || "",
      photo360: raw.photo360 || "",
      learning: Array.isArray(raw.learning)
        ? raw.learning
            .map((s) => String(s).replace(/^\s*[-•*]\s*/, "").trim())
            .filter(Boolean)
        : []
    };
  }

  function showLoadingState() {
    if (!courseGrid) return;
    if (emptyState) emptyState.classList.add("hidden");

    courseGrid.innerHTML = `
      <p style="grid-column:1/-1;text-align:center;padding:40px 0;">
        Cargando cursos...
      </p>
    `;
  }

  function showLoadError() {
    if (!courseGrid) return;
    if (emptyState) emptyState.classList.add("hidden");

    courseGrid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1;">
        <h3>No pudimos cargar los cursos</h3>
        <p>Revisa tu conexión e intenta de nuevo en unos segundos.</p>
        <button type="button" id="retryLoadBtn">Reintentar</button>
      </div>
    `;

    const retryBtn = document.getElementById("retryLoadBtn");
    if (retryBtn) {
      retryBtn.addEventListener("click", loadCourses);
    }
  }

    async function fetchCursosOnce(url, ms) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), ms);
    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error("HTTP " + response.status);
      const result = await response.json();
      if (!result.ok || !Array.isArray(result.cursos)) {
        throw new Error("Respuesta inválida del servidor");
      }
      return result.cursos;
    } finally {
      clearTimeout(timeout);
    }
  }

  async function loadCourses() {
    showLoadingState();

    let lista = null;
    const esperas = [7000, 7000, 10000];

    for (let i = 0; i < esperas.length && !lista; i++) {
      try {
        lista = await fetchCursosOnce(
          CONFIG.API_URL + "?action=cursos&t=" + Date.now(),
          esperas[i]
        );
      } catch (e) {
        console.warn("Intento " + (i + 1) + " falló", e);
      }
    }

    if (!lista) {
      try {
        lista = await fetchCursosOnce("cursos.json", 5000);
        console.warn("Mostrando copia de respaldo (cursos.json)");
      } catch (e) {
        console.error("Tampoco se pudo cargar el respaldo", e);
      }
    }

    if (!lista) {
      loadFailed = true;
      courses = [];
      showLoadError();
      return;
    }

    courses = lista.map(normalizeCourse);
    loadFailed = false;
    currentCourses = [...courses];
    applyFilters();
  }


  /* =========================================================
     INICIALIZACIÓN
     ========================================================= */

  renderCategories();
  renderCategoryMenu();
  loadCourses();

  if (categoriasMenu) {
    categoriasMenu.classList.remove("open");
    categoriasMenu.setAttribute("aria-hidden", "true");
  }

  if (categoriasBtn) {
    categoriasBtn.setAttribute("aria-expanded", "false");
  }

  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  }

});
