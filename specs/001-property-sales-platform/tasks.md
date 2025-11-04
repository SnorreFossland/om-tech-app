```markdown
# Tasks: Property Sales Platform

**Branch**: `001-property-sales-platform`  
**Input**: Design documents from `/specs/001-property-sales-platform/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/api-specification.yaml ✅

**Tests**: Manual testing per acceptance criteria (no automated tests requested in specification)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US2.5, US3, US4)
- All file paths are relative to repository root: `/Users/snorres/workspace/GitHub/my-app2`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency installation

- [x] T001 Install Vercel Blob SDK by running `npm install @vercel/blob` and add dependency to `package.json` (repo root: `/Users/snorres/workspace/GitHub/my-app2/package.json`)
- [x] T002 Install OpenAI SDK by running `npm install openai` and add dependency to `package.json` (repo root: `/Users/snorres/workspace/GitHub/my-app2/package.json`)
- [x] T003 Install Resend SDK by running `npm install resend` and add dependency to `package.json` (repo root: `/Users/snorres/workspace/GitHub/my-app2/package.json`)
- [x] T004 [P] Install React Email by running `npm install @react-email/components` and add dependency to `package.json` (repo root: `/Users/snorres/workspace/GitHub/my-app2/package.json`)
- [x] T005 [P] Create environment variables template in `.env.example` with VERCEL_BLOB_READ_WRITE_TOKEN, OPENAI_API_KEY, RESEND_API_KEY, NEXTAUTH_SECRET, DATABASE_URL

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database Schema & Migrations

- [x] T006 Update Prisma schema in `prisma/schema.prisma` to add UserRole enum (BUYER, SELLER, REPRESENTATIVE)
- [x] T007 Update User model in `prisma/schema.prisma` to add role field with UserRole type and phone field
- [x] T008 Create Property model in `prisma/schema.prisma` with 22 fields including PropertyType and PropertyStatus enums
- [x] T009 Create PropertyPhoto model in `prisma/schema.prisma` with url, blobKey, displayOrder fields and Property relationship
- [x] T010 Create Inquiry model in `prisma/schema.prisma` with InquiryStatus enum and relationships to Property, User (representative)
- [x] T011 Create AIEmailDraft model in `prisma/schema.prisma` with ApprovalStatus enum and relationship to Inquiry
- [x] T012 Create ViewingRequest model in `prisma/schema.prisma` with ViewingStatus enum and 3 preferred date fields
- [x] T013 Create Favorite model in `prisma/schema.prisma` with composite unique index on (userId, propertyId)
- [x] T014 Create RepresentativeAssignment model in `prisma/schema.prisma` with workloadCount and isAvailable fields
- [x] T015 Run Prisma migration by executing `npx prisma migrate dev --name init-property-platform` to create database tables (prisma schema: `prisma/schema.prisma`, repo root: `/Users/snorres/workspace/GitHub/my-app2`)

### Authentication & Authorization

- [x] T016 Update NextAuth configuration in `src/auth/auth.ts` to add REPRESENTATIVE role support
- [x] T017 Create role-based middleware in `src/lib/auth/role-middleware.ts` to check user roles (BUYER, SELLER, REPRESENTATIVE)
- [x] T018 Update session type definitions in `src/auth/auth.ts` to include user role in session object

### Validation Schemas

- [x] T019 [P] Create property validation schemas in `src/lib/validations/property.ts` using Zod for CreatePropertyRequest and UpdatePropertyRequest
- [ ] T020 [P] Create inquiry validation schemas in `src/lib/validations/inquiry.ts` using Zod for CreateInquiryRequest with minimum message length 10 chars
- [ ] T021 [P] Create user validation schemas in `src/lib/validations/user.ts` using Zod for CreateUserRequest with password min 8 chars

### Service Integrations

- [x] T022 [P] Create Vercel Blob upload service in `src/lib/storage/upload.ts` with uploadPropertyImage function supporting JPEG/PNG/WebP, max 10MB
- [ ] T023 [P] Create OpenAI email generator service in `src/lib/ai/email-generator.ts` with generateInquiryEmail function using GPT-4o
- [ ] T024 [P] Create language detector service in `src/lib/ai/language-detector.ts` with detectLanguage function for multi-language support
- [ ] T025 [P] Create Resend email sender service in `src/lib/email/sender.ts` with sendEmail function for property owner notifications

### Redux Store Setup

- [ ] T026 [P] Create properties slice in `src/store/slices/properties.slice.ts` with actions for filters, search state
- [ ] T027 [P] Create inquiries slice in `src/store/slices/inquiries.slice.ts` with actions for representative workflow state
- [ ] T028 [P] Create favorites slice in `src/store/slices/favorites.slice.ts` with actions for user favorites management
- [x] T029 [P] Create properties RTK Query API in `src/store/services/properties.api.ts` with endpoints from contracts/api-specification.yaml

### Base UI Components

- [x] T032 [P] Create PropertyCard component in `src/components/property/PropertyCard.tsx` (shell only - displays title, price, photo placeholder)
- [ ] T033 [P] Create InquiryForm component in `src/components/inquiry/InquiryForm.tsx` (shell only - basic form structure with react-hook-form)
- [ ] T034 [P] Create AIEmailDraftViewer component in `src/components/inquiry/AIEmailDraftViewer.tsx` (shell only - displays email content)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Browse Property Listings (Priority: P1) 🎯 MVP

