# SparshOS Portfolio — Test Report

Date: 2026-05-20

## What I ran

- `npm run lint` → PASS
- `npm run build` → PASS
- `npm audit --audit-level=moderate` → PASS, 0 vulnerabilities
- Production server: `npm run start` → PASS, running at `http://localhost:3000`
- HTTP smoke tests:
  - `/` returns 200 and contains the SparshOS/Next app markup → PASS
  - `/resume.pdf` returns 200 with `application/pdf` → PASS
- Source/feature checks:
  - Core terminal commands present → PASS
  - Tab/autocomplete/history keyboard support present → PASS
  - Project dossiers present → PASS
  - Terminal input has an accessible label → PASS
  - Placeholder contact info check → FAIL: placeholder email/social handles remain

## Main findings

The site is technically healthy: it builds cleanly, TypeScript passes, the production server starts, and no npm vulnerabilities were reported.

The main weakness is content readiness: contact/social links are placeholders, and the terminal still says the resume is a placeholder even though `public/resume.pdf` exists.

## Recommended improvements

### High priority

1. Replace placeholder contact values in `lib/portfolioData.ts`:
   - `your.email@example.com`
   - `https://github.com/your-handle`
   - `https://linkedin.com/in/your-handle`
   - `https://x.com/your-handle`

2. Update the `resume` command copy. It currently says:
   - `Resume placeholder: /resume.pdf`
   - `Add your PDF at public/resume.pdf.`

   Since a PDF exists, this should become something like:
   - `Resume: /resume.pdf`
   - `Open or download it from the resume link.`

3. Make contact/social/resume outputs clickable. Right now they are terminal text only. This is charming, but recruiters expect clickable links.

### Medium priority

4. Add basic automated tests. Suggested cases:
   - command list contains all public commands
   - `project egonav`, `project verdantia`, `project raptorgang` render a project card
   - invalid project shows an error
   - `ls`, `cd`, `cat`, and `pwd` behave correctly
   - `clear` empties the terminal
   - keyboard history works with ↑/↓
   - Tab autocomplete works for commands and file paths

5. Extract terminal command logic out of `TerminalOS.tsx` into a pure command engine module. This would make the app much easier to test.

6. Add SEO/social metadata:
   - Open Graph title/description/image
   - Twitter card metadata
   - favicon/app icon

### UX polish

7. Add a visible hint after boot: “Try: projects, project egonav, contact, resume”. The current tips are good, but a recruiter should immediately know the fastest path.

8. Add a reduced-motion mode using `prefers-reduced-motion` for boot animation, particles, smooth scroll, and cursor pulse.

9. Add a small non-terminal fallback section or command shortcuts for visitors who do not understand terminal UIs.

10. Consider a “skip boot” affordance. The boot sequence is fun, but repeat visitors/recruiters may want immediate access.

## Overall verdict

Strong concept and clean implementation. It already passes the important technical checks. Before sharing publicly, fix placeholders and make the key conversion paths — contact, resume, project links — faster and clickable.
