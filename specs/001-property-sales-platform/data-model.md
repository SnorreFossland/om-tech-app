# Data Model: Property Sales Platform

**Date**: 2025-11-01  
**Feature**: Property Sales Platform  
**Database**: Prisma with SQLite (development) / PostgreSQL (production)

## Overview

This document defines the database schema and entity relationships for the property sales platform. The platform manages properties, users (buyers/sellers/representatives), inquiries with AI-generated email drafts, viewing requests, favorites, and representative assignments.

---

## Entities

### 1. User

Represents all users in the system with role-based differentiation (buyer, seller, representative).

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | PK, @id, @default(cuid()) | Unique user identifier |
| email | String | @unique, required | User email address (login credential) |
| name | String | optional | User's full name |
| password | String | required | Hashed password (bcrypt) |
| phone | String | optional | User's phone number |
| role | Enum | required, default: BUYER | User role: BUYER, SELLER, REPRESENTATIVE |
| emailVerified | DateTime | optional | Email verification timestamp |
| createdAt | DateTime | @default(now()) | Account creation timestamp |
| updatedAt | DateTime | @updatedAt | Last update timestamp |

**Relationships**:

- `properties` → Property[] (one-to-many): Properties owned by seller
- `favorites` → Favorite[] (one-to-many): User's favorite properties
- `inquiriesMade` → Inquiry[] (one-to-many): Inquiries created by buyer (as inquirer, not FK)
- `inquiriesManaged` → Inquiry[] (one-to-many): Inquiries assigned to representative
- `assignedProperties` → RepresentativeAssignment[] (one-to-many): Properties assigned to representative

**Indexes**:

- Unique index on `email`
- Index on `role` for filtering by user type

**Validation Rules**:

- Email must match valid email format (enforced by Zod at API level)
- Password minimum 8 characters (enforced at registration)
- Role must be one of: BUYER, SELLER, REPRESENTATIVE

---

### 2. Property

Represents a real estate listing (house, apartment, condo, townhouse).

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | PK, @id, @default(cuid()) | Unique property identifier |
| title | String | required | Property listing title |
| address | String | required | Full street address |
| city | String | required | City name |
| state | String | required | State/province |
| zipCode | String | required | Postal code |
| country | String | required, default: "USA" | Country code |
| propertyType | Enum | required | HOUSE, APARTMENT, CONDO, TOWNHOUSE |
| price | Decimal | required | Listing price (in USD) |
| bedrooms | Int | required | Number of bedrooms |
| bathrooms | Decimal | required | Number of bathrooms (supports 1.5, 2.5, etc.) |
| squareFeet | Int | required | Property size in square feet |
| description | String | required, min 50 chars | Full property description |
| amenities | Json | optional | Array of amenities (parking, garden, etc.) |
| status | Enum | required, default: ACTIVE | ACTIVE, SOLD, PENDING, ARCHIVED |
| soldDate | DateTime | optional | Date property was marked sold |
| archiveDate | DateTime | optional | Date property was archived |
| keepVisibleAfterArchive | Boolean | default: false | Seller preference to keep sold listing visible |
| ownerId | String | FK, required | User ID of property owner (seller) |
| representativeId | String | FK, optional | Assigned representative ID |
| createdAt | DateTime | @default(now()) | Listing creation timestamp |
| updatedAt | DateTime | @updatedAt | Last update timestamp |

**Relationships**:

- `owner` → User (many-to-one): Property owner (seller)
- `representative` → User (many-to-one): Assigned representative
- `photos` → PropertyPhoto[] (one-to-many): Property images
- `inquiries` → Inquiry[] (one-to-many): Inquiries for this property
| `viewingRequests` → ViewingRequest[] (one-to-many): Viewing requests
- `favorites` → Favorite[] (one-to-many): Users who favorited this property
- `assignment` → RepresentativeAssignment (one-to-one): Representative assignment details

**Indexes**:

- Index on `city` for location search
- Index on `propertyType` for filtering
- Index on `price` for range queries
- Index on `status` for filtering active/sold
- Composite index on `(city, propertyType, status)` for common search patterns
- Index on `ownerId` for seller dashboard queries
- Index on `representativeId` for representative dashboard

