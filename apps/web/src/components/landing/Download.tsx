import Link from 'next/link';

const platforms = [
  {
    name: 'Android',
    description: 'Phones & tablets',
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.27-.86-.31-.16-.69-.04-.86.27l-1.87 3.24c-1.15-.48-2.44-.75-3.8-.75s-2.65.27-3.8.75L6.97 5.71c-.16-.31-.55-.43-.86-.27-.31.16-.43.55-.27.86L7.68 9.48C4.55 11.22 2.45 14.38 2 18h20c-.45-3.62-2.55-6.78-5.68-8.52zM7 15.25c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25zm10 0c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25z" />
      </svg>
    ),
    href: 'https://play.google.com/store/apps/details?id=com.examscholar.app.utme',
    badge: 'Popular',
    badgeColor: 'bg-success-500',
  },
  {
    name: 'iPhone & iPad',
    description: 'iOS 15+',
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
    ),
    href: 'https://apps.apple.com/us/app/Examinery-utme-cbt-practice/id6738136424',
    badge: null,
    badgeColor: null,
  },
  {
    name: 'Windows',
    description: '10 / 11',
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
        <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
      </svg>
    ),
    href: 'https://Examinery.com/Examinery-utme-setup.zip',
    badge: null,
    badgeColor: null,
  },
  {
    name: 'Windows 7/8',
    description: 'Legacy support',
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
        <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
      </svg>
    ),
    href: 'https://Examinery.com/Examinery-utme-setup-win7.msi',
    badge: null,
    badgeColor: null,
  },
  {
    name: 'macOS',
    description: 'Intel & Apple Silicon',
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
    ),
    href: 'https://apps.apple.com/us/app/Examinery-utme-cbt-practice/id6738136424',
    badge: null,
    badgeColor: null,
  },
];

export default function Download() {
  return (
    <section className="py-16 md:py-24 bg-neutral-900">
      <div className="section-container">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className="badge-primary mb-4 inline-block">Download</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-4">
            One account. All your devices. Works offline.
          </h2>
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
            Download Examinery on your phone, tablet, or computer. Practice anywhere, even without internet.
          </p>
        </div>

        {/* Platform Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {platforms.map((platform) => (
            <a
              key={platform.name}
              href={platform.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 hover:border-neutral-600 rounded-2xl p-6 text-center transition-all duration-200"
            >
              {platform.badge && (
                <span className={`absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white px-3 py-1 rounded-full ${platform.badgeColor}`}>
                  {platform.badge}
                </span>
              )}
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-neutral-700 group-hover:bg-neutral-600 flex items-center justify-center text-white transition-colors">
                {platform.icon}
              </div>
              <h3 className="text-base font-semibold text-white mb-1">
                {platform.name}
              </h3>
              <p className="text-xs text-neutral-400">{platform.description}</p>
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            href="/download"
            className="inline-flex items-center gap-2 text-neutral-400 hover:text-white font-medium transition-colors"
          >
            Compare all download options
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
