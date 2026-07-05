/**
 * Moon Language Documentation — interactive helpers
 */
(function () {
  "use strict";

  const sidebar = document.getElementById("moon-sidebar");
  const overlay = document.getElementById("moon-sidebar-overlay");
  const toggleBtn = document.getElementById("moon-sidebar-toggle");
  const searchInput = document.getElementById("moon-search");
  const tocLinks = Array.from(document.querySelectorAll(".moon-toc-link"));
  const sections = Array.from(document.querySelectorAll(".doc-section[id]"));

  /* ── Sidebar mobile toggle ── */
  function openSidebar() {
    sidebar?.classList.add("open");
    overlay?.classList.add("show");
    document.body.style.overflow = "hidden";
  }

  function closeSidebar() {
    sidebar?.classList.remove("open");
    overlay?.classList.remove("show");
    document.body.style.overflow = "";
  }

  toggleBtn?.addEventListener("click", () => {
    if (sidebar?.classList.contains("open")) closeSidebar();
    else openSidebar();
  });

  overlay?.addEventListener("click", closeSidebar);

  tocLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth < 992) closeSidebar();
    });
  });

  /* ── Active section highlight (scroll spy) ── */
  function updateActiveSection() {
    const scrollY = window.scrollY + 120;
    let current = sections[0]?.id ?? "";

    for (const section of sections) {
      if (section.offsetTop <= scrollY) current = section.id;
    }

    tocLinks.forEach((link) => {
      const href = link.getAttribute("href")?.slice(1);
      link.classList.toggle("active", href === current);
    });

    document.querySelectorAll(".moon-navbar .nav-link[data-section]").forEach((link) => {
      const target = link.getAttribute("data-section");
      link.classList.toggle("active", target === current || (current.startsWith(target) && target !== "intro"));
    });
  }

  window.addEventListener("scroll", updateActiveSection, { passive: true });
  updateActiveSection();

  /* ── Sidebar search ── */
  searchInput?.addEventListener("input", () => {
    const q = searchInput.value.trim().toLowerCase();
    tocLinks.forEach((link) => {
      const text = link.textContent?.toLowerCase() ?? "";
      const section = link.closest(".moon-toc-group");
      const visible = !q || text.includes(q);
      link.style.display = visible ? "" : "none";
      if (section) {
        const anyVisible = Array.from(section.querySelectorAll(".moon-toc-link"))
          .some((l) => l.style.display !== "none");
        section.style.display = anyVisible ? "" : "none";
      }
    });
  });

  /* ── Copy code buttons ── */
  document.querySelectorAll(".moon-code-copy").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const block = btn.closest(".moon-code-block");
      const code = block?.querySelector("pre")?.textContent ?? "";
      try {
        await navigator.clipboard.writeText(code);
        btn.textContent = "Copied!";
        btn.classList.add("copied");
        setTimeout(() => {
          btn.textContent = "Copy";
          btn.classList.remove("copied");
        }, 2000);
      } catch {
        btn.textContent = "Error";
      }
    });
  });

  /* ── Navbar shrink on scroll ── */
  const navbar = document.querySelector(".moon-navbar");
  window.addEventListener("scroll", () => {
    if (!navbar) return;
    navbar.classList.toggle("scrolled", window.scrollY > 40);
  }, { passive: true });
})();