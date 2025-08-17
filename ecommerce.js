// E-commerce Platform JavaScript
// Product data with comprehensive catalog
const products = [
    {
        id: 1,
        name: "MacBook Pro 16-inch",
        price: 207499,
        category: "electronics",
        rating: 5,
        icon: "fas fa-laptop",
        description: "Apple MacBook Pro with M2 Max chip, 32GB RAM, 1TB SSD. Perfect for professional development and creative work."
    },
    {
        id: 2,
        name: "iPhone 15 Pro",
        price: 99599,
        category: "mobile",
        rating: 5,
        icon: "fas fa-mobile-alt",
        description: "Latest iPhone with A17 Pro chip, 256GB storage, Pro camera system with 5x telephoto zoom."
    },
    {
        id: 3,
        name: "Sony WH-1000XM5 Headphones",
        price: 33199,
        category: "accessories",
        rating: 4,
        icon: "fas fa-headphones",
        description: "Industry-leading noise canceling wireless headphones with 30-hour battery life and premium sound quality."
    },
    {
        id: 4,
        name: "PlayStation 5",
        price: 41499,
        category: "gaming",
        rating: 5,
        icon: "fas fa-gamepad",
        description: "Next-gen gaming console with ultra-high speed SSD, ray tracing, and 4K gaming capabilities."
    },
    {
        id: 5,
        name: "Dell XPS 13",
        price: 107899,
        category: "electronics",
        rating: 4,
        icon: "fas fa-laptop",
        description: "Ultra-portable laptop with 13-inch InfinityEdge display, Intel i7 processor, and all-day battery life."
    },
    {
        id: 6,
        name: "AirPods Pro",
        price: 20749,
        category: "accessories",
        rating: 4,
        icon: "fas fa-headphones",
        description: "Active noise cancellation wireless earbuds with spatial audio and adaptive transparency."
    },
    {
        id: 7,
        name: "Samsung Galaxy S24 Ultra",
        price: 107899,
        category: "mobile",
        rating: 5,
        icon: "fas fa-mobile-alt",
        description: "Flagship Android phone with S Pen, 200MP camera, and built-in AI features for productivity."
    },
    {
        id: 8,
        name: "Xbox Series X",
        price: 41499,
        category: "gaming",
        rating: 5,
        icon: "fas fa-gamepad",
        description: "Microsoft's most powerful console with 4K gaming, 120fps, and extensive backward compatibility."
    },
    {
        id: 9,
        name: "iPad Pro 12.9-inch",
        price: 91299,
        category: "electronics",
        rating: 5,
        icon: "fas fa-tablet-alt",
        description: "Professional tablet with M2 chip, Liquid Retina XDR display, and Apple Pencil support."
    },
    {
        id: 10,
        name: "Nintendo Switch OLED",
        price: 29049,
        category: "gaming",
        rating: 4,
        icon: "fas fa-gamepad",
        description: "Hybrid gaming console with vibrant OLED screen, enhanced audio, and versatile gameplay modes."
    },
    {
        id: 11,
        name: "Logitech MX Master 3S",
        price: 8299,
        category: "accessories",
        rating: 4,
        icon: "fas fa-mouse",
        description: "Advanced wireless mouse with precise tracking, customizable buttons, and ergonomic design."
    },
    {
        id: 12,
        name: "Google Pixel 8 Pro",
        price: 82999,
        category: "mobile",
        rating: 4,
        icon: "fas fa-mobile-alt",
        description: "AI-powered Android phone with advanced computational photography and pure Google experience."
    }
];

// Application state
let cart = [];
let filteredProducts = [...products];
let currentModal = null;
let modalQuantity = 1;
let displayedProducts = 8;

// Format price in Indian Rupees
function formatPrice(price) {
  return price.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR'
  });
}


// DOM elements
const productsGrid = document.getElementById('productsGrid');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const categoryFilter = document.getElementById('categoryFilter');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const productModal = document.getElementById('productModal');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    renderProducts();
    updateCartUI();
    setupEventListeners();
    setupMobileMenu();
});

// Event listeners setup
function setupEventListeners() {
    // Search functionality
    searchInput.addEventListener('input', handleSearch);
    
    // Sort and filter
    sortSelect.addEventListener('change', handleSort);
    categoryFilter.addEventListener('change', handleFilter);
    
    // Load more products
    loadMoreBtn.addEventListener('click', loadMoreProducts);
    
    // Category cards
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            categoryFilter.value = category;
            handleFilter();
            scrollToProducts();
        });
    });

    // Close modal when clicking outside
    productModal.addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (productModal.classList.contains('active')) {
                closeModal();
            }
            if (cartSidebar.classList.contains('open')) {
                toggleCart();
            }
        }
    });
}

