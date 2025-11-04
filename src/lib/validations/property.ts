import { z } from 'zod'

export const createPropertySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(3, 'Zip code is required'),
  country: z.string().optional(),
  propertyType: z.enum(['HOUSE', 'APARTMENT', 'CONDO', 'TOWNHOUSE']),
  price: z.number().nonnegative('Price must be >= 0'),
  bedrooms: z.number().int().nonnegative().optional(),
  bathrooms: z.number().nonnegative().optional(),
  squareFeet: z.number().int().nonnegative().optional(),
  description: z.string().min(50, 'Description must be at least 50 characters').optional(),
  amenities: z.array(z.string()).optional(),
})

export type CreatePropertyInput = z.infer<typeof createPropertySchema>

export const updatePropertySchema = createPropertySchema.partial()

export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>
