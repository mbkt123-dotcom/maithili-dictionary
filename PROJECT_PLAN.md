# Maithili Dictionary Platform - Enhanced Project Plan

## 1. Project Overview

### Core Purpose
- Multi-dictionary Maithili dictionary platform
- Workflow management for dictionary creation and curation
- Public contribution via edit suggestions
- Multi-format PDF export
- Embedded in MLRC website
- Web-first, mobile-ready

### Key Features
- 7-8 dictionary sources (Maithili to Hindi, English, etc.)
- Main dictionary by Maithili Linguistics Research Council (default)
- Dynamic parameter system (15± parameters, configurable)
- Multi-language parameter entries
- Sub-words and compound words
- Cross-referencing between words
- Public edit suggestions (email + mobile)
- Social authentication (Google, Facebook, Instagram, Twitter)
- Role-based workflow
- Autocomplete search
- Tabbed word detail interface
- 4 PDF export formats
- Role-specific dashboards
- Embedded in parent website

---

## 2. Technology Stack

### Frontend
- **Framework**: Next.js 14+ (App Router) for SSR/SSG and embedding
- **UI**: Tailwind CSS + shadcn/ui (sober, clean design)
- **State**: Zustand or React Context
- **Forms**: React Hook Form + Zod
- **Search**: Algolia or Elasticsearch (autocomplete)
- **PDF viewer**: react-pdf
- **Authentication**: NextAuth.js (social logins)
- **Mobile**: PWA + React Native (future)

### Backend
- **Framework**: Node.js with Express or Next.js API routes
- **Database**: PostgreSQL (primary) + Redis (caching/sessions)
- **ORM**: Prisma
- **File storage**: AWS S3 / Azure Blob
- **Search**: PostgreSQL Full-Text Search + Elasticsearch/Algolia
- **Email**: SendGrid / AWS SES (notifications)
- **SMS**: Twilio (optional, for OTP)

### PDF Generation
- **Library**: Puppeteer (HTML→PDF) or LaTeX
- **Template engine**: Handlebars/Pug

### Authentication
- NextAuth.js (OAuth providers)
- JWT + refresh tokens
- Session management

### Deployment
- **Frontend**: Vercel (Next.js optimized)
- **Backend**: Same as frontend (Next.js API) or separate service
- **Database**: Managed PostgreSQL
- **CDN**: CloudFront / Cloudflare

---

## 3. Enhanced Database Schema

### Core Tables

#### `users`
- id (UUID, PK)
- email (unique, nullable for social logins)
- password_hash (nullable for social logins)
- full_name
- phone (optional)
- role (enum: public, field_researcher, editor, senior_editor, editor_in_chief, admin, super_admin)
- is_active
- auth_provider (enum: email, google, facebook, instagram, twitter)
- provider_id (for social logins)
- avatar_url (optional)
- created_at
- updated_at
- last_login

#### `dictionaries`
- id (UUID, PK)
- name (e.g., "Kalyani Sabd Kosh", "Main Dictionary")
- name_maithili
- source_language (default: 'maithili')
- target_languages (JSON array: ['hindi', 'english'])
- is_main (boolean, default false - MLRC dictionary)
- is_active
- description
- created_at
- updated_at

#### `parameter_definitions` (Dynamic parameter system)
- id (UUID, PK)
- parameter_key (unique, e.g., 'meaning', 'etymology', 'usage')
- parameter_name (display name)
- parameter_name_maithili
- parameter_type (enum: text, rich_text, json, array, multilingual)
- is_multilingual (boolean)
- supported_languages (JSON array: ['hindi', 'english', 'sanskrit', 'tamil'])
- is_required (boolean)
- order_index
- is_active
- can_edit (enum: all, admin_only, super_admin_only)
- created_at
- updated_at

