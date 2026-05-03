// Firebase variables
let currentUser = null;
let auth = null;
let database = null;

// Product Data
const initialProducts = [
    {
        id: 1,
        name: "Classic White Dress Shirt",
        category: "formal",
        price: 89.99,
        originalPrice: 129.99,
        description: "Premium cotton dress shirt perfect for business meetings",
        image: "https://via.placeholder.com/400x300/ffffff/333?text=White+Dress+Shirt",
        rating: 4.8
    },
    {
        id: 2,
        name: "Black Casual T-Shirt",
        category: "casual",
        price: 49.99,
        originalPrice: 79.99,
        description: "Comfortable cotton blend casual shirt",
        image: "https://via.placeholder.com/400x300/1a1a1a/fff?text=Black+Casual",
        rating: 4.6
    },
    {
        id: 3,
        name: "Performance Sports Shirt",
        category: "sports",
        price: 59.99,
        originalPrice: 99.99,
        description: "Breathable moisture-wicking sports shirt",
        image: "https://via.placeholder.com/400x300/3498db/fff?text=Sports+Shirt",
        rating: 4.7
    },
    {
        id: 4,
        name: "Luxury Premium Silk Shirt",
        category: "premium",
        price: 199.99,
        originalPrice: 299.99,
        description: "100% pure silk luxury shirt for special occasions",
        image: "https://via.placeholder.com/400x300/d4af37/000?text=Premium+Silk",
        rating: 5.0
    }
];

let products = [...initialProducts];

// Admin configuration
const ADMIN_EMAIL = 'admin@gmail.com';

// Check if user is admin
function isAdminUser(email) {
    // Check both Firebase user and session storage for admin
    const sessionAdmin = sessionStorage.getItem('isAdmin') === 'true';
    const sessionEmail = sessionStorage.getItem('adminEmail');
    return (email === ADMIN_EMAIL) || (sessionAdmin && sessionEmail === ADMIN_EMAIL);
}
let cart = [];
let currentCategory = 'all';

// Initialize Firebase and app
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Wait for Firebase to initialize
        await initializeFirebase();
        loadProductsFromFirebase();
        loadCart();
        renderProducts('all');
        updateCartCount();
        setupAuthListener();
    } catch (error) {
        console.error('Firebase initialization error:', error);
        // Fallback to localStorage if Firebase fails
        loadCart();
        renderProducts('all');
        updateCartCount();
    }
});

// Initialize Firebase
async function initializeFirebase() {
    return new Promise((resolve, reject) => {
        const checkFirebase = () => {
            if (window.firebaseApp && window.firebaseAuth && window.firebaseDB) {
                auth = window.firebaseAuth;
                database = window.firebaseDB;
                resolve();
            } else {
                setTimeout(checkFirebase, 100);
            }
        };
        checkFirebase();
    });
}

// Setup authentication listener
function setupAuthListener() {
    if (auth) {
        window.firebaseOnAuthStateChanged(auth, (user) => {
            currentUser = user;
            if (user) {
                console.log('User logged in:', user.email);
                loadUserCart();
                updateAuthUI(true);
            } else {
                console.log('User logged out');
                updateAuthUI(false);
            }
        });
    }
}

// Update authentication UI
function updateAuthUI(isLoggedIn) {
    const loginBtn = document.querySelector('.login-btn');
    const sidebarAdminLink = document.getElementById('sidebarAdminLink');
    const navbarAdminBtn = document.getElementById('navbarAdminBtn');

    if (loginBtn) {
        if (isLoggedIn && currentUser) {
            loginBtn.innerHTML = `<i class="fas fa-user"></i> ${currentUser.displayName || currentUser.email.split('@')[0]}`;
            loginBtn.href = '#';
            loginBtn.onclick = () => {
                if (auth) {
                    auth.signOut();
                }
            };

            // Check if user is admin
            if (isAdminUser(currentUser.email)) {
                // Show admin links
                if (sidebarAdminLink) sidebarAdminLink.style.display = 'block';
                if (navbarAdminBtn) navbarAdminBtn.style.display = 'inline-flex';
            } else {
                // Hide admin links for regular users
                if (sidebarAdminLink) sidebarAdminLink.style.display = 'none';
                if (navbarAdminBtn) navbarAdminBtn.style.display = 'none';
            }
        } else {
            loginBtn.innerHTML = `<i class="fas fa-user"></i> Login`;
            loginBtn.href = 'login.html';
            loginBtn.onclick = null;

            // Hide admin links when logged out
            if (sidebarAdminLink) sidebarAdminLink.style.display = 'none';
            if (navbarAdminBtn) navbarAdminBtn.style.display = 'none';
        }
    }
}

