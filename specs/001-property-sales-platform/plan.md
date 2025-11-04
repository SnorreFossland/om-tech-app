# Implementation Plan: Property Sales Platform

**Branch**: `001-property-sales-platform` | **Date**: 2025-11-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-property-sales-platform/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

A comprehensive property sales platform enabling property discovery, buyer-seller connections through AI-assisted representative communication, property listing management, and user engagement features. The platform uses an AI Agent to generate professional email drafts from buyer inquiries, which are reviewed and approved by platform representatives before being sent to property owners. Core features include property browsing with advanced search/filtering, inquiry processing with AI assistance, seller self-service listing creation, and user favorites management.

## Technical Context

**Language/Version**: TypeScript 5.9+ with strict mode enabled  
**Primary Dependencies**: Next.js 16+ (App Router), React 19+, Prisma 6+, NextAuth.js 4+, Tailwind CSS 3.4+, Radix UI, Redux Toolkit 2+, react-hook-form 7+, Zod 4+, Lucide React  
**Storage**: Prisma with SQLite (development) / PostgreSQL (production recommended), file storage for property images (NEEDS CLARIFICATION: cloud storage service - AWS S3, Cloudflare R2, or Vercel Blob)  
**Testing**: NEEDS CLARIFICATION: Testing strategy not specified in requirements - if needed: Jest + React Testing Library for components, Playwright for E2E  
**Target Platform**: Web application (responsive design for desktop, tablet, mobile browsers)
**Project Type**: Web application (Next.js full-stack with App Router)  
**Performance Goals**: <3s search results, <5s property page loads, <10s homepage, <30s AI email generation, 100 concurrent users, <1 min representative review/approval  
**Constraints**: Image uploads max 10MB/image (up to 20 per listing), email validation required, mobile-first responsive design, AI email drafts require human approval before sending  
**Scale/Scope**: MVP targeting single geographic market, 5 user stories (P1-P4 + P2.5), 45 functional requirements, 8 key entities, AI-assisted inquiry processing workflow
**AI Integration**: NEEDS CLARIFICATION: AI service provider for email draft generation (OpenAI GPT-4, Anthropic Claude, or custom model) and multi-language detection capability

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Component-First Architecture ✅ PASS

- **Requirement**: Features built as modular, reusable components with single responsibility
- **Compliance**:
  - Property listing components (PropertyCard, PropertyDetail, SearchFilters) in `src/components/property/`
  - Inquiry form and AI email review components in `src/components/inquiry/`
  - Representative dashboard components in `src/components/dashboard/`
  - Reusable UI components (Button, Form, Input) leveraging existing `src/components/ui/`
  - Each component has clear, single responsibility aligned with user stories
- **Status**: COMPLIANT - Component structure follows modular design principles

### II. Type Safety ✅ PASS

- **Requirement**: TypeScript strict mode, explicit types, Zod validation, Prisma schemas
- **Compliance**:
  - TypeScript 5.9+ with strict mode already configured in project
  - Prisma schemas for all entities (Property, User, Inquiry, AIEmailDraft, etc.)
  - Zod schemas for form validation (inquiry form, property listing form, search filters)
  - react-hook-form with Zod resolvers for all forms
  - API route handlers with typed request/response
- **Status**: COMPLIANT - Full type safety coverage planned

### III. User Story Driven Development ✅ PASS

- **Requirement**: Prioritized user stories (P1, P2, P3...) with acceptance criteria
- **Compliance**:
  - 5 user stories prioritized: P1 (Browse), P2 (Contact with AI), P2.5 (Representative Review), P3 (List Property), P4 (Favorites)
  - Each story has Given-When-Then acceptance scenarios
  - Implementation order: P1 → P2/P2.5 → P3 → P4
  - Each story independently deliverable and testable
- **Status**: COMPLIANT - Specification follows user story driven approach

### IV. Independent Testability ✅ PASS

- **Requirement**: User stories and components testable in isolation
- **Compliance**:
  - P1 (Browse) testable without other features - standalone property discovery
  - P2/P2.5 (Contact/Review) testable with mock property data
  - P3 (List Property) testable independently - seller workflow isolated
  - P4 (Favorites) testable with any property data
  - Components designed with clear props interfaces for isolated testing
  - Foundational setup (auth, database, UI components) completed before user story implementation
- **Status**: COMPLIANT - User stories designed for independent testing

### V. Code Quality & Consistency ✅ PASS

