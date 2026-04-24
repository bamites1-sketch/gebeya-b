import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { EthiopianFlagStripe } from '../components/ui/Logo';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function AboutPage() {
  return (
    <div className="bg-[#FDFBF7] dark:bg-gray-950 min-h-screen">

      {/* Hero */}
      <section
        className="relative py-20 px-4 text-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #2C1810 0%, #1a0e06 50%, #078930 100%)' }}
      >
        <div className="absolute inset-0 pattern-tibeb opacity-30 pointer-events-none" />
        <div className="relative max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
            <div className="flex justify-center gap-2 mb-6">
              <span className="h-1.5 w-10 bg-[#078930] rounded-full" />
              <span className="h-1.5 w-10 bg-[#FCDD09] rounded-full" />
              <span className="h-1.5 w-10 bg-[#DA121A] rounded-full" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">About gebeya-B</h1>
            <p className="text-white/70 text-lg max-w-xl mx-auto leading-relaxed">
              An Ethiopian cultural marketplace built with passion — connecting artisans with the world.
            </p>
          </motion.div>
        </div>
      </section>

      <EthiopianFlagStripe height={4} />

      <div className="max-w-4xl mx-auto px-4 py-16 space-y-12">

        {/* Developer card */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm overflow-hidden">
            <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg,#078930 33%,#FCDD09 33% 66%,#DA121A 66%)' }} />
            <div className="p-8 flex flex-col sm:flex-row items-center sm:items-start gap-8">

              {/* Avatar */}
              <div className="shrink-0">
                <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-[#F19A0E] to-[#2C1810] flex items-center justify-center shadow-lg">
                  <span className="text-5xl font-black text-white">B</span>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center sm:text-left">
                <div className="inline-flex items-center gap-2 bg-[#FEF3E2] dark:bg-[#2C1810]/40 text-[#F19A0E] text-xs font-bold px-3 py-1 rounded-full mb-3">
                  👨‍💻 Founder & Developer
                </div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-1">Beamlak Tesfahun</h2>
                <p className="text-[#F19A0E] font-semibold text-sm mb-4">
                  3rd Year Software Engineering Student
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-6">
                  {[
                    { icon: '🏫', label: 'University', value: 'Wollo University, Kombolcha Campus' },
                    { icon: '📍', label: 'Location',   value: 'Kombolcha, Ethiopia' },
                    { icon: '📧', label: 'Email',      value: 'Beamlaktesfahunn@gmail.com', href: 'mailto:Beamlaktesfahunn@gmail.com' },
                    { icon: '🐙', label: 'GitHub',   value: 'Beamlak (bamites1-sketch)', href: 'https://github.com/bamites1-sketch' },
                    { icon: '✈️', label: 'Telegram', value: '@BAM3_6', href: 'https://t.me/BAM3_6' },
                  ].map(({ icon, label, value, href }) => (
                    <div key={label} className="flex items-start gap-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                      <span className="text-lg shrink-0">{icon}</span>
                      <div>
                        <p className="text-xs text-gray-400 font-medium">{label}</p>
                        {href ? (
                          <a href={href} target={href.startsWith('http') ? '_blank' : undefined}
                            rel="noopener noreferrer"
                            className="text-[#F19A0E] hover:underline font-semibold break-all">
                            {value}
                          </a>
                        ) : (
                          <p className="text-gray-900 dark:text-white font-semibold">{value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                  <a href="mailto:Beamlaktesfahunn@gmail.com"
                    className="inline-flex items-center gap-2 bg-[#F19A0E] hover:bg-[#d97b08] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors">
                    📧 Send Email
                  </a>
                  <a href="https://github.com/bamites1-sketch" target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-[#F19A0E] hover:text-[#F19A0E] px-5 py-2.5 rounded-xl text-sm font-bold transition-colors">
                    🐙 GitHub
                  </a>
                  <a href="https://t.me/BAM3_6" target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-[#2CA5E0] hover:text-[#2CA5E0] px-5 py-2.5 rounded-xl text-sm font-bold transition-colors">
                    ✈️ Telegram
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* About the project */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm">
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4">🇪🇹 About gebeya-B</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              <strong className="text-[#F19A0E]">gebeya-B</strong> (ገበያ-B) is an Ethiopian cultural marketplace
              built with passion to celebrate and preserve Ethiopian heritage. The platform connects
              Ethiopian artisans and cultural product makers with customers locally and globally.
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
              The name "gebeya" (ገበያ) means "market" in Amharic — a nod to the traditional Ethiopian
              marketplace where communities gather to trade handmade goods, clothing, food, and cultural items.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { n: '25+', l: 'Products' },
                { n: '7',   l: 'Categories' },
                { n: '6',   l: 'Regions' },
                { n: '4',   l: 'Languages' },
              ].map(({ n, l }) => (
                <div key={l} className="text-center bg-[#FEF3E2] dark:bg-[#2C1810]/40 rounded-2xl p-4">
                  <p className="text-2xl font-black text-[#F19A0E]">{n}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Tech stack */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm">
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-5">⚙️ Tech Stack</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { icon: '⚛️',  name: 'React 19',       role: 'Frontend' },
                { icon: '⚡',  name: 'Vite',            role: 'Build Tool' },
                { icon: '🎨',  name: 'Tailwind CSS',    role: 'Styling' },
                { icon: '🟢',  name: 'Node.js + Express', role: 'Backend' },
                { icon: '🗄️', name: 'MySQL + Prisma',  role: 'Database' },
                { icon: '🔐',  name: 'JWT Auth',        role: 'Security' },
              ].map(({ icon, name, role }) => (
                <div key={name} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{name}</p>
                    <p className="text-xs text-gray-400">{role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="text-center">
          <Link to="/products"
            className="inline-flex items-center gap-2 bg-[#F19A0E] hover:bg-[#d97b08] text-white px-10 py-4 rounded-full font-black text-lg transition-all shadow-lg shadow-[#F19A0E]/30 hover:-translate-y-0.5">
            🛍️ Explore the Marketplace
          </Link>
        </motion.div>

      </div>
    </div>
  );
}
