# Job Application Tracker

A lightweight React + Tailwind CSS dashboard that feels like a Google Sheet / Airtable hybrid to keep every job search detail in one place.

## Getting started

1. Install dependencies and start the Vite dev server.
   ```bash
   npm install
   npm run dev
   ```
   The tracker will be available at the URL printed in the terminal.
2. Capture company, role, job link, applied status, recruiter outreach, follow-up date, priority, and document links for the resume + cover letter used via the **Add new application** modal.
3. Filter by search or priority, mark roles as applied, edit details, and remove entries as your pipeline evolves.
4. When you are ready to host the app, build the production bundle.
   ```bash
   npm run build
   ```

All data is stored in `localStorage`, so nothing leaves your browser.
