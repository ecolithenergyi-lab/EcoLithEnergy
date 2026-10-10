const mongoose = require('mongoose');

const SiteSettingsSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      default: 'EcoLith Energy',
      trim: true
    },
    tagline: {
      type: String,
      default: 'Powering a Greener Tomorrow',
      trim: true
    },
    phone1: {
      type: String,
      default: '8595581248',
      trim: true
    },
    phone2: {
      type: String,
      default: '9315111248',
      trim: true
    },
    email: {
      type: String,
      default: 'ecolithenergyi@gmail.com',
      trim: true,
      lowercase: true
    },
    address: {
      type: String,
      default: 'Ground Floor, Khasra Number 15, 24, Gali No. 5, Near Shani Mandir, Samaipur, Swaroop Nagar Extension, Delhi – 110042',
      trim: true
    },
    googleMapsUrl: {
      type: String,
      default: 'https://www.google.com/maps/search/?api=1&query=Ground+Floor,+Khasra+Number+15,+24,+Gali+No.+5,+near+Shani+Mandir,+Samaipur,+Swaroop+Nagar+Extension,+Delhi,+110042',
      trim: true
    },
    googleMapsEmbed: {
      type: String,
      default: 'https://www.google.com/maps?q=Ground+Floor,+Khasra+Number+15,+24,+Gali+No.+5,+near+Shani+Mandir,+Samaipur,+Swaroop+Nagar+Extension,+Delhi,+110042&output=embed',
      trim: true
    },
    whatsappNumber: {
      type: String,
      default: '8595581248',
      trim: true
    },
    instagramUrl: {
      type: String,
      default: '#',
      trim: true
    },
    linkedinUrl: {
      type: String,
      default: '#',
      trim: true
    },
    facebookUrl: {
      type: String,
      default: '#',
      trim: true
    },
    heroTitle: {
      type: String,
      default: 'Powering a Greener Tomorrow.',
      trim: true
    },
    heroSubtitle: {
      type: String,
      default: 'Premium Lithium Battery Solutions Built for Electric Mobility.',
      trim: true
    },
    aboutText: {
      type: String,
      default: 'EcoLith Energy is a Delhi-based lithium battery company focused on delivering dependable battery solutions for electric mobility and energy applications.',
      trim: true
    },
    footerText: {
      type: String,
      default: '© 2026 EcoLith Energy. All Rights Reserved.',
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('SiteSettings', SiteSettingsSchema);