#### `words`
- id (UUID, PK)
- dictionary_id (FK)
- word_maithili (main word)
- word_romanized (optional)
- pronunciation (IPA notation)
- word_type (noun, verb, adjective, etc.)
- parent_word_id (FK to words, nullable - for sub-words)
- is_sub_word (boolean)
- sub_word_order (integer, nullable)
- status (enum: draft, submitted, under_review, approved, rejected, published)
- created_by (FK to users, nullable for public submissions)
- created_at
- updated_at
- approved_at
- approved_by (FK to users)
- version_number
- is_concise (boolean)
- is_published
- view_count (integer, default 0)
- search_count (integer, default 0)

#### `word_parameters` (Flexible multilingual system)
- id (UUID, PK)
- word_id (FK)
- parameter_definition_id (FK to parameter_definitions)
- parameter_key (denormalized for performance)
- language (nullable - null means language-agnostic)
- content_text (text, for simple text)
- content_json (JSONB, for structured/complex data)
- content_rich_text (text, for formatted text)
- order_index
- is_primary (boolean - for multilingual, mark primary entry)
- created_at
- updated_at

#### `word_relationships` (Cross-references)
- id (UUID, PK)
- source_word_id (FK to words)
- target_word_id (FK to words)
- relationship_type (enum: see_also, synonym, antonym, related, derived_from, compound_of, variant_of)
- relationship_note (text, optional)
- is_bidirectional (boolean)
- created_at
- updated_at

#### `edit_suggestions` (Public contribution)
- id (UUID, PK)
- word_id (FK to words, nullable - null means new word suggestion)
- dictionary_id (FK, required - only MLRC main dictionary)
- suggestion_type (enum: edit_existing, add_new_word)
- email (required)
- phone (required)
- name (optional)
- suggestion_data (JSONB - flexible structure for word data)
- parameter_suggestions (JSONB - array of parameter edits)
- status (enum: pending, under_review, approved, rejected)
- reviewed_by (FK to users, nullable)
- reviewed_at (timestamp, nullable)
- review_notes (text, nullable)
- created_at
- updated_at

#### `word_workflow`
- id (UUID, PK)
- word_id (FK)
- current_stage (enum: field_research, editor_review, senior_editor_review, editor_in_chief_review, admin_review, approved)
- assigned_to (FK to users, nullable)
- assigned_by (FK to users)
- status (enum: pending, in_progress, completed, returned)
- comments (text)
- returned_to_stage (enum, nullable)
- return_reason (text, nullable)
- priority (enum: low, medium, high, urgent)
- due_date (nullable)
- created_at
- updated_at
- completed_at

#### `word_revisions`
- id (UUID, PK)
- word_id (FK)
- revision_number
- word_data (JSONB - snapshot of word entry)
- parameter_data (JSONB - snapshot of all parameters)
- revised_by (FK to users)
- revision_reason
- created_at

#### `work_assignments`
- id (UUID, PK)
- word_id (FK)
- assigned_to (FK to users)
- assigned_by (FK to users)
- assignment_type (enum: initial, transfer, review, edit_suggestion_review)
- priority
- due_date (nullable)
- status (enum: pending, in_progress, completed)
- notes
- created_at
- updated_at

#### `word_transfers`
- id (UUID, PK)
- word_id (FK)
- from_user (FK to users)
- to_user (FK to users)
- transfer_reason
- transfer_stage (enum: editor, senior_editor, editor_in_chief)
- created_at

#### `search_suggestions` (Autocomplete cache)
- id (UUID, PK)
- query_text (indexed)
- dictionary_id (FK, nullable)
- suggestions (JSONB - array of word IDs and metadata)
- hit_count (integer)
- last_updated
- created_at

#### `search_history` (Analytics)
- id (UUID, PK)
- user_id (FK, nullable - for logged-in users)
- query_text
- dictionary_id (FK, nullable)
- word_id (FK, nullable - if clicked on result)
- ip_address
- user_agent
- created_at