// Load user's cart from Firebase
function loadUserCart() {
    if (!currentUser || !database) return;

    const cartRef = window.firebaseRef(database, `carts/${currentUser.uid}`);
    window.firebaseOnValue(cartRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            cart = Object.values(data);
        } else {
            cart = [];
        }
        renderProducts(currentCategory);
        updateCartCount();
    });
}

// Save cart to Firebase
function saveCartToFirebase() {
    if (!currentUser || !database) {
        // Fallback to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        return;
    }

    const cartRef = window.firebaseRef(database, `carts/${currentUser.uid}`);
    const cartData = {};
    cart.forEach((item, index) => {
        cartData[index] = item;
    });

    window.firebaseSet(cartRef, cartData);
}

// Load cart from localStorage (fallback)
function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

// Load products from Firebase
function loadProductsFromFirebase() {
    if (!database) {
        products = [...initialProducts];
        renderProducts(currentCategory);
        return;
    }

    const productsRef = window.firebaseRef(database, 'products');
    window.firebaseOnValue(productsRef, (snapshot) => {
        const value = snapshot.val();
        if (value) {
            products = Object.keys(value).map(key => {
                const item = value[key];
                return {
                    ...item,
                    id: Number(item.id) || item.id,
                    productKey: key
                };
            });
        } else {
            products = [...initialProducts];
        }
        renderProducts(currentCategory);
    }, (error) => {
        console.error('Error loading products from Firebase:', error);
        products = [...initialProducts];
        renderProducts(currentCategory);
    });
}

// Toggle Side Navbar
function toggleSideNavbar() {
    const sideNavbar = document.getElementById('sideNavbar');
    sideNavbar.classList.toggle('active');

    // Close when clicking a link
    const links = sideNavbar.querySelectorAll('.sidebar-link');
    links.forEach(link => {
        link.addEventListener('click', () => {
            sideNavbar.classList.remove('active');
        });
    });
}

// Close sidebar when clicking outside
document.addEventListener('click', (e) => {
    const sideNavbar = document.getElementById('sideNavbar');
    const menuBtn = document.querySelector('.menu-btn');
    if (!sideNavbar.contains(e.target) && !menuBtn.contains(e.target)) {
        sideNavbar.classList.remove('active');
    }
});

