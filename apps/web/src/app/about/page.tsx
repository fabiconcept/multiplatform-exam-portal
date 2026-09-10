import Link from 'next/link';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

const stats = [
  { value: '300,000+', label: 'Students reached' },
  { value: '5+', label: 'Exam categories' },
  { value: '10,000+', label: 'Past questions' },
  { value: '4.8/5', label: 'App rating' },
];

const values = [
  {
    title: 'Accessibility',
    description: 'We believe every student deserves access to quality exam preparation materials, regardless of their location or internet connectivity.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Excellence',
    description: 'We are committed to providing the highest quality content, carefully vetted by professionals to ensure accuracy and relevance.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
  {
    title: 'Innovation',
    description: 'We continuously improve our platform to provide the best learning experience with realistic CBT simulations.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    title: 'Student Success',
    description: 'Your success is our mission. We are dedicated to helping students achieve their academic goals and excel in their exams.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
];

const team = [
  {
    name: 'ExamScholars Team',
    role: 'Education & Technology',
    description: 'A passionate team dedicated to revolutionizing exam preparation in Nigeria.',
  },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="pt-28 pb-16 md:pt-36 md:pb-24">
        {/* Header */}
        <div className="bg-success-500 py-16 md:py-24 mb-16">
          <div className="section-container text-center">
            <span className="badge bg-white/20 text-white mb-4 inline-block">About Us</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6">
              About ExamScholars
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
              Empowering Nigerian students to succeed in their exams through innovative technology 
              and comprehensive practice materials.
            </p>
          </div>
        </div>

        {/* Mission */}
        <div className="section-container mb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-display font-bold mb-6">Our Mission</h2>
              <p className="text-lg text-neutral-600 mb-6">
                ExamScholars was created with a simple mission: to provide every Nigerian student 
                with access to quality exam preparation materials. We understand the challenges 
                students face in preparing for important examinations like JAMB, WAEC, BECE, and NCEE.
              </p>
              <p className="text-lg text-neutral-600 mb-6">
                Our platform simulates real exam conditions, helping students build confidence 
                and improve their performance. With thousands of past questions, detailed explanations, 
                and offline access, we make exam preparation accessible to everyone.
              </p>
              <p className="text-lg text-neutral-600">
                Whether you&apos;re a student aiming for top scores, a parent guiding your child, 
                or an educator looking for quality resources, ExamScholars is your trusted partner 
                in academic success.
              </p>
            </div>
            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <div className="grid grid-cols-2 gap-6">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center p-4">
                    <p className="text-3xl font-bold text-primary-500">{stat.value}</p>
                    <p className="text-neutral-600 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="section-container mb-16">
          <h2 className="text-3xl font-display font-bold text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <div key={value.title} className="bg-white rounded-3xl p-6 text-center">
                <div className="w-14 h-14 bg-success-100 rounded-2xl flex items-center justify-center text-success-600 mx-auto mb-4">
                  {value.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                <p className="text-neutral-600 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="section-container mb-16">
          <div className="bg-white rounded-3xl p-8 md:p-12 text-center">
            <h2 className="text-3xl font-display font-bold mb-6">Our Team</h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto mb-8">
              We are a dedicated team of educators, developers, and exam experts committed to 
              helping students succeed. Our combined experience in education and technology 
              drives us to continuously improve the ExamScholars platform.
            </p>
            {team.map((member) => (
              <div key={member.name} className="inline-block">
                <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-primary-600">ES</span>
                </div>
                <h3 className="font-semibold text-lg">{member.name}</h3>
                <p className="text-neutral-500">{member.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="section-container">
          <div className="bg-neutral-900 rounded-3xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to start your exam preparation journey?
            </h2>
            <p className="text-neutral-400 mb-6">
              Join 300,000+ students already using ExamScholars
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="px-8 py-4 bg-primary-500 text-neutral-900 font-semibold rounded-full text-lg hover:bg-primary-400 hover:shadow-xl hover:shadow-primary-500/25 transition-all duration-200 inline-flex items-center justify-center gap-2"
              >
                Get started now
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/contact"
                className="px-8 py-4 bg-white/10 text-white font-semibold rounded-full text-lg hover:bg-white/20 transition-all duration-200 inline-flex items-center justify-center"
              >
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
