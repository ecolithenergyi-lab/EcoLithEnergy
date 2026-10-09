const { z } = require('zod');

const reviewSchema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  rating: z.number().min(1).max(5).default(5),
  review: z.string().min(3, 'Review text is required').max(1000),
  source: z.string().optional().default('Google Business Profile'),
  isPublished: z.boolean().optional().default(true)
});

module.exports = {
  reviewSchema
};
