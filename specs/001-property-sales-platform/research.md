# Technical Research: Property Sales Platform

**Date**: 2025-11-01  
**Feature**: Property Sales Platform  
**Purpose**: Resolve technical unknowns identified in Technical Context before Phase 1 design

## Research Items

### 1. Image Storage Solution

**Decision**: Vercel Blob Storage

**Rationale**:

- **Native Vercel Integration**: Since project uses Next.js 16+ and likely deployed on Vercel, Blob Storage provides seamless integration with zero additional configuration
- **Next.js Optimized**: Built-in support for Next.js Image component optimization and edge caching
- **Simple API**: Upload via `@vercel/blob` package with straightforward `put()` and `del()` methods
- **Cost Effective for MVP**: Generous free tier (1GB storage, 1GB bandwidth per month), pay-as-you-go pricing
- **Performance**: Global CDN distribution with edge caching reduces latency for property image loading
- **Security**: Automatic signed URLs, built-in access control
- **No Infrastructure Management**: Serverless, no buckets or IAM policies to configure

**Alternatives Considered**:

| Service | Pros | Cons | Rejected Because |
|---------|------|------|------------------|
| AWS S3 | Industry standard, highly scalable, S3-compatible tools | Requires AWS account setup, IAM configuration complexity, additional credentials management | Over-engineered for MVP; adds AWS infrastructure dependency and configuration overhead |
| Cloudflare R2 | S3-compatible API, zero egress fees, good pricing | Requires Cloudflare account, separate service from hosting, manual CDN setup | Adds another service provider; less integrated with Next.js/Vercel deployment workflow |
| Local File System | No external dependencies, free | Not scalable, doesn't work with serverless/edge, no CDN, manual backup | Incompatible with Vercel serverless architecture; poor performance and no redundancy |

**Implementation Notes**:

- Use `@vercel/blob` npm package
- Store images with unique prefixes: `properties/{propertyId}/{imageId}.{ext}`
- Return signed URLs with expiration for security
- Integrate with Next.js Image component for automatic optimization
- Implement deletion on property removal or image replacement

---

### 2. AI Service for Email Draft Generation

**Decision**: OpenAI GPT-4o (latest GPT-4 variant)

**Rationale**:

- **Production Ready**: Proven track record for text generation and professional communication
- **Quality**: GPT-4o produces high-quality, context-aware professional emails with proper tone
- **Multi-language Support**: Native support for English, Spanish, French, and 50+ other languages with automatic detection
- **Structured Output**: Can be prompted to generate consistent email format with greeting, body, closing
- **Cost Effective**: GPT-4o pricing is reasonable for email generation workload (~150-300 tokens per email)
- **API Maturity**: Well-documented REST API with TypeScript SDK (`openai` npm package)
- **Fast Response**: GPT-4o optimized for speed (~1-3s response times for email drafts)
- **Context Window**: 128K tokens allows including full inquiry, property details, and template instructions

**Alternatives Considered**:

| Service | Pros | Cons | Rejected Because |
|---------|------|------|------------------|
| Anthropic Claude 3 (Opus/Sonnet) | Excellent at following instructions, good at structured output, strong safety features | Higher cost than GPT-4o, slightly slower API response times | Cost and speed considerations for MVP; GPT-4o sufficient for email generation use case |
| Anthropic Claude 3.5 (Sonnet) | Better cost/performance than Opus, improved speed | Still more expensive than GPT-4o for similar quality | GPT-4o provides better cost/performance ratio for this specific use case |
| Llama 2/3 (Open Source) | Free to self-host, no API costs, data privacy | Requires infrastructure for hosting, lower quality than GPT-4, no built-in multi-language support | Quality concerns; infrastructure burden for MVP; lacks native multi-language capability |
| Template-Based System (No AI) | Predictable, free, no API dependencies | Lacks context awareness, poor personalization, can't adapt to inquiry nuances | Fails to provide the intelligent, contextual email generation that is a core feature requirement |

**Implementation Notes**:

- Use `openai` npm package (v4+)
- System prompt: Define tone (professional, friendly), structure (greeting, context, inquiry details, next steps, closing)
- Include inquiry context: buyer name, property address, property highlights, inquiry message
- Temperature: 0.7 for balance between creativity and consistency
- Max tokens: 500 (sufficient for professional email ~250-400 tokens)
- Implement retry logic for API failures
- Store API key in environment variable (`OPENAI_API_KEY`)
- Track token usage for cost monitoring

**Example Prompt Structure**:

