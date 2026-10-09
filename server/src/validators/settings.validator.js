const { z } = require('zod');

const settingsSchema = z.object({
  companyName: z.string().min(1).max(100).optional(),
  tagline: z.string().max(150).optional(),
  phone1: z.string().min(5).max(30).optional(),
  phone2: z.string().max(30).optional(),
  email: z.string().email().max(120).optional(),
  address: z.string().max(300).optional(),
  googleMapsUrl: z.string().url().or(z.literal('')).optional(),
  googleMapsEmbed: z.string().url().or(z.literal('')).optional(),
  whatsappNumber: z.string().max(30).optional(),
  instagramUrl: z.string().max(300).optional(),
  linkedinUrl: z.string().max(300).optional(),
  facebookUrl: z.string().max(300).optional(),
  heroTitle: z.string().max(150).optional(),
  heroSubtitle: z.string().max(250).optional(),
  aboutText: z.string().max(2000).optional(),
  footerText: z.string().max(200).optional()
});

module.exports = {
  settingsSchema
};
