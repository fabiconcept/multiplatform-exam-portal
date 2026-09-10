import Link from 'next/link';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

const platforms = [
  {
    name: 'Android',
    description: 'Phones and tablets',
    version: 'Latest version',
    size: '25 MB',
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.27-.86-.31-.16-.69-.04-.86.27l-1.87 3.24c-1.15-.48-2.44-.75-3.8-.75s-2.65.27-3.8.75L6.97 5.71c-.16-.31-.55-.43-.86-.27-.31.16-.43.55-.27.86L7.68 9.48C4.55 11.22 2.45 14.38 2 18h20c-.45-3.62-2.55-6.78-5.68-8.52zM7 15.25c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25zm10 0c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25z" />
      </svg>
    ),
    href: 'https://play.google.com/store/apps/details?id=com.examscholar.app.utme',
    color: 'bg-success-500 hover:bg-success-600',
    features: ['Offline access', 'Push notifications', 'Auto updates'],
  },
  {
    name: 'iPhone & iPad',
    description: 'iOS 14.0 or later',
    version: 'Latest version',
    size: '30 MB',
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
    ),
    href: 'https://apps.apple.com/us/app/examscholars-utme-cbt-practice/id6738136424',
    color: 'bg-neutral-800 hover:bg-neutral-900',
    features: ['iCloud sync', 'Face ID', 'Widget support'],
  },
  {
    name: 'Windows 10/11',
    description: 'Modern Windows PCs',
    version: 'Latest version',
    size: '35 MB',
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
        <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
      </svg>
    ),
    href: 'https://examscholars.com/examscholars-utme-setup.zip',
    color: 'bg-primary-500 hover:bg-primary-600',
    features: ['Full screen mode', 'Keyboard shortcuts', 'Auto save'],
  },
  {
    name: 'Windows 7/8',
    description: 'Older Windows PCs',
    version: 'v1.2.5',
    size: '28 MB',
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
        <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
      </svg>
    ),
    href: 'https://examscholars.com/examscholars-utme-setup-win7.msi',
    color: 'bg-background-500 hover:bg-background-600',
    features: ['Legacy support', 'Offline installer', 'Lightweight'],
  },
  {
    name: 'macOS',
    description: 'macOS 11.0 or later',
    version: 'Latest version',
    size: '32 MB',
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
    ),
    href: 'https://apps.apple.com/us/app/examscholars-utme-cbt-practice/id6738136424',
    color: 'bg-neutral-500 hover:bg-neutral-600',
    features: ['Retina display', 'Touch Bar support', 'App Store'],
  },
];

export default function DownloadPage() {
  return (
    <>
      <Navbar />
      <main className="pt-28 pb-16 md:pt-36 md:pb-24">
        {/* Header */}
        <div className="bg-neutral-900 py-16 md:py-24 mb-16">
          <div className="section-container text-center">
            <span className="badge bg-white/10 text-white mb-4 inline-block">Download</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6">
              Download ExamScholars
            </h1>
            <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto">
              Available on all major platforms. Download the app and start practicing 
              with thousands of past questions—even offline.
            </p>
          </div>
        </div>

        {/* Platform Cards */}
        <div className="section-container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {platforms.map((platform) => (
              <div
                key={platform.name}
                className="bg-white rounded-3xl p-8 border-2 border-neutral-100 hover:border-neutral-200 hover:shadow-xl transition-all"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white ${platform.color}`}>
                    {platform.icon}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-neutral-500">{platform.version}</p>
                    <p className="text-sm text-neutral-500">{platform.size}</p>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-1">{platform.name}</h3>
                <p className="text-neutral-500 mb-6">{platform.description}</p>
                <ul className="space-y-2 mb-6">
                  {platform.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-neutral-600">
                      <svg className="w-4 h-4 text-success-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <a
                  href={platform.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-4 rounded-full font-semibold text-center transition-all duration-200 inline-flex items-center justify-center gap-2 ${platform.color} text-white`}
                >
                  Download for {platform.name}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </a>
              </div>
            ))}
          </div>

          {/* System Requirements */}
          <div className="mt-16 bg-white rounded-3xl p-8 md:p-12">
            <h2 className="text-2xl font-bold mb-6">System Requirements</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-lg mb-3">Minimum Requirements</h3>
                <ul className="space-y-2 text-neutral-600">
                  <li>• Android 5.0+ / iOS 14.0+ / Windows 10+ / macOS 11.0+</li>
                  <li>• 2 GB RAM</li>
                  <li>• 100 MB free storage</li>
                  <li>• Works offline after download</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-3">Recommended</h3>
                <ul className="space-y-2 text-neutral-600">
                  <li>• Latest OS version</li>
                  <li>• 4 GB RAM</li>
                  <li>• 200 MB free storage</li>
                  <li>• Internet for initial download only</li>
                </ul>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <p className="text-neutral-600 mb-4">Need help with installation?</p>
            <Link href="/contact" className="btn-outline text-lg px-8 py-4">
              Contact support
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
