import type { ISODateString, ListParams, ObjectId } from './api.types';

// ---------------------------------------------------------------------------
// Enumerations
// ---------------------------------------------------------------------------
export type ProductStatus = 'active' | 'draft' | 'archived';

// ---------------------------------------------------------------------------
// Sub-documents
// ---------------------------------------------------------------------------
export interface ProductImage {
  readonly _id: ObjectId;
  readonly url: string;
  readonly publicId: string; // Cloudinary / storage public ID
  readonly alt?: string;
  readonly isPrimary: boolean;
}

export interface ProductVariant {
  readonly _id: ObjectId;
  readonly size: string;      // e.g. "S", "M", "L", "XL", "42", "10"
  readonly color?: string;
  readonly sku: string;
  readonly stock: number;
  readonly price?: number;    // override; null means inherit from parent
}

// ---------------------------------------------------------------------------
// Full Product document (read)
// ---------------------------------------------------------------------------
export interface Product {
  readonly _id: ObjectId;
  readonly name: string;
  readonly slug: string;
  readonly description: string;
  readonly category: string;
  readonly brand?: string;
  readonly price: number;
  readonly compareAtPrice?: number;   // original / crossed-out price
  readonly costPrice?: number;        // for margin calculation
  readonly images: ProductImage[];
  readonly variants: ProductVariant[];
  readonly tags: string[];
  readonly status: ProductStatus;
  readonly isFeatured: boolean;
  readonly averageRating: number;
  readonly reviewCount: number;
  readonly totalSold: number;
  readonly createdAt: ISODateString;
  readonly updatedAt: ISODateString;
}

// ---------------------------------------------------------------------------
// Lightweight list item (returned by GET /products, avoids large description)
// ---------------------------------------------------------------------------
export type ProductListItem = Pick<
  Product,
  | '_id'
  | 'name'
  | 'slug'
  | 'category'
  | 'price'
  | 'compareAtPrice'
  | 'status'
  | 'isFeatured'
  | 'averageRating'
  | 'reviewCount'
  | 'totalSold'
  | 'createdAt'
  | 'updatedAt'
> & {
  readonly primaryImage?: string; // URL of the primary image
  readonly totalStock: number;    // sum of all variant stocks
};

// ---------------------------------------------------------------------------
// Create / Update DTOs
// ---------------------------------------------------------------------------
export interface CreateProductDto {
  name: string;
  description: string;
  category: string;
  brand?: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  tags?: string[];
  status?: ProductStatus;
  isFeatured?: boolean;
  variants?: Omit<ProductVariant, '_id'>[];
}

export type UpdateProductDto = Partial<CreateProductDto>;

// ---------------------------------------------------------------------------
// Query params for GET /products
// ---------------------------------------------------------------------------
export interface ProductListParams extends ListParams {
  readonly category?: string;
  readonly status?: ProductStatus;
  readonly isFeatured?: boolean;
  readonly minPrice?: number;
  readonly maxPrice?: number;
}

// ---------------------------------------------------------------------------
// Category (flat, not hierarchical in this project)
// ---------------------------------------------------------------------------
export interface ProductCategory {
  readonly _id: ObjectId;
  readonly name: string;
  readonly slug: string;
  readonly productCount: number;
}