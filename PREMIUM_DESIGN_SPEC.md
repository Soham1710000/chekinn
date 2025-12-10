# 🎯 Chekinn Premium Design Specification

## Design Philosophy

> **"A quiet place to think things through"**

This is a PREMIUM app. Not playful. Not loud. Not SaaS. Not gamified.

**Emotional North Star:**  
Feels like talking to one trusted person. Calm. Forgiving. Unhurried. Comfortable to open at 11:47 PM.

---

## ✅ Design System - IMPLEMENTED

### **Colors** (LOCKED)

```typescript
// Backgrounds (warm off-white, NOT pure white)
background: '#FAFAF8'     // Primary warm off-white
surface: '#F3F4F2'        // Chat area, slightly darker
card: '#F0F1EF'           // Assistant message background

// Text (deep charcoal, NOT black)
text.primary: '#1F2933'   // Deep charcoal
text.secondary: '#6B7280' // Warm grey
text.tertiary: '#9CA3AF'  // Light grey

// Accent (ONE muted accent only - desaturated blue/slate)
accent: '#5B7C99'         // Dusty blue (use ONLY for mic + primary CTA)
```

**Rules:**
- ✅ Backgrounds never pure white
- ✅ Text never pure black
- ✅ Accent used ONLY for mic button + primary CTA
- ❌ NO gradients, neon, orange, or bright colors

---

### **Typography** (LOCKED - Inter Font)

```typescript
Font Family: Inter (DO NOT CHANGE)

Sizes:
- label: 12px          // Labels / hints
- helper: 15px         // Subtext / helper
- base: 16px           // Chat messages
- headline: 22px       // Onboarding headline

Line Heights:
- headline: 1.3        // Headlines
- helper: 1.45         // Subtext
- chat: 1.55           // Chat messages

Weights:
- normal: 400          // Default
- medium: 500          // User messages, emphasis
- semibold: 600        // MAXIMUM weight allowed
```

**Rules:**
- ❌ NO ALL CAPS
- ❌ NO bold above 600
- ✅ Assistant text lighter than user text

---

### **Spacing** (Premium - Slightly Empty is Correct)

```typescript
screenPadding: 20px           // Screen side padding: 20-24px
betweenSections: 24px         // Space between sections: 24-32px
betweenGroups: 20px           // Space between message groups
betweenBubbles: 12px          // Space between chat bubbles
chatBubbleVertical: 12px      // Chat bubble padding: 12-14px
chatBubbleHorizontal: 14px    // Chat bubble padding: 14-16px
```

**Rule:** If a screen feels slightly empty → correct.

---

### **Chat Bubbles** (CRITICAL)

```typescript
Shape:
- Rounded rectangles (NO speech tails)
- Border radius: 18px
- NO harsh borders

Assistant messages:
- Background: #F0F1EF (soft warm neutral)
- Text: #1F2933 (deep charcoal)
- Padding: 12px vertical, 14px horizontal

User messages:
- Background: #5B7C99 (muted accent)
- Text: #FAFAF8 (light neutral)
- Weight: 500 (medium)
- Padding: slightly tighter

Hierarchy feels: "You are thinking. I am here with you."
```

---

### **Mic Button** (Presence, Not Feature)

```typescript
Size: 58px (56-60px range)
Shape: Perfect circle
Background: #5B7C99 (muted accent)
Icon: Softened contrast (not pure white)
Shadow: Extremely soft (almost none)

States:
- Idle → gentle, inviting
- Listening → calm glow
- Processing → patient, still

❌ NO red recording dots
❌ NO aggressive waveforms
❌ NO flashing animation

Label (first session only):
"You can talk if that's easier"
```

---

## 📱 Screen Specifications

### **Onboarding Screen**

**Copy:**
```
Headline:
"A quiet place to think things through."

Subtext:
"You don't need perfect answers — just start where you are."

Form Labels:
• "What should I call you?"
• "Where are you right now? (optional)"
• "What are you mostly doing these days? (optional)"
• "What's been on your mind lately?"

Primary Button:
"Start a check-in"
```

