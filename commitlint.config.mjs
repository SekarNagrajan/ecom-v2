// Created by Sekar Nagarajan (2026-11-12 23:10)
/**
 * Conventional Commits, matching the existing history (`feat(admin): …`, `refactor(admin): …`).
 * Body/footer line length is not enforced so wrapped explanations and trailer lines are accepted.
 */
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "body-max-line-length": [0],
    "footer-max-line-length": [0],
    "subject-case": [0],
    "header-max-length": [2, "always", 120],
  },
};
