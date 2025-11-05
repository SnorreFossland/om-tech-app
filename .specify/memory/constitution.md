<!--
============================================================================
SYNC IMPACT REPORT - Constitution v1.0.0
============================================================================
Version Change: Initial → 1.0.0
Rationale: Initial constitution establishment for my-app2 project

Modified Principles:
  - NEW: I. Component-First Architecture
  - NEW: II. Type Safety
  - NEW: III. User Story Driven Development
  - NEW: IV. Independent Testability
  - NEW: V. Code Quality & Consistency

Added Sections:
  - Core Principles (5 principles)
  - Technology Standards
  - Development Workflow
  - Governance

Templates Status:
  ✅ plan-template.md - Aligned (Constitution Check section references this file)
  ✅ spec-template.md - Aligned (User story requirements match Principle III)
  ✅ tasks-template.md - Aligned (Phase organization matches independent testability)
  ⚠️  No command files found in .specify/templates/commands/ - skipped validation

Follow-up TODOs:
  - Consider adding .specify/templates/commands/ directory for command workflows
  - Add quickstart.md or developer onboarding guide in docs/
  - Consider adding CONTRIBUTING.md referencing this constitution

============================================================================
-->

# my-app2 Constitution

## Core Principles

### I. Component-First Architecture

Every feature MUST be built as modular, reusable components following these rules:

- Components MUST be independently testable and documented
- Components MUST have a single, clear responsibility
- Shared components MUST reside in `src/components/` with appropriate subdirectories (`ui/`, `shell/`, `dashboard/`, `theme/`)
- Page-specific components MAY be co-located with their routes in the app directory
- Component APIs MUST be explicit via TypeScript interfaces
- NO components created solely for organizational purposes without clear functional value

**Rationale**: Component-first architecture enables independent development, testing, and reusability while maintaining clear boundaries and reducing coupling.

### II. Type Safety

TypeScript MUST be used with strict mode enabled for all application code:

- NO implicit `any` types permitted without explicit justification
- All component props MUST have explicit TypeScript interfaces or types
- API contracts MUST use Zod schemas for runtime validation
- Database models MUST use Prisma schemas as single source of truth
- Form validation MUST use react-hook-form with Zod resolvers
- Type inference SHOULD be leveraged where TypeScript can derive types safely

**Rationale**: Type safety prevents runtime errors, improves developer experience through autocomplete, and serves as living documentation.

### III. User Story Driven Development

All features MUST be specified as prioritized, independently testable user stories:

- User stories MUST be ordered by priority (P1, P2, P3...) in spec.md
- Each user story MUST be independently deliverable as a slice of functionality
- Each user story MUST have explicit acceptance criteria in Given-When-Then format
- Implementation MUST proceed in priority order: P1 → P2 → P3
- Each story completion MUST result in a demonstrable, working feature
- Edge cases and error scenarios MUST be documented per story

**Rationale**: User story driven development ensures incremental value delivery, enables MVP identification, and maintains focus on user outcomes rather than technical tasks.

### IV. Independent Testability

Each user story and component MUST be independently testable:

- User stories MUST be completable and testable without dependencies on lower-priority stories
- Components MUST be testable in isolation via clear props interfaces
- Tests SHOULD be written before implementation when explicitly requested in specifications
- Contract tests verify API boundaries match specifications
- Integration tests verify user journeys end-to-end
- Unit tests verify individual component and function behavior
- Foundational infrastructure MUST be complete before user story implementation begins

**Rationale**: Independent testability enables parallel development, incremental delivery, early validation, and reduces regression risk.

### V. Code Quality & Consistency

All code MUST meet quality and consistency standards:

- ESLint MUST pass with no warnings or errors
- TypeScript compilation MUST pass with no errors (`npm run typecheck`)
- Code formatting MUST follow project standards (automated via tooling)
- Naming conventions MUST be consistent: PascalCase for components, camelCase for functions/variables
- File structure MUST follow Next.js App Router conventions
- Comments SHOULD explain "why" not "what" (code should be self-documenting)
- Complexity MUST be justified in plan.md Complexity Tracking table if violating simplicity

