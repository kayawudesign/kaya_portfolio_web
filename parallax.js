(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  // A single atmospheric world sits behind the complete site, not inside section cards.
  if (!document.querySelector(".parallax-world")) {
    const world = document.createElement("div");
    world.className = "parallax-world";
    world.setAttribute("aria-hidden", "true");
    world.innerHTML = `
      <div class="world-far"><span>VISUAL<br>COMMUNICATION</span></div>
      <div class="world-mid"><i class="world-orbit"></i><i class="world-orbit orbit-two"></i><b></b><b></b><b></b></div>
      <div class="world-near"><span>K</span><span>A</span><span>Y</span><span>A</span></div>`;
    document.body.prepend(world);
  }

  const far = document.querySelector(".world-far");
  const mid = document.querySelector(".world-mid");
  const near = document.querySelector(".world-near");
  const totalTravel = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

  // One master scrub timeline gives the whole document a shared depth field.
  const worldTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: document.body,
      start: "top top",
      end: () => `+=${totalTravel()}`,
      scrub: 1,
      invalidateOnRefresh: true
    }
  });
  worldTimeline
    .to(far, { y: () => -totalTravel() * 0.08, ease: "none" }, 0)
    .to(mid, { y: () => -totalTravel() * 0.20, ease: "none" }, 0)
    .to(near, { y: () => -totalTravel() * 0.34, ease: "none" }, 0);

  // Individual images drift within their own natural scroll positions.
  gsap.utils.toArray("[data-parallax-media]").forEach((media) => {
    if (media.matches(".landing-image > img")) return; // the hero has its own, stronger parallax below
    gsap.fromTo(media,
      { yPercent: 9, scale: 1.12 },
      {
        yPercent: -9,
        scale: 1.12,
        ease: "none",
        scrollTrigger: {
          trigger: media.closest(".expanding-panel, .detail-hero, .page-stack figure") || media,
          start: "top bottom",
          end: "bottom top",
          scrub: 1
        }
      }
    );
  });

  // Hero: the picture and its layers travel at different speeds (depth). No clip box, so nothing is limited by a frame.
  const heroImage = document.querySelector(".landing-image > img");
  const heroSection = document.querySelector(".landing");
  if (heroImage && heroSection) {
    const heroTrigger = {
      trigger: heroSection,
      start: 0,
      end: () => `+=${heroSection.offsetHeight}`,
      scrub: 0.5,
      invalidateOnRefresh: true
    };
    gsap.to(heroImage, { yPercent: -22, ease: "none", scrollTrigger: heroTrigger });
    [[".parallax-far", -0.10], [".parallax-mid", -0.30]].forEach(([selector, amount]) => {
      const layer = document.querySelector(selector);
      if (layer) gsap.to(layer, { y: () => amount * heroImage.offsetHeight, ease: "none", scrollTrigger: heroTrigger });
    });
  }

  // Content enters softly, without snapping into separate full-screen panels.
  gsap.utils.toArray(".profile-content, .profile-skills > div, .detail-intro, .page-stack figure").forEach((item) => {
    gsap.fromTo(item, { y: 38, autoAlpha: 0.72 }, {
      y: 0, autoAlpha: 1, ease: "none",
      scrollTrigger: { trigger: item, start: "top 92%", end: "top 58%", scrub: 0.8 }
    });
  });

  window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
  window.addEventListener("resize", () => ScrollTrigger.refresh());
})();