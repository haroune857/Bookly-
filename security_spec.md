# Security Specification & Invariants

## 1. Data Invariants
- **User Document Integrity**: A user can only create or update their own user record (`/users/{userId}` where `userId == request.auth.uid`).
- **Project Ownership**: An ebook project at `/projects/{projectId}` can only be created, modified, or deleted by its designated creator (`resource.data.userId == request.auth.uid` or `incoming().userId == request.auth.uid`).
- **Admin Configuration**: Only authenticated administrators can modify global platform parameters in `/admin_config/{configId}`.
- **Size Bounds**: String lengths and document keys must strictly conform to bounds defined in `firebase-blueprint.json` to prevent Denial of Wallet and payload injection.

## 2. The Dirty Dozen Payloads (Rejection Matrix)
1. **Unauthenticated User Read/Write**: Unauthenticated request attempting to read/write `/users/{userId}` -> `PERMISSION_DENIED`.
2. **Identity Spoofing**: Authenticated user trying to write `/users/anotherUser` with `request.auth.uid != anotherUser` -> `PERMISSION_DENIED`.
3. **Admin Privilege Escalation**: Regular user setting `isAdmin: true` in user profile -> `PERMISSION_DENIED`.
4. **Foreign Project Hijacking**: User A attempting to update or delete User B's project -> `PERMISSION_DENIED`.
5. **Oversized String Injection**: Payload containing a 1MB title or description exceeding defined bounds -> `PERMISSION_DENIED`.
6. **Path Traversal / ID Poisoning**: Document ID with special illegal characters or overly long strings -> `PERMISSION_DENIED`.
7. **Ghost Field Injection**: Adding arbitrary undocumented fields on update -> `PERMISSION_DENIED`.
8. **Immutable Field Tampering**: Modifying `createdAt` or `userId` after creation -> `PERMISSION_DENIED`.
9. **Blanket Query Scraping**: Attempting an unrestricted list query across all private users without ownership constraint -> `PERMISSION_DENIED`.
10. **Orphaned Sub-Resource Write**: Creating a project with mismatched `userId` -> `PERMISSION_DENIED`.
11. **Spoofed Email Claim Write**: Attempting admin write with unverified email when email verification is required -> `PERMISSION_DENIED`.
12. **Status Transition Bypass**: Overwriting a locked or completed entity with invalid lifecycle states -> `PERMISSION_DENIED`.