// Mobile menu functionality
function setupMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            this.classList.toggle('active');
        });
    }
}

// Render products in the grid
function renderProducts() {
    const productsToShow = filteredProducts.slice(0, displayedProducts);
    
    productsGrid.innerHTML = productsToShow.map(product => `
        <div class="product-card fade-in" data-id="${product.id}">
            <div class="product-image">
                <i class="${product.icon}"></i>
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <div class="product-rating">
                    ${generateStars(product.rating)}
                    <span>(${product.rating}.0)</span>
                </div>
                <div class="product-price">${formatPrice(product.price)}</div>
                <p class="product-description">${product.description.substring(0, 100)}...</p>
                <div class="product-actions">
                    <button class="btn btn-primary" onclick="addToCart(${product.id})">
                        <i class="fas fa-cart-plus"></i> Add to Cart
                    </button>
                    <button class="btn btn-secondary" onclick="openModal(${product.id})">
                        <i class="fas fa-eye"></i> View
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // Update load more button visibility
    loadMoreBtn.style.display = displayedProducts >= filteredProducts.length ? 'none' : 'block';
    
    // Animate cards
    setTimeout(() => {
        document.querySelectorAll('.product-card').forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }, 100);
}

// Generate star rating HTML
function generateStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="fas fa-star star"></i>';
        } else {
            stars += '<i class="fas fa-star star empty"></i>';
        }
    }
    return stars;
}

// Search functionality
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        filteredProducts = [...products];
    } else {
        filteredProducts = products.filter(product =>
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm)
        );
    }
    
    displayedProducts = 8;
    applyFiltersAndSort();
}

// Sort products
function handleSort() {
    const sortValue = sortSelect.value;
    
    switch (sortValue) {
        case 'price-low':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'name':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'rating':
            filteredProducts.sort((a, b) => b.rating - a.rating);
            break;
        default:
            // Default sorting by id
            filteredProducts.sort((a, b) => a.id - b.id);
    }
    
    displayedProducts = 8;
    renderProducts();
}

// Filter by category
function handleFilter() {
    const category = categoryFilter.value;
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    let filtered = [...products];
    
    // Apply search filter
    if (searchTerm !== '') {
        filtered = filtered.filter(product =>
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm)
        );
    }
    
    // Apply category filter
    if (category !== 'all') {
        filtered = filtered.filter(product => product.category === category);
    }
    
    filteredProducts = filtered;
    displayedProducts = 8;
    applyFiltersAndSort();
}

// Apply current filters and sorting
function applyFiltersAndSort() {
    handleSort();
    
    // Show "no products found" message if needed
    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = `
            <div class="no-products" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <i class="fas fa-search" style="font-size: 4rem; color: #3b82f6; margin-bottom: 1rem;"></i>
                <h3 style="color: #ffffff; margin-bottom: 1rem;">No Products Found</h3>
                <p style="color: #94a3b8;">Try adjusting your search or filter criteria.</p>
            </div>
        `;
        loadMoreBtn.style.display = 'none';
    } else {
        renderProducts();
    }
}

// Load more products
function loadMoreProducts() {
    displayedProducts += 4;
    renderProducts();
}

// Scroll to products section
function scrollToProducts() {
    document.getElementById('products').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// Cart functionality
function addToCart(productId, quantity = 1) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            ...product,
            quantity: quantity
        });
    }
    
    updateCartUI();
    saveCart();
    showCartNotification(product.name);
}

// Remove item from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartUI();
    saveCart();
}

// Update item quantity in cart
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(productId);
    } else {
        updateCartUI();
        saveCart();
    }
}

// Update cart UI
function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    cartCount.textContent = totalItems;
    cartTotal.textContent = formatPrice(totalPrice);
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h4>Your cart is empty</h4>
                <p>Add some products to get started!</p>
            </div>
        `;
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-image">
                    <i class="${item.icon}"></i>
                </div>
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <div class="cart-item-price">${formatPrice(item.price)} each</div>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span class="cart-quantity">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                    <button class="remove-item" onclick="removeFromCart(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
}

// Toggle cart sidebar
function toggleCart() {
    cartSidebar.classList.toggle('open');
    cartOverlay.classList.toggle('active');
    document.body.style.overflow = cartSidebar.classList.contains('open') ? 'hidden' : '';
}

// Clear entire cart
function clearCart() {
    if (cart.length === 0) return;
    
    if (confirm('Are you sure you want to clear your cart?')) {
        cart = [];
        updateCartUI();
        saveCart();
        showNotification('Cart cleared successfully!', 'success');
    }
}

// Checkout functionality
function checkout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'error');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // Simulate checkout process
    showNotification('Processing your order...', 'info');
    
    setTimeout(() => {
        alert(`Order placed successfully!\n\nItems: ${itemCount}\nTotal: ${formatPrice(total)}\n\nThank you for shopping with TechStore!`);
        cart = [];
        updateCartUI();
        saveCart();
        toggleCart();
    }, 2000);
}

