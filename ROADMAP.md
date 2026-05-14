# Vocalize Roadmap

> By the people, for the people. A social platform built on user freedom and community self-governance.

---

## ✅ Done

- Auth (register, login, sessions)
- Feed with For You / Trending / Top tabs
- Post creation — Text, Image (URL), Music (Spotify embed)
- Markdown in posts with full toolbar (bold, italic, code, links, headings, quotes, lists)
- Markdown in comments with optional Preview toggle
- Post modal (click any post card to open inline)
- Voting / likes
- Comments + nested replies with @mention notifications
- Reactions (emoji row on posts)
- Save / bookmark posts
- Share (copy link)
- Edit own posts (inline)
- Report posts — inline modal (no browser prompt)
- Community creation and management
- Join / leave communities
- Community pages with sort tabs (New / Top)
- User profiles with accent colors, gradient avatars, badges, now playing
- Settings — display name, bio, avatar, banner, theme/accent colors, feed density, display badge
- Notifications — replies, mentions, badge awards, mark all read
- Search
- Saved posts page
- Mod tools — view reports, remove content, resolve/dismiss reports
- Badges system (award, display)
- Flair system — API exists (mods can create, GET by community)

---

## 🔧 In Progress / Needs UI

### Flair system (API done, UI missing)
- [ ] Mod panel: UI to create/manage flairs for a community
- [ ] Submit form: flair picker when posting to a community
- [ ] Post display already handles flairs ✅

### Mod panel gaps
- [ ] Remove reason input (currently uses `prompt()`)
- [ ] Ban user from community
- [ ] Warn user (notify them their content was removed)
- [ ] Pin / unpin posts from mod panel (not just via API)

---

## 🚧 Next Up

### Core features
- [ ] Following users (follow/unfollow, following feed tab)
- [ ] User profile pages show followers/following counts
- [ ] Direct messages between users
- [ ] Post flair picker in submit form

### Communities
- [ ] Community discovery / browse page (`/c` is bare)
- [ ] Community settings page for owners (edit name, description, color, rules)
- [ ] Community rules displayed on community page
- [ ] Invite-only communities

### Feed & discovery
- [ ] "Following" tab on feed (posts from people you follow)
- [ ] Trending algorithm (not just top by votes — factor in recency)
- [ ] Recommended communities on sidebar

---

## 💡 Future

- [ ] Landing page for logged-out users (onboarding, mission statement)
- [ ] Onboarding flow for new users (pick communities, customize profile)
- [ ] Polls in posts
- [ ] Audio post type (voice notes, clips)
- [ ] Verified accounts / notable member badges
- [ ] Community events / pinned announcements
- [ ] Dark/light mode toggle
- [ ] Mobile app (React Native)
- [ ] Companion iPad display (Claude integration with mic toggle + screen access)

---

## 🐛 Known rough edges

- ModActions uses `prompt()` for removal reason — needs inline modal (same as report)
- Communities list page (`/c`) is unstyled
- Post detail page (`/p/[id]`) hasn't received the same polish pass as feed
- No onboarding — new users land on an empty feed
