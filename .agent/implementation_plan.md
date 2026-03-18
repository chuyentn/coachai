# Plan: 3-Agent AI Team Setup (PM, FE, BE)

This plan outlines how to configure three separate Antigravity instances (or profiles) to act as a coordinated development team for the `edu-vibe-code-coaching` project.

## Proposed Strategy

We will use **Profiles** in Antigravity to maintain separate contexts and identities. Each profile will have a specific set of active skills and a dedicated [.cursorrules](file:///d:/AI-KILLS/edu-vibe-code-coaching/.agent/roles/pm.cursorrules) file (or instructions in the Agent settings) to define its "personality" and responsibilities.

### 1. Victor (Project Manager & Leader)
**Goal:** High-level planning, task tracking, and architectural review.
- **Key Skills:**
    - `@brainstorming`: For initial feature design.
    - `@concise-planning`: To break down tasks into [task.md](file:///C:/Users/Victor%20Chuyen/.gemini/antigravity/brain/c516a7b7-1d78-486b-9af8-3f773736c191/task.md).
    - `@team-collaboration-standup-notes`: To summarize progress.
- **Responsibilities:**
    - Manages [task.md](file:///C:/Users/Victor%20Chuyen/.gemini/antigravity/brain/c516a7b7-1d78-486b-9af8-3f773736c191/task.md) and [implementation_plan.md](file:///C:/Users/Victor%20Chuyen/.gemini/antigravity/brain/c516a7b7-1d78-486b-9af8-3f773736c191/implementation_plan.md).
    - Coordinates between Lucky and Money.
    - Reviews PRs and ensures architectural consistency.

### 2. Lucky (Frontend Engineer)
**Goal:** Building responsive, premium UI components and managing client-side state.
- **Key Skills:**
    - `@nextjs-best-practices`: For App Router and Server Components optimization.
    - `@react-patterns`: For clean, reusable component logic.
    - `@tailwind-patterns`: For consistent and beautiful styling.
- **Responsibilities:**
    - Works within `src/components`, `src/pages`, and `public`.
    - Implements UI based on Victor's specs.
    - Consumes APIs built by Money.

### 3. Money (Backend Engineer)
**Goal:** API development, database management, and server-side logic.
- **Key Skills:**
    - `@nodejs-backend-patterns`: For robust Express/Node.js logic.
    - `@postgres-best-practices`: For optimized database queries (Supabase/PostgreSQL).
    - `@api-design-principles`: For clean REST/GraphQL interfaces.
- **Responsibilities:**
    - Works within `firebase-backend`, `functions`, and server-side files.
    - Manages SQL migrations and DB schema.
    - Ensures security and performance of the data layer.

---

## Proposed Changes

### Configuration
#### [NEW] [shared.cursorrules](file:///d:/AI-KILLS/edu-vibe-code-coaching/.agent/roles/shared.cursorrules)
#### [MODIFY] [pm.cursorrules](file:///d:/AI-KILLS/edu-vibe-code-coaching/.agent/roles/pm.cursorrules)
#### [MODIFY] [fe.cursorrules](file:///d:/AI-KILLS/edu-vibe-code-coaching/.agent/roles/fe.cursorrules)
#### [MODIFY] [be.cursorrules](file:///d:/AI-KILLS/edu-vibe-code-coaching/.agent/roles/be.cursorrules)

> [!TIP]
> **Dual-Language Support:** Tất cả các file quy tắc đều hỗ trợ song ngữ. Phần Tiếng Việt dành cho bạn (Nocode) và phần Tiếng Anh để đảm bảo AI hiểu sâu sắc các yêu cầu kỹ thuật và kiến trúc.

### Documentation
#### [MODIFY] [task.md](file:///d:/AI-KILLS/edu-vibe-code-coaching/task.md) (Shared Team Board)

---

## Verification Plan

### Automated Tests
- Run `npm test` after each role completes a major task.
- Use `@lint-and-validate` to ensure code quality across all roles.

### Manual Verification
1.  **Handoff Test:** Victor creates a task in `task.md`. Money implements the API. Lucky implements the UI. Verify the flow works from start to finish.
2.  **Context Isolation Test:** Verify that the Lucky agent does not accidentally modify Backend-only logic (and vice-versa).
