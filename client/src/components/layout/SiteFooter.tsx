type SiteFooterProps = {
  brandLogo: string;
};

export default function SiteFooter({ brandLogo }: SiteFooterProps) {
  return (
    <footer className="bg-femiBlue text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <img
              src={brandLogo}
              alt="Femifunmi Charity Logo"
              className="h-10 w-auto rounded-md"
            />
            <div>
              <h3 className="font-display text-xl font-black">
                Femi & Funmi Charity
              </h3>
              <p className="text-sm text-white/85">Loving and Giving</p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wide text-femiMustard">
            Quick Links
          </h4>
          <div className="mt-3 grid gap-2 text-sm">
            <a href="#about" className="hover:text-femiMustard">
              About
            </a>
            <a href="#gallery" className="hover:text-femiMustard">
              Gallery
            </a>
            <a href="#donations" className="hover:text-femiMustard">
              Donations
            </a>
            <a href="#contact" className="hover:text-femiMustard">
              Contact
            </a>
          </div>
        </div>

        <div>
          <h4
            id="footer-connect"
            className="text-sm font-bold uppercase tracking-wide text-femiMustard"
          >
            Connect
          </h4>
          <div className="mt-3 grid gap-3 text-sm">
            <a
              href="mailto:femifunmicharity@gmail.com"
              className="inline-flex items-center gap-2 hover:text-femiMustard"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4 fill-current"
              >
                <path d="M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v.4l-9 5.5-9-5.5V6Zm0 2.75V18a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.75l-8.48 5.18a1 1 0 0 1-1.04 0L3 8.75Z" />
              </svg>
              <span className="font-semibold">Email:</span>
              <span>femifunmicharity@gmail.com</span>
            </a>
            <a
              href="https://instagram.com/femifunmicharity"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 hover:text-femiMustard"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4 fill-current"
              >
                <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.8A3.95 3.95 0 0 0 3.8 7.75v8.5a3.95 3.95 0 0 0 3.95 3.95h8.5a3.95 3.95 0 0 0 3.95-3.95v-8.5a3.95 3.95 0 0 0-3.95-3.95h-8.5Zm9.05 1.45a1.15 1.15 0 1 1 0 2.3 1.15 1.15 0 0 1 0-2.3ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4Z" />
              </svg>
              <span className="font-semibold">Instagram:</span>
              <span>@femifunmicharity</span>
            </a>
            <a
              href="https://facebook.com/femifunmicharity"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 hover:text-femiMustard"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4 fill-current"
              >
                <path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.87.24-1.46 1.5-1.46H16.7V5a22.2 22.2 0 0 0-2.42-.12c-2.4 0-4.03 1.46-4.03 4.16V11H7.5v3h2.75v8h3.25Z" />
              </svg>
              <span className="font-semibold">Facebook:</span>
              <span>femifunmicharity</span>
            </a>
            <a
              href="https://twitter.com/femifunmichari1"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 hover:text-femiMustard"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4 fill-current"
              >
                <path d="M4 4h4.3l4.2 5.8L17.5 4H20l-6.4 7.4L20.5 20h-4.3l-4.6-6.2L6.1 20H3.5l7.1-8.2L4 4Z" />
              </svg>
              <span className="font-semibold">Twitter/X:</span>
              <span>@femifunmichari1</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