- **Requirement**: ESLint passes, TypeScript compilation passes, consistent naming, Next.js conventions
- **Compliance**:
  - ESLint 9+ with Next.js config already in project
  - TypeScript typecheck enforced via `npm run typecheck`
  - PascalCase for components (PropertyCard, InquiryForm, RepresentativeDashboard)
  - camelCase for functions/variables
  - Next.js App Router conventions: routes in `src/app/`, API in `src/app/api/`
  - File structure follows existing patterns in project
- **Status**: COMPLIANT - Quality standards maintained

### Technology Standards ✅ PASS

- **Stack Compliance**:
  - ✅ Next.js 16+ App Router
  - ✅ TypeScript 5.9+ strict mode
  - ✅ React 19+
  - ✅ Tailwind CSS 3.4+
  - ✅ Prisma 6+ with SQLite (dev)
  - ✅ NextAuth.js 4+ for authentication
  - ✅ Redux Toolkit 2+ for state management
  - ✅ react-hook-form 7+ with Zod validation
  - ✅ Radix UI + existing component library
  - ⚠️  **NEW**: AI service integration (OpenAI/Anthropic/custom) - requires research
  - ⚠️  **NEW**: Email service for notifications (Resend, SendGrid, AWS SES) - requires research
  - ⚠️  **NEW**: Image storage service (S3, R2, Vercel Blob) - requires research

### Development Workflow ✅ PASS

- **Compliance**:
  - ✅ Specification phase complete (spec.md with 5 prioritized user stories)
  - ✅ Planning phase in progress (this plan.md)
  - → Task breakdown phase next (/speckit.tasks command)
  - → Foundation phase (auth, database schema, base components)
  - → Story implementation (P1 → P2/P2.5 → P3 → P4)
  - → Validation per story
  - ✅ Feature branch: 001-property-sales-platform
  - ✅ Documentation structure: /specs/001-property-sales-platform/

**GATE STATUS**: ✅ **PASS** - Proceed to Phase 0 Research

**Items requiring research in Phase 0**:

1. AI service selection for email draft generation (OpenAI GPT-4, Anthropic Claude, or alternatives)
2. Image storage solution (AWS S3, Cloudflare R2, Vercel Blob, or alternatives)
3. Email delivery service (Resend, SendGrid, AWS SES, or alternatives)
4. Testing strategy confirmation (if tests will be implemented)

## Project Structure

### Documentation (this feature)

