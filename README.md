# VMS Nepal

Build the foundation of a production-quality web application called:

VMS — Valuation Management System

This is a Nepal-focused property valuation management platform. It must be a responsive Progressive Web App (PWA) that works beautifully on desktop browsers, tablets, and mobile phones.

IMPORTANT:
Do not build fake/demo functionality that appears functional but does not have a proper underlying structure.
Do not create unnecessary mock data as a substitute for the database.
Build the architecture so future phases can extend the same application without rewriting the foundation.

TECH STACK

Use:

* React
* TypeScript
* Tailwind CSS
* shadcn/ui where appropriate
* Supabase for authentication and database
* PostgreSQL
* Prepare the architecture for PostGIS/geospatial data
* PWA support
* GitHub-compatible project structure

DESIGN DIRECTION

Create a premium professional interface suitable for engineers, property valuers, banks and valuation companies in Nepal.

Visual character:

* Minimal
* Modern
* Precise
* Professional
* Premium
* Engineering/financial software feel
* Excellent typography
* Subtle animations
* No excessive gradients
* No excessive glassmorphism
* No unnecessary decorative effects

Primary brand color:
#004AAF

Supporting colors:
#FFFFFF
#000000

Use the blue primarily for active navigation, primary actions, important indicators and selected states.

RESPONSIVE BEHAVIOUR

Desktop:

* Permanent left sidebar
* Main content area
* Top utility/header area

Tablet:

* Compact navigation/hamburger
* Optimized touch targets
* Comfortable spacing

Mobile:

* Hamburger navigation
* Full-width content
* Touch-friendly controls
* Bottom or floating primary action where appropriate

The application must never feel like a desktop website squeezed onto a phone.

APP SHELL

Create:

1. Welcome screen
2. Authentication screen
3. Main application shell
4. Dashboard
5. Sidebar/navigation
6. User profile area
7. Settings placeholder
8. Admin Console placeholder

SIDEBAR

Display:

VMS
Valuation Management System

Navigation:

Dashboard
Records
Map
Converter
Advanced Calculator
Government Rates

Divider

Settings

For administrators additionally show:

Admin Console

Use appropriate icons.

The active navigation item must be visually obvious.

WELCOME SCREEN

Create a high-end welcome screen explaining:

VMS
Valuation Management System

A professional platform for organizing property valuation records, geographic information, land-area calculations, valuation calculations and government rates.

Include:

* Get Started
* Sign In

Briefly explain:
Map-based Records
Land Area Converter
Advanced Valuation Calculator
Government Rates

Keep it professional and concise.

AUTHENTICATION

Create a polished authentication screen.

Support architecture for:

* Google authentication
* Apple authentication
* Email/password or magic-link authentication

Use Supabase Auth.

After first login, users should be taken through a profile/onboarding process.

USER ROLES

Create the database architecture for three roles:

guest
registered_valuator
admin

Do NOT rely only on frontend role checks.

Prepare proper server/database-level authorization using Supabase Row Level Security.

Initial administrator emails:

[vms.app.nepal@gmail.com](mailto:vms.app.nepal@gmail.com)
[neokern.np@gmail.com](mailto:neokern.np@gmail.com)
[kiran@modernedge.com.np](mailto:kiran@modernedge.com.np)

These accounts should be recognized as administrators when they authenticate.

Do not hard-code admin privileges only in the frontend.

USER VERIFICATION STATES

Create support for:

guest
verification_pending
verified_valuator
admin

User profile fields should include:

id
name
email
avatar
role
verification_status
NEC number
NEC obtained year
created_at
updated_at

NEC number must not be publicly exposed to ordinary users.

When a new user provides NEC information:

* account initially remains verification_pending
* user sees that verification will be reviewed
* admin can later approve/reject verification

If no NEC information is provided:

* user remains guest

DATABASE FOUNDATION

Create the initial database structure required for:

users/profiles
user verification
roles
valuation records
government rates
audit logs

Do not yet build the complete record form or calculator.

Create appropriate IDs, timestamps and relationships.

RECORD OWNERSHIP

Prepare the architecture so:

Guest:

* Can view public/universal records
* Cannot create/edit records

Registered Valuator:

* Can create records
* Can create map pins
* Can view universal records
* Can edit ONLY records they created

Admin:

* Full access

This must eventually be enforced with database-level policies.

AUDITABILITY

Prepare audit-log architecture for important changes.

Important record changes should eventually be traceable by:

* user
* action
* timestamp
* record
* previous value
* new value

DO NOT BUILD YET

Do not implement:

* advanced map functionality
* land conversion engine
* valuation calculator
* government-rate management
* advanced admin console

Those will be implemented in later phases.

QUALITY REQUIREMENTS

Use reusable components.
Use TypeScript types.
Avoid duplicated code.
Use clear folder/module organization.
Keep business logic separate from UI.
Keep calculation logic separate from UI.
Keep map logic separate from UI.

Before finishing, make sure the application runs correctly and that the responsive shell works on desktop, tablet and mobile.

Do not redesign or remove functionality in later phases unless specifically instructed.
Existing functionality must remain intact when adding future phases.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/52b79829-9617-4333-a066-1307ffbf7c33).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