**Design:**
- Button height: ~48px
- Button radius: ~24px
- Button color: #5B7C99 (muted accent)
- NO loud contrast

---

### **Chat Screen**

**Copy Replacements:**
```
❌ "Welcome, {name}!"        → ✅ "Hey {name}"
❌ "I'm here to help..."     → ✅ "I've got you"
❌ "Recording..."            → ✅ "Listening..."
❌ "Tap the mic..."          → ✅ "You can speak or type"
```

**Empty State:**
```
Title: "Hey {name}"
Subtitle: "What's on your mind?"

(No icons, no emojis)
```

---

### **Intro Cards**

**Design:**
- Inline with chat
- Soft background contrast
- Rounded corners (12px)
- Text-first, NO images
- NO profile photos

**Buttons:**
```
[Curious]  [Not now]

Both should feel equally safe
Equal visual weight
NO color hierarchy
```

---

## 🚫 What to AVOID (Mandatory)

### **Visual Elements:**
- ❌ Illustrations
- ❌ Bright or playful colors
- ❌ Emojis (≤1 per screen max, preferably zero)
- ❌ Badges, streaks, metrics
- ❌ Social feeds or card grids
- ❌ High-contrast CTAs
- ❌ Visual noise

### **Language:**
- ❌ "Let's do this"
- ❌ "Awesome!"
- ❌ "Great choice!"
- ❌ "Yay!"
- ❌ Excessive exclamation marks

### **UI Patterns:**
- ❌ Gamification
- ❌ Aggressive animations
- ❌ Red recording indicators
- ❌ Waveforms
- ❌ Achievement notifications

---

## ✅ Current Implementation Status