#### `pdf_exports`
- id (UUID, PK)
- export_type (enum: pocket, concise, volume, descriptive)
- dictionary_id (FK, nullable)
- word_ids (JSONB array, nullable)
- volume_config (JSONB)
- include_cross_references (boolean)
- status (enum: pending, processing, completed, failed)
- file_url
- file_size
- page_count
- created_by (FK to users)
- created_at
- completed_at

#### `audit_logs`
- id (UUID, PK)
- user_id (FK, nullable)
- action_type (enum: create, update, delete, approve, reject, transfer, export, search, view, edit_suggestion)
- entity_type (word, user, dictionary, edit_suggestion, etc.)
- entity_id (UUID)
- changes (JSONB)
- ip_address
- user_agent
- created_at

#### `user_favorites`
- id (UUID, PK)
- user_id (FK)
- word_id (FK)
- created_at
- UNIQUE(user_id, word_id)

#### `user_notes`
- id (UUID, PK)
- user_id (FK)
- word_id (FK)
- note_text (text)
- is_private (boolean, default true)
- created_at
- updated_at

---

## 4. Enhanced User Roles and Permissions

### Public User (not logged in)
- Search words
- View word details
- Submit edit suggestions (email + phone required)
- Cannot add new words
- Cannot see unpublished words

### Public User (logged in via social)
- All public user features
- Add new words (after login)
- Save favorites
- Personal notes
- View search history

### Field Researcher
- All logged-in public user features
- Create new word entries (minimum: word, meaning, context, region)
- View own submitted words
- Edit own drafts (before submission)
- Submit words for review
- Cannot view other users' words

### Editor
- View assigned words
- Complete word entry forms (all parameters)
- Review edit suggestions (if assigned)
- Submit for senior editor review
- Return to field researcher with comments
- Transfer work to other editors
- View own dashboard

### Senior Editor
- Review editor-submitted words
- Review edit suggestions
- Approve and forward to Editor-in-Chief
- Return to editor with comments
- Transfer work to other senior editors
- View dashboard

### Editor-in-Chief
- Final review of words
- Approve for dictionary inclusion
- Reject words
- Return to senior editor or editor
- View dashboard

### Admin
- Periodic word induction (bulk approve)
- User management (except super admin)
- Dictionary management
- Parameter definition management (add/edit/disable parameters)
- View statistics
- Cannot view entire word list
- Cannot export PDFs

### Super Admin
- All admin permissions
- View entire word list
- Export PDFs in all formats
- System configuration
- User role management
- Full audit log access
- Parameter definition full control

---

## 5. Enhanced Workflow System

### Main Workflow
```
1. Field Research / Public Submission
   ↓ (submit)
2. Editor Review
   ↓ (complete & submit)
3. Senior Editor Review
   ↓ (approve & forward)
4. Editor-in-Chief Review
   ↓ (approve)
5. Admin Review (periodic induction)
   ↓ (induct)
6. Published
```

### Edit Suggestion Workflow
```
1. Public submits edit suggestion (email + phone)
   ↓
2. Admin/Editor reviews suggestion
   ↓ (if approved)
3. Creates word entry or updates existing word
   ↓
4. Enters normal workflow
```

### Sub-word Workflow
- Sub-words can be created independently or linked to parent
- Parent word approval can trigger sub-word review
- Sub-words appear under parent in UI
- Sub-words can have their own workflow

---

## 6. Enhanced API Design

### Authentication
```
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/me
GET  /api/auth/providers
POST /api/auth/oauth/:provider
GET  /api/auth/oauth/:provider/callback
```

### Dictionaries
```
GET    /api/dictionaries
GET    /api/dictionaries/:id
POST   /api/dictionaries (admin only)
PUT    /api/dictionaries/:id (admin only)
DELETE /api/dictionaries/:id (admin only)
```

### Words
```
GET    /api/words
GET    /api/words/:id
GET    /api/words/:id/full
POST   /api/words
PUT    /api/words/:id
DELETE /api/words/:id (admin only)
GET    /api/words/:id/sub-words
GET    /api/words/:id/relationships
POST   /api/words/:id/relationships
```