```
You are a professional real estate platform representative. Generate a polite, professional email to a property owner about a buyer inquiry.

Property: {address}, {type}, {bedrooms}bd/{bathrooms}ba, ${price}
Buyer: {name} ({email}, {phone})
Inquiry Message: {message}

Generate an email that:
1. Introduces the platform and the inquiry
2. Provides buyer details and their message
3. Highlights the property
4. Suggests next steps (viewing, call, response)
5. Maintains professional, helpful tone

Language: Auto-detect from inquiry message, default English
```

---

### 3. Email Delivery Service

**Decision**: Resend

**Rationale**:

- **Developer-First**: Modern API designed for developers, excellent DX with TypeScript SDK
- **Next.js Integration**: Official Next.js integration examples, optimized for serverless/edge
- **Generous Free Tier**: 100 emails/day, 3,000/month free (sufficient for MVP testing and early users)
- **React Email Support**: Native integration with React Email for beautiful HTML email templates
- **Simple API**: Single `resend.emails.send()` call, minimal configuration
- **Reliable Deliverability**: Good inbox delivery rates, handles SPF/DKIM/DMARC automatically
- **Webhooks**: Built-in webhook support for delivery tracking and bounce handling
- **Cost Effective**: $20/month for 50K emails after free tier (reasonable scaling)

**Alternatives Considered**:

| Service | Pros | Cons | Rejected Because |
|---------|------|------|------------------|
| SendGrid | Industry standard, feature-rich, high deliverability | Complex API, outdated SDK, expensive ($20/month for 100 emails/day), steep learning curve | Poor developer experience; expensive for MVP; overkill for simple transactional emails |
| AWS SES | Very cheap ($0.10 per 1K emails), highly scalable | Requires AWS setup, sandbox mode restrictions, manual deliverability configuration | AWS infrastructure overhead; sandbox limitations require verification; complex setup for simple use case |
| Postmark | Excellent deliverability, good API, templates | More expensive ($15/month for 10K), fewer free tier emails | Higher cost with no clear advantage over Resend for this use case |
| Nodemailer (SMTP) | Free with any SMTP provider, flexible | Requires email server setup, poor deliverability, no tracking, manual bounce handling | Deliverability concerns; no built-in tracking; infrastructure burden incompatible with serverless |

**Implementation Notes**:

- Use `resend` npm package
- Store API key in environment variable (`RESEND_API_KEY`)
- Use React Email for template creation (optional, can start with plain text)
- Email types needed:
  1. Inquiry notification to property owner (from AI Agent)
  2. Email verification (account creation)
  3. Password reset
  4. Favorite property update notifications
- Implement webhook endpoint at `/api/email/webhook` for delivery status
- From address: `noreply@{your-domain}.com` (requires domain verification in Resend dashboard)

---

### 4. Testing Strategy

**Decision**: No automated tests for MVP (spec.md does not request tests)

**Rationale**:

- **Specification Guidance**: Feature specification explicitly states tests are OPTIONAL and should only be included "if explicitly requested in the feature specification"
- **MVP Focus**: Prioritize delivering working features over test coverage for initial validation
- **User Validation**: Focus on user story acceptance criteria validation through manual testing
- **Constitution Compliance**: Constitution Principle IV states "Tests SHOULD be written before implementation when explicitly requested in specifications" (emphasis on "when requested")
- **Time to Market**: Faster initial delivery without test infrastructure setup
- **Future Addition**: Testing can be added incrementally based on user feedback and feature stability

**If Tests Were Requested (Future Reference)**:

| Tool | Use Case | Notes |
|------|----------|-------|
| Jest + React Testing Library | Component unit tests | Test PropertyCard, InquiryForm, SearchFilters in isolation |
| Playwright | End-to-end tests | Test full user journeys (browse→inquire, create listing) |
| MSW (Mock Service Worker) | API mocking | Mock external services (OpenAI, Resend, Vercel Blob) |
| Prisma Test Environment | Database tests | Use SQLite in-memory or test database |

**Current Approach**:

- Manual testing against acceptance scenarios in spec.md
- Each user story validated independently before marking complete
- Representative dashboard tested with real AI-generated emails
- Edge cases verified manually
- TypeScript type checking provides compile-time safety
- ESLint catches code quality issues

---

## Technology Stack Summary

**Selected Technologies**:

| Category | Technology | Version/Tier | Rationale |
|----------|-----------|--------------|-----------|
| Framework | Next.js | 16+ (App Router) | Existing project standard |
| Language | TypeScript | 5.9+ (strict) | Existing project standard |
| UI | React | 19+ | Existing project standard |
| Styling | Tailwind CSS | 3.4+ | Existing project standard |
| Database | Prisma + SQLite/PostgreSQL | 6+ | Existing project standard |
| Authentication | NextAuth.js | 4+ | Existing project standard |
| State | Redux Toolkit | 2+ | Existing project standard |
| Forms | react-hook-form + Zod | 7+ / 4+ | Existing project standard |
| **Image Storage** | **Vercel Blob** | **Standard tier** | **NEW: Native Vercel integration, simple API** |
| **AI Service** | **OpenAI GPT-4o** | **API access** | **NEW: Email generation, multi-language support** |
| **Email Service** | **Resend** | **Free tier (MVP)** | **NEW: Developer-friendly, Next.js optimized** |