**Rationale**: Consistent code quality reduces cognitive load, prevents bugs, and improves maintainability across team members.

## Technology Standards

### Core Stack

- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript 5.9+ with strict mode
- **UI Library**: React 19+
- **Styling**: Tailwind CSS 3.4+ with tailwindcss-animate
- **Component Library**: Radix UI primitives + custom components
- **Forms**: react-hook-form 7+ with Zod validation
- **State Management**: Redux Toolkit 2+ (via React Redux)
- **Database**: Prisma 6+ (SQLite for development, adaptable for production)
- **Authentication**: NextAuth.js 4+
- **Icons**: Lucide React
- **Theme**: next-themes for dark/light mode support

### Development Tools

- **Linting**: ESLint 9+ with Next.js config
- **Type Checking**: TypeScript compiler (`tsc --noEmit`)
- **Package Manager**: npm (as evidenced by package.json)
- **Git**: Version control with feature branches

### Architectural Constraints

- Server Components by default; Client Components only when needed (interactivity, hooks, browser APIs)
- API routes in `src/app/api/` following Next.js conventions
- Authentication via NextAuth.js with Prisma adapter
- Database access via Prisma Client (no raw SQL without justification)
- Environment variables via Next.js env system
- Responsive design mobile-first approach

## Development Workflow

### Feature Development Process

1. **Specification Phase**: Create spec.md with prioritized user stories and acceptance criteria
2. **Planning Phase**: Run `/speckit.plan` to generate plan.md with technical context and constitution compliance check
3. **Task Breakdown Phase**: Run `/speckit.tasks` to generate tasks.md organized by user story priority
4. **Foundation Phase**: Complete all foundational infrastructure tasks (blocks all user stories)
5. **Story Implementation Phase**: Implement user stories in priority order (P1 → P2 → P3)
6. **Validation Phase**: Each story independently tested and validated before proceeding
7. **Integration Phase**: Verify stories work together without conflicts

### Branch Strategy

- Feature branches named: `###-feature-name` (where ### is feature ID)
- Branch from main/master
- One feature per branch
- Merge to main after validation

### Quality Gates

- All TypeScript errors resolved (`npm run typecheck` passes)
- All ESLint errors resolved (`npm run lint` passes)
- Constitution compliance verified (Constitution Check in plan.md)
- Tests pass (if tests were requested in specification)
- User stories independently validated against acceptance criteria

### Documentation Requirements

- Feature documentation in `/specs/[###-feature]/` including:
  - `spec.md` (user stories, requirements, success criteria)
  - `plan.md` (technical approach, constitution check, structure decisions)
  - `tasks.md` (implementation tasks by user story)
  - `research.md` (technical research findings - optional)
  - `data-model.md` (entity definitions - if applicable)
  - `quickstart.md` (feature usage guide - if applicable)
  - `contracts/` (API contracts - if applicable)

## Governance

### Authority

This constitution supersedes all other development practices, conventions, and historical patterns. In case of conflict between this document and existing code, this document takes precedence for new work.

### Amendment Process

1. Proposed changes MUST be documented with rationale
2. Version number MUST be incremented according to semantic versioning:
   - **MAJOR**: Breaking changes to core principles or governance
   - **MINOR**: New principles added or significant expansions
   - **PATCH**: Clarifications, typos, non-semantic refinements
3. `LAST_AMENDED_DATE` MUST be updated to amendment date
4. Sync Impact Report MUST be added documenting affected templates and files

### Compliance

- All feature plans MUST include Constitution Check section verifying compliance
- Violations MUST be justified in Complexity Tracking table with simpler alternatives rejected
- Development tooling (ESLint, TypeScript) enforces technical standards
- Code reviews MUST verify constitution compliance
- Unapproved patterns MUST NOT be introduced without amendment

### Version Control

This constitution is version-controlled alongside code. Changes require:

- Documentation in Sync Impact Report
- Review of dependent templates and documentation
- Update of affected guidance files

**Version**: 1.0.0 | **Ratified**: 2025-11-01 | **Last Amended**: 2025-11-01