// Product modal functionality
function openModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    currentModal = product;
    modalQuantity = 1;
    
    document.getElementById('modalTitle').textContent = 'Product Details';
    document.getElementById('modalIcon').className = product.icon;
    document.getElementById('modalProductName').textContent = product.name;
    document.getElementById('modalPrice').textContent = formatPrice(product.price);
    document.getElementById('modalDescription').textContent = product.description;
    document.getElementById('modalQuantity').textContent = modalQuantity;
    
    // Generate rating stars
    document.getElementById('modalRating').innerHTML = `
        ${generateStars(product.rating)}
        <span>(${product.rating}.0)</span>
    `;
    
    productModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    productModal.classList.remove('active');
    document.body.style.overflow = '';
    currentModal = null;
    modalQuantity = 1;
}

function increaseQuantity() {
    modalQuantity++;
    document.getElementById('modalQuantity').textContent = modalQuantity;
}

function decreaseQuantity() {
    if (modalQuantity > 1) {
        modalQuantity--;
        document.getElementById('modalQuantity').textContent = modalQuantity;
    }
}

function addToCartFromModal() {
    if (!currentModal) return;
    
    addToCart(currentModal.id, modalQuantity);
    closeModal();
}

// Local storage functions
function saveCart() {
    localStorage.setItem('ecommerce_cart', JSON.stringify(cart));
}

function loadCart() {
    const savedCart = localStorage.getItem('ecommerce_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? 'rgba(34, 197, 94, 0.9)' : type === 'error' ? 'rgba(239, 68, 68, 0.9)' : 'rgba(59, 130, 246, 0.9)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        border: 1px solid ${type === 'success' ? 'rgba(34, 197, 94, 0.3)' : type === 'error' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.3)'};
        backdrop-filter: blur(10px);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function showCartNotification(productName) {
    showNotification(`${productName} added to cart!`, 'success');
}

// Smooth scrolling for navigation
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            const offsetTop = targetSection.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Header scroll effect
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(10, 10, 10, 0.98)';
    } else {
        header.style.background = 'rgba(10, 10, 10, 0.95)';
    }
});

// Loading animation for products
function showLoadingState() {
    productsGrid.innerHTML = `
        <div class="loading" style="grid-column: 1 / -1;">
            <i class="fas fa-spinner"></i>
            <p>Loading products...</p>
        </div>
    `;
}

// Initialize product animations
function initializeAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, {
        threshold: 0.1
    });

    document.querySelectorAll('.product-card').forEach(card => {
        observer.observe(card);
    });
}



// Advanced search functionality
function performAdvancedSearch(query) {
    const searchTerms = query.toLowerCase().split(' ');
    
    return products.filter(product => {
        const searchableText = `${product.name} ${product.description} ${product.category}`.toLowerCase();
        return searchTerms.every(term => searchableText.includes(term));
    });
}

// Wishlist functionality (future enhancement)
let wishlist = JSON.parse(localStorage.getItem('ecommerce_wishlist')) || [];

function toggleWishlist(productId) {
    const index = wishlist.indexOf(productId);
    if (index > -1) {
        wishlist.splice(index, 1);
        showNotification('Removed from wishlist', 'info');
    } else {
        wishlist.push(productId);
        showNotification('Added to wishlist', 'success');
    }
    localStorage.setItem('ecommerce_wishlist', JSON.stringify(wishlist));
}

// Performance optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Debounced search
const debouncedSearch = debounce(handleSearch, 300);
searchInput.addEventListener('input', debouncedSearch);

// Analytics tracking (placeholder for future integration)
function trackEvent(eventName, eventData) {
    console.log(`Analytics: ${eventName}`, eventData);
    // Future: Integrate with analytics service
}

// Track product views
function trackProductView(productId) {
    trackEvent('product_view', { productId });
}

// Track cart additions
function trackAddToCart(productId, quantity) {
    trackEvent('add_to_cart', { productId, quantity });
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('Application error:', e.error);
    showNotification('Something went wrong. Please try again.', 'error');
});

// Service worker registration (for future PWA features)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // Future: Register service worker for offline functionality
        console.log('Service worker support detected');
    });
}
