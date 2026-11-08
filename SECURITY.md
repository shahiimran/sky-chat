# Sky Chat security notes

This document records required launch controls. It is not a claim that the current deployment is already secure.

## Changes in this v2 branch

- Global chat messages are rendered with DOM text nodes / `textContent`, not interpolated into `innerHTML`.
- Empty messages are ignored and messages over 1,000 characters are rejected in the client.
- Chat send/delete/load failures are handled without silently pretending success.
- The exposed numeric admin password gate has been removed.
- The admin page now checks for a Firebase ID token custom claim: `admin === true`.

## Required Firebase setup

### 1. Admin custom claim

The Firebase project owner must assign the `admin` custom claim to the intended administrator UID from a trusted server using the Firebase Admin SDK. Never set privileged claims from browser code. After assigning the claim, the user should sign out and sign in again, or refresh the ID token.

Moderator access should use a separate `moderator` claim and a separate permission set.

### 2. Firestore Security Rules

The repository did not contain a Firestore rules file during this review. Before launch, create and deploy rules that enforce at minimum:

- A signed-in user can update only explicitly allowed fields on their own profile.
- Public profile reads never expose private email, account metadata or moderation notes.
- Users can create messages only as themselves; sender UID, timestamp and message length are validated.
- Users can delete only their own messages; moderators/admins use separately authorized server-side actions.
- Friend requests can only be created by the sender and read/accepted by the intended recipient.
- Users cannot grant themselves roles, remove bans, change moderation state or edit another user's private data.
- All unrecognized collections and operations are denied by default.

Do not deploy broad authenticated read/write rules such as `allow read, write: if request.auth != null`.

### 3. Admin actions

The UI custom-claim check is only a navigation/access gate. Firestore rules or trusted Cloud Functions must independently authorize every privileged read and write. Otherwise an ordinary user could bypass the page and call the database directly.

### 4. Privacy and teen safety

Before public use, provide:
- Block and report controls that work across chat and profile surfaces.
- A moderator review queue with restricted access and an audit trail.
- Rate limits and spam controls.
- Private-by-default profile fields and minimal data collection.
- Account deletion and data retention procedures.
- Clear community rules and a process for urgent safety reports.

Do not collect exact location, school, phone number or other sensitive details as public profile fields.

## Known work still outstanding

- The existing registration flow has no email verification.
- Existing user documents store email alongside profile data; migrate to separate private account records before broad user-directory access.
- The friend request and friend-link writes need transactional authorization and duplicate prevention.
- The moderator panel and report workflow need a full permissions review.
- Ban enforcement must be applied to all authenticated app operations, not only displayed in the UI.
- Test all rules in the Firebase Emulator Suite with ordinary, blocked, moderator and admin accounts.

## Deployment warning

Do not treat this branch as production-ready until Firestore rules, role assignment, moderation and the above tests are complete.
