import { database, ref, push, set, onValue, remove, get } from './firebase-init.js';

const productsRef = ref(database, 'products');
const usersRef = ref(database, 'users');
const ordersRef = ref(database, 'orders');

let selectedImageData = '';
let products = [];
let users = [];
let orders = [];

// DOM Elements
const elements = {
    // Products
    form: document.getElementById('productForm'),
    name: document.getElementById('productName'),
    category: document.getElementById('productCategory'),
    price: document.getElementById('productPrice'),
    originalPrice: document.getElementById('productOriginalPrice'),
    rating: document.getElementById('productRating'),
    description: document.getElementById('productDescription'),
    imageUrl: document.getElementById('productImageUrl'),
    imageFile: document.getElementById('productImageFile'),
    imagePreview: document.getElementById('productImagePreview'),
    message: document.getElementById('adminMessage'),
    productTableBody: document.querySelector('#productTable tbody'),

    // Statistics
    totalProducts: document.getElementById('totalProducts'),
    totalUsers: document.getElementById('totalUsers'),
    totalOrders: document.getElementById('totalOrders'),
    totalRevenue: document.getElementById('totalRevenue'),

    // Tables
    usersTableBody: document.querySelector('#usersTable tbody'),
    ordersTableBody: document.querySelector('#ordersTable tbody'),

    // Analytics
    topProductsList: document.getElementById('topProductsList'),
    recentActivity: document.getElementById('recentActivity')
};

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is admin
    const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
    const adminEmail = sessionStorage.getItem('adminEmail');

    if (!isAdmin || adminEmail !== 'admin@gmail.com') {
        // Not an admin, redirect to login
        alert('Access denied. Admin login required.');
        window.location.href = 'login.html';
        return;
    }

    if (elements.form) {
        elements.form.addEventListener('submit', handleProductSubmit);
    }
    if (elements.imageFile) {
        elements.imageFile.addEventListener('change', handleFileUpload);
    }

    // Add modal close listeners
    document.addEventListener('click', (event) => {
        const userModal = document.getElementById('userModal');
        const orderModal = document.getElementById('orderModal');

        if (event.target === userModal) {
            closeModal('userModal');
        }
        if (event.target === orderModal) {
            closeModal('orderModal');
        }
    });

    loadAllData();
});

// Load all Firebase data
function loadAllData() {
    loadProducts();
    loadUsers();
    loadOrders();
    updateStatistics();
}

// Load products
function loadProducts() {
    onValue(productsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            products = Object.keys(data).map((key) => {
                const item = data[key];
                return {
                    ...item,
                    id: Number(item.id) || item.id,
                    productKey: key
                };
            });
        } else {
            products = [];
        }
        renderProducts();
        updateStatistics();
    }, (error) => {
        console.error('Error loading products:', error);
        products = [];
        renderProducts();
    });
}

// Load users
function loadUsers() {
    onValue(usersRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            users = Object.keys(data).map((key) => {
                const item = data[key];
                return {
                    ...item,
                    userKey: key
                };
            });
        } else {
            users = [];
        }
        renderUsers();
        updateStatistics();
    }, (error) => {
        console.error('Error loading users:', error);
        users = [];
        renderUsers();
    });
}

// Load orders
function loadOrders() {
    onValue(ordersRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            orders = Object.keys(data).map((key) => {
                const item = data[key];
                return {
                    ...item,
                    orderKey: key
                };
            });
        } else {
            orders = [];
        }
        renderOrders();
        updateStatistics();
        renderAnalytics();
    }, (error) => {
        console.error('Error loading orders:', error);
        orders = [];
        renderOrders();
    });
}

// Update statistics
function updateStatistics() {
    // Total products
    if (elements.totalProducts) {
        elements.totalProducts.textContent = products.length;
    }

    // Total users
    if (elements.totalUsers) {
        elements.totalUsers.textContent = users.length;
    }

    // Total orders
    if (elements.totalOrders) {
        elements.totalOrders.textContent = orders.length;
    }

    // Total revenue
    const totalRevenue = orders.reduce((sum, order) => sum + (order.orderSummary?.total || 0), 0);
    if (elements.totalRevenue) {
        elements.totalRevenue.textContent = `₹${formatIndianPrice(totalRevenue)}`;
    }
}