**Goal**: Enable visitors to discover and search properties by location, filter by type/price/specs, and view detailed property information

**Independent Test**: Visit homepage → enter city in search → see property results → apply filters (price, bedrooms, type) → results update → click property card → see detail page with photos, description, amenities, specifications

### P1 Models & Data Access

- [ ] T035 [US1] Create Property entity helper functions in `src/lib/database/property-queries.ts` for searchProperties with filtering and pagination
- [ ] T036 [US1] Create Property entity helper function in `src/lib/database/property-queries.ts` for getPropertyById with photo and owner relationships

### P1 API Endpoints

- [x] T037 [US1] Implement GET /api/properties endpoint in `src/app/api/properties/route.ts` with query params for city, propertyType, price range, bedrooms, bathrooms, squareFeet, status, pagination
- [x] T038 [US1] Implement GET /api/properties/[id] endpoint in `src/app/api/properties/[id]/route.ts` to return property detail with photos array and owner info

### P1 UI Components

- [x] T039 [P] [US1] Implement SearchBar component in `src/components/property/SearchBar.tsx` with location input and search button
- [x] T040 [P] [US1] Implement SearchFilters component in `src/components/property/SearchFilters.tsx` with property type, price range sliders, bedrooms/bathrooms dropdowns, square footage inputs
- [x] T041 [US1] Update PropertyCard component in `src/components/property/PropertyCard.tsx` to display property info (title, price, bedrooms, bathrooms, squareFeet, propertyType, city, primary photo, status badge)
- [x] T042 [US1] Create PropertyGrid component in `src/components/property/PropertyGrid.tsx` to display array of PropertyCard with responsive grid layout
- [x] T043 [US1] Create PropertyDetail component in `src/components/property/PropertyDetail.tsx` to display full property information (all fields from data model)
- [x] T044 [US1] Create PropertyGallery component in `src/components/property/PropertyGallery.tsx` with image carousel for up to 20 photos using displayOrder

### P1 Pages & Routing

- [ ] T045 [US1] Create homepage in `src/app/(public)/page.tsx` with featured properties section and SearchBar component
- [x] T046 [US1] Create property search page in `src/app/(public)/properties/page.tsx` with SearchBar, SearchFilters, PropertyGrid, and pagination
- [x] T047 [US1] Create property detail page in `src/app/(public)/properties/[id]/page.tsx` with PropertyDetail and PropertyGallery components

### P1 State Management

- [x] T048 [US1] Wire up properties slice in property search page to manage filter state (city, propertyType, price range, bedrooms, bathrooms, squareFeet, status)
- [x] T049 [US1] Wire up properties RTK Query hooks in property search page to fetch and cache search results
- [x] T050 [US1] Wire up properties RTK Query hooks in property detail page to fetch single property with photos

**Checkpoint**: User Story 1 complete - visitors can browse, search, filter properties and view details. This is the MVP!

---

## Phase 4: User Story 2 - Contact Property Representative with AI Assistance (Priority: P2)

... (remaining sections unchanged)
# Tasks: Property Sales Platform

