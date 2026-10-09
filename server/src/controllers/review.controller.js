const Review = require('../models/Review');
const { successResponse, paginatedResponse, errorResponse } = require('../utils/response');
const { logAudit } = require('../middleware/audit');

// Public: Get published reviews
async function getPublicReviews(req, res) {
  try {
    const reviews = await Review.find({ isPublished: true }).sort({ createdAt: -1 }).lean();
    return successResponse(res, reviews);
  } catch (err) {
    return errorResponse(res, 'Failed to fetch reviews.', 500);
  }
}

// Admin: Get all reviews
async function getAdminReviews(req, res) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;

    const filter = {};
    if (search && search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { review: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const [reviews, total] = await Promise.all([
      Review.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Review.countDocuments(filter)
    ]);

    return paginatedResponse(res, reviews, { page, limit, total });
  } catch (err) {
    return errorResponse(res, 'Failed to fetch reviews.', 500);
  }
}

// Admin: Create review
async function createReview(req, res) {
  try {
    const review = await Review.create(req.body);

    logAudit({
      admin: req.admin,
      action: 'REVIEW_CREATE',
      resource: 'REVIEW',
      resourceId: review._id,
      details: { name: review.name, rating: review.rating },
      req
    });

    return successResponse(res, review, 201, 'Review added successfully.');
  } catch (err) {
    return errorResponse(res, 'Failed to add review.', 400);
  }
}

// Admin: Update review
async function updateReview(req, res) {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!review) {
      return errorResponse(res, 'Review not found.', 404);
    }

    logAudit({
      admin: req.admin,
      action: 'REVIEW_UPDATE',
      resource: 'REVIEW',
      resourceId: review._id,
      details: { name: review.name },
      req
    });

    return successResponse(res, review, 200, 'Review updated successfully.');
  } catch (err) {
    return errorResponse(res, 'Failed to update review.', 400);
  }
}

// Admin: Delete review
async function deleteReview(req, res) {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return errorResponse(res, 'Review not found.', 404);
    }

    logAudit({
      admin: req.admin,
      action: 'REVIEW_DELETE',
      resource: 'REVIEW',
      resourceId: req.params.id,
      details: { name: review.name },
      req
    });

    return successResponse(res, null, 200, 'Review deleted successfully.');
  } catch (err) {
    return errorResponse(res, 'Failed to delete review.', 500);
  }
}

module.exports = {
  getPublicReviews,
  getAdminReviews,
  createReview,
  updateReview,
  deleteReview
};
