import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { productsApi } from '@api/products.api';
import { queryKeys } from '@utils/queryKeys';
import type { ProductListParams, CreateProductDto, UpdateProductDto } from '@/types/product.types';
import type { ApiError } from '@/types/api.types';

// ---------------------------------------------------------------------------
// useAdminProducts — paginated list with filters
// ---------------------------------------------------------------------------
export function useAdminProducts(params?: ProductListParams) {
  return useQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: () => productsApi.list(params),
    placeholderData: keepPreviousData, // keeps stale data visible while fetching next page
    staleTime: 30_000,
  });
}

// ---------------------------------------------------------------------------
// useAdminProduct — single product detail
// ---------------------------------------------------------------------------
export function useAdminProduct(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.products.detail(id ?? ''),
    queryFn: () => productsApi.getById(id!),
    enabled: Boolean(id),
    staleTime: 60_000,
  });
}

// ---------------------------------------------------------------------------
// useAdminProductCategories — for the category filter select
// ---------------------------------------------------------------------------
export function useAdminProductCategories() {
  return useQuery({
    queryKey: queryKeys.products.categories(),
    queryFn: () => productsApi.getCategories(),
    staleTime: 5 * 60_000, // categories change infrequently
  });
}

// ---------------------------------------------------------------------------
// useCreateProduct
// ---------------------------------------------------------------------------
export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateProductDto) => productsApi.create(dto),
    onSuccess: newProduct => {
      // Invalidate all list queries so the new product appears
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
      // Pre-populate the detail cache immediately
      queryClient.setQueryData(queryKeys.products.detail(newProduct._id), newProduct);
      toast.success(`"${newProduct.name}" created successfully.`);
    },
    onError: (err: ApiError) => {
      toast.error(err.message ?? 'Failed to create product.');
    },
  });
}

// ---------------------------------------------------------------------------
// useUpdateProduct
// ---------------------------------------------------------------------------
export function useUpdateProduct(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateProductDto) => productsApi.update(id, dto),
    onSuccess: updated => {
      // Update the detail cache in-place — no network round-trip needed
      queryClient.setQueryData(queryKeys.products.detail(id), updated);
      // Invalidate list caches so list items reflect the change
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
      toast.success(`"${updated.name}" saved.`);
    },
    onError: (err: ApiError) => {
      toast.error(err.message ?? 'Failed to save product.');
    },
  });
}

// ---------------------------------------------------------------------------
// useDeleteProduct
// ---------------------------------------------------------------------------
export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: (_, id) => {
      // Remove from detail cache
      queryClient.removeQueries({ queryKey: queryKeys.products.detail(id) });
      // Refetch all lists
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
      toast.success('Product deleted.');
    },
    onError: (err: ApiError) => {
      toast.error(err.message ?? 'Failed to delete product.');
    },
  });
}

// ---------------------------------------------------------------------------
// useUploadProductImages
// ---------------------------------------------------------------------------
export function useUploadProductImages(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (files: File[]) => productsApi.uploadImages(productId, files),
    onSuccess: () => {
      // Refetch the product detail to get the updated images array
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(productId) });
      toast.success('Images uploaded.');
    },
    onError: (err: ApiError) => {
      toast.error(err.message ?? 'Image upload failed.');
    },
  });
}

// ---------------------------------------------------------------------------
// useDeleteProductImage
// ---------------------------------------------------------------------------
export function useDeleteProductImage(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (imageId: string) => productsApi.deleteImage(productId, imageId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(productId) });
      toast.success('Image removed.');
    },
    onError: (err: ApiError) => {
      toast.error(err.message ?? 'Failed to remove image.');
    },
  });
}