// Render products table
function renderProducts() {
    if (!elements.productTableBody) return;

    if (!products.length) {
        elements.productTableBody.innerHTML = '<tr><td colspan="6">कोई उत्पाद नहीं मिला।</td></tr>';
        return;
    }

    elements.productTableBody.innerHTML = products.map(product => `
        <tr>
            <td><img src="${product.image}" alt="${product.name}"></td>
            <td>${product.name}</td>
            <td>${getCategoryName(product.category)}</td>
            <td>₹${formatIndianPrice(product.price)}</td>
            <td>${product.rating.toFixed(1)} ⭐</td>
            <td><button class="delete-btn" onclick="window.deleteProduct('${product.productKey}')">हटाएं</button></td>
        </tr>
    `).join('');
}

// Render users table
function renderUsers() {
    if (!elements.usersTableBody) return;

    if (!users.length) {
        elements.usersTableBody.innerHTML = '<tr><td colspan="5">कोई ग्राहक नहीं मिला।</td></tr>';
        return;
    }

    elements.usersTableBody.innerHTML = users.map(user => `
        <tr class="clickable-row" onclick="window.showUserDetails('${user.userKey}')">
            <td>${user.name || 'N/A'}</td>
            <td>${user.email || 'N/A'}</td>
            <td>${user.createdAt ? formatIndianDate(user.createdAt) : 'N/A'}</td>
            <td>${user.lastLogin ? formatIndianDate(user.lastLogin) : 'N/A'}</td>
            <td><button class="delete-btn" onclick="event.stopPropagation(); window.deleteUser('${user.userKey}')">हटाएं</button></td>
        </tr>
    `).join('');
}

// Render orders table
function renderOrders() {
    if (!elements.ordersTableBody) return;

    if (!orders.length) {
        elements.ordersTableBody.innerHTML = '<tr><td colspan="7">कोई ऑर्डर नहीं मिला।</td></tr>';
        return;
    }

    elements.ordersTableBody.innerHTML = orders.map(order => `
        <tr class="clickable-row" onclick="window.showOrderDetails('${order.orderKey}')">
            <td>${order.orderId || order.orderKey}</td>
            <td>${order.shipping?.firstName} ${order.shipping?.lastName}</td>
            <td>${order.items?.length || 0} आइटम</td>
            <td>₹${formatIndianPrice(order.orderSummary?.total || 0)}</td>
            <td><span class="status-badge status-${order.status || 'pending'}">${getStatusName(order.status || 'pending')}</span></td>
            <td>${order.createdAt ? formatIndianDate(order.createdAt) : 'N/A'}</td>
            <td>
                <button class="delete-btn" onclick="event.stopPropagation(); window.deleteOrder('${order.orderKey}')">हटाएं</button>
            </td>
        </tr>
    `).join('');
}

// Render analytics
function renderAnalytics() {
    renderTopProducts();
    renderRecentActivity();
}

// Render top products
function renderTopProducts() {
    if (!elements.topProductsList) return;

    // Calculate top products by order frequency
    const productCounts = {};
    orders.forEach(order => {
        order.items?.forEach(item => {
            productCounts[item.id] = (productCounts[item.id] || 0) + (item.quantity || 1);
        });
    });

    const topProducts = Object.entries(productCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([productId, count]) => {
            const product = products.find(p => String(p.id) === String(productId));
            return { product, count };
        })
        .filter(item => item.product);

    elements.topProductsList.innerHTML = topProducts.map(({ product, count }) => `
        <div class="product-item">
            <img src="${product.image}" alt="${product.name}">
            <div>
                <div style="font-weight: 600;">${product.name}</div>
                <div style="color: #666; font-size: 0.9rem;">${count} ऑर्डर</div>
            </div>
        </div>
    `).join('');
}

