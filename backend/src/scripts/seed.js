const Product = require('../models/Product');
const Review = require('../models/Review');
const Gallery = require('../models/Gallery');
const SiteSettings = require('../models/SiteSettings');
const logger = require('../utils/logger');

async function seedDatabase() {
  try {
    // 1. Seed Site Settings
    const existingSettings = await SiteSettings.findOne();
    if (!existingSettings) {
      await SiteSettings.create({
        companyName: 'EcoLith Energy',
        tagline: 'Powering a Greener Tomorrow',
        phone1: '8595581248',
        phone2: '9315111248',
        email: 'ecolithenergyi@gmail.com',
        address: 'Ground Floor, Khasra Number 15, 24, Gali No. 5, Near Shani Mandir, Samaipur, Swaroop Nagar Extension, Delhi – 110042',
        googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Ground+Floor,+Khasra+Number+15,+24,+Gali+No.+5,+near+Shani+Mandir,+Samaipur,+Swaroop+Nagar+Extension,+Delhi,+110042',
        googleMapsEmbed: 'https://www.google.com/maps?q=Ground+Floor,+Khasra+Number+15,+24,+Gali+No.+5,+near+Shani+Mandir,+Samaipur,+Swaroop+Nagar+Extension,+Delhi,+110042&output=embed',
        whatsappNumber: '8595581248',
        heroTitle: 'Powering a Greener Tomorrow.',
        heroSubtitle: 'Premium Lithium Battery Solutions Built for Electric Mobility.',
        aboutText: 'EcoLith Energy is a Delhi-based lithium battery company focused on delivering dependable battery solutions for electric mobility and energy applications.'
      });
      logger.info('Site settings initialized.');
    }

    // 2. Seed Products
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const initialProducts = [
        {
          name: '48V 30AH LFP Battery',
          slug: '48v-30ah-lfp-battery',
          category: 'LFP',
          technology: 'LFP Lithium Iron Phosphate',
          voltage: '48V',
          capacity: '30AH',
          energy: '1440Wh',
          type: 'Light Weight Battery',
          description: 'High-power lithium iron phosphate battery designed for efficient electric mobility and portable energy use.',
          shortDescription: 'A 48V 30AH lithium iron phosphate battery designed for high power density, portability and dependable electric mobility performance.',
          features: ['Voltage: 48V', 'Capacity: 30AH', 'Energy: 1440Wh', 'Technology: LFP Lithium Iron Phosphate', 'Type: Light Weight Battery', 'Application: EV & portable power'],
          applications: ['Electric Scooters', 'Electric Bikes', 'Portable Power', 'EV Vehicles'],
          warranty: 'Contact for Warranty Details',
          price: 0,
          showPrice: false,
          image: '/images/48-30%20battry.jpeg',
          gallery: ['/images/48-30%20battry.jpeg'],
          isFeatured: false,
          isPublished: true,
          sortOrder: 1,
          seoTitle: '48V 30AH LFP Battery | EcoLith Energy Delhi',
          seoDescription: 'High quality 48V 30AH LFP Lithium Battery manufactured by EcoLith Energy Delhi.'
        },
        {
          name: '60V 32AH NMC Lithium Battery',
          slug: '60v-32ah-nmc-lithium-battery',
          category: 'NMC',
          technology: 'NMC Lithium-Ion',
          voltage: '60V',
          capacity: '32AH',
          energy: '1920Wh',
          type: 'Light Weight Battery',
          description: 'A lightweight NMC lithium-ion battery pack engineered for electric mobility applications.',
          shortDescription: '1920Wh Energy EV application focused NMC lithium-ion battery.',
          features: ['Lightweight design', 'NMC Lithium-Ion technology', 'EV application focused', 'Quality-oriented assembly', 'Professional battery enclosure'],
          applications: ['Electric Scooters', 'Electric Bikes', 'Electric Rickshaws', 'EV Vehicles'],
          warranty: 'Contact for Warranty Details',
          price: 0,
          showPrice: false,
          image: '/images/NMC-60V32AH.jpeg',
          gallery: ['/images/NMC-60V32AH.jpeg'],
          isFeatured: true,
          isPublished: true,
          sortOrder: 2,
          seoTitle: '60V 32AH NMC Lithium Battery | EcoLith Energy Delhi',
          seoDescription: 'High energy 60V 32AH NMC battery pack with 1920Wh capacity for electric mobility.'
        },
        {
          name: 'LFP Lithium Battery',
          slug: 'lfp-lithium-battery',
          category: 'LFP',
          technology: 'LFP Lithium Iron Phosphate',
          voltage: '60V–72V',
          capacity: '30AH+',
          energy: '1800Wh+',
          type: 'Light Weight Battery',
          description: 'Lithium Iron Phosphate battery engineered for safety and long cycle life.',
          shortDescription: 'LFP (Lithium Iron Phosphate) battery engineered for safety, thermal stability and long cycle life.',
          features: ['Long Cycle Life', 'High Safety', 'Stable Performance', 'Reliable Energy'],
          applications: ['Electric Scooters', 'Electric Rickshaws', 'Energy Storage', 'Custom EV Applications'],
          warranty: 'Contact for Warranty Details',
          price: 0,
          showPrice: false,
          image: '/images/60-30%20lfp.jpeg',
          gallery: ['/images/60-30%20lfp.jpeg'],
          isFeatured: false,
          isPublished: true,
          sortOrder: 3,
          seoTitle: 'LFP Lithium Battery | EcoLith Energy Delhi',
          seoDescription: 'Dependable LFP battery solutions for EV mobility and energy storage.'
        }
      ];

      await Product.insertMany(initialProducts);
      logger.info('Initial real EcoLith products seeded successfully.');
    }

    // 3. Seed Reviews
    const reviewCount = await Review.countDocuments();
    if (reviewCount === 0) {
      const initialReviews = [
        {
          name: 'Sahil Gunjan',
          rating: 5,
          review: 'Best battery premium and best performance quality 👍',
          source: 'Google Business Profile',
          isPublished: true
        },
        {
          name: 'Salim Ahamad',
          rating: 5,
          review: 'Very nice 👍',
          source: 'Google Business Profile',
          isPublished: true
        },
        {
          name: 'EcoLith Energy',
          rating: 5,
          review: 'Best service and premium quality battery',
          source: 'Google Business Profile',
          isPublished: true
        }
      ];

      await Review.insertMany(initialReviews);
      logger.info('Initial customer reviews seeded successfully.');
    }

    // 4. Seed Gallery
    const galleryCount = await Gallery.countDocuments();
    if (galleryCount === 0) {
      const initialGallery = [
        {
          title: 'Battery Assembly Area',
          description: 'Real photograph from the EcoLith Energy facility in Delhi.',
          image: '/images/factory-1.png',
          category: 'facility',
          sortOrder: 1,
          isPublished: true
        },
        {
          title: 'Battery Testing & Production Area',
          description: 'Real photograph of battery testing area at Samaipur workshop.',
          image: '/images/factory-2.png',
          category: 'facility',
          sortOrder: 2,
          isPublished: true
        },
        {
          title: 'Quality & Testing',
          description: 'Inspection and testing of assembled battery packs.',
          image: '/images/quality.jpeg',
          category: 'quality',
          sortOrder: 3,
          isPublished: true
        }
      ];

      await Gallery.insertMany(initialGallery);
      logger.info('Initial real facility gallery seeded successfully.');
    }

  } catch (err) {
    logger.error(`Database seeding failed: ${err.message}`);
  }
}

// Support direct CLI invocation
if (require.main === module) {
  const { connectDatabase, closeDatabase } = require('../config/database');
  (async () => {
    try {
      await connectDatabase();
      await seedDatabase();
      logger.info('Seed script execution completed.');
      await closeDatabase();
      process.exit(0);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  })();
}

module.exports = {
  seedDatabase
};