### Search & Autocomplete
```
GET    /api/search?q=...&dictionary=...&limit=...
GET    /api/search/autocomplete?q=...&dictionary=...&limit=10
GET    /api/search/suggestions?q=...
POST   /api/search/history
GET    /api/search/history
```

### Edit Suggestions
```
POST   /api/edit-suggestions
GET    /api/edit-suggestions
GET    /api/edit-suggestions/:id
PUT    /api/edit-suggestions/:id/review
POST   /api/edit-suggestions/:id/approve
POST   /api/edit-suggestions/:id/reject
```

### Parameters (Dynamic System)
```
GET    /api/parameters
GET    /api/parameters/:id
POST   /api/parameters (admin/super admin)
PUT    /api/parameters/:id (admin/super admin)
DELETE /api/parameters/:id (super admin only)
GET    /api/words/:id/parameters
POST   /api/words/:id/parameters
PUT    /api/words/:id/parameters/:paramId
DELETE /api/words/:id/parameters/:paramId
```

### Word Relationships
```
GET    /api/words/:id/relationships
POST   /api/words/:id/relationships
PUT    /api/relationships/:id
DELETE /api/relationships/:id
GET    /api/words/:id/synonyms
GET    /api/words/:id/related-words
GET    /api/words/:id/cross-references
```

### Workflow
```
POST   /api/words/:id/submit
POST   /api/words/:id/assign
POST   /api/words/:id/transfer
POST   /api/words/:id/approve
POST   /api/words/:id/reject
POST   /api/words/:id/return
GET    /api/words/:id/workflow
GET    /api/words/:id/revisions
GET    /api/words/:id/revisions/:revId
POST   /api/words/:id/revisions/:revId/restore
```

### Dashboard
```
GET    /api/dashboard/stats
GET    /api/dashboard/my-drafts
GET    /api/dashboard/pending-reviews
GET    /api/dashboard/assigned-words
GET    /api/dashboard/edit-suggestions
GET    /api/dashboard/recent-activity
```

### User Features
```
GET    /api/user/favorites
POST   /api/user/favorites/:wordId
DELETE /api/user/favorites/:wordId
GET    /api/user/notes
POST   /api/user/notes
PUT    /api/user/notes/:id
DELETE /api/user/notes/:id
GET    /api/user/search-history
```

### PDF Export
```
POST   /api/exports/pdf (super admin only)
GET    /api/exports
GET    /api/exports/:id
GET    /api/exports/:id/download
GET    /api/exports/:id/status
```

---

## 7. Enhanced Frontend Structure

### Pages/Routes
```
/ (home - embedded dictionary search)
/search (advanced search with filters)
/dictionary/:id (dictionary view)
/word/:id (word detail page with tabs)
/login (with social login options)
/register (if email/password registration allowed)
/dashboard (role-based)
  /dashboard/my-words
  /dashboard/reviews
  /dashboard/assignments
  /dashboard/edit-suggestions
  /dashboard/stats
  /dashboard/favorites
/words/create
/words/:id/edit
/edit-suggestion
/edit-suggestion/:id
/admin
  /admin/users
  /admin/dictionaries
  /admin/parameters
  /admin/exports
  /admin/settings
  /admin/analytics
```

### Components Structure
- Search components (SearchBar, AutocompleteDropdown, SearchFilters, etc.)
- Word components (WordCard, WordDetail, WordTabs, etc.)
- Form components (WordForm, ParameterInput, MultilingualInput, etc.)
- Workflow components (WorkflowTracker, AssignmentPanel, etc.)
- Dashboard components (DashboardStats, MyWordsList, etc.)
- PDF components (PDFExportModal, PDFFormatSelector, etc.)
- User components (FavoritesList, PersonalNotes, etc.)
- UI components (Header, Footer, Navigation, etc.)