// Render recent activity
function renderRecentActivity() {
    if (!elements.recentActivity) return;

    const recentOrders = orders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10);

    elements.recentActivity.innerHTML = recentOrders.map(order => `
        <div class="activity-item">
            <i class="fas fa-shopping-cart" style="color: var(--primary-color);"></i>
            <div>
                <div style="font-weight: 600;">ऑर्डर ${order.orderId || order.orderKey}</div>
                <div style="color: #666; font-size: 0.9rem;">
                    ${order.shipping?.firstName} ${order.shipping?.lastName} - ₹${formatIndianPrice(order.orderSummary?.total || 0)}
                </div>
                <div style="color: #999; font-size: 0.8rem;">
                    ${order.createdAt ? formatIndianDate(order.createdAt) : 'N/A'}
                </div>
            </div>
        </div>
    `).join('');
}

// Tab switching
window.showTab = function(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab
    const selectedTab = document.getElementById(tabName + 'Tab');
    if (selectedTab) {
        selectedTab.classList.add('active');
    }

    // Add active class to clicked button
    event.target.classList.add('active');
};

// Product management functions
function showAdminMessage(text, success = true) {
    if (!elements.message) return;
    elements.message.style.display = 'block';
    elements.message.textContent = text;
    elements.message.style.background = success ? 'rgba(39, 174, 96, 0.12)' : 'rgba(231, 76, 60, 0.12)';
    elements.message.style.color = success ? '#166534' : '#991b1b';
    setTimeout(() => {
        if (elements.message) {
            elements.message.style.display = 'none';
        }
    }, 3200);
}

function resetForm() {
    selectedImageData = '';
    if (elements.form) elements.form.reset();
    if (elements.imagePreview) {
        elements.imagePreview.src = 'https://via.placeholder.com/600x400/eeeeee/555?text=Image+Preview';
    }
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        selectedImageData = e.target.result;
        if (elements.imagePreview) {
            elements.imagePreview.src = selectedImageData;
        }
        if (elements.imageUrl) {
            elements.imageUrl.value = '';
        }
    };
    reader.readAsDataURL(file);
}

async function handleProductSubmit(event) {
    event.preventDefault();

    const name = elements.name?.value.trim();
    const category = elements.category?.value;
    const price = Number(elements.price?.value);
    const originalPrice = Number(elements.originalPrice?.value) || price;
    const rating = Number(elements.rating?.value) || 4.5;
    const description = elements.description?.value.trim();
    const url = elements.imageUrl?.value.trim();
    const image = selectedImageData || url;

    if (!name || !category || !price || !description || !image) {
        showAdminMessage('कृपया सभी आवश्यक फ़ील्ड भरें और छवि जोड़ें।', false);
        return;
    }

    // Convert INR to USD for storage (assuming 1 USD = 83.5 INR)
    const priceUSD = price / 83.5;
    const originalPriceUSD = originalPrice / 83.5;

    const newProduct = {
        id: Date.now(),
        name,
        category,
        price: priceUSD,
        originalPrice: originalPriceUSD,
        rating,
        description,
        image
    };

    try {
        const newProductRef = push(productsRef);
        await set(newProductRef, newProduct);
        showAdminMessage('उत्पाद सफलतापूर्वक जोड़ा गया। यह जल्द ही स्टोर में दिखाई देगा।');
        resetForm();
    } catch (error) {
        console.error('Error adding product:', error);
        showAdminMessage('उत्पाद जोड़ने में विफल। कृपया पुनः प्रयास करें।', false);
    }
}

async function deleteProduct(productKey) {
    try {
        const productToRemove = ref(database, `products/${productKey}`);
        await remove(productToRemove);
        showAdminMessage('उत्पाद सफलतापूर्वक हटा दिया गया।');
    } catch (error) {
        console.error('Error deleting product:', error);
        showAdminMessage('उत्पाद हटाने में विफल।', false);
    }
}