// Filter Products by Category
function filterCategory(category) {
    currentCategory = category;
    renderProducts(category);

    // Update active button
    const buttons = document.querySelectorAll('.category-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}

// Render Products
function renderProducts(category) {
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = '';

    let filteredProducts = products;
    if (category !== 'all') {
        filteredProducts = products.filter(p => p.category === category);
    }

    filteredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';

        const isInCart = cart.some(item => String(item.id) === String(product.id));
        const buttonClass = isInCart ? 'added' : '';
        const buttonText = isInCart ? '✓ Added' : '+ Add to Cart';

        productCard.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <div class="product-name">${product.name}</div>
                <div class="product-description">${product.description}</div>
                <div class="product-rating">
                    ${'★'.repeat(Math.floor(product.rating))} ${product.rating}
                </div>
                <div class="product-footer">
                    <div>
                        <span class="original-price">₹${(product.originalPrice * 83.5).toFixed(0)}</span>
                        <span class="product-price">₹${(product.price * 83.5).toFixed(0)}</span>
                    </div>
                    <button class="add-to-cart-btn ${buttonClass}" onclick="addToCart(${product.id})">${buttonText}</button>
                </div>
            </div>
        `;

        productsGrid.appendChild(productCard);
    });
}

// Add to Cart
function addToCart(productId) {
    const product = products.find(p => String(p.id) === String(productId));

    const existingItem = cart.find(item => String(item.id) === String(productId));

    if (!existingItem) {
        cart.push({
            ...product,
            quantity: 1,
            addedAt: new Date().toISOString()
        });

        // Update button
        const buttons = document.querySelectorAll('.add-to-cart-btn');
        buttons.forEach(btn => {
            if (btn.getAttribute('onclick').includes(productId)) {
                btn.classList.add('added');
                btn.textContent = '✓ Added';
            }
        });

        saveCartToFirebase();
        updateCartCount();
        showNotification('Added to cart!');
    }
}

// Update Cart Count
function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        cartCount.textContent = cart.length;
    }
}

// Show Notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: #27ae60;
        color: white;
        padding: 1rem 2rem;
        border-radius: 4px;
        z-index: 2000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-weight: 500;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Scroll to Products
function scrollToProducts() {
    document.getElementById('productsSection').scrollIntoView({ behavior: 'smooth' });
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }

    /* Enhanced mobile responsiveness */
    @media (max-width: 1200px) {
        .hero {
            padding: 3rem;
        }
    }

    @media (max-width: 992px) {
        .navbar-container {
            max-width: 100%;
            padding: 0 1rem;
        }

        .hero {
            padding: 2rem 1rem;
        }

        .products-section {
            padding: 3rem 1rem;
        }
    }

    @media (max-width: 768px) {
        .navbar-container {
            position: relative;
        }

        .navbar-left {
            min-width: auto;
        }

        .navbar-center {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: var(--primary-color);
            padding: 1rem;
            transform: translateY(-100%);
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }

        .navbar-center.active {
            transform: translateY(0);
            opacity: 1;
            visibility: visible;
        }

        .search-bar {
            width: 100%;
            margin-bottom: 0.5rem;
        }

        .search-btn {
            width: 100%;
        }

        .hero-content h1 {
            font-size: 1.8rem;
            line-height: 1.2;
        }

        .hero-image img {
            border-radius: 8px;
        }

        .category-buttons {
            flex-wrap: wrap;
            justify-content: center;
        }

        .category-btn {
            flex: 1;
            min-width: 120px;
            margin: 0.25rem;
        }

        .product-card {
            margin: 0 auto;
            max-width: 100%;
        }

        .product-info {
            padding: 1rem;
        }

        .product-name {
            font-size: 1.1rem;
        }

        .product-description {
            font-size: 0.85rem;
        }

        .footer-content {
            grid-template-columns: 1fr;
            gap: 2rem;
        }
    }

    @media (max-width: 576px) {
        .navbar {
            padding: 0.5rem 0;
        }

        .navbar-container {
            padding: 0 0.5rem;
        }

        .logo {
            font-size: 1rem;
        }

        .menu-btn {
            padding: 0.5rem;
        }

        .login-btn {
            padding: 0.4rem 0.8rem;
            font-size: 0.8rem;
        }

        .cart-icon {
            font-size: 1.2rem;
        }

        .hero {
            padding: 1.5rem 1rem;
        }

        .hero-content h1 {
            font-size: 1.5rem;
        }

        .hero-content p {
            font-size: 0.9rem;
        }

        .hero-btn {
            padding: 0.8rem 1.5rem;
            font-size: 0.9rem;
        }

        .category-section h2 {
            font-size: 1.8rem;
        }

        .products-section h2 {
            font-size: 1.8rem;
        }

        .product-image {
            height: 180px;
        }

        .product-price {
            font-size: 1.3rem;
        }

        .add-to-cart-btn {
            padding: 0.5rem 0.8rem;
            font-size: 0.8rem;
        }

        .footer {
            padding: 2rem 1rem 1rem;
        }

        .footer-section h3 {
            font-size: 1rem;
        }
    }

    @media (max-width: 480px) {
        .hero-content h1 {
            font-size: 1.3rem;
        }

        .hero-btn {
            width: 100%;
            padding: 0.8rem;
        }

        .category-btn {
            padding: 0.5rem 0.8rem;
            font-size: 0.75rem;
        }

        .product-card {
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .product-footer {
            flex-direction: column;
            gap: 0.5rem;
            align-items: stretch;
        }

        .add-to-cart-btn {
            width: 100%;
        }
    }

    /* Loading states */
    .loading {
        opacity: 0.6;
        pointer-events: none;
    }

    .loading::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 20px;
        height: 20px;
        margin: -10px 0 0 -10px;
        border: 2px solid var(--secondary-color);
        border-top: 2px solid transparent;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    /* Touch-friendly interactions */
    @media (hover: none) and (pointer: coarse) {
        .product-card {
            transition: transform 0.2s ease;
        }

        .product-card:active {
            transform: scale(0.98);
        }

        .add-to-cart-btn {
            transition: all 0.2s ease;
        }

        .add-to-cart-btn:active {
            transform: scale(0.95);
        }

        .category-btn {
            transition: all 0.2s ease;
        }

        .category-btn:active {
            transform: scale(0.95);
        }
    }
`;
document.head.appendChild(style);

