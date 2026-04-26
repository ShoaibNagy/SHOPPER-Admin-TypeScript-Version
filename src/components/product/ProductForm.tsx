import { useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { Select } from '@components/ui/Select';
import { Spinner } from '@components/ui/Spinner';
import { useAdminProduct, useCreateProduct, useUpdateProduct, useAdminProductCategories } from '@hooks/useAdminProducts';
import type { ProductStatus } from '@/types/product.types';

// ---------------------------------------------------------------------------
// Validation schema
// ---------------------------------------------------------------------------
const variantSchema = z.object({
  size:  z.string().min(1, 'Size required'),
  color: z.string().optional(),
  sku:   z.string().min(1, 'SKU required'),
  stock: z.coerce.number().int().min(0, 'Stock must be ≥ 0'),
  price: z.coerce.number().positive().optional().or(z.literal('')),
});

const productSchema = z.object({
  name:           z.string().min(2, 'Name must be at least 2 characters'),
  description:    z.string().min(10, 'Description must be at least 10 characters'),
  category:       z.string().min(1, 'Category is required'),
  brand:          z.string().optional(),
  price:          z.coerce.number().positive('Price must be greater than 0'),
  compareAtPrice: z.coerce.number().positive().optional().or(z.literal('')),
  costPrice:      z.coerce.number().positive().optional().or(z.literal('')),
  status:         z.enum(['active', 'draft', 'archived'] as const),
  isFeatured:     z.boolean(),
  tags:           z.string(), // comma-separated string, split on submit
  variants:       z.array(variantSchema),
});

type ProductFormValues = z.infer<typeof productSchema>;
type ProductFormInputValues = z.input<typeof productSchema>;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface ProductFormProps {
  productId?: string; // undefined = create mode
  onSuccess?: (id: string) => void;
}

// ---------------------------------------------------------------------------
// Status & category select options
// ---------------------------------------------------------------------------
const STATUS_OPTIONS = [
  { value: 'active'   as ProductStatus, label: 'Active'   },
  { value: 'draft'    as ProductStatus, label: 'Draft'    },
  { value: 'archived' as ProductStatus, label: 'Archived' },
];

// ---------------------------------------------------------------------------
// ProductForm
// ---------------------------------------------------------------------------
export function ProductForm({ productId, onSuccess }: ProductFormProps) {
  const isEditing = Boolean(productId);

  const { data: product, isLoading: loadingProduct } = useAdminProduct(productId);
  const { data: categoriesData }                     = useAdminProductCategories();
  const createMutation                               = useCreateProduct();
  const updateMutation                               = useUpdateProduct(productId ?? '');

  const categoryOptions = (categoriesData ?? []).map(c => ({ value: c.name, label: c.name }));

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProductFormInputValues, unknown, ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '', description: '', category: '', brand: '',
      price: 0, compareAtPrice: '', costPrice: '',
      status: 'draft', isFeatured: false, tags: '', variants: [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'variants' });

  // Populate form when editing
  useEffect(() => {
    if (product) {
      reset({
        name:           product.name,
        description:    product.description,
        category:       product.category,
        brand:          product.brand ?? '',
        price:          product.price,
        compareAtPrice: product.compareAtPrice ?? '',
        costPrice:      product.costPrice ?? '',
        status:         product.status,
        isFeatured:     product.isFeatured,
        tags:           product.tags.join(', '),
        variants:       product.variants.map(v => ({
          size: v.size, color: v.color ?? '', sku: v.sku,
          stock: v.stock, price: v.price ?? '',
        })),
      });
    }
  }, [product, reset]);

  function onSubmit(values: ProductFormValues) {
    const dto = {
      name: values.name,
      description: values.description,
      category: values.category,
      brand: values.brand ?? '',
      price: values.price,
      status: values.status,
      isFeatured: values.isFeatured,
      tags: values.tags.split(',').map(t => t.trim()).filter(Boolean),
      ...(values.compareAtPrice === '' ? {} : { compareAtPrice: Number(values.compareAtPrice) }),
      ...(values.costPrice === '' ? {} : { costPrice: Number(values.costPrice) }),
      variants: values.variants.map(v => ({
        size: v.size,
        color: v.color ?? '',
        sku: v.sku,
        stock: v.stock,
        ...(v.price === '' ? {} : { price: Number(v.price) }),
      })),
    };

    if (isEditing) {
      updateMutation.mutate(dto, { onSuccess: () => onSuccess?.(productId!) });
    } else {
      createMutation.mutate(dto, { onSuccess: p => onSuccess?.(p._id) });
    }
  }

  if (isEditing && loadingProduct) {
    return <Spinner variant="page" label="Loading product…" />;
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* ── Section: Basic info ────────────────────────────────────── */}
      <section style={sectionStyle}>
        <h2 style={sectionHeadingStyle}>Basic Information</h2>
        <div style={gridStyle}>
          <Input label="Product Name" required error={errors.name?.message!} {...register('name')} />
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select
                label="Category"
                required
                value={field.value}
                onChange={v => field.onChange(v ?? '')}
                options={categoryOptions}
                error={errors.category?.message!}
                searchable
              />
            )}
          />
        </div>

        <div style={{ gridColumn: '1/-1' }}>
          <label style={labelStyle}>Description <span style={{ color: '#ef4444' }}>*</span></label>
          <textarea
            style={textareaStyle}
            rows={5}
            aria-invalid={Boolean(errors.description)}
            {...register('description')}
          />
          {errors.description && <span style={errorStyle}>{errors.description.message}</span>}
        </div>

        <Input label="Brand" placeholder="Optional" {...register('brand')} />
        <Input label="Tags" placeholder="e.g. summer, sale, new (comma-separated)" {...register('tags')} />
      </section>

      {/* ── Section: Pricing ───────────────────────────────────────── */}
      <section style={{ ...sectionStyle, marginTop: 16 }}>
        <h2 style={sectionHeadingStyle}>Pricing</h2>
        <div style={gridStyle}>
          <Input label="Price" required type="number" step="0.01" error={errors.price?.message!} leftAdornment="EGP" {...register('price')} />
          <Input label="Compare-at Price" type="number" step="0.01" hint="Crossed-out original price" leftAdornment="EGP" {...register('compareAtPrice')} />
          <Input label="Cost Price" type="number" step="0.01" hint="For margin calculation only" leftAdornment="EGP" {...register('costPrice')} />
        </div>
      </section>

      {/* ── Section: Visibility ────────────────────────────────────── */}
      <section style={{ ...sectionStyle, marginTop: 16 }}>
        <h2 style={sectionHeadingStyle}>Visibility</h2>
        <div style={gridStyle}>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select
                label="Status"
                value={field.value}
                onChange={v => field.onChange(v ?? 'draft')}
                options={STATUS_OPTIONS}
              />
            )}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 20 }}>
            <input type="checkbox" id="isFeatured" style={{ width: 16, height: 16 }} {...register('isFeatured')} />
            <label htmlFor="isFeatured" style={{ fontSize: 13, color: '#f0f0f0', cursor: 'pointer' }}>
              Feature this product on the storefront
            </label>
          </div>
        </div>
      </section>

      {/* ── Section: Variants ──────────────────────────────────────── */}
      <section style={{ ...sectionStyle, marginTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ ...sectionHeadingStyle, marginBottom: 0 }}>Variants</h2>
          <Button
            variant="secondary" size="sm" type="button"
            onClick={() => append({ size: '', color: '', sku: '', stock: 0, price: '' })}
            leftIcon={<svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5.5 1v9M1 5.5h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>}
          >
            Add Variant
          </Button>
        </div>

        {fields.length === 0 ? (
          <p style={{ color: '#4a4a4a', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>
            No variants yet. Add a variant to specify sizes, colours and stock levels.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {fields.map((field, index) => (
              <div key={field.id} style={variantRowStyle}>
                <Input
                  placeholder="Size *"
                  error={errors.variants?.[index]?.size?.message!}
                  {...register(`variants.${index}.size`)}
                  style={{ width: 80 }}
                />
                <Input placeholder="Colour" {...register(`variants.${index}.color`)} style={{ width: 100 }} />
                <Input
                  placeholder="SKU *"
                  error={errors.variants?.[index]?.sku?.message!}
                  {...register(`variants.${index}.sku`)}
                  style={{ flex: 1 }}
                />
                <Input
                  placeholder="Stock *"
                  type="number" min="0"
                  error={errors.variants?.[index]?.stock?.message!}
                  {...register(`variants.${index}.stock`)}
                  style={{ width: 80 }}
                />
                <Input
                  placeholder="Price override"
                  type="number" step="0.01" min="0"
                  {...register(`variants.${index}.price`)}
                  style={{ width: 120 }}
                />
                <Button
                  variant="ghost" size="sm" type="button" iconOnly
                  aria-label="Remove variant"
                  onClick={() => remove(index)}
                >
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                    <path d="M2 3h9M5 3V2h3v1M4 3v8h5V3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Form actions ───────────────────────────────────────────── */}
      <div style={actionsStyle}>
        <Button variant="secondary" size="md" type="button" href="/products">
          Cancel
        </Button>
        <Button
          variant="primary" size="md" type="submit"
          isLoading={isPending}
          disabled={!isDirty && isEditing}
        >
          {isEditing ? 'Save Changes' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Inline styles (these are structural — visual tokens come from SCSS/Tailwind)
// ---------------------------------------------------------------------------
const sectionStyle: React.CSSProperties = {
  background: '#1c1c1c',
  border: '1px solid #383838',
  borderRadius: 8,
  padding: 24,
};

const sectionHeadingStyle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 600,
  color: '#f0f0f0',
  margin: '0 0 16px',
  fontFamily: 'DM Sans, sans-serif',
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
  gap: 16,
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 500,
  color: '#9a9a9a',
  marginBottom: 4,
  fontFamily: 'DM Sans, sans-serif',
};

const textareaStyle: React.CSSProperties = {
  width: '100%',
  background: '#242424',
  border: '1px solid #383838',
  borderRadius: 6,
  color: '#f0f0f0',
  fontFamily: 'DM Sans, sans-serif',
  fontSize: 13,
  padding: '8px 12px',
  resize: 'vertical',
  outline: 'none',
  lineHeight: 1.5,
  boxSizing: 'border-box',
};

const errorStyle: React.CSSProperties = {
  fontSize: 11,
  color: '#ef4444',
  marginTop: 4,
  display: 'block',
};

const variantRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  alignItems: 'flex-start',
  flexWrap: 'wrap',
  padding: 12,
  background: '#242424',
  borderRadius: 6,
  border: '1px solid #2e2e2e',
};

const actionsStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 12,
  marginTop: 24,
  paddingTop: 20,
  borderTop: '1px solid #383838',
};