async function deleteUser(userKey) {
    try {
        const userToRemove = ref(database, `users/${userKey}`);
        await remove(userToRemove);
        showAdminMessage('ग्राहक सफलतापूर्वक हटा दिया गया।');
    } catch (error) {
        console.error('Error deleting user:', error);
        showAdminMessage('ग्राहक हटाने में विफल।', false);
    }
}

async function deleteOrder(orderKey) {
    try {
        const orderToRemove = ref(database, `orders/${orderKey}`);
        await remove(orderToRemove);
        showAdminMessage('ऑर्डर सफलतापूर्वक हटा दिया गया।');
    } catch (error) {
        console.error('Error deleting order:', error);
        showAdminMessage('ऑर्डर हटाने में विफल।', false);
    }
}

// Export functions to window
window.deleteProduct = deleteProduct;
window.deleteUser = deleteUser;
window.deleteOrder = deleteOrder;

// Utility functions for Indian localization
function formatIndianPrice(price) {
    return new Intl.NumberFormat('en-IN').format(price);
}

function formatIndianDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('hi-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getCategoryName(category) {
    const categories = {
        'casual': 'कैजुअल',
        'formal': 'फॉर्मल',
        'sports': 'स्पोर्ट्स',
        'premium': 'प्रीमियम',
        'ethnic': 'एथनिक',
        'traditional': 'पारंपरिक',
        'other': 'अन्य'
    };
    return categories[category] || category;
}

function getStatusName(status) {
    const statuses = {
        'pending': 'लंबित',
        'processing': 'प्रोसेसिंग',
        'shipped': 'भेजा गया',
        'delivered': 'पहुंचा दिया',
        'cancelled': 'रद्द'
    };
    return statuses[status] || status;
}

// Modal functions
function showUserDetails(userKey) {
    const user = users.find(u => u.userKey === userKey);
    if (!user) return;

    const modal = document.getElementById('userModal');
    const modalBody = document.getElementById('userModalBody');

    modalBody.innerHTML = `
        <div class="modal-detail-grid">
            <div class="detail-card">
                <h3>व्यक्तिगत जानकारी</h3>
                <p><span class="label">नाम:</span> <span class="value">${user.name || 'N/A'}</span></p>
                <p><span class="label">ईमेल:</span> <span class="value">${user.email || 'N/A'}</span></p>
                <p><span class="label">फोन:</span> <span class="value">${user.phone || 'N/A'}</span></p>
                <p><span class="label">पंजीकरण तारीख:</span> <span class="value">${user.createdAt ? formatIndianDate(user.createdAt) : 'N/A'}</span></p>
                <p><span class="label">अंतिम लॉगिन:</span> <span class="value">${user.lastLogin ? formatIndianDate(user.lastLogin) : 'N/A'}</span></p>
            </div>
            <div class="detail-card">
                <h3>खाता स्थिति</h3>
                <p><span class="label">स्थिति:</span> <span class="value">${user.isActive !== false ? 'सक्रिय' : 'निष्क्रिय'}</span></p>
                <p><span class="label">ईमेल सत्यापित:</span> <span class="value">${user.emailVerified ? 'हाँ' : 'नहीं'}</span></p>
                <p><span class="label">ऑर्डर संख्या:</span> <span class="value">${getUserOrderCount(user.email)}</span></p>
                <p><span class="label">कुल खर्च:</span> <span class="value">₹${formatIndianPrice(getUserTotalSpent(user.email))}</span></p>
            </div>
        </div>
        ${user.address ? `
        <div class="detail-card">
            <h3>पता</h3>
            <p>${user.address.street || ''}</p>
            <p>${user.address.city || ''}, ${user.address.state || ''} ${user.address.pincode || ''}</p>
            <p>${user.address.country || 'India'}</p>
        </div>
        ` : ''}
    `;

    modal.style.display = 'block';
}

