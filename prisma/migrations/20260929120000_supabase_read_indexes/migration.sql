-- Additive indexes for authentication, tenant resolution and client history.
-- These statements preserve all existing rows and migration history.
CREATE INDEX "session_userId_idx" ON "session"("userId");
CREATE INDEX "account_userId_idx" ON "account"("userId");
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");
CREATE INDEX "member_userId_idx" ON "member"("userId");
CREATE INDEX "audit_log_organizationId_createdAt_idx" ON "audit_log"("organizationId", "createdAt");
CREATE INDEX "audit_log_organizationId_target_idx" ON "audit_log"("organizationId", "target");
