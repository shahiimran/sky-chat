# Sky Chat

A community-first realtime chat website built with HTML, CSS, JavaScript modules and Firebase.

## Project status

**Sky Chat v2 is an upgrade branch in progress.** The original `main` branch remains unchanged. The current repository contains frontend pages and Firebase client-side integration; a deployed, production-safe social platform still requires backend authorization, database rules, moderation workflows and end-to-end testing.

## Current features in the codebase

- Email/password registration and login
- User profile and settings pages
- Realtime global chat
- Friend requests and friend list
- Discover and user directory pages
- Admin and moderator page shells
- Firebase Authentication and Cloud Firestore client integration

Some screens and flows may be incomplete. Do not assume a visible page is fully functional until tested.

## v2 direction

Sky Chat is intended to be a **friendship and community chat platform**, not a dating or matchmaking service.

- Responsive mobile-first dashboard
- Private one-to-one conversations and community rooms
- User profiles with optional interests
- Friend requests with accept/decline controls
- Message history, unread indicators and notifications
- Block, report and mute controls
- Moderator review queue and audit trail
- Admin tools protected by server-issued Firebase custom claims
- Clear privacy controls and account deletion workflow
- Accessible light/dark themes

## Security before public launch

1. Configure and test Firestore Security Rules. Never rely on frontend checks as authorization.
2. Use Firebase custom claims for admin/moderator roles; assign them only from a trusted Admin SDK environment.
3. Separate public profile fields from private account data. Do not expose email addresses in public user queries.
4. Validate message ownership, size, rate limits and moderation status in Security Rules or trusted backend code.
5. Configure Firebase App Check and authorized domains.
6. Add report/block workflows and a documented moderation process before inviting users.
7. Test with separate ordinary, moderator and admin accounts.

See [SECURITY.md](SECURITY.md) for the current security notes.

## Run locally

Because the site uses JavaScript modules, serve the repository through a local HTTP server rather than opening HTML files directly. Configure the Firebase project and authorized domain before testing authentication.

## Deployment

A static host can serve the frontend, but Firebase Authentication and Firestore remain separate managed services. A custom domain does not hide frontend HTML/CSS/JavaScript; keep privileged logic and secrets on trusted server-side infrastructure.

## Development branch

Current v2 work: `upgrade/sky-chat-v2`
