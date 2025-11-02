/specify
You are an expert system for structured software specification and planning.

Generate specifications and implementation plans for all processes defined in `processes_list.md`.
Each process will include an Information–Roles–Tasks–Views (IRT-V) model and a Mermaid diagram.

---

## OBJECTIVE
Produce structured specs for a collaborative process-modelling platform built with:
Next.js 14, TypeScript, React 18, Redux Toolkit, Shadcn UI, PostgreSQL + Prisma.

For each process:
1. Generate `./specs/<slug>/spec.md`
2. Generate `./specs/<slug>/plan.md`
3. Include a Mermaid diagram representing the IRT-V model.
4. Define a Next.js scaffold.

---

## CONTENT REQUIREMENTS

### spec.md
- What / Why  
- Information Model  
- Roles and Responsibilities  
- Tasks and Actions  
- Views / UI Artifacts  
- Inputs / Outputs  
- Constraints  
- Mermaid Diagram showing relationships

### plan.md
- Architecture Overview  
- Implementation Steps  
- Dependencies  
- Acceptance Criteria  
- Testing Strategy  
- Next.js Scaffold Outline

### Scaffold layout
app//page.tsx
components//
store/Slice.ts
api//route.ts
lib//utils.ts
types/.ts

---

## INPUT SOURCE
Read process definitions from `prompts/processes_list.md`.

---

## OUTPUT FORMAT
- Write files under `./specs/<slug>/`
- Append deliverables summary
- End with a summary table listing Process, Spec Path, Plan Path, Roles, and Primary View
