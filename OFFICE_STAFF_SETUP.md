# Office Staff System - Setup Guide

## 🎯 Overview
The Office Staff system allows you to:
- **Create staff accounts** from the admin dashboard
- **Auto-assign queries** to staff members automatically (round-robin)
- **Staff dashboard** for viewing and managing assigned queries
- **Separate login** for office staff at `/staff/login`

---

## 📋 Database Setup

### Step 1: Run the SQL Migration

1. Open your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Copy the contents of `database/setup_office_staff.sql`
4. Paste and **Run** the SQL script

This will:
- ✅ Create `office_staff` table
- ✅ Add `assigned_to` columns to `quote_requests` and `contact_messages`
- ✅ Set up auto-assignment triggers (round-robin distribution)
- ✅ Configure row-level security policies

---

## 🚀 Quick Start

### For Admin:

1. **Login to Admin Dashboard**
   - URL: `http://localhost:3000/admin/login`
   - Use your admin credentials

2. **Navigate to "Office Staff" Tab**
   - Click on "Office Staff" in the sidebar

3. **Add Staff Members**
   - Click "+ Add Staff" button
   - Fill in:
     - Full Name
     - Email Address
     - Password (minimum 8 characters)
   - Click "Add Staff"

4. **Manage Staff**
   - **Activate/Deactivate**: Toggle staff status (inactive staff won't receive assignments)
   - **Delete**: Remove staff member permanently
   - **View Stats**: See assigned quotes and messages per staff member

### For Office Staff:

1. **Login to Staff Portal**
   - URL: `http://localhost:3000/staff/login`
   - Use credentials provided by admin

2. **View Assigned Queries**
   - **Assigned Quotes**: See all quotes assigned to you
   - **Assigned Messages**: See all contact messages assigned to you
   - **Update Status**: Change status directly from the table
   - **View Details**: Click any row to see full details

3. **Manage Queries**
   - Update status: New → Pending → Quoted/Contacted → Resolved
   - Mark as read automatically when viewing details
   - Silent auto-refresh every 30 seconds

---

## 🔄 Auto-Assignment System

### How It Works:

1. **Customer submits a quote or contact form** on the website
2. **System automatically assigns** to the next available staff member
3. **Round-robin algorithm** ensures even distribution:
   - Checks active staff members only
   - Assigns to staff with **fewest total assignments**
   - Ties broken by staff creation date (older staff first)

### Assignment Logic:

```sql
get_next_staff_member()
├── Filter: is_active = true
├── Count: Total assignments per staff
├── Sort: Least assignments first
└── Return: Staff with lowest count
```

### Example:
- **Staff A**: 5 quotes + 3 messages = 8 total ✅ **Gets next**
- **Staff B**: 7 quotes + 4 messages = 11 total
- **Staff C**: Inactive ❌ **Skipped**

---

## 📊 Features

### Admin Dashboard (`/admin/dashboard`)
- ✅ Create/manage staff accounts
- ✅ View staff statistics (assigned items, join date)
- ✅ Activate/deactivate staff members
- ✅ Delete staff accounts
- ✅ See all queries (assigned and unassigned)

### Staff Dashboard (`/staff/dashboard`)
- ✅ View only assigned queries
- ✅ Update query status
- ✅ Mark items as read
- ✅ View detailed information
- ✅ Auto-refresh every 30 seconds
- ✅ Real-time assignment counts

---

## 🔐 Security

### Authentication:
- **Admin**: Full access to all features
- **Staff**: Can only view/edit assigned items
- **Separate login portals** for admin and staff

### Row-Level Security (RLS):
- Staff can only see queries assigned to them
- Admin has full visibility
- Enforced at database level

---

## 🛠️ Troubleshooting

### Problem: Staff can't login
**Solution**: 
- Check if staff account is **active** in admin dashboard
- Verify email/password are correct
- Check Supabase auth logs

### Problem: No auto-assignment happening
**Solution**:
1. Check if triggers are active:
   ```sql
   SELECT * FROM information_schema.triggers 
   WHERE trigger_name LIKE '%auto_assign%';
   ```
2. Verify at least one staff member is active:
   ```sql
   SELECT * FROM office_staff WHERE is_active = true;
   ```

### Problem: Uneven distribution
**Solution**:
- Check assignment counts:
   ```sql
   SELECT 
     os.name,
     os.is_active,
     COUNT(qr.id) as quote_count,
     COUNT(cm.id) as message_count
   FROM office_staff os
   LEFT JOIN quote_requests qr ON qr.assigned_to = os.id
   LEFT JOIN contact_messages cm ON cm.assigned_to = os.id
   GROUP BY os.id, os.name, os.is_active
   ORDER BY (COUNT(qr.id) + COUNT(cm.id)) ASC;
   ```

---

## 📱 Access URLs

| Role | Login URL | Dashboard URL |
|------|-----------|---------------|
| **Admin** | `/admin/login` | `/admin/dashboard` |
| **Staff** | `/staff/login` | `/staff/dashboard` |

---

## 🔄 Workflow Example

### Scenario: New quote submission

1. **Customer** fills out quote form on website
2. **Trigger fires** → `auto_assign_quote()` function runs
3. **System selects** staff member with fewest assignments
4. **Query assigned** to selected staff automatically
5. **Staff sees** new quote in their dashboard (marked unread)
6. **Staff updates** status and handles the query
7. **Admin can monitor** from admin dashboard

---

## 📝 Database Schema

### `office_staff` table:
```sql
id              UUID PRIMARY KEY
name            TEXT NOT NULL
email           TEXT UNIQUE NOT NULL
is_active       BOOLEAN DEFAULT true
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### Modified tables:
```sql
quote_requests:
  + assigned_to   UUID → office_staff(id)

contact_messages:
  + assigned_to   UUID → office_staff(id)
```

---

## 🎨 UI Screenshots

### Admin - Staff Management
- Grid view of all staff members
- Stats cards showing assigned items
- Add/Edit/Delete actions
- Active/Inactive status toggle

### Staff Dashboard
- Stats overview (assigned quotes, messages)
- Tabbed interface (Quotes | Messages)
- Sortable tables with status updates
- Detail modal for full query information

---

## 💡 Tips

1. **Start with 2-3 staff members** for balanced workload
2. **Deactivate** staff during leave instead of deleting
3. **Monitor** assignment distribution from admin dashboard
4. **Use status updates** to track query progress
5. **Check unread counts** regularly for new assignments

---

## 🆘 Support

If you encounter issues:
1. Check Supabase database logs
2. Verify triggers are active
3. Confirm RLS policies are correct
4. Check browser console for errors
5. Review authentication status

---

## 🚀 Next Steps

1. ✅ Run database migration
2. ✅ Login to admin dashboard
3. ✅ Add your first staff member
4. ✅ Test with a new quote submission
5. ✅ Verify auto-assignment works
6. ✅ Staff logs in and sees assigned query

**You're all set!** 🎉

---

*For technical support, contact the development team.*
