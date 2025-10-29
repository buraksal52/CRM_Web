# 🎉 Toast Notifications - Quick Reference

## 📦 Installation
```bash
npm install react-hot-toast
```

---

## 🚀 Quick Start

### 1. Import toast utilities
```javascript
import { showSuccess, showError, showInfo } from '../utils/toast';
```

### 2. Use in your code
```javascript
// Success
showSuccess('Record created successfully! 🎉');

// Error
showError('Failed to save data');

// Info
showInfo('Logged out successfully 👋');
```

---

## 🎨 Available Functions

| Function | Type | Duration | Use Case |
|----------|------|----------|----------|
| `showSuccess(msg)` | ✅ Green | 3s | Create, update, delete success |
| `showError(msg)` | ❌ Red | 4s | API errors, validation failures |
| `showInfo(msg)` | ℹ️ Blue | 3s | Logout, informational messages |
| `showWarning(msg)` | ⚠️ Amber | 3.5s | Non-critical alerts |
| `showLoading(msg)` | 🔄 Gray | Manual | Long operations |
| `dismissToast(id)` | - | - | Dismiss specific toast |
| `dismissAll()` | - | - | Dismiss all toasts |

---

## 💡 Common Patterns

### CRUD Operations

```javascript
// CREATE
try {
  await api.post('/customers/', formData);
  showSuccess('Customer created successfully! 🎉');
} catch (err) {
  showError(err.response?.data?.detail || 'Failed to create customer');
}

// UPDATE
try {
  await api.patch(`/customers/${id}/`, formData);
  showSuccess('Customer updated successfully! ✅');
} catch (err) {
  showError(err.response?.data?.detail || 'Failed to update customer');
}

// DELETE
try {
  await api.delete(`/customers/${id}/`);
  showSuccess(`Customer "${name}" deleted successfully! 🗑️`);
} catch (err) {
  showError(err.response?.data?.detail || 'Failed to delete customer');
}
```

### Authentication

```javascript
// LOGIN SUCCESS
showSuccess(`Welcome back, ${username}! 👋`);

// LOGIN ERROR
showError('Invalid username or password');

// LOGOUT
showInfo('Logged out successfully. See you soon! 👋');

// REGISTRATION
showSuccess('Registration successful! Please log in. 🎉');
```

### API Errors with 401 Redirect

```javascript
catch (err) {
  if (err.response?.status === 401) {
    showError('Session expired. Please log in again.');
    navigate('/login');
  } else {
    const errorMessage = 'Failed to fetch data. Please try again.';
    setError(errorMessage);
    showError(errorMessage);
  }
}
```

### Loading Toast

```javascript
// Start loading
const loadingToast = showLoading('Uploading file...');

// ... perform operation

// Dismiss and show result
dismissToast(loadingToast);
showSuccess('File uploaded successfully!');
```

---

## 🎯 Emoji Guide

| Emoji | Use Case |
|-------|----------|
| 🎉 | Created/New record |
| ✅ | Updated/Completed |
| 🗑️ | Deleted |
| 👋 | Welcome/Goodbye |
| 🔄 | Status changed |
| ❌ | Error/Failed |
| ⚠️ | Warning |
| ℹ️ | Information |

---

## 📍 Toast Position

Currently: **top-right**

To change, edit `App.jsx`:
```jsx
<Toaster position="top-center" />
```

Options: `top-left`, `top-center`, `top-right`, `bottom-left`, `bottom-center`, `bottom-right`

---

## ⏱️ Duration Guide

| Type | Duration | Reason |
|------|----------|--------|
| Success | 3s | Quick confirmation |
| Error | 4s | More time to read error |
| Info | 3s | Standard message |
| Warning | 3.5s | Important but not critical |
| Loading | Manual | Until operation completes |

---

## ✅ Best Practices

### ✓ Do:
- Keep messages concise (< 50 chars)
- Use emojis for visual clarity
- Show toast for important actions
- Auto-dismiss in 3-4 seconds
- Include entity name in delete messages

### ✗ Don't:
- Don't show toast for every minor action
- Don't use very long messages
- Don't stack more than 3 toasts
- Don't use toasts for critical errors (use modals)
- Don't override auto-dismiss for errors

---

## 🎨 Color Scheme

| Type | Background | Hex |
|------|-----------|-----|
| Success | Green | #059669 |
| Error | Red | #dc2626 |
| Info | Blue | #3b82f6 |
| Warning | Amber | #f59e0b |
| Loading | Gray | #4b5563 |

---

## 🐛 Troubleshooting

### Toast not appearing?
- ✅ Check `<Toaster>` is in `App.jsx`
- ✅ Verify import: `import { showSuccess } from '../utils/toast'`
- ✅ Check console for errors

### Toast appears but wrong color?
- ✅ Use correct function: `showSuccess` not `showError`
- ✅ Check `toast.js` styling

### Multiple toasts overlap?
- ✅ Check `gutter` setting in `App.jsx`
- ✅ Verify `reverseOrder={false}`

---

## 📝 Message Templates

### Customers
```javascript
// Create
'Customer created successfully! 🎉'

// Update
'Customer updated successfully! ✅'

// Delete
`Customer "${customerName}" deleted successfully! 🗑️`

// Error
'Failed to fetch customers. Please try again.'
```

### Leads
```javascript
// Create
'Lead created successfully! 🎉'

// Update
'Lead updated successfully! ✅'

// Delete
`Lead "${leadTitle}" deleted successfully! 🗑️`
```

### Tasks
```javascript
// Create
'Task created successfully! 🎉'

// Update
'Task updated successfully! ✅'

// Delete
`Task "${taskTitle}" deleted successfully! 🗑️`

// Complete
'Task marked as completed! ✅'

// Reopen
'Task marked as reopened! 🔄'
```

### Auth
```javascript
// Login
`Welcome back, ${username}! 👋`

// Logout
'Logged out successfully. See you soon! 👋'

// Register
'Registration successful! Please log in. 🎉'

// Session expired
'Session expired. Please log in again.'

// Invalid credentials
'Invalid username or password'
```

---

## 🔗 Files Modified

| File | Purpose |
|------|---------|
| `src/App.jsx` | Toaster component setup |
| `src/utils/toast.js` | Helper functions |
| `src/pages/Customers.jsx` | Customer CRUD toasts |
| `src/pages/Leads.jsx` | Lead CRUD toasts |
| `src/pages/Tasks.jsx` | Task CRUD + toggle toasts |
| `src/pages/Login.jsx` | Login toasts |
| `src/pages/Register.jsx` | Registration toasts |
| `src/pages/Dashboard.jsx` | Logout + error toasts |

---

## 📚 Resources

- [react-hot-toast Docs](https://react-hot-toast.com/)
- Full Documentation: `TOAST_NOTIFICATIONS_IMPLEMENTATION.md`

---

**Toast System Ready! 🎉**

All pages now show beautiful, user-friendly notifications for every action.
