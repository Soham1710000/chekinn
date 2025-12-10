# 🎯 Chekinn Admin Panel - User Guide

## 📍 Access Your Admin Panel

### **Local Access:**
```
http://localhost:8001/admin
```

### **External Access (once routing is fixed):**
```
https://voicechat-companion.preview.emergentagent.com/admin
```

---

## 🔐 Login Credentials

**Default Password:** `chekinn2024`

To change the password, update the environment variable:
```bash
export ADMIN_PASSWORD="your-new-password"
```

Or edit directly in `/app/backend/server.py` (line with `ADMIN_PASSWORD`)

---

## ✨ What You Can Do

### 1. **View All Users**
- See complete list of users with their preferences
- Columns: Name, City, Current Role, Intent/Preference
- Currently **28+ users** in your database

### 2. **Create Manual Introductions**
**Step-by-step:**
1. Click on any user row (or checkbox) to select
2. Select a second user (max 2 at a time)
3. Selected users highlight in **blue**
4. A form appears automatically when 2 users are selected
5. Add optional context about why this match makes sense
6. Click **"Create Introduction"**

### 3. **View Stats**
- **Total Users**: All registered users
- **Selected Users**: Currently selected for matching

---

## 🎨 Features

### ✅ Smart Selection
- Click anywhere on a row to select
- Can't select more than 2 users at once
- Visual feedback with blue highlighting

### ✅ Real-time Feedback
- Success messages: "✅ Introduction created between..."
- Error messages: "❌ Failed to create..." or "⚠️ You can only select 2 users..."
- Auto-dismiss after 5 seconds

### ✅ User Context
- See user's city, role, and intent at a glance
- Long preferences are truncated with "..."
- Hover over rows for better visibility

---

## 🔧 Use Cases

### **Matching Dashboard**
Match users based on:
- Similar career goals (MBA prep, job transitions)
- Geographic location (city)
- Current role/industry
- Intent statements

### **User Quality Control**
- Review user profiles and preferences
- Identify high-quality potential connections
- Manual curation for best matches

### **Manual Orchestration Layer**
- AI suggests, you decide
- Human-in-the-loop approach
- Test intro system before full automation

---

## 🚀 Backend Integration

All operations use these API endpoints:

- `GET /api/admin/users` - Fetch all users
- `POST /api/admin/create-intro` - Create introduction
  ```json
  {
    "from_user_id": "user1_id",
    "to_user_id": "user2_id",
    "reason": "Both exploring CAT prep..."
  }
  ```

---

## 🎯 What Happens After Creating an Intro?

1. **Both users receive notification** when they open the Connections tab
2. **Visual indicators appear**: Orange dot + "NEW" badge
3. **Users can accept or decline** the introduction
4. **If accepted**: Both users can start a peer-to-peer chat
5. **Notification tracking**: System marks intros as "seen" automatically

---

## 📊 Your Current Setup

- **Total Users**: 28 (as of last check)
- **Backend**: Running on port 8001
- **Password**: `chekinn2024` (change in production!)
- **Status**: ✅ Fully operational

---

## 🔒 Security Notes

**Current Protection:**
- Basic password authentication
- No session management (password in URL)
- Suitable for internal/testing use

**For Production:**
1. Change the default password
2. Use environment variables for secrets
3. Consider adding JWT tokens or session-based auth
4. Add IP whitelisting if needed
5. Use HTTPS only

---

## 💡 Tips

- **Refresh the page** after creating intros to clear selection
- **Use descriptive reasons** for better intro quality
- **Test on mobile** - the UI is responsive
- **Check intro status** in the main Chekinn app (Connections tab)

---

## 🐛 Troubleshooting

**Problem: "Failed to load users"**
- Check backend is running: `sudo supervisorctl status backend`
- Verify API endpoint: `curl http://localhost:8001/api/admin/users`

**Problem: "Failed to create introduction"**
- Check if intro already exists between these users
- Verify both user IDs are valid
- Check backend logs: `/var/log/supervisor/backend.err.log`

**Problem: Login page appears but password doesn't work**
- Verify password is correct (default: `chekinn2024`)
- Check for typos or extra spaces
- Try resetting: edit `ADMIN_PASSWORD` in server.py

---

## 📝 Future Enhancements

- [ ] Add user search/filter
- [ ] Show existing intros for each user
- [ ] Batch intro creation
- [ ] Intro analytics dashboard
- [ ] Export user list to CSV
- [ ] View user's full conversation history

---

**Your admin panel is now live and ready to use!** 🎉

Questions? Check the main Chekinn codebase or contact support.
