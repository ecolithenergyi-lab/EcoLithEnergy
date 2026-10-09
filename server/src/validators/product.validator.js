const { z } = require('zod');

const productSchema = z.object({
  name: z.string().min(2, 'Product name is required').max(150),
  slug: z.string().max(160).optional(),
  category: z.enum(['LFP', 'NMC']),
  technology: z.string().min(2, 'Technology is required'),
  voltage: z.string().min(1, 'Voltage is required'),
  capacity: z.string().min(1, 'Capacity is required'),
  energy: z.string().optional(),
  type: z.string().optional().default('Light Weight Battery'),
  description: z.string().min(5, 'Description is required'),
  shortDescription: z.string().optional(),
  features: z.array(z.string()).optional().default([]),
  applications: z.array(z.string()).optional().default([]),
  warranty: z.string().optional().default('Contact for Warranty Details'),
  price: z.number().min(0).optional().default(0),
  showPrice: z.boolean().optional().default(false),
  image: z.string().min(1, 'Product image is required'),
  gallery: z.array(z.string()).optional().default([]),
  isFeatured: z.boolean().optional().default(false),
  isPublished: z.boolean().optional().default(true),
  sortOrder: z.number().optional().default(0),
  seoTitle: z.string().max(150).optional(),
  seoDescription: z.string().max(300).optional()
});

module.exports = {
  productSchema
};
