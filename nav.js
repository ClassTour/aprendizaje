/* =========================================================
   CLASS TOUR
   nav.js
   Menú hamburguesa para pantallas pequeñas.
   Se usa en index.html, nosotros.html y terminos.html

   NOTA: este archivo NO maneja:
     - El smart header (scroll)  → está en index.html inline
     - El dropdown de categorías → lo maneja app.js
     - El modal                  → lo maneja app.js
   ========================================================= */

(function () {

  "use strict";

  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("mainNav");

  if (!toggle || !nav) return;


  /* =========================================================
     ESTADO
     ========================================================= */

  let isOpen = false;


  /* =========================================================
     ABRIR / CERRAR MENÚ
     ========================================================= */

  function setOpen(open) {

    if (open === isOpen) return;

    isOpen = open;

    nav.classList.toggle("nav-open", open);

    toggle.setAttribute("aria-expanded", String(open));

    toggle.setAttribute(
      "aria-label",
      open ? "Cerrar menú" : "Abrir menú"
    );

    // Bloquea el scroll del body cuando el menú está abierto
    document.body.style.overflow = open ? "hidden" : "";

    // Foco accesible: al abrir, foco en el primer enlace
    if (open) {

      const firstLink = nav.querySelector("a, button");

      if (firstLink) {
        firstLink.focus({ preventScroll: true });
      }

    }

  }


  /* =========================================================
     TOGGLE
     ========================================================= */

  toggle.addEventListener("click", function (event) {

    event.stopPropagation();

    setOpen(!isOpen);

  });


  /* =========================================================
     CIERRE AL ELEGIR UN ENLACE O UNA CATEGORÍA
     ========================================================= */

  nav.addEventListener("click", function (event) {

    const target = event.target.closest("a, .categoria-opcion");

    if (target) {
      setOpen(false);
    }

  });


  /* =========================================================
     CIERRE AL HACER CLIC FUERA
     ========================================================= */

  document.addEventListener("click", function (event) {

    if (!isOpen) return;

    if (
      !nav.contains(event.target) &&
      !toggle.contains(event.target)
    ) {
      setOpen(false);
    }

  });


  /* =========================================================
     CIERRE CON TECLA ESCAPE
     ========================================================= */

  document.addEventListener("keydown", function (event) {

    if (event.key === "Escape" && isOpen) {
      setOpen(false);
      toggle.focus({ preventScroll: true });
    }

  });


  /* =========================================================
     CIERRE AL CAMBIAR DE TAMAÑO
     ========================================================= */

  window.addEventListener("resize", function () {

    if (window.innerWidth > 900 && isOpen) {
      setOpen(false);
    }

  });


  /* =========================================================
     ESTADO INICIAL
     ========================================================= */

  setOpen(false);

})();