```text
specs/001-property-sales-platform/
├── spec.md              # Feature specification (COMPLETE)
├── plan.md              # This file (/speckit.plan command output - IN PROGRESS)
├── research.md          # Phase 0 output (/speckit.plan command - TO BE CREATED)
├── data-model.md        # Phase 1 output (/speckit.plan command - TO BE CREATED)
├── quickstart.md        # Phase 1 output (/speckit.plan command - TO BE CREATED)
├── contracts/           # Phase 1 output (/speckit.plan command - TO BE CREATED)
│   ├── properties-api.yaml
│   ├── inquiries-api.yaml
│   ├── users-api.yaml
│   └── representatives-api.yaml
├── checklists/
│   └── requirements.md  # Specification quality checklist (COMPLETE)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── app/                          # Next.js App Router
│   ├── (public)/                 # Public routes (no auth required)
│   │   ├── page.tsx              # Homepage with featured properties
│   │   ├── properties/
│   │   │   ├── page.tsx          # Property search/browse
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Property detail page
│   │   └── about/
│   │       └── page.tsx          # About page
│   ├── (auth)/                   # Auth-related routes
│   │   ├── login/
│   │   │   └── page.tsx          # Login page
│   │   └── signup/
│   │       └── page.tsx          # Signup page
│   ├── (buyer)/                  # Buyer-authenticated routes
│   │   └── favorites/
│   │       └── page.tsx          # User favorites dashboard
│   ├── (seller)/                 # Seller-authenticated routes
│   │   └── dashboard/
│   │       ├── page.tsx          # Seller dashboard
│   │       ├── properties/
│   │       │   ├── page.tsx      # Manage properties
│   │       │   ├── new/
│   │       │   │   └── page.tsx  # Create new property
│   │       │   └── [id]/
│   │       │       └── edit/
│   │       │           └── page.tsx  # Edit property
│   │       └── layout.tsx
│   ├── (representative)/         # Representative-authenticated routes
│   │   └── dashboard/
│   │       ├── page.tsx          # Representative dashboard
│   │       ├── inquiries/
│   │       │   ├── page.tsx      # Manage inquiries
│   │       │   └── [id]/
│   │       │       └── page.tsx  # Review AI draft & approve
│   │       └── layout.tsx
│   ├── api/                      # API routes
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts      # NextAuth.js configuration
│   │   ├── properties/
│   │   │   ├── route.ts          # GET /api/properties (search/filter)
│   │   │   ├── [id]/
│   │   │   │   └── route.ts      # GET/PUT/DELETE /api/properties/:id
│   │   │   └── upload/
│   │   │       └── route.ts      # POST /api/properties/upload (image upload)
│   │   ├── inquiries/
│   │   │   ├── route.ts          # POST /api/inquiries (submit inquiry)
│   │   │   └── [id]/
│   │   │       ├── route.ts      # GET /api/inquiries/:id
│   │   │       ├── approve/
│   │   │       │   └── route.ts  # POST /api/inquiries/:id/approve
│   │   │       ├── regenerate/
│   │   │       │   └── route.ts  # POST /api/inquiries/:id/regenerate
│   │   │       └── reject/
│   │   │           └── route.ts  # POST /api/inquiries/:id/reject
│   │   ├── ai/
│   │   │   └── generate-email/
│   │   │       └── route.ts      # POST /api/ai/generate-email (AI service)
│   │   ├── favorites/
│   │   │   ├── route.ts          # GET/POST /api/favorites
│   │   │   └── [id]/
│   │   │       └── route.ts      # DELETE /api/favorites/:id
│   │   └── users/
│   │       ├── route.ts          # POST /api/users (registration)
│   │       └── [id]/
│   │           └── route.ts      # GET/PUT /api/users/:id
│   ├── globals.css               # Global styles (existing)
│   ├── layout.tsx                # Root layout (existing)
│   └── providers.tsx             # Redux Provider wrapper (existing)
├── components/
│   ├── property/                 # Property-related components
│   │   ├── PropertyCard.tsx      # Property listing card
│   │   ├── PropertyGrid.tsx      # Grid of property cards
│   │   ├── PropertyDetail.tsx    # Full property details
│   │   ├── PropertyForm.tsx      # Create/edit property form
│   │   ├── PropertyImageUpload.tsx
│   │   ├── SearchBar.tsx         # Location search
│   │   ├── SearchFilters.tsx     # Price, beds, baths filters
│   │   └── PropertyGallery.tsx   # Image gallery viewer
│   ├── inquiry/                  # Inquiry-related components
│   │   ├── InquiryForm.tsx       # Buyer contact form
│   │   ├── InquiryList.tsx       # Representative inquiry list
│   │   ├── AIEmailDraftViewer.tsx # Display AI-generated email
│   │   ├── EmailEditor.tsx       # Edit email content
│   │   └── ApprovalButtons.tsx   # Approve/Edit/Reject actions
│   ├── dashboard/                # Dashboard components (existing)
│   ├── shell/                    # Shell components (existing)
│   ├── theme/                    # Theme components (existing)
│   └── ui/                       # UI primitives (existing: button, card, form, input, etc.)
├── lib/
│   ├── prisma.ts                 # Prisma client singleton (existing)
│   ├── utils.ts                  # Utility functions (existing)
│   ├── ai/                       # AI service integration
│   │   ├── email-generator.ts    # AI email generation logic
│   │   └── language-detector.ts  # Language detection
│   ├── email/                    # Email service integration
│   │   └── sender.ts             # Email delivery logic
│   ├── storage/                  # Image storage integration
│   │   └── upload.ts             # Image upload/retrieval
│   └── validations/              # Zod schemas
│       ├── property.ts           # Property validation schemas
│       ├── inquiry.ts            # Inquiry validation schemas
│       └── user.ts               # User validation schemas
├── store/                        # Redux store (existing)
│   ├── store.ts                  # Store configuration (existing)
│   ├── hooks.ts                  # Typed hooks (existing)
│   ├── slices/
│   │   ├── counter.slice.ts      # Example slice (existing)
│   │   ├── properties.slice.ts   # Properties state (NEW)
│   │   ├── inquiries.slice.ts    # Inquiries state (NEW)
│   │   └── favorites.slice.ts    # Favorites state (NEW)
│   └── services/
│       ├── api.ts                # RTK Query base (existing)
│       ├── properties.api.ts     # Properties API endpoints (NEW)
│       ├── inquiries.api.ts      # Inquiries API endpoints (NEW)
│       └── favorites.api.ts      # Favorites API endpoints (NEW)
└── auth/
    ├── auth.ts                   # NextAuth configuration (existing)
    └── prisma.ts                 # Prisma adapter (existing)

prisma/
├── schema.prisma                 # Database schema (existing User model)
└── migrations/                   # Database migrations

public/
├── images/                       # Static images
└── placeholders/                 # Placeholder images for properties
```