---

## 8. Enhanced Search and Autocomplete

### Autocomplete Implementation
- Real-time suggestions as user types
- Debounced API calls (300ms delay)
- Cache recent searches in Redis
- Elasticsearch/Algolia for fast suggestions
- Show: word, dictionary, brief meaning
- Highlight matching characters
- Keyboard navigation (arrow keys, enter)

### Search Features
- Full-text search across all dictionaries
- Filter by dictionary
- Filter by word type
- Filter by language
- Search in specific parameters
- Fuzzy matching for typos
- Search history
- Recent searches
- Popular searches

---

## 9. Enhanced Word Detail Page

### Tab Structure
1. **Overview** - Standard info, primary meanings
2. **Meanings** - Detailed meanings in all languages
3. **Synonyms** - List of synonyms with links
4. **Related Words** - Antonyms, derived words, compounds
5. **Sub-words** - Hierarchical display of sub-words
6. **Examples** - Usage examples and sentences
7. **Etymology** - Word origin and historical development
8. **Cross-references** - "See also" references
9. **Additional Info** - Cultural context, regional variants, images/audio

### UI Design Principles
- Clean, minimal interface
- Sober color palette (whites, grays, subtle accents)
- Clear typography hierarchy
- Ample whitespace
- Consistent spacing
- Subtle shadows and borders
- Smooth transitions
- Accessible (WCAG 2.1 AA)

---

## 10. Sub-words and Compound Words

### Data Model
- `parent_word_id` in words table
- `is_sub_word` boolean flag
- `sub_word_order` for ordering

### UI Display
- Hierarchical tree view
- Expandable/collapsible sub-words
- Indentation to show hierarchy
- Breadcrumb navigation
- "Parent word" link in sub-word view
- "Sub-words" section in parent word view

---

## 11. Cross-referencing System

### Implementation
- `word_relationships` table
- Relationship types: see_also, synonym, antonym, related, derived_from, compound_of, variant_of
- Bidirectional relationships where applicable

### UI Display
- "See also" section in word detail
- Clickable links to referenced words
- Relationship type indicators
- In PDF: page numbers for cross-references

---

## 12. Dynamic Parameter System

### Parameter Definition Management
- Admin/Super Admin can add/edit/disable parameters
- Parameters can be multilingual
- Parameters can be required/optional
- Parameters have types (text, rich_text, json, array, multilingual)
- Parameters have order/index for display

### Multilingual Parameter Handling
- Each parameter can have entries in multiple languages
- Language selector for each multilingual parameter
- Primary language indicator
- Display all languages or selected language
- Language toggle in UI

---

## 13. Edit Suggestions System

### Public Submission Flow
1. User searches word (or wants to add new)
2. Clicks "Suggest edit" or "Add new word"
3. Form requires: Email (required), Phone (required), Name (optional), Word data
4. Submission creates `edit_suggestion` record
5. User receives confirmation email
6. Admin/Editor reviews suggestion
7. If approved, word entry created/updated
8. User notified of approval/rejection

---

## 14. Social Authentication

### Supported Providers
- Google
- Facebook
- Instagram
- Twitter/X

### Implementation
- NextAuth.js for OAuth
- Provider-specific configurations
- User profile sync (name, email, avatar)
- Account linking (multiple providers to one account)

---

## 15. Enhanced PDF Export System

### Export Types

#### 1. Pocket Dictionary
- Size: Standard pocket (4" x 6")
- Content: Word + primary meaning
- Cross-references: "See p. X" format
- Layout: 2-3 columns
- Index: Alphabetical at end

#### 2. Concise Dictionary
- Size: Between A6 and A5 (5.8" x 8.3")
- Content: Word + meanings + brief usage
- Cross-references: Included
- Layout: 2 columns
- Words: Only `is_concise = true`

