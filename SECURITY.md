# Sky Chat v2 — security and deployment notes

This branch contains a security baseline, not a production certification.

## Implemented in this branch
- Safer global chat rendering using DOM text nodes and `textContent`.
- Client-side message validation and send/load/delete error handling.
- Removed the hardcoded admin password page gate. Admin UI checks the Firebase custom claim `admin === true`.
- Removed a Telegram bot token from browser code and removed sending users' email/UID to Telegram during account deletion.
- Added `firestore.rules` with deny-by-default access and ownership checks.
- Registration now separates private `users/{uid}` account data (including email) from public `publicProfiles/{uid}` profile data.
- Friend list reads public profile documents rather than private account documents.

## IMPORTANT: exposed Telegram bot token
A Telegram bot token was previously committed in `js/settings.js`. Removing it from the latest branch does not erase it from Git history or revoke it. The bot owner must revoke that token in Telegram's BotFather and create a new one if still needed. Do not put the replacement token in browser JavaScript or GitHub.

## Firebase setup required
1. In Firebase Console, open Firestore Rules and publish the contents of `firestore.rules`. Review the rules against your live database before publishing.
2. Existing accounts need a matching `publicProfiles/{uid}` document. The new registration code creates it for new accounts; old accounts need a one-time migration from their existing profile fields. Do not copy email or other private account data into public profiles.
3. Admin/moderator custom claims must be assigned from a trusted environment using Firebase Admin SDK. Never assign them from browser code. The admin UI gate is not a substitute for Firestore authorization.
4. Test with ordinary, blocked, moderator and admin accounts in Firebase Emulator Suite before opening the app publicly.

## Known limitations / not yet launch-ready
- The DM client in the original repository is incomplete/broken; private chat needs a complete implementation and rules tests.
- Discover and some referenced scripts/pages were missing from the original repository.
- Friend acceptance is not transactional and duplicate friend records are still possible.
- Existing accounts need public profile migration; otherwise their friend cards may not display.
- Ban enforcement is not yet applied consistently to every collection/action.
- Moderator workflow, report creation UI, block controls, rate limits, email verification and account-data cleanup need implementation.
- Account deletion and retention need a trusted cleanup process for messages, friend links and other related data.

Do not deploy as a public teen community until moderation, reporting, blocking, privacy and the above tests are complete.