**Validation Rules**:

- Price must be positive
- Bedrooms must be >= 0
- Bathrooms must be >= 0 (supports decimals like 1.5)
- Square feet must be > 0
- Description minimum 50 characters
- Address must be validated for format (city, state, zip required)
- Unique constraint on `(address, ownerId)` to prevent duplicate listings

---

### 3. PropertyPhoto

Represents uploaded images for a property listing.

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | PK, @id, @default(cuid()) | Unique photo identifier |
| propertyId | String | FK, required | Associated property ID |
| url | String | required | Image URL (Vercel Blob storage) |
| blobKey | String | required | Blob storage key for deletion |
| displayOrder | Int | required, default: 0 | Order for image display (0 = primary) |
| uploadedAt | DateTime | @default(now()) | Upload timestamp |

**Relationships**:

- `property` → Property (many-to-one): Parent property

**Indexes**:

- Index on `propertyId` for fetching property images
- Composite index on `(propertyId, displayOrder)` for ordered queries

**Validation Rules**:

- Maximum 20 photos per property (enforced at API level)
- Supported formats: JPEG, PNG, WebP (enforced at upload)
- Maximum file size: 10MB per image (enforced at upload)

---

### 4. Inquiry

Represents a buyer's contact request for a specific property with AI-generated email draft.

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | PK, @id, @default(cuid()) | Unique inquiry identifier |
| propertyId | String | FK, required | Property being inquired about |
| inquirerName | String | required | Buyer's name |
| inquirerEmail | String | required | Buyer's email |
| inquirerPhone | String | optional | Buyer's phone number |
| message | String | required | Buyer's inquiry message |
| status | Enum | required, default: PENDING_AI_PROCESSING | Inquiry status (see below) |
| representativeId | String | FK, optional | Assigned representative |
| createdAt | DateTime | @default(now()) | Inquiry submission timestamp |
| updatedAt | DateTime | @updatedAt | Last status update timestamp |

**Status Values**:

- `PENDING_AI_PROCESSING`: Inquiry submitted, waiting for AI email generation
- `DRAFT_READY`: AI has generated email draft, awaiting representative review
- `APPROVED`: Representative approved, email sent to owner
- `CONTACTED_OWNER`: Email successfully delivered to property owner
- `RESPONDED_TO_BUYER`: Owner has responded (future enhancement)
- `CLOSED`: Inquiry resolved/closed
- `REJECTED`: Representative rejected AI draft

**Relationships**:

- `property` → Property (many-to-one): Inquired property
- `representative` → User (many-to-one): Assigned representative
- `aiEmailDraft` → AIEmailDraft (one-to-one): AI-generated email
- `viewingRequest` → ViewingRequest (one-to-one, optional): Associated viewing request

**Indexes**:

- Index on `propertyId` for property inquiry history
- Index on `representativeId` for representative dashboard
- Index on `status` for filtering by workflow stage
- Composite index on `(representativeId, status)` for representative workflow queries
- Index on `createdAt` for chronological sorting

**Validation Rules**:

- Email must be valid format
- Message cannot be empty
- inquirerName cannot be empty

---

### 5. AIEmailDraft

Represents an AI-generated email draft for an inquiry.

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | PK, @id, @default(cuid()) | Unique draft identifier |
| inquiryId | String | FK, @unique, required | Associated inquiry ID |
| draftContent | String | required | AI-generated email content |
| editedContent | String | optional | Representative-edited content (if modified) |
| detectedLanguage | String | default: "en" | Detected language code (en, es, fr, etc.) |
| approvalStatus | Enum | required, default: PENDING | PENDING, APPROVED, REJECTED |
| rejectionCount | Int | default: 0 | Number of times draft was rejected |
| generatedAt | DateTime | @default(now()) | AI generation timestamp |
| approvedAt | DateTime | optional | Approval timestamp |
| approvedById | String | FK, optional | Representative who approved |

**Relationships**:

- `inquiry` → Inquiry (one-to-one): Parent inquiry
- `approvedBy` → User (many-to-one): Representative who approved

