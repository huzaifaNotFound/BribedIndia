# BribedIndia

**Making corruption visible through data.**

BribedIndia is a civic-tech platform designed to bring transparency to bribery and institutional injustice across India. It enables people to report incidents and explore aggregated data through interactive maps, statistics, and visualizations.

The project aims to make patterns of corruption easier to understand by connecting reports with their locations, departments, public services, and categories. Rather than focusing on accusations against individuals, BribedIndia emphasizes data-driven transparency, accountability, and institutional patterns.

## Features

- **Interactive India Map** — Explore state-wise bribery reports through a choropleth map that visualizes the distribution of reported incidents.
- **Corruption Dashboard** — View aggregated statistics, including total reports, verified reports, and reports awaiting review.
- **Latest Reports** — Explore recent submissions and understand the types of incidents being reported.
- **State and Department Analysis** — Compare reporting patterns across states, departments, and public services.
- **Data Visualizations** — Examine trends over time and the distribution of reports across categories.
- **Report Verification** — Distinguish between unverified, corroborated, and manually verified reports.
- **Anonymous Reporting** — Support reporting without publicly exposing the identity of the reporter.
- **AI-Assisted Analysis** — Potentially assist with categorization, duplicate detection, and report summarization without treating AI output as proof of an allegation.

## Verification System

BribedIndia separates submitted allegations from corroborated patterns and verified reports.

| Status | Meaning |
|---|---|
| Unverified | A report has been submitted but has not yet been corroborated. |
| Corroborated | Similar reports from independent sources indicate a potential pattern requiring review. |
| Verified | An authorized reviewer has manually confirmed the report according to the platform's verification process. |

Multiple similar reports can indicate a pattern, but they do not independently establish that an allegation is true. Verification requires a separate review process.

## Design Philosophy

BribedIndia uses a restrained, data-journalism-inspired visual direction focused on clarity and credibility.

- Off-white and near-black foundations with mustard-yellow accents.
- Editorial typography combining serif display headings with clean sans-serif text.
- Minimal interface elements, fine dividing lines, and data-dense tables.
- Interactive geographic visualizations and clear statistical hierarchies.
- A deliberate emphasis on evidence and institutional patterns rather than sensationalism.

## Tech Stack

The planned technology stack includes:

- **Frontend:** React, Vite, Tailwind CSS
- **Backend and Database:** Supabase and PostgreSQL
- **Authentication and Access Control:** Supabase Auth and Row Level Security
- **Geographic Visualization:** Leaflet with OpenStreetMap, or an equivalent mapping solution
- **AI Integration:** Optional AI-assisted categorization, duplicate detection, and summarization

*The stack above describes the planned architecture; update it to reflect the technologies actually implemented in the current version.*

## Project Goals

1. Make information about reported bribery more accessible.
2. Reveal geographic and institutional patterns through aggregated data.
3. Establish a transparent process for reviewing and verifying reports.
4. Encourage informed civic participation.
5. Present sensitive allegations responsibly, without equating a submission with proven wrongdoing.

## Responsible Reporting

BribedIndia is intended to support transparency, not public harassment or unsubstantiated accusations. Reports should be handled with appropriate privacy protections, moderation, and verification procedures. Public visualizations should communicate the limitations of the underlying data.

## Status

BribedIndia is a civic-tech project focused on exploring how interactive data visualization and responsible reporting can improve public understanding of corruption in India.

---

**BribedIndia — Transparency through data.**