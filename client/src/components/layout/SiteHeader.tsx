import { useEffect, useMemo, useState } from "react";

type SiteHeaderProps = {
  brandLogo: string;
};

export default function SiteHeader({ brandLogo }: SiteHeaderProps) {
  const navItems = useMemo(
    () => [
      { id: "about", label: "About" },
      { id: "testimonials", label: "Testimonials" },
      { id: "what-we-are-up-to", label: "What We Are Up To" },
      { id: "recent-updates", label: "Recent Updates" },
      { id: "donations", label: "Donations" },
      { id: "contact", label: "Contact" }
    ],
    []
  );
  const [activeSectionId, setActiveSectionId] = useState<string>("home");

  useEffect(() => {
    const observedIds = ["home", ...navItems.map((item) => item.id)];
    const sections = observedIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));

    if (sections.length === 0) return;

    let rafId = 0;
    const updateActiveSection = () => {
      const headerOffset = 120;
      const scrollPosition = window.scrollY + headerOffset;
      let current = "home";

      for (const section of sections) {
        if (section.offsetTop <= scrollPosition) {
          current = section.id;
        }
      }

      setActiveSectionId(current);
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        updateActiveSection();
        rafId = 0;
      });
    };

    updateActiveSection();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [navItems]);

  return (
    <header className="sticky top-0 z-30 border-b border-femiBlue/20 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <a href="#home" className="flex items-center gap-2">
          <img
            src={brandLogo}
            alt="Femifunmi Charity Logo"
            className="h-10 w-auto"
          />
          <span className="font-display text-lg font-black text-femiBlue">
            FEMIFUNMI CHARITY
          </span>
        </a>
        <div className="hidden gap-4 text-sm font-semibold md:flex">
          {navItems.map((item) => {
            const isActive = activeSectionId === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setActiveSectionId(item.id)}
                className={`transition ${
                  isActive ? "text-femiBlue" : "text-slate-700 hover:text-femiBlue"
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