**Indexes**:

- Unique index on `inquiryId` (one draft per inquiry)
- Index on `approvalStatus` for filtering drafts by status

**Validation Rules**:

- draftContent cannot be empty
- rejectionCount cannot be negative
- detectedLanguage must be valid ISO 639-1 code

---

### 6. ViewingRequest

Represents a scheduled viewing request for a property.

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | PK, @id, @default(cuid()) | Unique viewing request identifier |
| propertyId | String | FK, required | Property to view |
| inquiryId | String | FK, optional | Associated inquiry (if from inquiry form) |
| requesterName | String | required | Name of person requesting viewing |
| requesterEmail | String | required | Email of requester |
| requesterPhone | String | optional | Phone of requester |
| preferredDate1 | DateTime | required | First preferred viewing date/time |
| preferredDate2 | DateTime | optional | Second preferred viewing date/time |
| preferredDate3 | DateTime | optional | Third preferred viewing date/time |
| status | Enum | required, default: PENDING | PENDING, CONFIRMED, CANCELLED, COMPLETED |
| representativeId | String | FK, optional | Assigned representative |
| notes | String | optional | Additional notes from requester |
| createdAt | DateTime | @default(now()) | Request submission timestamp |
| updatedAt | DateTime | @updatedAt | Last update timestamp |

**Relationships**:

- `property` → Property (many-to-one): Property to view
- `inquiry` → Inquiry (one-to-one, optional): Related inquiry
- `representative` → User (many-to-one): Assigned representative

**Indexes**:

- Index on `propertyId` for property viewing history
- Index on `representativeId` for representative dashboard
- Index on `status` for filtering
- Index on `preferredDate1` for scheduling

**Validation Rules**:

- Preferred dates must be in the future (enforced at API level)
- Email must be valid format
- At least one preferred date required

---

### 7. Favorite

Represents a user's saved/favorited property.

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | PK, @id, @default(cuid()) | Unique favorite identifier |
| userId | String | FK, required | User who favorited |
| propertyId | String | FK, required | Favorited property |
| createdAt | DateTime | @default(now()) | Favorite save timestamp |

**Relationships**:

- `user` → User (many-to-one): User who favorited
- `property` → Property (many-to-one): Favorited property

**Indexes**:

- Composite unique index on `(userId, propertyId)` to prevent duplicates
- Index on `userId` for user favorites list
- Index on `propertyId` for favorite count queries

**Validation Rules**:

- User cannot favorite same property twice (enforced by unique constraint)
- User must be authenticated (enforced at API level)

---

### 8. RepresentativeAssignment

Represents the assignment of properties to platform representatives for inquiry management.

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | PK, @id, @default(cuid()) | Unique assignment identifier |
| representativeId | String | FK, required | Assigned representative |
| propertyId | String | FK, @unique, required | Assigned property |
| assignedAt | DateTime | @default(now()) | Assignment timestamp |
| workloadCount | Int | default: 0 | Number of pending inquiries for this assignment |
| isAvailable | Boolean | default: true | Representative availability status |

**Relationships**:

- `representative` → User (many-to-one): Assigned representative
- `property` → Property (one-to-one): Assigned property

**Indexes**:

- Unique index on `propertyId` (one representative per property)
- Index on `representativeId` for representative workload queries
- Composite index on `(representativeId, isAvailable)` for assignment algorithm

**Validation Rules**:

- Representative must have role REPRESENTATIVE (enforced at API level)
- workloadCount cannot be negative

---

## Enums

### UserRole

```prisma
enum UserRole {
  BUYER
  SELLER
  REPRESENTATIVE
}
```

### PropertyType

```prisma
enum PropertyType {
  HOUSE
  APARTMENT
  CONDO
  TOWNHOUSE
}
```

### PropertyStatus

```prisma
enum PropertyStatus {
  ACTIVE
  SOLD
  PENDING
  ARCHIVED
}
```

### InquiryStatus

```prisma
enum InquiryStatus {
  PENDING_AI_PROCESSING
  DRAFT_READY
  APPROVED
  CONTACTED_OWNER
  RESPONDED_TO_BUYER
  CLOSED
  REJECTED
}
```

