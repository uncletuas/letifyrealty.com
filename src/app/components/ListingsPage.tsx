import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { Listings } from './Listings';

interface ListingsPageProps {
  onBack: () => void;
  onPropertyClick?: (propertyId: string) => void;
}

export function ListingsPage({ onBack, onPropertyClick }: ListingsPageProps) {
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
      </div>

      <div className="mt-6">
        <Listings
          onPropertyClick={onPropertyClick}
          title="All Listings"
          subtitle="Browse every available property across sales, rentals, commercial, and Airbnb"
          sectionId="listings-page"
          showFilters
          showSearch
        />
      </div>
    </section>
  );
}
