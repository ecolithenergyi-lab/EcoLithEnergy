const Inquiry = require('../models/Inquiry');
const { successResponse, paginatedResponse, errorResponse } = require('../utils/response');
const { logAudit } = require('../middleware/audit');
const { hashIp } = require('../utils/sanitize');
const { generateWhatsAppUrl } = require('../services/whatsapp.service');
const SiteSettings = require('../models/SiteSettings');

// Public: Submit inquiry
async function createInquiry(req, res) {
  try {
    const rawIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
    const ipHash = hashIp(rawIp);

    const inquiryData = {
      ...req.body,
      ipHash,
      source: 'Website Contact Form'
    };

    const inquiry = await Inquiry.create(inquiryData);

    // Fetch site settings to get configured WhatsApp number
    const settings = await SiteSettings.findOne().lean();
    const whatsappTarget = (settings && settings.whatsappNumber) || '8595581248';
    const whatsappUrl = generateWhatsAppUrl(inquiry, whatsappTarget);

    return successResponse(res, {
      inquiryId: inquiry._id,
      whatsappUrl,
      message: 'Thank you. Your enquiry has been received.'
    }, 201, 'Thank you. Your enquiry has been received.');
  } catch (err) {
    return errorResponse(res, 'Failed to submit enquiry. Please try again.', 500);
  }
}

// Admin: Get inquiries
async function getAdminInquiries(req, res) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const { status, search } = req.query;

    const filter = {};
    if (status && status !== 'ALL') {
      filter.status = status;
    }
    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { company: { $regex: q, $options: 'i' } },
        { requirement: { $regex: q, $options: 'i' } }
      ];
    }

    const [inquiries, total] = await Promise.all([
      Inquiry.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Inquiry.countDocuments(filter)
    ]);

    return paginatedResponse(res, inquiries, { page, limit, total });
  } catch (err) {
    return errorResponse(res, 'Failed to fetch inquiries.', 500);
  }
}

// Admin: Get inquiry by ID
async function getAdminInquiryById(req, res) {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return errorResponse(res, 'Inquiry not found.', 404);
    }
    return successResponse(res, inquiry);
  } catch (err) {
    return errorResponse(res, 'Failed to fetch inquiry.', 500);
  }
}

// Admin: Update inquiry status
async function updateInquiryStatus(req, res) {
  try {
    const { status } = req.body;
    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return errorResponse(res, 'Inquiry not found.', 404);
    }

    const oldStatus = inquiry.status;
    inquiry.status = status;
    await inquiry.save();

    logAudit({
      admin: req.admin,
      action: 'INQUIRY_STATUS_CHANGE',
      resource: 'INQUIRY',
      resourceId: inquiry._id,
      details: { from: oldStatus, to: status, customer: inquiry.name },
      req
    });

    return successResponse(res, inquiry, 200, `Inquiry status changed to ${status}.`);
  } catch (err) {
    return errorResponse(res, 'Failed to update status.', 400);
  }
}

// Admin: Delete inquiry
async function deleteInquiry(req, res) {
  try {
    const inquiry = await Inquiry.findByIdAndDelete(req.params.id);
    if (!inquiry) {
      return errorResponse(res, 'Inquiry not found.', 404);
    }

    logAudit({
      admin: req.admin,
      action: 'INQUIRY_DELETE',
      resource: 'INQUIRY',
      resourceId: req.params.id,
      details: { customer: inquiry.name, phone: inquiry.phone },
      req
    });

    return successResponse(res, null, 200, 'Inquiry deleted successfully.');
  } catch (err) {
    return errorResponse(res, 'Failed to delete inquiry.', 500);
  }
}

// Admin: Export inquiries as CSV
function escapeCsvValue(value) {
  const text = String(value ?? '');
  const spreadsheetSafe = /^[\s\uFEFF]*[=+\-@]/u.test(text) ? `'${text}` : text;
  return `"${spreadsheetSafe.replace(/"/g, '""')}"`;
}

async function exportCsv(req, res) {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 }).lean();

    const headers = ['ID', 'Date', 'Name', 'Phone', 'Email', 'Company', 'Requirement', 'Message', 'Status'];
    const rows = inquiries.map(i => [
      i._id,
      new Date(i.createdAt).toISOString(),
      i.name,
      i.phone,
      i.email,
      i.company,
      i.requirement,
      i.message,
      i.status
    ].map(escapeCsvValue));

    const csvContent = [headers.map(escapeCsvValue).join(','), ...rows.map(r => r.join(','))].join('\r\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=ecolith_inquiries_${Date.now()}.csv`);
    return res.status(200).send(csvContent);
  } catch (err) {
    return errorResponse(res, 'Failed to export CSV.', 500);
  }
}

module.exports = {
  createInquiry,
  getAdminInquiries,
  getAdminInquiryById,
  updateInquiryStatus,
  deleteInquiry,
  exportCsv,
  escapeCsvValue
};
