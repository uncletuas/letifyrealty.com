import { motion } from 'motion/react';
import { ArrowLeft, FileText } from 'lucide-react';

interface TermsConditionsProps {
  onBack: () => void;
}

export function TermsConditions({ onBack }: TermsConditionsProps) {
  const sections = [
    {
      title: 'Use of Services',
      description:
        'Letifi Realty provides real estate brokerage, property marketing, and property management services. Information provided on our website is for general guidance and does not constitute legal or financial advice.',
    },
    {
      title: 'Accuracy of Information',
      description:
        'While we strive to ensure that property listings and information are accurate, Letifi Realty does not guarantee the completeness or accuracy of all listings and is not liable for errors, omissions, or changes made by property owners.',
    },
    {
      title: 'Client Responsibilities',
      description: 'Clients are responsible for:',
      list: [
        'Providing accurate information',
        'Conducting independent inspections and due diligence',
        'Complying with all applicable laws and agreements',
      ],
    },
    {
      title: 'Fees and Payments',
      description:
        'Any service fees, commissions, or charges will be clearly communicated and agreed upon before engagement.',
    },
    {
      title: 'Intellectual Property',
      description:
        'All content on this website, including text, images, logos, and branding, belongs to Letifi Realty and may not be copied or used without written permission.',
    },
    {
      title: 'Limitation of Liability',
      description:
        'Letifi Realty shall not be liable for any loss, damages, or disputes arising from property transactions, third-party actions, or reliance on website information.',
    },
    {
      title: 'Termination',
      description:
        'We reserve the right to suspend or terminate access to our services if these Terms are violated.',
    },
    {
      title: 'Governing Law',
      description:
        'These Terms and Conditions are governed by the laws of the Federal Republic of Nigeria.',
    },
    {
      title: 'Changes to Terms',
      description:
        'Letifi Realty may update these Terms at any time. Continued use of our services constitutes acceptance of any changes.',
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
                  <FileText size={22} />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl" style={{ fontWeight: 700 }}>
                    Terms and Conditions
                  </h1>
                  <p className="text-sm text-foreground/70">Effective Date: February 5, 2026</p>
                </div>
              </div>
              <p className="text-foreground/80 leading-relaxed text-lg">
                By accessing or using the services of Letifi Realty, you agree to the following Terms and Conditions.
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
                  <li>Use our services for legitimate purposes only.</li>
                  <li>Listing details can change; confirm all information independently.</li>
                  <li>We may update these terms as our services evolve.</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-6">
                <h3 className="mb-3" style={{ fontWeight: 600 }}>
                  Contact Information
                </h3>
                <p className="text-sm text-foreground/70 mb-4">
                  For questions regarding these Terms, contact us at:
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
