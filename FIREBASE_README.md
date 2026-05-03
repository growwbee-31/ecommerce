# Firebase Database Setup - LuxeShirts India

## 🔗 Firebase Configuration

Your Firebase project is configured with the following settings:

### Project Details
- **Project ID**: `growwbee-9c95d`
- **Project Name**: GrowwBee
- **Database URL**: `https://growwbee-9c95d-default-rtdb.firebaseio.com`

### Services Enabled
- ✅ **Authentication**: Email/Password, Google Sign-in
- ✅ **Realtime Database**: For products, users, orders, carts
- ✅ **Hosting**: Ready for deployment

## 🗄️ Database Structure

```
firebase-database/
├── products/          # Product catalog
│   ├── productId1/
│   │   ├── id, name, category, price, etc.
│   └── productId2/
├── users/            # User profiles
│   ├── userId1/
│   │   ├── name, email, createdAt, etc.
│   └── userId2/
├── orders/           # Order history
│   ├── orderId1/
│   │   ├── items, shipping, payment, etc.
│   └── orderId2/
└── carts/            # Shopping carts
    ├── userId1/
    └── userId2/
```

## 🔐 Admin Access

- **Admin Email**: `admin@gmail.com`
- **Admin Password**: `1234567`
- **Access**: Login via `login.html` → Automatic redirect to `admin.html`

## 🧪 Testing Database Connection

1. Open `firebase-test.html` in your browser
2. Click "Test Database Connection" to verify connectivity
3. Use other buttons to view current data in each collection
4. Add test data to verify write operations

## 📊 Admin Dashboard Features

- **Products Management**: Add, edit, delete products
- **User Management**: View all registered users
- **Order Management**: Track all orders with details
- **Analytics**: Revenue, top products, recent activity
- **Indian Localization**: Hindi interface, INR currency

## 🔧 Firebase SDK Version

- **Version**: 9.22.0
- **Modules**: App, Auth, Database
- **Import Method**: ES6 Modules via CDN

## 🚀 Deployment Ready

The application is ready for deployment with:
- Firebase Hosting configuration
- Environment-specific settings
- Production-ready security rules

## 📞 Support

For Firebase-related issues:
1. Check `firebase-test.html` for connection status
2. Verify Firebase Console settings
3. Check browser console for errors
4. Ensure internet connectivity

---

**Status**: ✅ Firebase Database Connected and Operational