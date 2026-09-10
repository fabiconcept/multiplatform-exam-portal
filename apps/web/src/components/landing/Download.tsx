import Link from 'next/link';

const platforms = [
  {
    name: 'Android',
    description: 'Phones and tablets',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.27-.86-.31-.16-.69-.04-.86.27l-1.87 3.24c-1.15-.48-2.44-.75-3.8-.75s-2.65.27-3.8.75L6.97 5.71c-.16-.31-.55-.43-.86-.27-.31.16-.43.55-.27.86L7.68 9.48C4.55 11.22 2.45 14.38 2 18h20c-.45-3.62-2.55-6.78-5.68-8.52zM7 15.25c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25zm10 0c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25z" />
      </svg>
    ),
    href: 'https://play.google.com/store/apps/details?id=com.examscholar.app.utme',
    color: 'bg-success-500 hover:bg-success-600',
  },
  {
    name: 'iPhone & iPad',
    description: 'Available for iOS',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
    ),
    href: 'https://apps.apple.com/us/app/examscholars-utme-cbt-practice/id6738136424',
    color: 'bg-neutral-800 hover:bg-neutral-900',
  },
  {
    name: 'Windows 10 / 11',
    description: 'Modern Windows PCs',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
      </svg>
    ),
    href: 'https://examscholars.com/examscholars-utme-setup.zip',
    color: 'bg-primary-500 hover:bg-primary-600',
  },
  {
    name: 'Windows 7 / 8',
    description: 'Older Windows PCs',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
      </svg>
    ),
    href: 'https://examscholars.com/examscholars-utme-setup-win7.msi',
    color: 'bg-background-500 hover:bg-background-600',
  },
  {
    name: 'macOS',
    description: 'Apple computers',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
    ),
    href: 'https://apps.apple.com/us/app/examscholars-utme-cbt-practice/id6738136424',
    color: 'bg-neutral-500 hover:bg-neutral-600',
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
            Download available on all devices
          </h2>
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
            Download Exam Scholars and practise past questions wherever you learn best—even when there is no internet connection.
          </p>
        </div>

        {/* Platform Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {platforms.map((platform) => (
            <a
              key={platform.name}
              href={platform.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group card bg-neutral-800 hover:bg-neutral-700 transition-all duration-200 text-center"
            >
              <div
                className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center text-white transition-colors ${platform.color}`}
              >
                {platform.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">
                {platform.name}
              </h3>
              <p className="text-sm text-neutral-400">{platform.description}</p>
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            href="/download"
            className="btn-outline border-neutral-600 text-white hover:border-primary-500 hover:text-primary-500 text-lg px-8 py-4"
          >
            Compare all exam products and downloads
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