**Structure Decision**: Selected **Web Application (Next.js full-stack)** structure. This is a full-stack web application using Next.js App Router with both frontend (React components) and backend (API routes) in a single codebase. The existing project already follows this pattern with `src/app/` for routes and `src/components/` for React components.

**Key Decisions**:

- **Route Groups**: Using Next.js route groups `(public)`, `(auth)`, `(buyer)`, `(seller)`, `(representative)` to organize pages by access level and keep URLs clean
- **Component Organization**: Property, inquiry, and dashboard-specific components in dedicated subdirectories; leveraging existing UI component library
- **API Routes**: RESTful API structure under `src/app/api/` with resource-based organization
- **State Management**: Redux Toolkit slices for properties, inquiries, favorites; RTK Query for API integration
- **Existing Infrastructure**: Leveraging existing auth (NextAuth), database (Prisma), UI components, and styling (Tailwind)
- **New Integrations**: AI service, email service, and image storage in `src/lib/` for clean separation

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**Status**: No violations - Constitution Check passed all gates. No complexity justification required.

---

## Phase 0: Research & Clarification ✅ COMPLETE

**Output**: `research.md`

**Purpose**: Resolve all "NEEDS CLARIFICATION" items from Technical Context before design phase.

### Research Completed

**File Created**: `/specs/001-property-sales-platform/research.md`

**Decisions Made**:

1. **Image Storage**: ✅ **Vercel Blob**
   - Rationale: Native Vercel integration, simple API, cost-effective for MVP
   - Implementation: `@vercel/blob` package with direct upload from API routes
   - Details in research.md sections 1.1-1.3

2. **AI Service**: ✅ **OpenAI GPT-4o**
   - Rationale: Production-ready, multi-language support, fast response times (1-3s)
   - Implementation: `openai` package with streaming for representative feedback
   - Details in research.md sections 2.1-2.3

3. **Email Service**: ✅ **Resend**
   - Rationale: Developer-first, Next.js integration, generous free tier (100 emails/day)
   - Implementation: `resend` package with React Email templates
   - Details in research.md sections 3.1-3.3

4. **Testing Strategy**: ✅ **Manual Testing**
   - Rationale: Requirements do not specify automated testing (FR-046 through FR-050 absent)
   - Approach: Manual QA per user story acceptance criteria
   - Details in research.md section 4

**Status**: All clarifications resolved. Ready for Phase 1 design.

---

## Phase 1: Data Model & API Contracts ✅ COMPLETE

**Output**: `data-model.md`, `/contracts/*`, `quickstart.md`, agent-specific file

**Purpose**: Design database schema, entity relationships, and API contracts before implementation.

### 1.1 Data Model Design ✅ COMPLETE

**File Created**: `/specs/001-property-sales-platform/data-model.md`

**Entities Designed** (8 total):

1. **User** (12 fields) - Authentication and profile data with role-based access
2. **Property** (22 fields) - Property listings with location, pricing, amenities
3. **PropertyPhoto** (6 fields) - Image storage references with display ordering
4. **Inquiry** (10 fields) - Buyer inquiries with workflow status tracking
5. **AIEmailDraft** (11 fields) - AI-generated email drafts with approval workflow
6. **ViewingRequest** (14 fields) - Property viewing scheduling
7. **Favorite** (4 fields) - User property favorites
8. **RepresentativeAssignment** (7 fields) - Representative workload management

**Enums Defined** (6 total):

- UserRole (BUYER, SELLER, REPRESENTATIVE)
- PropertyType (HOUSE, APARTMENT, CONDO, TOWNHOUSE)
- PropertyStatus (ACTIVE, SOLD, PENDING, ARCHIVED)
- InquiryStatus (7 states: PENDING_AI_PROCESSING → DRAFT_READY → APPROVED → CONTACTED_OWNER → RESPONDED_TO_BUYER → CLOSED, REJECTED)
- ApprovalStatus (PENDING, APPROVED, REJECTED)
- ViewingStatus (6 states)

**Key Design Decisions**:

