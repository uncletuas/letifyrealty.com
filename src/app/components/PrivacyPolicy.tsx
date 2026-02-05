import { motion } from 'motion/react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

export function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
  const sections = [
    {
      title: 'Information We Collect',
      description: 'We may collect the following information:',
      list: [
        'Full name',
        'Phone number',
        'Email address',
        'Property preferences or inquiries',
        'Any other information you voluntarily submit through forms or communication channels',
      ],
    },
    {
      title: 'How We Use Your Information',
      description: 'We use your information to:',
      list: [
        'Respond to inquiries and property requests',
        'Provide real estate and property management services',
        'Communicate updates, offers, or relevant information',
        'Improve our services and website experience',
      ],
    },
    {
      title: 'Data Protection',
      description:
        'We take reasonable measures to protect your personal data from unauthorized access, misuse, or disclosure. However, no online transmission is 100% secure.',
    },
    {
      title: 'Cookies',
      description:
        'Our website may use cookies to enhance user experience and analyze website traffic. You may disable cookies in your browser settings if you prefer.',
    },
    {
      title: 'Third-Party Links',
      description:
        'Our website may contain links to third-party websites. Letifi Realty is not responsible for the privacy practices of those websites.',
    },
    {
      title: 'Your Rights',
      description:
        'You may request access, correction, or deletion of your personal information by contacting us directly.',
    },
    {
      title: 'Changes to This Policy',
      description:
        'We may update this Privacy Policy from time to time. Any changes will be posted on this page.',
    },
  ];

  return (
    <section className="py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.button
          onClick={onBack}
          className="flex items-center gap-2 text-foreground/70 hover:text-primary transition-colors"
          whileHover={{ x: -4 }}
        >
          <ArrowLeft size={18} />
          Back to Home
        </motion.button>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-accent/10 p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl" style={{ fontWeight: 700 }}>
                    Privacy Policy
                  </h1>
                  <p className="text-sm text-foreground/70">Effective Date: February 5, 2026</p>
                </div>
              </div>
              <p className="text-foreground/80 leading-relaxed text-lg">
                At Letifi Realty, we respect your privacy and are committed to protecting any personal information you provide when using our website or services.
              </p>
            </motion.div>

            {sections.map((section, index) => (
              <motion.div
                key={section.title}
                className="bg-card border border-border rounded-xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
              >
                <h2 className="text-xl sm:text-2xl mb-3" style={{ fontWeight: 600 }}>
                  {section.title}
                </h2>
                <p className="text-foreground/80 leading-relaxed">
                  {section.description}
                </p>
                {section.list && (
                  <ul className="mt-4 space-y-2 text-foreground/80 list-disc pl-5">
                    {section.list.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </motion.div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="mb-3" style={{ fontWeight: 600 }}>
                  Quick Summary
                </h3>
                <ul className="space-y-2 text-sm text-foreground/70">
                  <li>We collect only the details you provide to deliver services.</li>
                  <li>Your data is used to respond to requests and improve experiences.</li>
                  <li>We do not sell or share your data for marketing purposes.</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-6">
                <h3 className="mb-3" style={{ fontWeight: 600 }}>
                  Contact Us
                </h3>
                <p className="text-sm text-foreground/70 mb-4">
                  If you have any questions about this Privacy Policy, please reach out.
                </p>
                <div className="space-y-2 text-sm">
                  <a href="mailto:info@letifirealty.com" className="text-primary hover:text-accent transition-colors block">
                    info@letifirealty.com
                  </a>
                  <a href="tel:+2349067435048" className="text-primary hover:text-accent transition-colors block">
                    09067435048
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
