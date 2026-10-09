const Product = require('../models/Product');
const { successResponse, paginatedResponse, errorResponse } = require('../utils/response');
const { logAudit } = require('../middleware/audit');
const { deleteUploadedFile } = require('../services/upload.service');

// Public: Get published products
async function getPublicProducts(req, res) {
  try {
    const { category } = req.query;
    const filter = { isPublished: true };

    if (category && ['LFP', 'NMC'].includes(category.toUpperCase())) {
      filter.category = category.toUpperCase();
    }

    const products = await Product.find(filter)
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();

    return successResponse(res, products);
  } catch (err) {
    return errorResponse(res, 'Failed to fetch products.', 500);
  }
}

// Public: Get single product by slug
async function getPublicProductBySlug(req, res) {
  try {
    const { slug } = req.params;
    const product = await Product.findOne({ slug: slug.toLowerCase(), isPublished: true }).lean();

    if (!product) {
      return errorResponse(res, 'Product not found.', 404);
    }

    return successResponse(res, product);
  } catch (err) {
    return errorResponse(res, 'Failed to fetch product.', 500);
  }
}

// Admin: Get all products with search & pagination
async function getAdminProducts(req, res) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const { search, category, published } = req.query;

    const filter = {};
    if (category && category !== 'ALL') {
      filter.category = category.toUpperCase();
    }
    if (published !== undefined && published !== '') {
      filter.isPublished = published === 'true';
    }
    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { technology: { $regex: q, $options: 'i' } },
        { voltage: { $regex: q, $options: 'i' } },
        { capacity: { $regex: q, $options: 'i' } }
      ];
    }

    const [products, total] = await Promise.all([
      Product.find(filter).sort({ sortOrder: 1, createdAt: -1 }).skip(skip).limit(limit).lean(),
      Product.countDocuments(filter)
    ]);

    return paginatedResponse(res, products, { page, limit, total });
  } catch (err) {
    return errorResponse(res, 'Failed to fetch products.', 500);
  }
}

// Admin: Get single product
async function getAdminProductById(req, res) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return errorResponse(res, 'Product not found.', 404);
    }
    return successResponse(res, product);
  } catch (err) {
    if (err.name === 'CastError') {
      return errorResponse(res, `Invalid resource identifier: ${req.params.id}`, 400);
    }
    return errorResponse(res, 'Failed to fetch product.', 500);
  }
}

// Admin: Create product
async function createProduct(req, res) {
  try {
    const productData = req.body;

    // Generate unique slug if needed
    if (!productData.slug) {
      productData.slug = productData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }

    const existing = await Product.findOne({ slug: productData.slug });
    if (existing) {
      productData.slug = `${productData.slug}-${Date.now()}`;
    }

    const product = await Product.create(productData);

    logAudit({
      admin: req.admin,
      action: 'PRODUCT_CREATE',
      resource: 'PRODUCT',
      resourceId: product._id,
      details: { name: product.name, slug: product.slug },
      req
    });

    return successResponse(res, product, 201, 'Product created successfully.');
  } catch (err) {
    return errorResponse(res, `Failed to create product: ${err.message}`, 400);
  }
}

// Admin: Update product
async function updateProduct(req, res) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return errorResponse(res, 'Product not found.', 404);
    }

    // Slug check if changing slug
    if (req.body.slug && req.body.slug !== product.slug) {
      const existing = await Product.findOne({ slug: req.body.slug, _id: { $ne: product._id } });
      if (existing) {
        return errorResponse(res, 'Slug already in use by another product.', 400);
      }
    }

    Object.assign(product, req.body);
    await product.save();

    logAudit({
      admin: req.admin,
      action: 'PRODUCT_UPDATE',
      resource: 'PRODUCT',
      resourceId: product._id,
      details: { name: product.name },
      req
    });

    return successResponse(res, product, 200, 'Product updated successfully.');
  } catch (err) {
    return errorResponse(res, `Failed to update product: ${err.message}`, 400);
  }
}

// Admin: Delete product
async function deleteProduct(req, res) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return errorResponse(res, 'Product not found.', 404);
    }

    const productName = product.name;
    const oldImage = product.image;

    await Product.findByIdAndDelete(req.params.id);

    // If uploaded image was in uploads folder, clean it up
    if (oldImage && oldImage.startsWith('/uploads/')) {
      deleteUploadedFile(oldImage);
    }

    logAudit({
      admin: req.admin,
      action: 'PRODUCT_DELETE',
      resource: 'PRODUCT',
      resourceId: req.params.id,
      details: { name: productName },
      req
    });

    return successResponse(res, null, 200, 'Product deleted successfully.');
  } catch (err) {
    return errorResponse(res, 'Failed to delete product.', 500);
  }
}

// Admin: Toggle publish
async function togglePublish(req, res) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return errorResponse(res, 'Product not found.', 404);
    }

    product.isPublished = !product.isPublished;
    await product.save();

    logAudit({
      admin: req.admin,
      action: product.isPublished ? 'PRODUCT_PUBLISH' : 'PRODUCT_UNPUBLISH',
      resource: 'PRODUCT',
      resourceId: product._id,
      details: { isPublished: product.isPublished },
      req
    });

    return successResponse(res, { isPublished: product.isPublished }, 200, `Product ${product.isPublished ? 'published' : 'unpublished'}.`);
  } catch (err) {
    return errorResponse(res, 'Failed to toggle product status.', 500);
  }
}

module.exports = {
  getPublicProducts,
  getPublicProductBySlug,
  getAdminProducts,
  getAdminProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  togglePublish
};