- Representative intermediary model with assignment tracking
- AI draft versioning with rejection count limits (max 3)
- Composite unique indexes on (userId, propertyId) for favorites
- Cascading deletes for dependent entities
- Query optimization indexes on high-traffic fields
- Auto-archiving logic for sold properties (30-day trigger)

**ERD**: Complete entity-relationship diagram included in data-model.md

### 1.2 API Contracts ✅ COMPLETE

**File Created**: `/specs/001-property-sales-platform/contracts/api-specification.yaml`

**API Design**: OpenAPI 3.0.3 specification covering all REST endpoints

**Endpoints Designed** (grouped by resource):

**Properties API**:

- `GET /api/properties` - Search/filter with pagination (FR-001 to FR-011)
- `POST /api/properties` - Create listing (FR-023 to FR-029)
- `GET /api/properties/{id}` - Detail view (FR-012)
- `PUT /api/properties/{id}` - Update listing (FR-030)
- `DELETE /api/properties/{id}` - Delete listing (FR-031)
- `POST /api/properties/upload` - Image upload to Vercel Blob (FR-032)

**Inquiries API**:

- `POST /api/inquiries` - Submit inquiry (FR-013, triggers AI processing)
- `GET /api/inquiries` - List inquiries (representative only, FR-036)
- `GET /api/inquiries/{id}` - Detail with AI draft (FR-037)
- `POST /api/inquiries/{id}/approve` - Approve & send email (FR-039, FR-043)
- `POST /api/inquiries/{id}/reject` - Reject draft (FR-041)
- `POST /api/inquiries/{id}/regenerate` - Request new draft (FR-040, FR-042)

**Favorites API**:

- `GET /api/favorites` - List user favorites (FR-033)
- `POST /api/favorites` - Add favorite (FR-034)
- `DELETE /api/favorites/{id}` - Remove favorite (FR-035)

**Users API**:

- `POST /api/users` - Registration (FR-014, FR-015)
- `GET /api/users/{id}` - Get profile
- `PUT /api/users/{id}` - Update profile

**Authentication**: NextAuth.js session-based auth with session cookies

**Request/Response Schemas**: 15 schemas defined (Property, Inquiry, AIEmailDraft, Favorite, User, etc.)

**Validation Rules**: Zod integration points specified (e.g., title min 5 chars, message min 10 chars, max 10MB images)

**Error Responses**: Standardized 400/401/403/404/500 responses with error schemas

### 1.3 User Guide ✅ COMPLETE

**File Created**: `/specs/001-property-sales-platform/quickstart.md`

**Sections Covered**:

1. Introduction - Platform overview and key features
2. User Roles - Buyer, Seller, Representative role descriptions
3. Getting Started - Account creation and login flow
4. Buyer Guide - Browsing, searching, filtering, inquiries, favorites
5. Seller Guide - Creating listings, uploading photos, managing properties, receiving inquiries
6. Representative Guide - Dashboard, AI draft review, approval workflow, regeneration, tracking
7. FAQs - Common questions for all roles

**Key Workflows Documented**:

- Buyer inquiry submission → AI processing → representative review → approval → owner contact
- Seller property creation → photo upload → listing management → inquiry responses
- Representative AI draft review → approve/edit/reject → regenerate with instructions
- Sold property handling → SOLD badge → 30-day auto-archive

**User-Facing Details**:

- AI language auto-detection (50+ languages via GPT-4o)
- Response time expectations (4 hours representative review, 24-48 hours owner response)
- Image upload limits (20 images max, 10MB each, JPG/PNG)
- Inquiry status lifecycle (7 states explained)
- Representative performance metrics dashboard

### 1.4 Agent Context Update ✅ COMPLETE

**Script Executed**: `.specify/scripts/bash/update-agent-context.sh copilot`

**File Updated**: `.github/copilot-instructions.md`

**Technologies Added**:

- **Language**: TypeScript 5.9+ with strict mode enabled
- **Framework**: Next.js 16+ (App Router), React 19+, Prisma 6+, NextAuth.js 4+, Tailwind CSS 3.4+, Radix UI, Redux Toolkit 2+, react-hook-form 7+, Zod 4+, Lucide React
- **Feature**: 001-property-sales-platform

**Result**: GitHub Copilot now has context about this feature's technology stack for code suggestions.

---

## Phase 1 Constitution Re-Check ✅ PASS

*Re-evaluating constitution compliance after Phase 1 design (data model & API contracts)*

### I. Component-First Architecture ✅ PASS