#### 3. Volume Dictionary (Standard)
- Size: A4
- Content: All parameters
- Cross-references: Full with page numbers
- Layout: Single column
- Multi-volume: Configurable pages per volume
- Index: Per volume + master index

#### 4. Descriptive Dictionary (Premium)
- Size: A4
- Content: All parameters + images
- Cross-references: Full with page numbers
- Layout: Rich formatting
- Print quality: High resolution
- Multi-volume: Based on content
- Premium formatting

### PDF Formatting Specifications

#### Typography
- **Headwords**: Bold, 12–14pt (adjust for page size)
- **Body text**: Regular, 9–11pt
- **Pronunciation**: Italic, 8–9pt
- **Examples**: Italic, 9–10pt
- **Cross-refs**: Small caps or italic, 8pt
- **Maithili script**: Appropriate Unicode font (Noto Sans Devanagari, etc.)

#### Layout Standards
- **Guide words**: Top of each page showing first and last headword
- **Running headers**: Letter range (A–B, C–D, etc.)
- **Page numbers**: Consistent placement
- **Column layout**: 2–3 columns per page (depending on page size)
- **Entry spacing**: Clear separation between entries
- **Indentation hierarchy**: Sub-entries indented (hanging indent)

#### Entry Structure (Standard Order)
1. Headword (bold)
2. Pronunciation (brackets/slashes)
3. Part of speech (abbreviation)
4. Inflectional forms (if applicable)
5. Definitions (numbered/lettered)
6. Example sentences
7. Usage notes
8. Etymology
9. Related forms (derivatives)
10. Cross-references

#### PDF Configuration
```json
{
  "pocket": {
    "pageSize": {"width": "4in", "height": "6in"},
    "columns": 2,
    "typography": {
      "headword": {"font": "bold", "size": "11pt", "color": "#000000"},
      "pronunciation": {"font": "italic", "size": "8pt", "color": "#666666"},
      "definition": {"font": "regular", "size": "9pt", "color": "#000000"}
    },
    "elements": {
      "includeGuideWords": true,
      "includeRunningHeaders": true,
      "includePageNumbers": true,
      "includeIndex": true,
      "crossReferenceFormat": "See {word}, p. {page}"
    }
  },
  "concise": {
    "pageSize": {"width": "5.8in", "height": "8.3in"},
    "columns": 2
  },
  "volume": {
    "pageSize": "A4",
    "columns": 1,
    "pagesPerVolume": 500
  },
  "descriptive": {
    "pageSize": "A4",
    "includeImages": true,
    "highQuality": true
  }
}
```

---

## 16. Website Embedding

### Integration Approach
- Next.js allows embedding as a route
- Shared header/footer via layout components
- CSS isolation to prevent conflicts
- Shared navigation state

### Implementation
```
mlrc-website/
├── app/
│   ├── layout.tsx (shared header/footer)
│   ├── page.tsx (home)
│   ├── dictionary/
│   │   └── [...slug]/page.tsx (dictionary app routes)
│   └── other pages...
```

---

## 17. Additional UX Enhancements

### User Features
1. **Favorites/bookmarks** - Save words for quick access
2. **Personal notes** - Add private notes on words
3. **Search history** - View recent searches
4. **Word of the day** - Featured word on homepage
5. **Share functionality** - Share word links
6. **Print-friendly view** - Clean print layout
7. **Dark mode** (optional) - Toggle light/dark theme
8. **Accessibility** - Keyboard navigation, screen reader support
9. **Performance** - Lazy loading, image optimization, code splitting
10. **Analytics** - Popular words, search trends, user engagement

---

## 18. Enhanced Backend User Experience

### Dashboard Enhancements
1. **Workload overview** - Assigned words count, pending reviews, overdue items
2. **Quick actions** - Quick assign, bulk operations, keyboard shortcuts
3. **Notifications** - New assignments, review requests, approvals/rejections
4. **Collaboration** - Comments/threads, @mentions, activity feed
5. **Advanced filters** - Filter by status, date range, dictionary, word type
6. **Bulk operations** - Bulk assign, approve, transfer, export
7. **Reporting** - Work statistics, performance metrics, quality metrics
8. **Parameter management UI** - Visual parameter editor, drag-and-drop ordering

