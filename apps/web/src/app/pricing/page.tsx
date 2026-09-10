import Link from 'next/link';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

const plans = [
  {
    name: 'Free',
    price: '₦0',
    period: 'forever',
    description: 'Get started with basic features',
    features: [
      'Limited practice questions',
      'Basic performance tracking',
      'Study mode access',
      'Single device',
      'Community forum access',
    ],
    cta: 'Start for free',
    href: '/register',
    popular: false,
  },
  {
    name: 'Premium',
    price: '₦3,000',
    period: 'one-time',
    description: 'Unlock all features for exam success',
    features: [
      'Unlimited practice questions',
      'Detailed performance analytics',
      'Study & Exam modes',
      'Offline access on all devices',
      'Detailed explanations',
      'JAMB 8-key navigation',
      'Priority support',
      'Regular content updates',
    ],
    cta: 'Get Premium',
    href: '/register?plan=premium',
    popular: true,
  },
];

const faqs = [
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept bank transfers, USSD, card payments, and mobile money. All payments are processed securely.',
  },
  {
    question: 'Can I get a refund?',
    answer: 'Yes, we offer a 7-day money-back guarantee if you are not satisfied with the premium features.',
  },
  {
    question: 'How long does the premium last?',
    answer: 'The premium is a one-time payment that gives you lifetime access to all features. No recurring charges.',
  },
  {
    question: 'Can I use premium on multiple devices?',
    answer: 'Yes, your premium subscription works across all your devices - Android, iOS, Windows, and Mac.',
  },
  {
    question: 'Is there a student discount?',
    answer: 'We already keep our pricing affordable at ₦3,000. Contact us if you need special assistance.',
  },
];

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="pt-28 pb-16 md:pt-36 md:pb-24">
        {/* Header */}
        <div className="bg-primary-500 py-16 md:py-24 mb-16">
          <div className="section-container text-center">
            <span className="badge bg-neutral-900/10 text-neutral-900 mb-4 inline-block">Pricing</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-neutral-900 mb-6">
              Simple, affordable pricing
            </h1>
            <p className="text-lg md:text-xl text-neutral-700 max-w-2xl mx-auto">
              Invest in your academic success. One-time payment, lifetime access. 
              No subscriptions, no hidden fees.
            </p>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="section-container mb-16">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-3xl p-8 ${
                  plan.popular
                    ? 'bg-neutral-900 text-white ring-4 ring-primary-500'
                    : 'bg-white border-2 border-neutral-200'
                }`}
              >
                {plan.popular && (
                  <span className="inline-block bg-primary-500 text-neutral-900 text-sm font-semibold px-3 py-1 rounded-full mb-4">
                    Most Popular
                  </span>
                )}
                <h3 className={`text-2xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-neutral-900'}`}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className={`text-sm ${plan.popular ? 'text-neutral-400' : 'text-neutral-500'}`}>
                    / {plan.period}
                  </span>
                </div>
                <p className={`mb-6 ${plan.popular ? 'text-neutral-400' : 'text-neutral-600'}`}>
                  {plan.description}
                </p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <svg
                        className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                          plan.popular ? 'text-primary-500' : 'text-success-500'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className={plan.popular ? 'text-neutral-300' : 'text-neutral-600'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`w-full py-4 rounded-full font-semibold text-center transition-all duration-200 inline-flex items-center justify-center ${
                    plan.popular
                      ? 'bg-primary-500 text-neutral-900 hover:bg-primary-400'
                      : 'bg-neutral-900 text-white hover:bg-neutral-800'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* How to Activate */}
        <div className="section-container mb-16">
          <div className="bg-white rounded-3xl p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">How to activate</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-xl mx-auto mb-4">
                  1
                </div>
                <h3 className="font-semibold mb-2">Register & Choose</h3>
                <p className="text-neutral-600 text-sm">Create an account and select the Premium plan</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-xl mx-auto mb-4">
                  2
                </div>
                <h3 className="font-semibold mb-2">Make Payment</h3>
                <p className="text-neutral-600 text-sm">Pay ₦3,000 via bank transfer, card, or USSD</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-xl mx-auto mb-4">
                  3
                </div>
                <h3 className="font-semibold mb-2">Get Activated</h3>
                <p className="text-neutral-600 text-sm">Your account is instantly activated with all features</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="section-container">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq) => (
              <div key={faq.question} className="bg-white rounded-2xl p-6">
                <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
                <p className="text-neutral-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="section-container mt-16 text-center">
          <div className="bg-neutral-900 rounded-3xl p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to start practicing?
            </h2>
            <p className="text-neutral-400 mb-6">
              Join 300,000+ students already using ExamScholars
            </p>
            <Link
              href="/register"
              className="px-8 py-4 bg-primary-500 text-neutral-900 font-semibold rounded-full text-lg hover:bg-primary-400 hover:shadow-xl hover:shadow-primary-500/25 transition-all duration-200 inline-flex items-center gap-2"
            >
              Get started now
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
