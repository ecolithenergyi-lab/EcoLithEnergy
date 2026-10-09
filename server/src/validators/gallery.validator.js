const { z } = require('zod');

const gallerySchema = z.object({
  title: z.string().min(2, 'Title is required').max(120),
  description: z.string().max(300).optional().default(''),
  image: z.string().min(1, 'Image path or URL is required'),
  category: z.enum(['factory', 'battery', 'quality', 'facility']).default('facility'),
  sortOrder: z.number().optional().default(0),
  isPublished: z.boolean().optional().default(true)
});

module.exports = {
  gallerySchema
};