---

## 19. Security Enhancements

### Additional Security Measures
1. **Rate limiting** - Search rate limits, API rate limits, edit suggestion limits
2. **Input validation** - Sanitize all inputs, validate email/phone formats, prevent XSS/SQL injection
3. **File upload security** - File type validation, size limits, virus scanning (optional)
4. **Audit logging** - All actions logged, IP tracking, change tracking
5. **Data privacy** - GDPR compliance, data export, data deletion, privacy policy

---

## 20. Development Phases

### Phase 1: Foundation (Weeks 1-4)
- Database setup with all tables
- Authentication system (social logins)
- Basic user management
- Dictionary CRUD
- Parameter definition system
- Basic word entry form

### Phase 2: Core Features (Weeks 5-8)
- Dynamic parameter system
- Multilingual parameter handling
- Word entry workflow
- Sub-word system
- Basic search with autocomplete
- Role-based dashboards

### Phase 3: Public Features (Weeks 9-10)
- Public search interface
- Edit suggestion system
- Word detail page with tabs
- Cross-referencing system
- Social authentication integration

### Phase 4: Workflow (Weeks 11-14)
- Complete workflow system
- Transfer functionality
- Revision control
- Comments and returns
- Edit suggestion review workflow

### Phase 5: Advanced Features (Weeks 15-18)
- PDF export (all 4 types)
- Cross-reference page numbering
- Advanced search
- Statistics and reporting
- User features (favorites, notes)

### Phase 6: Integration (Weeks 19-20)
- Website embedding
- Shared header/footer
- Theme integration
- Navigation integration

### Phase 7: Polish (Weeks 21-24)
- UI/UX refinement (sober, clean design)
- Performance optimization
- Testing (unit, integration, e2e)
- Documentation
- Accessibility improvements

### Phase 8: Mobile (Weeks 25-28)
- Mobile app development
- Offline functionality
- Sync system
- Mobile-specific features

---

## 21. File Structure

```
maithili-dictionary/
├── app/ (Next.js App Router)
│   ├── layout.tsx
│   ├── page.tsx
│   ├── word/[id]/page.tsx
│   ├── search/page.tsx
│   ├── dashboard/[section]/page.tsx
│   ├── admin/[section]/page.tsx
│   └── api/ (API routes)
├── components/
│   ├── search/
│   ├── word/
│   ├── forms/
│   ├── workflow/
│   ├── dashboard/
│   ├── pdf/
│   ├── ui/
│   └── layout/
├── lib/
│   ├── db/
│   ├── auth/
│   └── utils/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/
├── storage/
│   └── pdfs/
└── types/
```

---

## 22. Additional Considerations

### Internationalization (i18n)
- UI languages: Maithili, Hindi, English
- Language switcher
- RTL support if needed
- Date/time localization
- Number formatting

### Performance Optimization
- Redis caching (search results, autocomplete)
- Database indexing (all searchable fields)
- CDN for static assets
- Image optimization (WebP, lazy loading)
- Code splitting
- Service workers (PWA)

### Monitoring and Analytics
- Error tracking (Sentry)
- Performance monitoring
- User analytics (privacy-compliant)
- Search analytics
- Dictionary usage stats

### Backup and Recovery
- Daily database backups
- Automated backups
- Point-in-time recovery
- Version control for word data
- Disaster recovery plan

### Email Notifications
- Edit suggestion confirmations
- Assignment notifications
- Approval/rejection notifications
- Workflow updates
- System announcements

### Testing Strategy
- Unit tests (components, utilities)
- Integration tests (API, workflows)
- E2E tests (critical paths)
- Performance tests
- Accessibility tests

---

## 23. Design System (Sober, Clean)

