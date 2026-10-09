const { z } = require('zod');

const inquiryCreateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(120),
  phone: z.string().min(7, 'Please enter a valid phone number').max(30).regex(/^[0-9+\s-]{7,25}$/, 'Invalid phone number format'),
  email: z.string().email('Please enter a valid email address').max(120).optional().or(z.literal('')),
  company: z.string().max(150).optional().or(z.literal('')),
  requirement: z.string().min(2, 'Please select a requirement').max(100),
  message: z.string().max(2000).optional().or(z.literal(''))
});

const inquiryStatusSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'IN_PROGRESS', 'CONVERTED', 'CLOSED', 'SPAM'])
});

module.exports = {
  inquiryCreateSchema,
  inquiryStatusSchema
};