**Branch**: `001-property-sales-platform`  
**Input**: Design documents from `/specs/001-property-sales-platform/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/api-specification.yaml ✅

**Tests**: Manual testing per acceptance criteria (no automated tests requested in specification)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US2.5, US3, US4)
- All file paths are relative to repository root: `/Users/snorres/workspace/GitHub/my-app2`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency installation

- [ ] T001 Install Vercel Blob SDK by running `npm install @vercel/blob` and add dependency to `package.json` (repo root: `/Users/snorres/workspace/GitHub/my-app2/package.json`)
- [ ] T002 Install OpenAI SDK by running `npm install openai` and add dependency to `package.json` (repo root: `/Users/snorres/workspace/GitHub/my-app2/package.json`)
- [ ] T003 Install Resend SDK by running `npm install resend` and add dependency to `package.json` (repo root: `/Users/snorres/workspace/GitHub/my-app2/package.json`)
- [ ] T004 [P] Install React Email by running `npm install @react-email/components` and add dependency to `package.json` (repo root: `/Users/snorres/workspace/GitHub/my-app2/package.json`)
- [ ] T005 [P] Create environment variables template in `.env.example` with VERCEL_BLOB_READ_WRITE_TOKEN, OPENAI_API_KEY, RESEND_API_KEY, NEXTAUTH_SECRET, DATABASE_URL

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database Schema & Migrations

- [ ] T006 Update Prisma schema in `prisma/schema.prisma` to add UserRole enum (BUYER, SELLER, REPRESENTATIVE)
- [ ] T007 Update User model in `prisma/schema.prisma` to add role field with UserRole type and phone field
- [ ] T008 Create Property model in `prisma/schema.prisma` with 22 fields including PropertyType and PropertyStatus enums
- [ ] T009 Create PropertyPhoto model in `prisma/schema.prisma` with url, blobKey, displayOrder fields and Property relationship
- [ ] T010 Create Inquiry model in `prisma/schema.prisma` with InquiryStatus enum and relationships to Property, User (representative)
- [ ] T011 Create AIEmailDraft model in `prisma/schema.prisma` with ApprovalStatus enum and relationship to Inquiry
- [ ] T012 Create ViewingRequest model in `prisma/schema.prisma` with ViewingStatus enum and 3 preferred date fields
- [ ] T013 Create Favorite model in `prisma/schema.prisma` with composite unique index on (userId, propertyId)
- [ ] T014 Create RepresentativeAssignment model in `prisma/schema.prisma` with workloadCount and isAvailable fields
- [ ] T015 Run Prisma migration by executing `npx prisma migrate dev --name init-property-platform` to create database tables (prisma schema: `prisma/schema.prisma`, repo root: `/Users/snorres/workspace/GitHub/my-app2`)

### Authentication & Authorization

- [ ] T016 Update NextAuth configuration in `src/auth/auth.ts` to add REPRESENTATIVE role support
- [ ] T017 Create role-based middleware in `src/lib/auth/role-middleware.ts` to check user roles (BUYER, SELLER, REPRESENTATIVE)
- [ ] T018 Update session type definitions in `src/auth/auth.ts` to include user role in session object

### Validation Schemas

- [ ] T019 [P] Create property validation schemas in `src/lib/validations/property.ts` using Zod for CreatePropertyRequest and UpdatePropertyRequest
- [ ] T020 [P] Create inquiry validation schemas in `src/lib/validations/inquiry.ts` using Zod for CreateInquiryRequest with minimum message length 10 chars
- [ ] T021 [P] Create user validation schemas in `src/lib/validations/user.ts` using Zod for CreateUserRequest with password min 8 chars

### Service Integrations

- [ ] T022 [P] Create Vercel Blob upload service in `src/lib/storage/upload.ts` with uploadPropertyImage function supporting JPEG/PNG/WebP, max 10MB
- [ ] T023 [P] Create OpenAI email generator service in `src/lib/ai/email-generator.ts` with generateInquiryEmail function using GPT-4o
- [ ] T024 [P] Create language detector service in `src/lib/ai/language-detector.ts` with detectLanguage function for multi-language support
- [ ] T025 [P] Create Resend email sender service in `src/lib/email/sender.ts` with sendEmail function for property owner notifications

### Redux Store Setup

- [ ] T026 [P] Create properties slice in `src/store/slices/properties.slice.ts` with actions for filters, search state
- [ ] T027 [P] Create inquiries slice in `src/store/slices/inquiries.slice.ts` with actions for representative workflow state
- [ ] T028 [P] Create favorites slice in `src/store/slices/favorites.slice.ts` with actions for user favorites management
- [ ] T029 [P] Create properties RTK Query API in `src/store/services/properties.api.ts` with endpoints from contracts/api-specification.yaml
- [ ] T030 [P] Create inquiries RTK Query API in `src/store/services/inquiries.api.ts` with endpoints from contracts/api-specification.yaml
- [ ] T031 [P] Create favorites RTK Query API in `src/store/services/favorites.api.ts` with endpoints from contracts/api-specification.yaml

### Base UI Components

- [ ] T032 [P] Create PropertyCard component in `src/components/property/PropertyCard.tsx` (shell only - displays title, price, photo placeholder)
- [ ] T033 [P] Create InquiryForm component in `src/components/inquiry/InquiryForm.tsx` (shell only - basic form structure with react-hook-form)
- [ ] T034 [P] Create AIEmailDraftViewer component in `src/components/inquiry/AIEmailDraftViewer.tsx` (shell only - displays email content)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Browse Property Listings (Priority: P1) 🎯 MVP

**Goal**: Enable visitors to discover and search properties by location, filter by type/price/specs, and view detailed property information

**Independent Test**: Visit homepage → enter city in search → see property results → apply filters (price, bedrooms, type) → results update → click property card → see detail page with photos, description, amenities, specifications

### P1 Models & Data Access

- [ ] T035 [US1] Create Property entity helper functions in `src/lib/database/property-queries.ts` for searchProperties with filtering and pagination
- [ ] T036 [US1] Create Property entity helper function in `src/lib/database/property-queries.ts` for getPropertyById with photo and owner relationships

### P1 API Endpoints

- [ ] T037 [US1] Implement GET /api/properties endpoint in `src/app/api/properties/route.ts` with query params for city, propertyType, price range, bedrooms, bathrooms, squareFeet, status, pagination
- [ ] T038 [US1] Implement GET /api/properties/[id] endpoint in `src/app/api/properties/[id]/route.ts` to return property detail with photos array and owner info

### P1 UI Components

- [ ] T039 [P] [US1] Implement SearchBar component in `src/components/property/SearchBar.tsx` with location input and search button
- [ ] T040 [P] [US1] Implement SearchFilters component in `src/components/property/SearchFilters.tsx` with property type, price range sliders, bedrooms/bathrooms dropdowns, square footage inputs
- [ ] T041 [US1] Update PropertyCard component in `src/components/property/PropertyCard.tsx` to display property info (title, price, bedrooms, bathrooms, squareFeet, propertyType, city, primary photo, status badge)
- [ ] T042 [US1] Create PropertyGrid component in `src/components/property/PropertyGrid.tsx` to display array of PropertyCard with responsive grid layout
- [ ] T043 [US1] Create PropertyDetail component in `src/components/property/PropertyDetail.tsx` to display full property information (all fields from data model)
- [ ] T044 [US1] Create PropertyGallery component in `src/components/property/PropertyGallery.tsx` with image carousel for up to 20 photos using displayOrder

### P1 Pages & Routing

- [ ] T045 [US1] Create homepage in `src/app/(public)/page.tsx` with featured properties section and SearchBar component
- [ ] T046 [US1] Create property search page in `src/app/(public)/properties/page.tsx` with SearchBar, SearchFilters, PropertyGrid, and pagination
- [ ] T047 [US1] Create property detail page in `src/app/(public)/properties/[id]/page.tsx` with PropertyDetail and PropertyGallery components

### P1 State Management

- [ ] T048 [US1] Wire up properties slice in property search page to manage filter state (city, propertyType, price range, bedrooms, bathrooms, squareFeet, status)
- [ ] T049 [US1] Wire up properties RTK Query hooks in property search page to fetch and cache search results
- [ ] T050 [US1] Wire up properties RTK Query hooks in property detail page to fetch single property with photos

**Checkpoint**: User Story 1 complete - visitors can browse, search, filter properties and view details. This is the MVP!

---

## Phase 4: User Story 2 - Contact Property Representative with AI Assistance (Priority: P2)

**Goal**: Enable buyers to submit inquiries through a form, which triggers AI email generation. Representatives review AI-generated drafts and approve/edit before sending to property owners.

**Independent Test**: View property detail → click "Contact Representative" → fill inquiry form (name, email, phone, message) → submit → see confirmation message. Separately: Login as representative → see inquiry in dashboard with DRAFT_READY status → view AI-generated email → click approve → email sends to owner.

### P2 Models & Data Access

- [ ] T051 [P] [US2] Create Inquiry entity helper functions in `src/lib/database/inquiry-queries.ts` for createInquiry and assignRepresentative
- [ ] T052 [P] [US2] Create AIEmailDraft entity helper functions in `src/lib/database/ai-draft-queries.ts` for createDraft, updateDraftStatus

### P2 API Endpoints (Buyer-facing)

- [ ] T053 [US2] Implement POST /api/inquiries endpoint in `src/app/api/inquiries/route.ts` to accept inquiry form submission (propertyId, inquirerName, inquirerEmail, inquirerPhone, message)
- [ ] T054 [US2] Add AI email generation trigger in POST /api/inquiries endpoint to call OpenAI service after inquiry creation with status PENDING_AI_PROCESSING
- [ ] T055 [US2] Create background job handler in `src/lib/ai/inquiry-processor.ts` to process PENDING_AI_PROCESSING inquiries, generate email draft, update status to DRAFT_READY
- [ ] T056 [US2] Implement POST /api/ai/generate-email endpoint in `src/app/api/ai/generate-email/route.ts` to call OpenAI GPT-4o with inquiry and property context

### P2 UI Components (Buyer-facing)

- [ ] T057 [US2] Update InquiryForm component in `src/components/inquiry/InquiryForm.tsx` to implement full form with name, email, phone, message fields using react-hook-form and Zod validation
- [ ] T058 [US2] Add InquiryForm component to property detail page in `src/app/(public)/properties/[id]/page.tsx` with "Contact Representative" button
- [ ] T059 [US2] Add inquiry submission success message/modal after form submit showing "Your inquiry has been submitted and will be reviewed by our team"

**Checkpoint**: Buyers can submit inquiries, AI generates email drafts. Now implement representative review workflow (User Story 2.5).

---

## Phase 5: User Story 2.5 - Representative Reviews and Approves AI-Generated Emails (Priority: P2.5)

**Goal**: Platform representatives review AI-generated email drafts, edit if needed, and approve to send to property owners

**Independent Test**: Login as representative → navigate to dashboard → see list of inquiries with DRAFT_READY status → click inquiry → view AI-generated email draft → click "Approve" → email sends to property owner → inquiry status updates to CONTACTED_OWNER. Also test: edit draft → approve edited version → verify edited email sent.

### P2.5 Models & Data Access

- [ ] T060 [P] [US2.5] Create Inquiry entity helper functions in `src/lib/database/inquiry-queries.ts` for getInquiriesByRepresentative with status filter
- [ ] T061 [P] [US2.5] Create Inquiry entity helper function in `src/lib/database/inquiry-queries.ts` for getInquiryWithDraft including property and AI draft relationships
- [ ] T062 [P] [US2.5] Create AIEmailDraft entity helper functions in `src/lib/database/ai-draft-queries.ts` for approveDraft, rejectDraft, regenerateDraft

### P2.5 API Endpoints (Representative-facing)

- [ ] T063 [US2.5] Implement GET /api/inquiries endpoint in `src/app/api/inquiries/route.ts` with role check for REPRESENTATIVE and query params for status, propertyId, pagination
- [ ] T064 [US2.5] Implement GET /api/inquiries/[id] endpoint in `src/app/api/inquiries/[id]/route.ts` with role check for REPRESENTATIVE to return inquiry with AI draft
- [ ] T065 [US2.5] Implement POST /api/inquiries/[id]/approve endpoint in `src/app/api/inquiries/[id]/approve/route.ts` to accept optional editedContent, update draft status to APPROVED, call Resend to send email to property owner, update inquiry status to CONTACTED_OWNER
- [ ] T066 [US2.5] Implement POST /api/inquiries/[id]/reject endpoint in `src/app/api/inquiries/[id]/reject/route.ts` to update draft status to REJECTED, increment rejectionCount
- [ ] T067 [US2.5] Implement POST /api/inquiries/[id]/regenerate endpoint in `src/app/api/inquiries/[id]/regenerate/route.ts` to accept optional instructions, call AI service to generate new draft, replace existing draft

### P2.5 UI Components (Representative-facing)

- [ ] T068 [P] [US2.5] Create InquiryList component in `src/components/inquiry/InquiryList.tsx` to display table of inquiries with property title, buyer name, status, created date
- [ ] T069 [US2.5] Update AIEmailDraftViewer component in `src/components/inquiry/AIEmailDraftViewer.tsx` to display draft content, detected language, generation timestamp with professional email formatting
- [ ] T070 [P] [US2.5] Create EmailEditor component in `src/components/inquiry/EmailEditor.tsx` with rich text editor or textarea for editing draft content
- [ ] T071 [P] [US2.5] Create ApprovalButtons component in `src/components/inquiry/ApprovalButtons.tsx` with Approve, Edit, Reject, Regenerate buttons

### P2.5 Pages & Routing (Representative-facing)

- [ ] T072 [US2.5] Create representative dashboard layout in `src/app/(representative)/dashboard/layout.tsx` with role protection middleware
- [ ] T073 [US2.5] Create representative dashboard page in `src/app/(representative)/dashboard/page.tsx` with statistics cards (pending drafts, approved today, total inquiries)
- [ ] T074 [US2.5] Create inquiries list page in `src/app/(representative)/dashboard/inquiries/page.tsx` with InquiryList component and status filter tabs
- [ ] T075 [US2.5] Create inquiry detail page in `src/app/(representative)/dashboard/inquiries/[id]/page.tsx` with property info, buyer details, AI draft viewer, and approval buttons

### P2.5 State Management

- [ ] T076 [US2.5] Wire up inquiries RTK Query hooks in representative pages to fetch inquiry list and single inquiry with draft
- [ ] T077 [US2.5] Wire up inquiries slice actions for approval workflow state management (editing mode, approval confirmation dialogs)

**Checkpoint**: Representatives can review AI drafts, edit, approve, reject, regenerate. Complete buyer-to-seller inquiry workflow functional.

---

## Phase 6: User Story 3 - List Property for Sale (Priority: P3)

**Goal**: Enable sellers to create property listings with details, photos, and manage existing listings

**Independent Test**: Create seller account → login → navigate to "List New Property" → fill property form (title, address, city, state, zip, type, price, beds, baths, sqft, description, amenities) → upload 5 photos → submit → see property in "My Listings" → property appears in public search results → edit listing → update price → verify change reflected.

### P3 API Endpoints (Seller-facing)

- [ ] T078 [US3] Implement POST /api/properties endpoint in `src/app/api/properties/route.ts` with role check for SELLER and CreatePropertyRequest validation
- [ ] T079 [US3] Implement PUT /api/properties/[id] endpoint in `src/app/api/properties/[id]/route.ts` with owner authorization check and UpdatePropertyRequest validation
- [ ] T080 [US3] Implement DELETE /api/properties/[id] endpoint in `src/app/api/properties/[id]/route.ts` with owner authorization check and cascade delete of photos
- [ ] T081 [US3] Implement POST /api/properties/upload endpoint in `src/app/api/properties/upload/route.ts` to accept multipart/form-data with propertyId and files array (max 20, max 10MB each), call Vercel Blob upload, create PropertyPhoto records with displayOrder

### P3 UI Components (Seller-facing)

- [ ] T082 [US3] Create PropertyForm component in `src/components/property/PropertyForm.tsx` with all property fields using react-hook-form, Zod validation, address/city/state/zip inputs, property type select, price/beds/baths/sqft number inputs, description textarea (min 50 chars), amenities multi-select
- [ ] T083 [US3] Create PropertyImageUpload component in `src/components/property/PropertyImageUpload.tsx` with drag-and-drop file upload, preview thumbnails, reorder drag-and-drop functionality, file size/format validation UI
- [ ] T084 [P] [US3] Create PropertyListTable component in `src/components/property/PropertyListTable.tsx` to display seller's properties with title, status, price, created date, actions (edit, delete)

### P3 Pages & Routing (Seller-facing)

- [ ] T085 [US3] Create seller dashboard layout in `src/app/(seller)/dashboard/layout.tsx` with role protection middleware
- [ ] T086 [US3] Create seller dashboard page in `src/app/(seller)/dashboard/page.tsx` with stats cards (active listings, total inquiries received, total views - future)
- [ ] T087 [US3] Create manage properties page in `src/app/(seller)/dashboard/properties/page.tsx` with PropertyListTable and "Add New Property" button
- [ ] T088 [US3] Create new property page in `src/app/(seller)/dashboard/properties/new/page.tsx` with PropertyForm and PropertyImageUpload components
- [ ] T089 [US3] Create edit property page in `src/app/(seller)/dashboard/properties/[id]/edit/page.tsx` with pre-filled PropertyForm and PropertyImageUpload showing existing photos

### P3 State Management

- [ ] T090 [US3] Wire up properties RTK Query hooks in seller pages to create, update, delete properties
- [ ] T091 [US3] Wire up properties RTK Query hooks for image upload with progress tracking

**Checkpoint**: Sellers can create, edit, delete property listings with photo uploads. Full property management functional.

---

## Phase 7: User Story 4 - Save Favorite Properties (Priority: P4)

**Goal**: Enable registered users to save properties to favorites and view saved properties in their dashboard

**Independent Test**: Create buyer account → login → browse properties → click heart icon on property card → heart fills → navigate to "My Favorites" page → see saved property → click property → view detail → click heart icon again → property removed from favorites → return to favorites page → verify property no longer listed.

### P4 Models & Data Access

- [ ] T092 [P] [US4] Create Favorite entity helper functions in `src/lib/database/favorite-queries.ts` for addFavorite, removeFavorite, getUserFavorites with property relationships

### P4 API Endpoints

- [ ] T093 [US4] Implement GET /api/favorites endpoint in `src/app/api/favorites/route.ts` with authentication check, pagination, include property details
- [ ] T094 [US4] Implement POST /api/favorites endpoint in `src/app/api/favorites/route.ts` with authentication check, duplicate prevention (unique constraint on userId + propertyId)
- [ ] T095 [US4] Implement DELETE /api/favorites/[id] endpoint in `src/app/api/favorites/[id]/route.ts` with ownership authorization check

### P4 UI Components

- [ ] T096 [US4] Update PropertyCard component in `src/components/property/PropertyCard.tsx` to add heart icon button with favorite/unfavorite toggle (only shown when user authenticated)
- [ ] T097 [US4] Update PropertyDetail component in `src/components/property/PropertyDetail.tsx` to add favorite button with icon (filled if favorited, outline if not)
- [ ] T098 [P] [US4] Create FavoritesList component in `src/components/favorites/FavoritesList.tsx` to display grid of favorited properties with PropertyCard components

### P4 Pages & Routing

- [ ] T099 [US4] Create favorites page in `src/app/(buyer)/favorites/page.tsx` with authentication protection and FavoritesList component

### P4 State Management

- [ ] T100 [US4] Wire up favorites RTK Query hooks in property cards and detail pages to add/remove favorites
- [ ] T101 [US4] Wire up favorites slice to track favorite status in property search results and detail pages (update isFavorited field)
- [ ] T102 [US4] Implement optimistic UI updates in favorites slice to immediately reflect favorite toggle before API response

**Checkpoint**: Users can save/unsave properties, view favorites dashboard. All user stories complete!

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories or overall platform quality

### Error Handling & UX

- [ ] T103 [P] Add error boundary component in `src/components/error/ErrorBoundary.tsx` to catch and display React errors gracefully
- [ ] T104 [P] Add loading skeletons in `src/components/ui/skeleton.tsx` for property cards, detail page, inquiry list
- [ ] T105 Add toast notifications in `src/components/ui/toast.tsx` for success/error messages across all forms and actions
- [ ] T106 Implement 404 page in `src/app/not-found.tsx` for missing properties and pages

### Responsive Design & Accessibility

- [ ] T107 [P] Verify responsive design on PropertyCard, PropertyGrid, SearchFilters for mobile breakpoints (tailwind sm:, md:, lg:)
- [ ] T108 [P] Add ARIA labels to interactive components (buttons, forms, modals) for accessibility
- [ ] T109 Test keyboard navigation on inquiry form, property form, and search filters

### Performance Optimization

- [ ] T110 [P] Add Next.js Image component optimizations to PropertyCard and PropertyGallery for lazy loading and responsive images
- [ ] T111 Implement cursor-based pagination for property search results to improve performance on large datasets
- [ ] T112 Add database query indexes verification in `prisma/schema.prisma` per data-model.md specifications

### Security Hardening

- [ ] T113 [P] Add rate limiting middleware in `src/lib/middleware/rate-limit.ts` for inquiry submission endpoint (max 5 per hour per IP)
- [ ] T114 [P] Add CORS configuration in Next.js config for API routes
- [ ] T115 Verify all API endpoints check authentication/authorization per contracts/api-specification.yaml

### Documentation & Testing

- [ ] T116 [P] Validate all acceptance scenarios from quickstart.md manually and document results in `specs/001-property-sales-platform/test-results.md`
- [ ] T117 Create seed data script in `prisma/seed.ts` with sample properties, users (buyer, seller, representative), inquiries for development and testing
- [ ] T118 Run seed script with `npx prisma db seed` to populate development database (seed file: `prisma/seed.ts`)
- [ ] T119 Update README.md with setup instructions, environment variables, how to run locally, how to deploy

### Environment & Deployment

- [ ] T120 [P] Configure Vercel Blob environment variables in Vercel project settings
- [ ] T121 [P] Configure OpenAI API key in Vercel project settings with secure environment variable
- [ ] T122 [P] Configure Resend API key in Vercel project settings
- [ ] T123 Verify database connection in production (PostgreSQL) and run migrations with `npx prisma migrate deploy` (prisma schema: `prisma/schema.prisma`)
- [ ] T124 Deploy to Vercel and verify all user stories work in production (update `README.md` with deployment notes: `/Users/snorres/workspace/GitHub/my-app2/README.md`)

---

## Dependencies & Execution Order

### Phase Dependencies

```