### Color Palette
- **Primary**: Deep blue or teal (subtle)
- **Secondary**: Gray tones
- **Background**: White/light gray
- **Text**: Dark gray/black
- **Accents**: Minimal, purposeful
- **Success**: Subtle green
- **Warning**: Subtle orange
- **Error**: Subtle red

### Typography
- **Headings**: Clean sans-serif (Inter, Poppins)
- **Body**: Readable sans-serif
- **Maithili script**: Appropriate font (Noto Sans Devanagari or custom)
- **Hierarchy**: Clear size differences
- **Line height**: Comfortable (1.5-1.6)

### Spacing
- Consistent spacing scale (4px base)
- Generous whitespace
- Clear section separation
- Comfortable padding

### Components
- Minimal borders
- Subtle shadows
- Smooth transitions
- Clear focus states
- Accessible contrast ratios

---

## 24. Standard Dictionary Formatting & Styling

### Typography Conventions

#### Headwords (main entries)
- Bold, larger font size
- Often in the source language script (Maithili)
- Romanized version in parentheses or smaller font
- Consistent capitalization rules

#### Pronunciation
- IPA notation in brackets: /ˈwɜːrd/ or [ˈwɜːrd]
- Or in slashes: /pronunciation/
- Smaller font, often italic or different color
- Placement: immediately after headword

#### Part of Speech
- Abbreviations: n., v., adj., adv., prep., conj., etc.
- Often in italics or different font
- Placement: after pronunciation, before definitions

#### Definitions
- Numbered (1, 2, 3) or lettered (a, b, c) for multiple senses
- Indented sub-definitions
- Usage labels: (formal), (informal), (archaic), (regional), etc.
- Domain labels: (Linguistics), (Literature), etc.

#### Example Sentences
- Italicized
- In quotation marks or indented
- Translation in parentheses or following
- Source attribution if applicable

#### Etymology
- In brackets [ ] or parentheses ( )
- Often in smaller font
- Format: "From Sanskrit..." or "Derived from..."
- Historical development chain

#### Cross-references
- Small caps or italics
- Format: "See also WORD" or "→ WORD" or "cf. WORD"
- Page numbers in print: "See WORD, p. 123"

### Layout Standards

#### Page Structure
- Guide words: top of each page showing first and last headword
- Running headers: letter range (A–B, C–D, etc.)
- Page numbers: consistent placement (top/bottom, outer corners)
- Column dividers: vertical rules between columns

#### Column Layout
- 2–3 columns per page (depending on page size)
- Equal column widths
- Consistent gutter spacing
- Text flows top to bottom, left to right

#### Entry Spacing
- Clear separation between entries
- Consistent line spacing
- Sub-entries indented (hanging indent)
- Visual hierarchy through indentation

### Dictionary Entry Template Structure

```
HEADWORD [pronunciation] part_of_speech
  1. Definition text. Example sentence in italics.
     a. Sub-definition with example.
     b. Another sub-definition.
  2. Second definition. Example: "Usage example here."
     (Usage label: formal/informal/regional)
  3. Third definition.
  
  Etymology: [From Sanskrit... or Derived from...]
  
  Related forms: derivative_word, another_derivative
  
  See also: RELATED_WORD_1, RELATED_WORD_2 (p. 123)
  
  Sub-entries:
    - sub-word-1 [pronunciation] definition
    - sub-word-2 [pronunciation] definition
```

---

## Summary

This comprehensive plan covers:
1. Multi-dictionary platform architecture
2. Dynamic parameter system for flexible word entries
3. Complete workflow management system
4. Public contribution via edit suggestions
5. Four PDF export formats with proper dictionary formatting
6. Role-based access control
7. Social authentication
8. Advanced search and autocomplete
9. Cross-referencing and word relationships
10. Sub-words and compound words
11. Website embedding capability
12. Standard dictionary typography and formatting conventions

The project is ready for implementation following the phased development approach outlined above.