- **Data Model Review**:
  - 8 entities designed with clear single responsibilities
  - Property/PropertyPhoto separation for image management
  - Inquiry/AIEmailDraft separation for workflow management
  - RepresentativeAssignment for workload distribution
- **API Design Review**:
  - REST endpoints grouped by resource (properties, inquiries, favorites, users)
  - Each endpoint has single, clear responsibility
  - Request/response schemas promote reusable components
- **Status**: COMPLIANT - Design maintains modularity

### II. Type Safety ✅ PASS

- **Data Model Review**:
  - All Prisma schemas include explicit field types
  - 6 enums defined for constrained values (UserRole, PropertyType, etc.)
  - Relationships explicitly typed with foreign keys
  - Validation rules specified (minLength, maxLength, unique constraints)
- **API Contracts Review**:
  - OpenAPI schemas define all request/response types
  - Zod integration points specified for runtime validation
  - TypeScript types will be generated from Prisma schemas
- **Status**: COMPLIANT - Full type safety coverage in design

### III. User Story Driven Development ✅ PASS

- **Traceability Review**:
  - Each API endpoint maps to specific functional requirements
  - Data model entities directly support user stories (P1: Property/PropertyPhoto, P2/P2.5: Inquiry/AIEmailDraft, P3: Property creation, P4: Favorite)
  - Quickstart guide organized by user story personas (Buyer, Seller, Representative)
- **Status**: COMPLIANT - Design maintains user story alignment

### IV. Independent Testability ✅ PASS

- **API Design Review**:
  - REST endpoints independently testable with mock data
  - No circular dependencies between API routes
  - Each entity can be seeded independently in test database
- **Data Model Review**:
  - Relationships use foreign keys (can test with test IDs)
  - Cascading deletes isolated per entity
  - Optional fields allow partial data for testing
- **Status**: COMPLIANT - Design supports isolated testing

### V. Code Quality & Consistency ✅ PASS

- **Naming Review**:
  - PascalCase for schemas (PropertyPhoto, AIEmailDraft, RepresentativeAssignment)
  - camelCase for fields (inquirerName, detectedLanguage, approvalStatus)
  - Descriptive enum values (PENDING_AI_PROCESSING, CONTACTED_OWNER)
- **Convention Review**:
  - REST API follows standard HTTP methods (GET, POST, PUT, DELETE)
  - OpenAPI 3.0.3 standard format
  - Prisma naming conventions followed
- **Status**: COMPLIANT - Design follows quality standards

**GATE STATUS**: ✅ **PASS** - Ready to proceed to task breakdown (/speckit.tasks)

---

## Next Steps

### Immediate Action: Task Breakdown

**Command**: `/speckit.tasks`

This command will:

1. Read this completed plan.md
2. Break down user stories into concrete implementation tasks
3. Generate `/specs/001-property-sales-platform/tasks.md` with:
   - Foundational tasks (database schema, auth, components)
   - User story implementation tasks (P1 → P2/P2.5 → P3 → P4)
   - Task dependencies and sequencing
   - Acceptance criteria per task

### Implementation Order

Once tasks.md is generated:

**Phase 2: Foundation** (Prerequisite for all user stories)

- Task group: Database schema implementation (Prisma migrations)
- Task group: NextAuth.js role-based authentication
- Task group: Base UI components (PropertyCard, InquiryForm shells)
- Task group: AI/email/storage service integration setup

**Phase 3: User Story Implementation**

- P1 (Browse Properties): Search, filtering, property detail view
- P2 + P2.5 (Contact + Representative Review): Inquiry submission, AI integration, representative dashboard
- P3 (List Property): Property creation, photo upload, seller management
- P4 (Favorites): Save/unsave properties, favorites dashboard

**Phase 4: Validation**

- Manual QA per acceptance criteria
- Representative workflow testing
- AI draft quality review
- Cross-role integration testing

---

## Plan Generation Complete

**Status**: ✅ All phases complete

- ✅ Summary
- ✅ Technical Context
- ✅ Constitution Check (initial)
- ✅ Project Structure
- ✅ Phase 0: Research (research.md created)
- ✅ Phase 1: Data Model & API Contracts (data-model.md, contracts/api-specification.yaml, quickstart.md created)
- ✅ Phase 1: Agent Context Update (.github/copilot-instructions.md updated)
- ✅ Constitution Re-Check (post-design validation)

**Next Command**: `/speckit.tasks` to generate task breakdown
