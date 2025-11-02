# Feature Specification: SessionSetup workspace

**Feature Branch**: `1-batch-process-specs/session-setup`
**Created**: 2025-11-02
**Status**: Draft
**Input**: Generate a feature spec for the SessionSetup workspace based on `prompts/processes_list.md`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Configure templates and group rules (Priority: P1)

A program lead or instructional designer configures session templates and group rules used when creating sessions.

**Why this priority**: Templates ensure consistent session structure; group rules enforce expected behaviors during execution.

**Independent Test**: As a program lead, create or edit a template, save it, and confirm it becomes selectable when creating a new session.

**Acceptance Scenarios**:
1. **Given** SessionSetup view, **When** program lead saves a new template, **Then** the template appears in the template selector for session creation.
2. **Given** group rules updated, **When** a session is created using that template, **Then** the session reflects the configured rules.

---

### Edge Cases

- Template validation: invalid template fields should prevent saving and show clear errors.

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: The system MUST allow authorized users to create, edit, and delete session templates.
- **FR-002**: The system MUST allow configuration of group rules (e.g., roles, time limits) per template.
- **FR-003**: The system MUST surface templates during session creation.
- **FR-004**: Template changes SHOULD be versioned or clearly labeled to avoid confusion.

### Key Entities
- **Template**: id, name, fields, rules, version
- **GroupRule**: id, templateId, ruleType, parameters

## Success Criteria *(mandatory)*

- **SC-001**: Templates created by program leads are selectable in session creation UI 100% of the time in manual tests.
- **SC-002**: At least 95% of template saves succeed without validation errors in test scenarios.

## Assumptions
- Program leads have the authorization to manage templates.
- Templates are text-based structured definitions stored in the repository database.

## Examples
- Create a "Retrospective" template with sections: Agenda, Notes, Action Items; confirm availability when creating a session.

## Next steps
1. Confirm template field schema and any constraints.

*End of draft*