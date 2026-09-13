const testimonials = [
  {
    name: 'Chukwu Vincent',
    exam: 'JAMB/UTME',
    avatar: 'CV',
    rating: 5,
    quote:
      'I scored 287 in JAMB. Before Examinery, I was scoring below 200 in practice. The detailed explanations after each question taught me things my textbook could not explain simply.',
  },
  {
    name: 'Adewale Opeyemi',
    exam: 'WAEC/SSCE',
    avatar: 'AO',
    rating: 5,
    quote:
      'I used Examinery for three months before WAEC. I got distinctions in Mathematics, English, Physics, and Chemistry. The exam mode prepared me for the real thing. I felt no pressure on exam day.',
  },
  {
    name: 'Obianuju Onu',
    exam: 'JAMB/UTME',
    avatar: 'OO',
    rating: 5,
    quote:
      'What I love about Examinery is that I was not just memorizing answers. I was understanding the concepts. When I saw similar questions in the real exam, I knew how to solve them, not just guess.',
  },
  {
    name: 'Usman Abdusalam',
    exam: 'Post-UTME',
    avatar: 'UA',
    rating: 5,
    quote:
      'The timed exam mode forced me to work faster. Before Examinery, I could barely finish 50 questions in an hour. After two months of practice, I was finishing with time to spare. My Post-UTME score went up by 40 points.',
  },
];

const avatarColors = [
  'bg-primary-500',
  'bg-accent-500',
  'bg-success-500',
  'bg-warning-500',
];

export default function Testimonials() {
  return (
    <section className="py-16 md:py-24 bg-background-100">
      <div className="section-container">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className="badge-primary mb-4 inline-block">Testimonials</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-neutral-900 mb-4">
            Students who passed with Examinery
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Real results from real students. These are their scores and their words.
          </p>
        </div>

        {/* Testimonial Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className="bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Quote Icon */}
              <svg
                className="w-8 h-8 text-primary-200 mb-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-primary-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <p className="text-neutral-700 mb-6 leading-relaxed">
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
                    avatarColors[index % avatarColors.length]
                  }`}
                >
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold text-neutral-900">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-neutral-500">{testimonial.exam} candidate</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Social Proof */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-4 bg-white px-6 py-4 rounded-2xl shadow-sm">
            <div className="flex -space-x-2">
              {avatarColors.map((color, i) => (
                <div
                  key={i}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-white ${color}`}
                >
                  {['CV', 'AO', 'OO', 'UA'][i]}
                </div>
              ))}
            </div>
            <div className="text-left">
              <p className="font-semibold text-neutral-900 text-sm">300,000+ students trust Examinery</p>
              <p className="text-xs text-neutral-500">Join them, start practicing today</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
