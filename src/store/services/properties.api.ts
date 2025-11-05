import { api } from './api'

type SearchArgs = {
  city?: string
  propertyType?: string
  bedrooms?: number
  minPrice?: number
  maxPrice?: number
  page?: number
  pageSize?: number
  owner?: boolean
}

type PropertyPhoto = {
  id: string
  propertyId: string
  url: string
  blobKey?: string | null
  displayOrder?: number
  createdAt?: string
}

type Property = {
  id: string
  title?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  propertyType?: string
  price?: number
  bedrooms?: number
  bathrooms?: number
  squareFeet?: number
  description?: string | null
  amenities?: string | null
  status?: string
  ownerId?: string | null
  representativeId?: string | null
  photos?: PropertyPhoto[]
  createdAt?: string
  updatedAt?: string
}

export const propertiesApi = api.injectEndpoints({
  endpoints: (build) => ({
    getProperties: build.query<{ data: Property[]; meta?: any }, SearchArgs>({
      query: (args) => {
        const params = new URLSearchParams()
        if (args?.city) params.set('city', args.city)
        if (args?.propertyType) params.set('propertyType', args.propertyType)
        if (args?.bedrooms) params.set('bedrooms', String(args.bedrooms))
        if (args?.minPrice) params.set('minPrice', String(args.minPrice))
        if (args?.maxPrice) params.set('maxPrice', String(args.maxPrice))
        if (args?.page) params.set('page', String(args.page))
        if (args?.pageSize) params.set('pageSize', String(args.pageSize))
        if (args?.owner) params.set('owner', 'true')
        const qs = params.toString()
        return { url: `/properties${qs ? `?${qs}` : ''}` }
      },
      providesTags: (result) =>
        result
          ? [
              { type: 'Properties' as const, id: 'LIST' },
              ...result.data.map((p) => ({ type: 'Property' as const, id: p.id })),
            ]
          : [{ type: 'Properties' as const, id: 'LIST' }],
    }),
    getProperty: build.query<{ data: Property }, string>({
      query: (id) => ({ url: `/properties/${id}` }),
      providesTags: (result, error, id) => [{ type: 'Property' as const, id }],
    }),

    createProperty: build.mutation<{ data: Property }, Partial<Property>>({
      query: (body) => ({ url: `/properties`, method: 'POST', body }),
      invalidatesTags: [{ type: 'Properties', id: 'LIST' }],
    }),

    updateProperty: build.mutation<{ data: Property }, { id: string; data: Partial<Property> }>({
      query: ({ id, data }) => ({ url: `/properties/${id}`, method: 'PUT', body: data }),
      invalidatesTags: (result, error, arg) => [{ type: 'Property', id: arg.id }, { type: 'Properties', id: 'LIST' }],
    }),

    deleteProperty: build.mutation<void, string>({
      query: (id) => ({ url: `/properties/${id}`, method: 'DELETE' }),
      invalidatesTags: (result, error, id) => [{ type: 'Property', id }, { type: 'Properties', id: 'LIST' }],
    }),

    uploadInlineImages: build.mutation<{ data: PropertyPhoto[] }, { propertyId: string; images: Array<{ filename: string; contentType?: string; base64: string; displayOrder?: number }> }>({
      query: ({ propertyId, images }) => ({ url: `/properties/upload-inline`, method: 'POST', body: { propertyId, images } }),
      invalidatesTags: (result, error, arg) => [{ type: 'Property', id: arg.propertyId }],
    }),
    assignRepresentative: build.mutation<{ data: { id: string; representativeId: string; propertyId: string } }, { propertyId: string; representativeId: string }>({
      query: ({ propertyId, representativeId }) => ({ url: `/properties/${propertyId}/representative`, method: 'POST', body: { representativeId } }),
      invalidatesTags: (result, error, arg) => [{ type: 'Property', id: arg.propertyId }],
    }),

    unassignRepresentative: build.mutation<void, { propertyId: string }>({
      query: ({ propertyId }) => ({ url: `/properties/${propertyId}/representative`, method: 'DELETE' }),
      invalidatesTags: (result, error, arg) => [{ type: 'Property', id: arg.propertyId }],
    }),
    getRepresentatives: build.query<{ data: { id: string; name?: string | null; email: string }[] }, void>({
      query: () => ({ url: `/api/users?role=REPRESENTATIVE` }),
      providesTags: (result) => (result ? result.data.map((u) => ({ type: 'Property' as const, id: u.id })) : []),
    }),
  }),
})

export const {
  useGetPropertiesQuery,
  useGetPropertyQuery,
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useDeletePropertyMutation,
  useUploadInlineImagesMutation,
  useGetRepresentativesQuery,
  useAssignRepresentativeMutation,
  useUnassignRepresentativeMutation,
} = propertiesApi