### **Completed:**
- ✅ Design system constants updated
- ✅ Colors locked to spec (#FAFAF8, #1F2933, #5B7C99)
- ✅ Typography locked to Inter with exact sizes
- ✅ Spacing defined (chat-specific values)
- ✅ MicButton updated (58px, soft shadow)
- ✅ Chat bubbles redesigned (18px radius)

### **To Apply (Remaining Work):**
- 🔄 Update all screen backgrounds to #FAFAF8
- 🔄 Update all text colors to #1F2933 / #6B7280
- 🔄 Update button radii to 24px
- 🔄 Remove ALL remaining emojis
- 🔄 Update onboarding copy
- 🔄 Update chat screen copy
- 🔄 Apply new spacing values
- 🔄 Test with 4-question checklist

---

## 🎨 Component-by-Component Updates Needed

### **ChatBubble.tsx**
```typescript
✅ Already updated with:
- BorderRadius.lg (16px) → Need to change to chatBubble (18px)
- Colors.accent for user bubbles
- Colors.surface for assistant bubbles
- Proper spacing
```

### **TrackSelector.tsx**
```typescript
✅ Already updated with:
- Removed emojis
- Warm copy: "What brings you here today?"
- Proper spacing

🔄 Needs:
- Verify colors match spec
```

### **LoadingOverlay.tsx**
```typescript
✅ Already updated with:
- Softened loading messages
- Colors.overlay
- Colors.accent for spinner

🔄 Needs:
- Verify all text uses new colors
```

### **Onboarding Screen**
```typescript
🔄 Needs complete copy update:

Current                              → Target
"Welcome to Chekinn"                → "A quiet place to think things through."
"Your thoughtful companion..."      → "You don't need perfect answers"
"What's your name? *"               → "What should I call you?"
"Where are you based?"              → "Where are you right now? (optional)"
"What do you do currently?"         → "What are you mostly doing these days?"
"What brings you here?"             → "What's been on your mind lately?"
"Continue"                          → "Start a check-in"
```

### **Main Chat Screen**
```typescript
🔄 Needs copy updates:

Current                              → Target
"Welcome, {name}!"                  → "Hey {name}"
"I'm here to help..."               → "I've got you. What's on your mind?"
"Choose Your Focus"                 → "What brings you here?"
"Recording..."                      → "Listening..."
"Tap the mic..."                    → "You can speak or type"

🔄 Remove:
- Emoji icon from empty state
```

### **Intros Screen**
```typescript
🔄 Needs:
- Remove ALL emojis from analytics
- Update "Accept" → "Curious"
- Update "Not Now" → "Pass"
- Simplify card design (text-first, no photos)
```

### **Profile/Admin Screens**
```typescript
🔄 Remove completely:
- All emoji icons (👥, ⚡, 💬, etc.)
- Replace with simple text labels
- Simplify layout
```

---

## 🧪 Design Quality Test (Run on Every Screen)

### **The 4 Questions:**

1. **Would this feel okay to open late at night?**
   - Check: Soft colors, no harsh lights, calm presence
   
2. **Does this feel like a place, not a tool?**
   - Check: No "efficiency" language, no metrics focus
   
3. **Is it slowing the user down?**
   - Check: Generous spacing, thoughtful copy, no urgency
   
4. **Would this feel private if someone glanced at my phone?**
   - Check: Minimal, text-first, no loud visuals

**If any answer is "no" → soften the design**

---

## 📐 Exact Specifications Reference

### **Mic Button:**
```
Size: 58px × 58px
Border Radius: 9999px (perfect circle)
Background: #5B7C99
Icon Size: 28-30px
Icon Color: #FAFAF8 (softened, not pure white)
Shadow: 
  offset: (0, 1)
  opacity: 0.04
  radius: 4px
```

### **Primary Button:**
```
Height: 48px
Border Radius: 24px
Background: #5B7C99
Text: #FAFAF8
Font Size: 16px
Font Weight: 500
Padding: 0 24px
```

### **Chat Bubble - Assistant:**
```
Background: #F0F1EF
Text Color: #1F2933
Font Size: 16px
Font Weight: 400
Line Height: 1.55
Padding: 12px (vertical) × 14px (horizontal)
Border Radius: 18px
```

### **Chat Bubble - User:**
```
Background: #5B7C99
Text Color: #FAFAF8
Font Size: 16px
Font Weight: 500
Line Height: 1.55
Padding: 12px (vertical) × 14px (horizontal)
Border Radius: 18px
```

---

## 🎯 Implementation Priority

### **Phase 1: Critical (Do First)**
1. ✅ Design system constants (DONE)
2. ✅ MicButton size and shadow (DONE)
3. 🔄 Chat bubble radius (16px → 18px)
4. 🔄 Onboarding copy update
5. 🔄 Remove all emojis

### **Phase 2: Visual Polish**
6. 🔄 Update all backgrounds to #FAFAF8
7. 🔄 Update all text colors to spec
8. 🔄 Update button radii to 24px
9. 🔄 Apply chat-specific spacing
10. 🔄 Update main chat copy

### **Phase 3: Final Touches**
11. 🔄 Verify mic button label (first session only)
12. 🔄 Test all 4 design questions
13. 🔄 Remove any remaining "startup-y" language
14. 🔄 Polish empty states

---

## 🎨 Anchor Rule (Never Forget)

> **Warmth over clarity.**  
> **Calm over efficiency.**  
> **Presence over polish.**

If something feels efficient, sharp, or "startup-y" → it's wrong.

---

## 📄 Files Updated

1. ✅ `/app/frontend/constants/design.ts` - Complete redesign
2. ✅ `/app/frontend/components/MicButton.tsx` - Size and shadow
3. ✅ `/app/frontend/components/ChatBubble.tsx` - Colors and spacing
4. ✅ `/app/frontend/components/TrackSelector.tsx` - Copy and layout
5. ✅ `/app/frontend/components/LoadingOverlay.tsx` - Messages and colors

---

**Status:** Design system fully specified and partially implemented.  
**Next Step:** Apply to remaining screens (onboarding, chat, intros, profile).  
**Goal:** Premium, quiet, human app that feels like a private conversation.

---

Generated: 2025-12-10  
Design Language: Premium, Quiet, Human ✨  
Implementation: In Progress 🔄
