// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the app
    console.log('DOM loaded, initializing app...');
    init();
});

// Global variables
let allCoupons = [];
let filteredCoupons = [];
let currentFilter = 'all';

// Initialize application
function init() {
    console.log('Initializing application...');
    loadCoupons();
    setupEventListeners();
    setupMobileMenu();
    updateCartCount();
}

// Mobile Menu Functionality
function setupMobileMenu() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    const dropdowns = document.querySelectorAll('.dropdown');
    
    // Check if elements exist
    if (!navToggle || !navMenu || !mobileMenuOverlay) {
        console.log('Mobile menu elements not found');
        return;
    }
    
    // Toggle mobile menu
    navToggle.addEventListener('click', function() {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        mobileMenuOverlay.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });
    
    // Close menu when clicking overlay
    mobileMenuOverlay.addEventListener('click', function() {
        closeMobileMenu();
    });
    
    // Handle dropdown menus on mobile
    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        
        if (toggle) {
            toggle.addEventListener('click', function(e) {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    dropdown.classList.toggle('active');
                    
                    // Close other dropdowns
                    dropdowns.forEach(other => {
                        if (other !== dropdown) {
                            other.classList.remove('active');
                        }
                    });
                }
            });
        }
    });
    
    // Close menu when clicking nav links
    const navLinks = document.querySelectorAll('.nav-link:not(.dropdown-toggle)');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                closeMobileMenu();
            }
        });
    });
    
    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (window.innerWidth > 768) {
                closeMobileMenu();
                dropdowns.forEach(dropdown => {
                    dropdown.classList.remove('active');
                });
            }
        }, 250);
    });
}

// Close mobile menu helper function
function closeMobileMenu() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    
    if (navToggle) navToggle.classList.remove('active');
    if (navMenu) navMenu.classList.remove('active');
    if (mobileMenuOverlay) mobileMenuOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

// Setup Event Listeners
function setupEventListeners() {
    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            // Filter coupons
            currentFilter = this.getAttribute('data-filter');
            filterCoupons(currentFilter);
        });
    });
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            searchCoupons(e.target.value);
        });
        
        // Enter key for search
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchCoupons(e.target.value);
            }
        });
    }
}

// Format date helper function
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Hide loader helper function
function hideLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.display = 'none';
    }
}

// Show loader helper function
function showLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.display = 'flex';
    }
}

// Load Coupons (Mock Data)
function loadCoupons() {
    // Show loader
    console.log('Loading coupons...');
    showLoader();
    
    // Mock coupon data
 fetch('data/coupons.json')
  .then(r => r.json())
  .then(json => {
      allCoupons = json.coupons;
      filteredCoupons = [...allCoupons];
      displayCoupons(filteredCoupons);
      hideLoader();
  })
  .catch(err => console.error(err));
    
    // Simulate loading delay
    setTimeout(() => {
        filteredCoupons = [...allCoupons];
        displayCoupons(filteredCoupons);
        hideLoader();
    }, 1000);
}

// Display Coupons
function displayCoupons(coupons) {
    const couponsGrid = document.getElementById('couponsGrid');
    
    if (!couponsGrid) {
        console.error('Coupons grid element not found!');
        return;
    }

    if (coupons.length === 0) {
        couponsGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No Coupons Found</h3>
                <p>Try adjusting your filters or search terms</p>
            </div>
        `;
        return;
    }
    
    couponsGrid.innerHTML = coupons.map(coupon => `
        <div class="coupon-card" data-category="${coupon.category}">
            <div class="coupon-header">
                <h3 class="store-name">${coupon.storeName}</h3>
            </div>
            <div class="coupon-body">
                <div class="discount-amount">${coupon.discount}</div>
                <p class="coupon-description">${coupon.description}</p>
                <div class="coupon-code">
                    <span id="code-${coupon.id}">${coupon.code}</span>
                </div>
                <div class="coupon-meta">
                    <span class="expiry-date">
                        <i class="fas fa-clock"></i> 
                        Expires: ${formatDate(coupon.expiryDate)}
                    </span>
                    <span class="category-tag">${coupon.category}</span>
                </div>
                <div class="coupon-actions">
                    <button class="btn btn-primary" onclick="copyCoupon('${coupon.code}', ${coupon.id})">
                        <i class="fas fa-copy"></i> Copy Code
                    </button>
                    <button class="btn btn-secondary" onclick="addToCart(${coupon.id})">
                        <i class="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                </div>
                ${coupon.isVerified ? '<span class="badge badge-verified">Verified</span>' : ''}
            </div>
        </div>
    `).join('');
}

// Search Coupons
function searchCoupons(searchTerm) {
    if (!searchTerm) {
        const searchInput = document.getElementById('searchInput');
        searchTerm = searchInput ? searchInput.value : '';
    }
    
    const term = searchTerm.toLowerCase().trim();
    
    if (term === '') {
        filterCoupons(currentFilter);
        return;
    }
    
    filteredCoupons = allCoupons.filter(coupon => 
        coupon.storeName.toLowerCase().includes(term) ||
        coupon.description.toLowerCase().includes(term) ||
        coupon.code.toLowerCase().includes(term) ||
        coupon.category.toLowerCase().includes(term) ||
        coupon.tags.some(tag => tag.toLowerCase().includes(term))
    );
    
    // Apply current filter on search results
    if (currentFilter !== 'all') {
        filteredCoupons = filteredCoupons.filter(coupon => {
            if (currentFilter === 'expiring') {
                return isExpiringSoon(coupon.expiryDate);
            }
            return coupon.category === currentFilter;
        });
    }
    
    displayCoupons(filteredCoupons);
}

// Filter Coupons
function filterCoupons(filter) {
    if (filter === 'all') {
        filteredCoupons = [...allCoupons];
    } else if (filter === 'expiring') {
        filteredCoupons = allCoupons.filter(coupon => isExpiringSoon(coupon.expiryDate));
    } else {
        filteredCoupons = allCoupons.filter(coupon => coupon.category === filter);
    }
    
    displayCoupons(filteredCoupons);
}

// Check if coupon is expiring soon (within 7 days)
function isExpiringSoon(expiryDate) {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
}

// Copy Coupon Code
function copyCoupon(code, couponId) {
    // Track the click
    trackClick('copy', couponId);
    
    // Copy to clipboard
    navigator.clipboard.writeText(code).then(() => {
        // Show success feedback
        const button = event.target.closest('button');
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Copied!';
        button.disabled = true;
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.disabled = false;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
}