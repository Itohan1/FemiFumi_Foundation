import { FormEvent } from "react";

type ContactSectionProps = {
  contactStatus: string;
  newsletterStatus: string;
  onContactSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onNewsletterSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function ContactSection({
  contactStatus,
  newsletterStatus,
  onContactSubmit,
  onNewsletterSubmit,
}: ContactSectionProps) {
  return (
    <section
      id="contact"
      className="bg-gradient-to-b from-white to-femiCream py-16"
    >
      <div className="mx-auto grid max-w-6xl gap-8 px-4 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-femiBlue/20 bg-white p-6 shadow-warm">
            <h2 className="text-3xl font-black text-femiBlue">Contact Us</h2>
            <p className="mt-4 text-slate-700">
              Reach us for donations, volunteering and partnerships.
            </p>
            <div className="mt-6 space-y-2 text-sm text-slate-800">
              <p>Website: www.femifunmicharity.org</p>
              <p>Email: femifunmicharity@gmail.com</p>
              <div className="pt-2">
                <p className="mb-2 font-semibold text-femiBlue">
                  Social Channels
                </p>
                <div className="grid gap-2">
                  <a
                    href="https://instagram.com/femifunmicharity"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-slate-700 hover:text-femiBlue"
                  >
                    Instagram: @femifunmicharity
                  </a>
                  <a
                    href="https://facebook.com/femifunmicharity"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-slate-700 hover:text-femiBlue"
                  >
                    Facebook: femifunmicharity
                  </a>
                  <a
                    href="https://twitter.com/femifunmichari1"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-slate-700 hover:text-femiBlue"
                  >
                    Twitter/X: @femifunmichari1
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-femiBlue/20 bg-white p-6 shadow-warm">
            <h3 className="text-2xl font-black text-femiBlue">Newsletter</h3>
            <p className="mt-3 text-slate-700">
              Stay up to date on our programs, outreaches and more.
            </p>
            <form onSubmit={onNewsletterSubmit} className="mt-5 grid gap-3">
              <label
                htmlFor="newsletterFirstName"
                className="text-sm font-semibold text-slate-700"
              >
                First Name
              </label>
              <input
                id="newsletterFirstName"
                required
                name="firstName"
                autoComplete="given-name"
                placeholder="Enter first name"
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none transition focus:border-femiBlue focus:ring-2 focus:ring-femiBlue/20"
              />
              <label
                htmlFor="newsletterEmail"
                className="text-sm font-semibold text-slate-700"
              >
                Email Address
              </label>
              <input
                id="newsletterEmail"
                required
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none transition focus:border-femiBlue focus:ring-2 focus:ring-femiBlue/20"
              />
              <label
                htmlFor="newsletterConsent"
                className="inline-flex items-start gap-2 text-sm text-slate-700"
              >
                <input
                  id="newsletterConsent"
                  name="newsletterConsent"
                  type="checkbox"
                  required
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-femiBlue focus:ring-femiBlue/30"
                />
                <span>
                  I agree to receive notifications, updates, publications,
                  alerts and newsletters from the FemiFunmi Charity
                  organisation.
                </span>
              </label>
              <button className="mt-1 rounded-lg bg-femiBlue px-4 py-2 font-bold text-white transition hover:bg-femiBlue/90">
                Subscribe
              </button>
              {newsletterStatus && (
                <p aria-live="polite" className="text-sm text-femiBlue">
                  {newsletterStatus}
                </p>
              )}
            </form>
          </div>
        </div>

        <form
          onSubmit={onContactSubmit}
          className="rounded-3xl border border-femiBlue/20 bg-white p-6 shadow-warm md:p-8"
        >
          <h3 className="text-2xl font-black text-femiBlue">Send a Message</h3>
          <p className="mt-2 text-sm text-slate-600">
            We usually respond as quickly as possible.
          </p>
          <div className="mt-6 grid gap-3">
            <label
              htmlFor="contactFullName"
              className="text-sm font-semibold text-slate-700"
            >
              Full Name
            </label>
            <input
              id="contactFullName"
              required
              name="fullName"
              autoComplete="name"
              placeholder="Enter your full name"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none transition focus:border-femiBlue focus:ring-2 focus:ring-femiBlue/20"
            />
            <label
              htmlFor="contactEmail"
              className="text-sm font-semibold text-slate-700"
            >
              Email Address
            </label>
            <input
              id="contactEmail"
              required
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none transition focus:border-femiBlue focus:ring-2 focus:ring-femiBlue/20"
            />
            <label
              htmlFor="contactPhone"
              className="text-sm font-semibold text-slate-700"
            >
              Phone Number
            </label>
            <input
              id="contactPhone"
              required
              name="phone"
              autoComplete="tel"
              placeholder="+234 ..."
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none transition focus:border-femiBlue focus:ring-2 focus:ring-femiBlue/20"
            />
            <label
              htmlFor="contactMessage"
              className="text-sm font-semibold text-slate-700"
            >
              Message
            </label>
            <textarea
              id="contactMessage"
              required
              name="message"
              placeholder="Tell us how we can help"
              rows={5}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none transition focus:border-femiBlue focus:ring-2 focus:ring-femiBlue/20"
            />
            <button className="mt-2 rounded-lg bg-femiRed px-4 py-2 font-bold text-white transition hover:bg-femiRed/90">
              Send Message
            </button>
            {contactStatus && (
              <p aria-live="polite" className="text-sm text-femiBlue">
                {contactStatus}
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
