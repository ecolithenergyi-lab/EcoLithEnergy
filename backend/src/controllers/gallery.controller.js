const Gallery = require('../models/Gallery');
const { successResponse, paginatedResponse, errorResponse } = require('../utils/response');
const { logAudit } = require('../middleware/audit');
const { deleteUploadedFile } = require('../services/upload.service');

// Public: Get published gallery images
async function getPublicGallery(req, res) {
  try {
    const { category } = req.query;
    const filter = { isPublished: true };
    if (category) filter.category = category;

    const items = await Gallery.find(filter).sort({ sortOrder: 1, createdAt: -1 }).lean();
    return successResponse(res, items);
  } catch (err) {
    return errorResponse(res, 'Failed to fetch gallery.', 500);
  }
}

// Admin: Get all gallery items
async function getAdminGallery(req, res) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const skip = (page - 1) * limit;
    const { category, search } = req.query;

    const filter = {};
    if (category && category !== 'ALL') filter.category = category;
    if (search && search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const [items, total] = await Promise.all([
      Gallery.find(filter).sort({ sortOrder: 1, createdAt: -1 }).skip(skip).limit(limit).lean(),
      Gallery.countDocuments(filter)
    ]);

    return paginatedResponse(res, items, { page, limit, total });
  } catch (err) {
    return errorResponse(res, 'Failed to fetch gallery.', 500);
  }
}

// Admin: Add gallery item
async function createGalleryItem(req, res) {
  try {
    const item = await Gallery.create(req.body);

    logAudit({
      admin: req.admin,
      action: 'GALLERY_CREATE',
      resource: 'GALLERY',
      resourceId: item._id,
      details: { title: item.title, category: item.category },
      req
    });

    return successResponse(res, item, 201, 'Gallery item added successfully.');
  } catch (err) {
    return errorResponse(res, 'Failed to add gallery item.', 400);
  }
}

// Admin: Update gallery item
async function updateGalleryItem(req, res) {
  try {
    const item = await Gallery.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) {
      return errorResponse(res, 'Gallery item not found.', 404);
    }

    logAudit({
      admin: req.admin,
      action: 'GALLERY_UPDATE',
      resource: 'GALLERY',
      resourceId: item._id,
      details: { title: item.title },
      req
    });

    return successResponse(res, item, 200, 'Gallery item updated successfully.');
  } catch (err) {
    return errorResponse(res, 'Failed to update gallery item.', 400);
  }
}

// Admin: Delete gallery item
async function deleteGalleryItem(req, res) {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) {
      return errorResponse(res, 'Gallery item not found.', 404);
    }

    const itemTitle = item.title;
    const oldImage = item.image;

    await Gallery.findByIdAndDelete(req.params.id);

    if (oldImage && oldImage.startsWith('/uploads/')) {
      deleteUploadedFile(oldImage);
    }

    logAudit({
      admin: req.admin,
      action: 'GALLERY_DELETE',
      resource: 'GALLERY',
      resourceId: req.params.id,
      details: { title: itemTitle },
      req
    });

    return successResponse(res, null, 200, 'Gallery item deleted successfully.');
  } catch (err) {
    return errorResponse(res, 'Failed to delete gallery item.', 500);
  }
}

module.exports = {
  getPublicGallery,
  getAdminGallery,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem
};