### ApprovalStatus

```prisma
enum ApprovalStatus {
  PENDING
  APPROVED
  REJECTED
}
```

### ViewingStatus

```prisma
enum ViewingStatus {
  PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
}
```

---

## Entity Relationship Diagram

```
User (Buyer/Seller/Representative)
├── properties (as owner)              → Property[]
├── favorites                          → Favorite[]
├── inquiriesManaged (as rep)          → Inquiry[]
└── assignedProperties (as rep)        → RepresentativeAssignment[]

Property
├── owner                              → User (seller)
├── representative                     → User (representative)
├── photos                             → PropertyPhoto[]
├── inquiries                          → Inquiry[]
├── viewingRequests                    → ViewingRequest[]
├── favorites                          → Favorite[]
└── assignment                         → RepresentativeAssignment

Inquiry
├── property                           → Property
├── representative                     → User (representative)
├── aiEmailDraft                       → AIEmailDraft
└── viewingRequest (optional)          → ViewingRequest

AIEmailDraft
├── inquiry                            → Inquiry
└── approvedBy                         → User (representative)

ViewingRequest
├── property                           → Property
├── inquiry (optional)                 → Inquiry
└── representative                     → User (representative)

Favorite
├── user                               → User
└── property                           → Property

RepresentativeAssignment
├── representative                     → User (representative)
└── property                           → Property
```

---

## Database Migrations Strategy

### Initial Migration (001_init)

Create all tables, enums, indexes, and relationships defined above.

### Future Migrations (as needed)

- Add full-text search indexes when search performance becomes issue
- Add soft delete for properties (deletedAt field) instead of hard delete
- Add audit trail tables for inquiry status changes
- Add property view tracking for analytics
- Add representative performance metrics

---

## Data Access Patterns

### Common Queries

1. **Search Properties**:
   - Filter by: city, propertyType, price range, bedrooms, bathrooms, squareFeet range, status
   - Sort by: price, createdAt, updatedAt
   - Pagination: 20 per page
   - Include: photos (limit 1 for listing card), favorite status for logged-in user

2. **Property Detail**:
   - Include: all photos (sorted by displayOrder), owner info (name, email), representative info, favorite status
   - Check: user authorization for edit/delete (owner only)

3. **Representative Dashboard**:
   - Filter inquiries by: status, propertyId
   - Sort by: createdAt desc
   - Include: property info, AI draft, requester info
   - Pagination: 50 per page

4. **Seller Dashboard**:
   - Filter properties by: ownerId, status
   - Sort by: createdAt desc
   - Include: photo count, inquiry count, favorite count
   - No pagination (sellers typically have few properties)

5. **User Favorites**:
   - Filter by: userId
   - Sort by: createdAt desc
   - Include: property info, first photo
   - Pagination: 20 per page

### Performance Optimization

- Use Prisma's `include` and `select` to minimize over-fetching
- Implement cursor-based pagination for large result sets
- Cache property search results in Redis (future enhancement)
- Use database indexes defined above for query optimization
- Consider read replicas for high-traffic scenarios

---

## Data Integrity Rules

1. **Cascading Deletes**:
   - Delete Property → delete PropertyPhoto, Inquiry, ViewingRequest, Favorite, RepresentativeAssignment
   - Delete User (seller) → soft delete or transfer Property ownership
   - Delete User (representative) → reassign Inquiry and RepresentativeAssignment
   - Delete Inquiry → delete AIEmailDraft

2. **Constraints**:
   - User email must be unique
   - Property address + ownerId must be unique
   - UserId + PropertyId must be unique in Favorite
   - PropertyId must be unique in RepresentativeAssignment
   - InquiryId must be unique in AIEmailDraft

3. **Referential Integrity**:
   - All foreign keys enforced by database
   - Prisma handles referential integrity automatically
   - Use `@relation` directives for explicit relationship definitions

---

## Phase 1 Data Model Complete

**Status**: ✅ Entity schema defined with fields, relationships, indexes, and validation rules

**Next**: Generate OpenAPI contracts from this data model
