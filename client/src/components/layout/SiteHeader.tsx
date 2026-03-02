import { useEffect, useMemo, useRef, useState } from "react";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

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

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const updateHeaderHeight = () => {
      setHeaderHeight(headerRef.current?.getBoundingClientRect().height ?? 0);
    };

    updateHeaderHeight();
    window.addEventListener("resize", updateHeaderHeight);
    return () => window.removeEventListener("resize", updateHeaderHeight);
  }, []);

  const mobileMenuTop = headerHeight || 64;

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-30 border-b border-femiBlue/20 bg-white/95 backdrop-blur"
    >
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
        <button
          type="button"
          aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isMobileMenuOpen}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-femiBlue/30 text-femiBlue md:hidden"
          onClick={() => setIsMobileMenuOpen((previous) => !previous)}
        >
          <svg
            className="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {isMobileMenuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
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
      {isMobileMenuOpen ? (
        <>
          <button
            type="button"
            aria-label="Close navigation menu backdrop"
            className="fixed left-1/2 right-0 z-30 bg-black/35 md:hidden"
            style={{ top: mobileMenuTop, height: `calc(100dvh - ${mobileMenuTop}px)` }}
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div
            className="fixed left-0 z-40 w-1/2 overflow-y-auto border-r border-femiBlue/20 bg-white px-4 pb-6 pt-4 md:hidden"
            style={{ top: mobileMenuTop, height: `calc(100dvh - ${mobileMenuTop}px)` }}
          >
            <div className="flex flex-col gap-3 text-sm font-semibold">
              {navItems.map((item) => {
                const isActive = activeSectionId === item.id;
                return (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={() => {
                      setActiveSectionId(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`transition ${
                      isActive ? "text-femiBlue" : "text-slate-700 hover:text-femiBlue"
                    }`}
                  >
                    {item.label}
                  </a>
                );
              })}
            </div>
          </div>
        </>
      ) : null}
    </header>
  );
}
