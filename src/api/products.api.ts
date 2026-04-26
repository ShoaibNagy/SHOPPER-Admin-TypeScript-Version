import { del, get, patch, post, postForm, put } from './client';
import type { PaginatedResponse } from '@/types/api.types';
import type {
  CreateProductDto,
  Product,
  ProductCategory,
  ProductImage,
  ProductListItem,
  ProductListParams,
  UpdateProductDto,
} from '@/types/product.types';

const BASE = '/products';

export const productsApi = {
  // ── List ────────────────────────────────────────────────────────────────
  /**
   * GET /api/products
   * Returns a paginated, filtered list of products (lightweight items).
   */
  list: (params?: ProductListParams) =>
    get<PaginatedResponse<ProductListItem>>(BASE, params as Record<string, unknown>),

  // ── Single ──────────────────────────────────────────────────────────────
  /**
   * GET /api/products/:id
   * Returns the full product document including variants and images.
   */
  getById: (id: string) =>
    get<Product>(`${BASE}/${id}`),

  // ── Create ──────────────────────────────────────────────────────────────
  /**
   * POST /api/products
   * Creates a new product (without images — upload separately).
   */
  create: (dto: CreateProductDto) =>
    post<Product>(BASE, dto),

  // ── Update ──────────────────────────────────────────────────────────────
  /**
   * PUT /api/products/:id
   * Full replacement of the product document.
   */
  update: (id: string, dto: UpdateProductDto) =>
    put<Product>(`${BASE}/${id}`, dto),

  /**
   * PATCH /api/products/:id
   * Partial update (e.g. toggle isFeatured or change status).
   */
  partialUpdate: (id: string, dto: UpdateProductDto) =>
    patch<Product>(`${BASE}/${id}`, dto),

  // ── Delete ──────────────────────────────────────────────────────────────
  /**
   * DELETE /api/products/:id
   */
  delete: (id: string) =>
    del<{ deleted: boolean }>(`${BASE}/${id}`),

  // ── Images ──────────────────────────────────────────────────────────────
  /**
   * POST /api/products/:id/images
   * Uploads one or more product images (multipart/form-data, field: "images").
   */
  uploadImages: (id: string, files: File[]) => {
    const form = new FormData();
    files.forEach(f => form.append('images', f));
    return postForm<ProductImage[]>(`${BASE}/${id}/images`, form);
  },

  /**
   * DELETE /api/products/:id/images/:imageId
   */
  deleteImage: (productId: string, imageId: string) =>
    del<{ deleted: boolean }>(`${BASE}/${productId}/images/${imageId}`),

  /**
   * PATCH /api/products/:id/images/:imageId/primary
   * Sets the given image as the product's primary image.
   */
  setPrimaryImage: (productId: string, imageId: string) =>
    patch<Product>(`${BASE}/${productId}/images/${imageId}/primary`),

  // ── Categories ──────────────────────────────────────────────────────────
  /**
   * GET /api/products/categories
   * Returns all categories with their product counts.
   */
  getCategories: () =>
    get<ProductCategory[]>(`${BASE}/categories`),
};