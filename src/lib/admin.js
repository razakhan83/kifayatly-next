function normalizeEmail(email) {
  return (email || "").trim().toLowerCase();
}

function getConfiguredAdminEmails() {
  const emails = [
    process.env.ADMIN_EMAIL,
    ...(process.env.ADMIN_EMAILS || "").split(","),
  ]
    .map(normalizeEmail)
    .filter(Boolean);

  return Array.from(new Set(emails));
}

function isAdminEmail(email) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return false;
  return getConfiguredAdminEmails().includes(normalizedEmail);
}

export { getConfiguredAdminEmails, isAdminEmail, normalizeEmail };