Phase 1 (Setup)
    ↓
Phase 2 (Foundational) ← BLOCKS ALL USER STORIES
    ↓
    ├─→ Phase 3 (US1 - Browse Properties) 🎯 MVP
    ├─→ Phase 4 (US2 - Contact with AI) ─┐
    ├─→ Phase 5 (US2.5 - Rep Review)     ├─→ Complete inquiry workflow
    ├─→ Phase 6 (US3 - List Property)    │
    └─→ Phase 7 (US4 - Favorites)        │
         ↓                                │
    Phase 8 (Polish & Cross-Cutting) ←───┘

```

### Critical Path (Minimum MVP)

1. **Phase 1**: Setup (T001-T005) - Install all dependencies
2. **Phase 2**: Foundational (T006-T034) - Database, auth, services, base components
3. **Phase 3**: User Story 1 (T035-T050) - Browse properties
4. **Phase 8**: Essential polish (T105, T116-T119) - Testing and documentation

**Minimum Deliverable**: Complete phases 1, 2, 3 for browsing-only MVP

### User Story Dependencies

- **US1 (Browse)**: Independent - depends only on Phase 2
- **US2 (Contact with AI)**: Depends on Phase 2, integrates with US1 (property detail page)
- **US2.5 (Rep Review)**: Depends on US2 (inquiry creation), completes inquiry workflow
- **US3 (List Property)**: Independent - depends only on Phase 2 (but properties won't show in US1 until created)
- **US4 (Favorites)**: Depends on US1 (property cards), Phase 2 (auth)

### Parallel Opportunities

**Within Phase 1 (Setup)**:

- T001-T005 can all run in parallel (different packages)

**Within Phase 2 (Foundational)**:

- After migrations (T006-T015):
  - T019-T021 (validation schemas) in parallel
  - T022-T025 (service integrations) in parallel
  - T026-T031 (Redux store) in parallel
  - T032-T034 (base components) in parallel

**Between User Stories** (if team has capacity):

- US1 (T035-T050) and US3 (T078-T091) can be developed in parallel by different developers
- US2 (T051-T059) and US4 (T092-T102) can be developed in parallel
- US2.5 (T060-T077) must wait for US2 core (T051-T056) but can parallel with US2 UI (T057-T059)

**Within Phase 8 (Polish)**:

- T103-T115 can run in parallel (different concerns)
- T116-T119 should run after all user stories complete
- T120-T124 run sequentially for deployment

---

## Implementation Strategy

### MVP First (User Story 1 Only)

**Goal**: Launch browse-only property platform in ~2 weeks

1. ✅ Complete Phase 1: Setup (1 day)
2. ✅ Complete Phase 2: Foundational (3-5 days)
3. ✅ Complete Phase 3: User Story 1 (3-5 days)
4. ✅ Essential Polish: T105 (toasts), T116 (testing), T119 (docs), T120-T124 (deploy)
5. **STOP and VALIDATE**: Manual test all US1 acceptance scenarios
6. **Deploy MVP**: Vercel deployment with browse functionality only

**MVP Scope**: 50 tasks (T001-T050 + essential polish)  
**Value**: Visitors can discover properties immediately

### Incremental Delivery (Recommended)

**Sprint 1: Foundation + Browse (MVP)**

- Phase 1 + Phase 2 + Phase 3 = MVP Launch
- Value: Property discovery working

**Sprint 2: Seller Self-Service**

- Phase 6 (US3 - List Property)
- Value: Sellers can add properties themselves

**Sprint 3: Inquiry with AI Workflow**

- Phase 4 (US2 - Contact) + Phase 5 (US2.5 - Representative Review)
- Value: Buyer-seller connection with AI assistance

**Sprint 4: User Engagement**

- Phase 7 (US4 - Favorites)
- Value: Users can organize their search

**Sprint 5: Polish & Deploy**

- Phase 8 (Polish)
- Value: Production-ready platform

**Total**: ~8-10 weeks with single developer, 4-6 weeks with 2-3 developers

### Parallel Team Strategy (3 Developers)

**Week 1-2: Foundation (All Together)**

- Complete Phase 1 + Phase 2 together
- Checkpoint: Foundation ready

**Week 3-4: Parallel User Stories**

- Developer A: Phase 3 (US1 - Browse)
- Developer B: Phase 6 (US3 - List Property)
- Developer C: Phase 4 (US2 - Contact) → Phase 5 (US2.5 - Representative)

**Week 5-6: Integration & Polish**

- Developer A: Phase 7 (US4 - Favorites)
- Developer B: Phase 8 (Polish tasks T103-T115)
- Developer C: Testing (T116-T118)

**Week 7: Deploy**

- All: T119-T124 deployment and validation

**Total**: ~7 weeks with 3 developers

---

## Task Statistics

- **Total Tasks**: 124
- **Phase 1 (Setup)**: 5 tasks
- **Phase 2 (Foundational)**: 29 tasks
- **Phase 3 (US1 - Browse)**: 16 tasks
- **Phase 4 (US2 - Contact with AI)**: 9 tasks
- **Phase 5 (US2.5 - Rep Review)**: 16 tasks
- **Phase 6 (US3 - List Property)**: 14 tasks
- **Phase 7 (US4 - Favorites)**: 11 tasks
- **Phase 8 (Polish)**: 22 tasks

**Parallel Tasks**: 38 tasks marked [P] (30% can run in parallel within phases)

**User Story Distribution**:

- US1 (Browse): 16 implementation tasks
- US2 (Contact): 9 implementation tasks
- US2.5 (Rep Review): 16 implementation tasks
- US3 (List Property): 14 implementation tasks
- US4 (Favorites): 11 implementation tasks

**MVP Minimum**: 50 tasks (Phase 1 + Phase 2 + Phase 3 + essential polish)

---

## Validation Checklist

Before considering any phase "complete", verify:

**Phase 2 (Foundational) Complete When**:

- [ ] All Prisma models created and migrations run successfully
- [ ] Can register user with BUYER, SELLER, REPRESENTATIVE roles
- [ ] NextAuth authentication working with role in session
- [ ] All Zod validation schemas export correct types
- [ ] Vercel Blob upload service successfully uploads test image
- [ ] OpenAI service generates test email (with mock inquiry data)
- [ ] Resend service sends test email
- [ ] All Redux slices and RTK Query APIs compile without errors

**User Story 1 Complete When**:

- [ ] Homepage displays with search bar
- [ ] Can search properties by city and see results
- [ ] Filters (type, price, beds, baths, sqft) update results correctly
- [ ] Pagination works (20 per page)
- [ ] Property card displays all required info (title, price, photo, specs)
- [ ] Clicking property card navigates to detail page
- [ ] Detail page shows all property info, photo gallery (if multiple photos)
- [ ] SOLD badge displays on sold properties
- [ ] All acceptance scenarios from spec.md pass manual testing

**User Story 2 Complete When**:

- [ ] Contact form appears on property detail page
- [ ] Can submit inquiry with name, email, phone, message
- [ ] See confirmation message after submission
- [ ] Inquiry record created in database with PENDING_AI_PROCESSING status
- [ ] AI email draft generated within 30 seconds
- [ ] Draft status updates to DRAFT_READY
- [ ] All acceptance scenarios from spec.md pass manual testing

**User Story 2.5 Complete When**:

- [ ] Can login as representative
- [ ] Representative dashboard shows pending draft count
- [ ] Inquiry list displays with status filters
- [ ] Can view inquiry detail with AI-generated email
- [ ] Can approve draft → email sends to owner → status updates to CONTACTED_OWNER
- [ ] Can edit draft → approve → edited email sends
- [ ] Can reject draft → status updates
- [ ] Can regenerate draft with instructions → new draft created
- [ ] All acceptance scenarios from spec.md pass manual testing

**User Story 3 Complete When**:

- [ ] Can login as seller
- [ ] Seller dashboard shows active listing count
- [ ] Can navigate to "List New Property"
- [ ] Can fill property form with all required fields
- [ ] Form validation works (title min 5 chars, description min 50 chars, etc.)
- [ ] Can upload up to 20 images (max 10MB each)
- [ ] Can reorder images via drag-and-drop
- [ ] Property created and visible in public search
- [ ] Can edit existing property and see changes reflected
- [ ] Can delete property (with confirmation)
- [ ] All acceptance scenarios from spec.md pass manual testing

**User Story 4 Complete When**:

- [ ] Can login as buyer
- [ ] Heart icon appears on property cards when authenticated
- [ ] Clicking heart adds to favorites → icon fills
- [ ] Clicking filled heart removes from favorites → icon empties
- [ ] Can navigate to "My Favorites" page
- [ ] Favorites page displays all saved properties
- [ ] Removing favorite from favorites page removes from list
- [ ] Favorite status persists across sessions
- [ ] All acceptance scenarios from spec.md pass manual testing

---

## Notes

- **[P] tasks**: Different files or independent concerns - can run in parallel within same phase
- **[Story] label**: Maps task to specific user story from spec.md for traceability
- **File paths**: All paths relative to repository root `/Users/snorres/workspace/GitHub/my-app2`
- **No automated tests**: Manual QA per acceptance criteria (as per research.md decision)
- **AI service**: OpenAI GPT-4o selected (research.md) - generates email drafts in 1-3 seconds
- **Image storage**: Vercel Blob selected (research.md) - simple API, Vercel-native
- **Email service**: Resend selected (research.md) - developer-friendly, 100 emails/day free tier
- **Constitution compliance**: All tasks follow component-first, type-safe, user-story-driven approach per plan.md
- **Independent stories**: Each user story can be tested independently without others (per constitution)
- **Commit strategy**: Commit after completing each task or logical group of parallel tasks
- **Stop at any checkpoint**: Any phase completion is a valid stopping point for review/validation
