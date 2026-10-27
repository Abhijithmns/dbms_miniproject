# Changelog

All notable changes to the Next.js version of the Notebook template are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this template follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.2] - 2026-10-23

### Fixed

- The newsletter confirmations on the home and subscribe pages no longer say the form is a demo and nothing
  was sent. They now tell the reader to look out for a confirmation email, as in the HTML version. `DOCS.md`
  describes the wording.

## [1.0.1] - 2026-10-14

### Security

- Next.js 16.4.1, which fixes two critical remote code execution vulnerabilities (in `use cache` functions
  returning typed arrays, and in the Image Optimization API with SVG files) and a denial of service in Server
  Actions. The static demo build isn't affected, but update if you deploy this template to a Node.js server.

## [1.0.0] - 2026-10-10

### Added

- Initial release: the Next.js 16 (App Router, static export) port of the Notebook HTML template, with 10
  routes: Home, Post, Archive, Tags, Series, Search, About, Projects, Subscribe and the 404 page.
- Code blocks with a language label, a copy button and a syntax theme for light and dark mode
- Table of contents that highlights the section you are reading, plus heading links that copy the section's address
- Reading progress bar and a reading time counted from the text
- Series box and older/newer post links built from one post index (`src/data/posts.ts`)
- Archive grouped by year with jump links
- Tag browser with shareable `?tag=` links (any case, unknown tags ignored)
- Instant search over titles, summaries, tags and series, with highlighted matches and a `/` shortcut from any page
- Dark mode that remembers the choice, with no flash on load
- Validated newsletter forms, an RSS address with a copy button and an accessible mobile menu
- Graph-paper design with hand-made SVG illustrations, self-hosted fonts, scroll reveals that respect
  reduced motion and a back-to-top button