**NPM Packages to Install**:

```bash
npm install @vercel/blob        # Image storage
npm install openai              # AI email generation
npm install resend              # Email delivery
npm install react-email         # Optional: Email templates
npm install @react-email/components  # Optional: Email template components
```

**Environment Variables Required**:

```bash
# Existing (already in project)
DATABASE_URL=
NEXTAUTH_URL=
NEXTAUTH_SECRET=

# New (to be added)
BLOB_READ_WRITE_TOKEN=         # Vercel Blob (from Vercel dashboard)
OPENAI_API_KEY=                # OpenAI API key
RESEND_API_KEY=                # Resend API key
FROM_EMAIL=noreply@yourdomain.com  # Verified sender email
```

---

## Architecture Patterns

### API Design Pattern: RESTful

**Decision**: Use REST architecture for all API endpoints

**Rationale**:

- Aligns with Next.js App Router route handlers pattern
- Simple CRUD operations for properties, inquiries, favorites
- Easy to document with OpenAPI specification
- Well-understood by developers
- Sufficient for MVP requirements (no complex graph queries needed)

**Endpoint Structure**:

- `GET /api/properties` - List/search properties
- `GET /api/properties/:id` - Get property details
- `POST /api/properties` - Create property (seller)
- `PUT /api/properties/:id` - Update property (seller)
- `DELETE /api/properties/:id` - Delete property (seller)
- `POST /api/properties/upload` - Upload images
- `POST /api/inquiries` - Submit inquiry (buyer)
- `GET /api/inquiries` - List inquiries (representative)
- `GET /api/inquiries/:id` - Get inquiry with AI draft
- `POST /api/inquiries/:id/approve` - Approve and send email
- `POST /api/inquiries/:id/regenerate` - Regenerate AI draft
- `POST /api/inquiries/:id/reject` - Reject draft
- `GET/POST /api/favorites` - Get/add favorites
- `DELETE /api/favorites/:id` - Remove favorite

### State Management Pattern: Redux Toolkit with RTK Query

**Decision**: Use existing Redux Toolkit setup with RTK Query for API integration

**Rationale**:

- Already configured in project (`store/store.ts`, `store/hooks.ts`)
- RTK Query provides automatic caching, loading states, refetching
- Reduces boilerplate compared to manual fetch calls
- Built-in React hooks for components
- Optimistic updates for favorites
- Normalized cache for properties data

### Authentication Pattern: NextAuth.js with Prisma Adapter

**Decision**: Extend existing NextAuth.js setup with role-based access

**Rationale**:

- Already configured in project (`auth/auth.ts`)
- Add `role` field to User model (buyer/seller/representative)
- Use NextAuth callbacks to include role in session
- Middleware for route protection by role
- Prisma adapter already handles session management

---

## Risk Assessment

### High Priority Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| AI API costs exceed budget | High | Implement token usage monitoring, rate limiting, caching of common responses |
| AI generates inappropriate content | Medium | Representative approval required (already in design), content filtering in prompts |
| Image storage costs scale | Medium | Implement image compression, lazy loading, consider free tier limits |
| Email deliverability issues | High | Use Resend's built-in deliverability features, domain verification, monitor bounce rates |
| Multi-language detection fails | Low | Default to English gracefully, allow representative override during editing |

### Medium Priority Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Representative approval bottleneck | Medium | Queue system for high volume, distribute among multiple representatives |
| Property search performance at scale | Medium | Add database indexes on location, price, property type; consider Algolia/Meilisearch later |
| Image upload failures | Medium | Client-side validation (size/format), retry logic, clear error messages |

### Low Priority Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| SQLite limitations in production | Low | Migrate to PostgreSQL before scaling (Prisma makes this straightforward) |
| Redux state complexity growth | Low | Keep state normalized, use RTK Query for server data, local state for UI-only concerns |

---

## Phase 0 Complete

**Status**: ✅ All NEEDS CLARIFICATION items resolved

**Key Decisions**:

1. ✅ Image Storage: Vercel Blob
2. ✅ AI Service: OpenAI GPT-4o
3. ✅ Email Service: Resend
4. ✅ Testing: Manual validation (no automated tests for MVP)

**Next Phase**: Phase 1 - Design & Contracts (data-model.md, contracts/, quickstart.md)
