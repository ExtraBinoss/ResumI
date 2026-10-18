(() => {
  const manifest = [
    ["react-studio", "Studio", "assets/templates/react-studio.webp"],
    ["react-editorial", "Editorial", "assets/templates/react-editorial.webp"],
    ["react-classic", "Classic", "assets/templates/react-classic.webp"],
    ["react-profile", "Profile", "assets/templates/react-profile.webp"],
    ["react-harvard", "Harvard", "assets/templates/react-harvard.webp"],
    ["react-cobalt", "Cobalt", "assets/templates/react-cobalt.webp"],
    ["react-atelier", "Atelier", "assets/templates/react-atelier.webp"],
    ["react-timeline", "Timeline", "assets/templates/react-timeline.webp"],
    [
      "react-consultant",
      "Consultant",
      "assets/templates/react-consultant.webp",
    ],
    ["react-mosaic", "Mosaic", "assets/templates/react-mosaic.webp"],
    ["react-terminal", "Terminal", "assets/templates/react-terminal.webp"],
    ["react-mainframe", "Mainframe", "assets/templates/react-mainframe.webp"],
    ["react-arcade", "Arcade", "assets/templates/react-arcade.webp"],
    ["react-blueprint", "Blueprint", "assets/templates/react-blueprint.webp"],
    ["react-orbit", "Orbit", "assets/templates/react-orbit.webp"],
    ["react-risograph", "Risograph", "assets/templates/react-risograph.webp"],
    ["react-swiss", "Swiss", "assets/templates/react-swiss.webp"],
    ["react-botanica", "Botanica", "assets/templates/react-botanica.webp"],
    ["react-cassette", "Cassette", "assets/templates/react-cassette.webp"],
    ["react-signal", "Signal", "assets/templates/react-signal.webp"],
    ["react-maison", "Maison", "assets/templates/react-maison.webp"],
    ["react-gallery", "Gallery", "assets/templates/react-gallery.webp"],
    ["react-forma", "Forma", "assets/templates/react-forma.webp"],
    ["react-linen", "Linen", "assets/templates/react-linen.webp"],
    ["react-muse", "Muse", "assets/templates/react-muse.webp"],
    ["react-cinema", "Cinema", "assets/templates/react-cinema.webp"],
    ["react-panorama", "Panorama", "assets/templates/react-panorama.webp"],
    ["react-vellum", "Vellum", "assets/templates/react-vellum.webp"],
    ["react-chroma", "Chroma", "assets/templates/react-chroma.webp"],
    ["react-terrazzo", "Terrazzo", "assets/templates/react-terrazzo.webp"],
    ["react-spectrum", "Spectrum", "assets/templates/react-spectrum.webp"],
    ["react-bloom", "Bloom", "assets/templates/react-bloom.webp"],
    ["react-kinetic", "Kinetic", "assets/templates/react-kinetic.webp"],
    ["react-patina", "Patina", "assets/templates/react-patina.webp"],
    ["react-contour", "Contour", "assets/templates/react-contour.webp"],
    ["react-nocturne", "Nocturne", "assets/templates/react-nocturne.webp"],
    ["react-solstice", "Solstice", "assets/templates/react-solstice.webp"],
    ["react-aerogram", "Aerogram", "assets/templates/react-aerogram.webp"],
    ["react-gridline", "Gridline", "assets/templates/react-gridline.webp"],
    ["react-polaroid", "Polaroid", "assets/templates/react-polaroid.webp"],
  ];
  const byId = (id) => document.getElementById(`rv-journey-${id}`);
  const world = byId("world");
  const paperHost = byId("papers");
  const heroSlots = {
    "react-cassette": 12,
    "react-risograph": 13,
    "react-polaroid": 14,
    "react-nocturne": 15,
    "react-chroma": 16,
  };
  const freeSlots = Array.from({ length: 40 }, (_, i) => i).filter(
    (i) => !Object.values(heroSlots).includes(i),
  );
  let nextSlot = 0;
  const papers = manifest.map(([id, name, path]) => {
    const hero = Object.hasOwn(heroSlots, id);
    const slot = hero ? heroSlots[id] : freeSlots[nextSlot++];
    const col = slot % 10;
    const row = Math.floor(slot / 10);
    const el = document.createElement("div");
    el.className = "rv-journey-paper";
    el.id = `rv-journey-${id}`;
    el.dataset.templateId = id;
    el.dataset.pzCol = String(col);
    el.dataset.pzRow = String(row);
    el.dataset.layoutAllowOverflow =
      "Template media intentionally travels and crops at the gallery wings";
    el.style.zIndex =
      id === "react-polaroid" ? "50" : hero ? "40" : String(1 + row);
    const surface = document.createElement("div");
    surface.className = "rv-journey-paper-surface";
    const image = document.createElement("img");
    image.src = path;
    image.alt = `${name} resume template`;
    image.loading = "eager";
    surface.append(image);
    if (hero) {
      const sharp = document.createElement("img");
      sharp.src = `assets/templates/${id}.png`;
      sharp.alt = "";
      sharp.setAttribute("aria-hidden", "true");
      surface.append(sharp);
    }
    el.append(surface);
    paperHost.append(el);
    return {
      id,
      el,
      surface,
      hero,
      col,
      row,
      gx: (col - 4.5) * 167,
      gy: -243 + row * 210,
      x: (col - 4.5) * 167,
      y: -243 + row * 210,
      s: 1,
      r: 0,
      a: hero ? 0 : 1,
      p: hero ? 0 : 1,
    };
  });
  const polaroid = papers.find((p) => p.id === "react-polaroid");
  const cam = { s: 1.015, x: 0, y: 0 };
  // Screen-space focus lock reproduces the captured paper's exact 596 × 843 bounds.
  // Camera and paper lift share this single transform writer; the handoff is pixel-identical.
  const lift = { lock: 1, x: 0, y: 0, s: 596 / 132, r: 0 };
  polaroid.x = 160 / 2.8;
  polaroid.y = -5 / 2.8;
  polaroid.s = 560 / (132 * 2.8);
  function renderWorld() {
    world.style.transform = `translate3d(${cam.x}px,${cam.y}px,0) scale(${cam.s})`;
    for (const page of papers) {
      let { x, y, s, r } = page;
      if (page === polaroid && lift.lock > 0.5) {
        x = (lift.x - cam.x) / cam.s;
        y = (lift.y - cam.y) / cam.s;
        s = lift.s / cam.s;
        r = lift.r;
      }
      page.el.style.transform = `translate3d(${x}px,${y}px,0) rotate(${r}deg) scale(${s})`;
      page.el.style.opacity = String(page.a);
      // Reverse parallax-zoom: the focal paper contracts while displaced siblings
      // approach their authored grid positions and recover scale/opacity together.
      const dx = (page.col - 4) * 54 * page.p;
      const dy = (page.row - 1) * 64 * page.p;
      page.surface.style.transform = `translate3d(${dx}px,${dy}px,0) scale(${1 - page.p * 0.4})`;
      page.surface.style.opacity = String(1 - page.p);
    }
  }
  const tl = gsap.timeline({ paused: true, onUpdate: renderWorld });
  tl.set(
    [
      byId("close"),
      byId("editor"),
      byId("make"),
      byId("count"),
      byId("logo"),
      byId("line-one"),
      byId("line-two"),
      byId("url"),
      byId("credit"),
      ...document.querySelectorAll('[class~="rv-journey-agent"]'),
    ],
    { opacity: 0 },
    0,
  );
  // 0–2.3: read the actual page; its real paper cluster motivates the camera.
  tl.to(cam, { s: 1, x: 0, y: 0, duration: 1.02, ease: "power2.out" }, 0);
  tl.to(cam, { s: 1.25, y: -260, duration: 1.25, ease: "power3.inOut" }, 1.02);
  tl.to(
    byId("landing"),
    { opacity: 0, scale: 1.045, duration: 0.57, ease: "power2.inOut" },
    2.08,
  );
  // 2.3–5.8: the captured working surface settles, then releases its exact paper.
  tl.fromTo(
    byId("editor"),
    { opacity: 0, y: 185, scale: 1.025, rotationX: 5 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      rotationX: 0,
      duration: 1.02,
      ease: "power3.out",
      immediateRender: false,
    },
    2.12,
  );
  tl.to(cam, { s: 1, y: 0, duration: 1.02, ease: "power3.inOut" }, 2.27);
  tl.set(polaroid, { a: 1 }, 4.04);
  tl.to(cam, { s: 2.8, y: -55, duration: 1.76, ease: "power3.inOut" }, 4.04);
  tl.to(
    lift,
    {
      x: 160,
      y: -60,
      s: 560 / 132,
      r: 0,
      duration: 1.76,
      ease: "power3.inOut",
    },
    4.04,
  );
  tl.to(
    polaroid.surface,
    { borderRadius: "2px", duration: 1.1, ease: "power2.inOut" },
    4.04,
  );
  tl.to(
    byId("editor"),
    { scale: 0.965, opacity: 0, duration: 1.02, ease: "power2.inOut" },
    4.08,
  );
  tl.fromTo(
    byId("make"),
    { opacity: 0, y: 7 },
    {
      opacity: 1,
      y: 0,
      duration: 0.55,
      ease: "power3.out",
      immediateRender: false,
    },
    5.04,
  );
  tl.to(
    byId("make"),
    { opacity: 0, y: -5, duration: 0.38, ease: "power2.in" },
    5.86,
  );
  // 5.8–8.2: the same lifted paper leads a coordinated five-paper expansion.
  tl.set(lift, { lock: 0 }, 5.8);
  tl.to(
    polaroid,
    { x: 0, y: -15, s: 1.24, r: 0, duration: 1.55, ease: "power3.out" },
    5.8,
  );
  const spread = [
    ["react-cassette", -243, 0, 0.925, -6, 5.88],
    ["react-risograph", -125, -10, 1.02, -3, 5.94],
    ["react-nocturne", 125, -10, 1.02, 3, 6.0],
    ["react-chroma", 243, 0, 0.925, 6, 6.06],
  ];
  for (const [id, x, y, s, r, at] of spread) {
    const page = papers.find((p) => p.id === id);
    tl.fromTo(
      page,
      { x: 160 / 2.8, y: -5 / 2.8, s: 1.42, r: 0, a: 0 },
      {
        x,
        y,
        s,
        r,
        a: 1,
        duration: 1.5,
        ease: "power3.out",
        immediateRender: false,
      },
      at,
    );
  }
  // 8.2–11.8: reverse focal/sibling parallax lands every manifest page together.
  tl.to(cam, { s: 1, x: 0, y: 0, duration: 1.95, ease: "power3.inOut" }, 8.08);
  papers.forEach((page) => {
    if (page.hero) {
      tl.to(
        page,
        {
          x: page.gx,
          y: page.gy,
          s: 1,
          r: 0,
          duration: 1.84,
          ease: "power3.inOut",
        },
        8.08,
      );
    } else {
      tl.to(
        page,
        { p: 0, duration: 1.34, ease: "power3.out" },
        8.17 + page.row * 0.055 + page.col * 0.011,
      );
    }
  });
  tl.fromTo(
    byId("count"),
    { opacity: 0, y: 23, scale: 0.97 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.58,
      ease: "power3.out",
      immediateRender: false,
    },
    9.94,
  );
  // 11.8–15: the gallery becomes two continuous wings around the final lockup.
  tl.to(
    byId("count"),
    { opacity: 0, y: -24, duration: 0.32, ease: "power2.in" },
    11.72,
  );
  papers.forEach((page) => {
    const left = page.col < 5;
    const wingX = left ? -1000 + page.col * 90 : 640 + (page.col - 5) * 90;
    tl.to(
      page,
      {
        x: wingX,
        y: page.gy,
        s: 0.9,
        r: left ? -3 : 3,
        a: 1,
        duration: 1.03,
        ease: "power3.inOut",
      },
      11.8 + Math.abs(page.col - 4.5) * 0.012,
    );
  });
  tl.to(
    paperHost,
    { opacity: 0.53, duration: 1.03, ease: "power3.inOut" },
    11.8,
  );
  tl.set(byId("close"), { opacity: 1 }, 11.98);
  tl.fromTo(
    byId("logo"),
    { opacity: 0, y: 26, scale: 0.82 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.7,
      ease: "power3.out",
      immediateRender: false,
    },
    11.98,
  );
  tl.fromTo(
    byId("line-one"),
    { opacity: 0, y: 32 },
    {
      opacity: 1,
      y: 0,
      duration: 0.66,
      ease: "power3.out",
      immediateRender: false,
    },
    12.12,
  );
  tl.fromTo(
    byId("line-two"),
    { opacity: 0, y: 32 },
    {
      opacity: 1,
      y: 0,
      duration: 0.66,
      ease: "power3.out",
      immediateRender: false,
    },
    12.21,
  );
  document.querySelectorAll('[class~="rv-journey-agent"]').forEach((el, i) => {
    tl.fromTo(
      el,
      { opacity: 0, x: 0, y: 12, scale: 0.65 },
      {
        opacity: 1,
        x: (i - 2.5) * 96,
        y: 0,
        scale: 1,
        duration: 0.65,
        ease: "power3.out",
        immediateRender: false,
      },
      12.43 + i * 0.028,
    );
  });
  tl.fromTo(
    byId("url"),
    { opacity: 0, y: 17 },
    {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: "power3.out",
      immediateRender: false,
    },
    12.7,
  );
  tl.fromTo(
    byId("credit"),
    { opacity: 0, y: 10 },
    {
      opacity: 1,
      y: 0,
      duration: 0.45,
      ease: "power3.out",
      immediateRender: false,
    },
    12.82,
  );
  renderWorld();
  window.__timelines = window.__timelines || {};
  window.__timelines["01-journey"] = tl;
})();
