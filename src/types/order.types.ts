import type { ISODateString, ListParams, ObjectId } from './api.types';

// ---------------------------------------------------------------------------
// Enumerations — must match the backend's Order model exactly
// ---------------------------------------------------------------------------
export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus = 'unpaid' | 'paid' | 'partially_refunded' | 'refunded' | 'failed';

export type PaymentMethod = 'card' | 'cash_on_delivery';

// ---------------------------------------------------------------------------
// Sub-documents
// ---------------------------------------------------------------------------
export interface OrderAddress {
  readonly firstName: string;
  readonly lastName: string;
  readonly street: string;
  readonly city: string;
  readonly state?: string;
  readonly postalCode: string;
  readonly country: string;
  readonly phone: string;
}

export interface OrderLineItem {
  readonly _id: ObjectId;
  readonly product: {
    readonly _id: ObjectId;
    readonly name: string;
    readonly slug: string;
    readonly primaryImage?: string;
  };
  readonly variant?: {
    readonly size: string;
    readonly color?: string;
    readonly sku: string;
  };
  readonly quantity: number;
  readonly unitPrice: number;        // price at time of order (snapshot)
  readonly subtotal: number;         // unitPrice × quantity
}

export interface OrderStatusHistoryEntry {
  readonly status: OrderStatus;
  readonly timestamp: ISODateString;
  readonly note?: string;
  readonly updatedBy?: string;       // admin user ID
}

// ---------------------------------------------------------------------------
// Full Order document (read)
// ---------------------------------------------------------------------------
export interface Order {
  readonly _id: ObjectId;
  readonly orderNumber: string;      // human-readable e.g. "ORD-2025-00142"
  readonly user: {
    readonly _id: ObjectId;
    readonly name: string;
    readonly email: string;
    readonly phone?: string;
  };
  readonly items: OrderLineItem[];
  readonly shippingAddress: OrderAddress;
  readonly billingAddress: OrderAddress;
  readonly status: OrderStatus;
  readonly statusHistory: OrderStatusHistoryEntry[];
  readonly paymentStatus: PaymentStatus;
  readonly paymentMethod: PaymentMethod;
  readonly stripePaymentIntentId?: string;
  readonly stripeChargeId?: string;
  readonly subtotal: number;
  readonly shippingFee: number;
  readonly discount: number;
  readonly tax: number;
  readonly total: number;
  readonly notes?: string;           // customer note at checkout
  readonly adminNotes?: string;
  readonly trackingNumber?: string;
  readonly shippingCarrier?: string;
  readonly estimatedDelivery?: ISODateString;
  readonly deliveredAt?: ISODateString;
  readonly createdAt: ISODateString;
  readonly updatedAt: ISODateString;
}

// ---------------------------------------------------------------------------
// Lightweight list item
// ---------------------------------------------------------------------------
export type OrderListItem = Pick<
  Order,
  | '_id'
  | 'orderNumber'
  | 'status'
  | 'paymentStatus'
  | 'paymentMethod'
  | 'total'
  | 'createdAt'
  | 'updatedAt'
> & {
  readonly user: {
    readonly _id: ObjectId;
    readonly name: string;
    readonly email: string;
  };
  readonly itemCount: number;
};

// ---------------------------------------------------------------------------
// Update DTOs
// ---------------------------------------------------------------------------
export interface UpdateOrderStatusDto {
  readonly status: OrderStatus;
  readonly note?: string;
}

export interface UpdateOrderTrackingDto {
  readonly trackingNumber: string;
  readonly shippingCarrier?: string;
  readonly estimatedDelivery?: ISODateString;
}

export interface UpdateOrderAdminNotesDto {
  readonly adminNotes: string;
}

// ---------------------------------------------------------------------------
// Query params for GET /orders
// ---------------------------------------------------------------------------
export interface OrderListParams extends ListParams {
  readonly status?: OrderStatus;
  readonly paymentStatus?: PaymentStatus;
  readonly userId?: ObjectId;
  readonly dateFrom?: ISODateString;
  readonly dateTo?: ISODateString;
}