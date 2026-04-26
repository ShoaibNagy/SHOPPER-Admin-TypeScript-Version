import type { ISODateString, ListParams, ObjectId } from './api.types';

// ---------------------------------------------------------------------------
// Enumerations
// ---------------------------------------------------------------------------
export type ReviewStatus = 'pending' | 'approved' | 'rejected';

// ---------------------------------------------------------------------------
// Full Review document (read)
// ---------------------------------------------------------------------------
export interface Review {
  readonly _id: ObjectId;
  readonly product: {
    readonly _id: ObjectId;
    readonly name: string;
    readonly slug: string;
    readonly primaryImage?: string;
  };
  readonly user: {
    readonly _id: ObjectId;
    readonly name: string;
    readonly email: string;
    readonly avatar?: string;
  };
  readonly rating: number;           // 1–5
  readonly title?: string;
  readonly body: string;
  readonly images?: string[];        // user-uploaded review images
  readonly status: ReviewStatus;
  readonly isVerifiedPurchase: boolean;
  readonly helpfulCount: number;
  readonly reportCount: number;
  readonly adminNote?: string;
  readonly createdAt: ISODateString;
  readonly updatedAt: ISODateString;
}

// ---------------------------------------------------------------------------
// Lightweight list item
// ---------------------------------------------------------------------------
export type ReviewListItem = Pick<
  Review,
  | '_id'
  | 'rating'
  | 'title'
  | 'status'
  | 'isVerifiedPurchase'
  | 'helpfulCount'
  | 'reportCount'
  | 'createdAt'
> & {
  readonly productName: string;
  readonly productId: ObjectId;
  readonly userName: string;
  readonly userId: ObjectId;
  readonly bodyPreview: string;     // first 120 chars of body
};

// ---------------------------------------------------------------------------
// Update DTO (admin moderation)
// ---------------------------------------------------------------------------
export interface UpdateReviewStatusDto {
  readonly status: ReviewStatus;
  readonly adminNote?: string;
}

// ---------------------------------------------------------------------------
// Query params for GET /reviews
// ---------------------------------------------------------------------------
export interface ReviewListParams extends ListParams {
  readonly status?: ReviewStatus;
  readonly productId?: ObjectId;
  readonly userId?: ObjectId;
  readonly minRating?: number;
  readonly maxRating?: number;
}