function showOrderDetails(orderKey) {
    const order = orders.find(o => o.orderKey === orderKey);
    if (!order) return;

    const modal = document.getElementById('orderModal');
    const modalBody = document.getElementById('orderModalBody');

    modalBody.innerHTML = `
        <div class="modal-detail-grid">
            <div class="detail-card">
                <h3>ऑर्डर जानकारी</h3>
                <p><span class="label">ऑर्डर ID:</span> <span class="value">${order.orderId || order.orderKey}</span></p>
                <p><span class="label">तारीख:</span> <span class="value">${order.createdAt ? formatIndianDate(order.createdAt) : 'N/A'}</span></p>
                <p><span class="label">स्थिति:</span> <span class="value"><span class="status-badge status-${order.status || 'pending'}">${getStatusName(order.status || 'pending')}</span></span></p>
                <p><span class="label">भुगतान विधि:</span> <span class="value">${order.payment?.method || 'N/A'}</span></p>
            </div>
            <div class="detail-card">
                <h3>ग्राहक जानकारी</h3>
                <p><span class="label">नाम:</span> <span class="value">${order.shipping?.firstName} ${order.shipping?.lastName}</span></p>
                <p><span class="label">ईमेल:</span> <span class="value">${order.shipping?.email || 'N/A'}</span></p>
                <p><span class="label">फोन:</span> <span class="value">${order.shipping?.phone || 'N/A'}</span></p>
            </div>
        </div>

        ${order.shipping ? `
        <div class="detail-card">
            <h3>शिपिंग पता</h3>
            <p>${order.shipping.street || ''}</p>
            <p>${order.shipping.city || ''}, ${order.shipping.state || ''} ${order.shipping.pincode || ''}</p>
            <p>${order.shipping.country || 'India'}</p>
        </div>
        ` : ''}

        <div class="order-items">
            <h3>ऑर्डर आइटम</h3>
            ${order.items?.map(item => {
                const product = products.find(p => String(p.id) === String(item.id));
                return `
                    <div class="order-item">
                        <img src="${product?.image || '/placeholder.jpg'}" alt="${item.name}">
                        <div class="order-item-details">
                            <h4>${item.name}</h4>
                            <p>मात्रा: ${item.quantity}</p>
                            <p>आकार: ${item.size || 'N/A'}</p>
                        </div>
                        <div class="order-item-price">
                            ₹${formatIndianPrice(item.price * item.quantity)}
                        </div>
                    </div>
                `;
            }).join('') || '<p>कोई आइटम नहीं मिला</p>'}
        </div>

        <div class="order-summary">
            <h3>ऑर्डर सारांश</h3>
            <div class="summary-row">
                <span>सबटोटल:</span>
                <span>₹${formatIndianPrice(order.orderSummary?.subtotal || 0)}</span>
            </div>
            <div class="summary-row">
                <span>शिपिंग:</span>
                <span>₹${formatIndianPrice(order.orderSummary?.shipping || 0)}</span>
            </div>
            <div class="summary-row">
                <span>कर:</span>
                <span>₹${formatIndianPrice(order.orderSummary?.tax || 0)}</span>
            </div>
            <div class="summary-row">
                <span><strong>कुल:</strong></span>
                <span><strong>₹${formatIndianPrice(order.orderSummary?.total || 0)}</strong></span>
            </div>
        </div>
    `;

    modal.style.display = 'block';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Helper functions
function getUserOrderCount(email) {
    return orders.filter(order => order.shipping?.email === email).length;
}

function getUserTotalSpent(email) {
    return orders
        .filter(order => order.shipping?.email === email)
        .reduce((total, order) => total + (order.orderSummary?.total || 0), 0);
}

// Export modal functions to window
window.showUserDetails = showUserDetails;
window.showOrderDetails = showOrderDetails;
window.closeModal = closeModal;

// Admin logout function
window.adminLogout = function() {
    // Clear admin session
    sessionStorage.removeItem('isAdmin');
    sessionStorage.removeItem('adminEmail');

    // Redirect to login page
    window.location.href = 'login.html';
};