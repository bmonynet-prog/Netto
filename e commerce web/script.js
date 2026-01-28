// Product Data
const products = [
  {
    id: 1,
    name: "Netto V1",
    price: 199.99,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    category: "electronics",
    description: "High-quality clothes",
  },
  {
    id: 2,
    name: "Netto V2",
    price: 899.99,
    image:
      "https://images.unsplash.com/photo-1676173646307-d050e097d181?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    category: "electronics",
    description: "The collabration with WW1",
  },
  {
    id: 3,
    name: "Netto V3",
    price: 249.99,
    image:
      "https://images.unsplash.com/photo-1532435109783-fdb8a2be0baa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    category: "electronics",
    description: "Best fitness clothes",
  },
  {
    id: 4,
    name: "Ultra Laptop Pro",
    price: 1299.99,
    image:
      "https://images.unsplash.com/photo-1511385348-a52b4a160dc2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    category: "electronics",
    description: "Powerful laptop for professionals and creators",
  },
  {
    id: 5,
    name: "Running Shoes Elite",
    price: 129.99,
    image:
      "https://images.unsplash.com/photo-1562183241-b937e95585b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    category: "sports",
    description: "Comfortable running shoes for peak performance",
  },
  {
    id: 6,
    name: "Designer Winter Jacket",
    price: 179.99,
    image:
      "https://images.unsplash.com/photo-1706765779494-2705542ebe74?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    category: "fashion",
    description: "Stylish and warm jacket for the winter season",
  },
  {
    id: 7,
    name: "Travel Backpack Pro",
    price: 89.99,
    image:
      "https://images.unsplash.com/photo-1570630358718-4fb324824b3d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    category: "fashion",
    description: "Durable backpack perfect for travel adventures",
  },
  {
    id: 8,
    name: "Smart Coffee Maker",
    price: 149.99,
    image:
      "https://images.unsplash.com/photo-1608354580875-30bd4168b351?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    category: "home",
    description: "Brew the perfect cup with smart temperature control",
  },
];

// State
let cart = [];
let selectedCategory = "all";

// DOM Elements
const productsGrid = document.getElementById("productsGrid");
const noProducts = document.getElementById("noProducts");
const cartCount = document.getElementById("cartCount");
const cartBtn = document.getElementById("cartBtn");
const cartOverlay = document.getElementById("cartOverlay");
const cartSidebar = document.getElementById("cartSidebar");
const closeCartBtn = document.getElementById("closeCartBtn");
const cartItems = document.getElementById("cartItems");
const cartFooter = document.getElementById("cartFooter");
const totalAmount = document.getElementById("totalAmount");
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const mobileNav = document.getElementById("mobileNav");

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  setupEventListeners();
  updateCartUI();
});

// Setup Event Listeners
function setupEventListeners() {
  // Category buttons
  const navBtns = document.querySelectorAll(".nav-btn");
  navBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedCategory = btn.dataset.category;

      // Update active state
      document
        .querySelectorAll(".nav-btn")
        .forEach((b) => b.classList.remove("active"));
      document
        .querySelectorAll(`[data-category="${selectedCategory}"]`)
        .forEach((b) => b.classList.add("active"));

      renderProducts();

      // Close mobile menu
      mobileNav.classList.remove("active");
    });
  });

  // Cart controls
  cartBtn.addEventListener("click", openCart);
  closeCartBtn.addEventListener("click", closeCart);
  cartOverlay.addEventListener("click", closeCart);

  // Mobile menu
  mobileMenuBtn.addEventListener("click", () => {
    mobileNav.classList.toggle("active");
  });
}

// Render Products
function renderProducts() {
  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  if (filteredProducts.length === 0) {
    productsGrid.style.display = "none";
    noProducts.style.display = "block";
    return;
  }

  productsGrid.style.display = "grid";
  noProducts.style.display = "none";

  productsGrid.innerHTML = filteredProducts
    .map(
      (product, index) => `
        <div class="product-card" style="animation-delay: ${index * 0.1}s">
            <div class="product-image-container">
                <img src="${product.image}" alt="${
                  product.name
                }" class="product-image">
                <button class="quick-add-btn" onclick="addToCart(${
                  product.id
                })">
                    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                    Add to Cart
                </button>
                <div class="sale-badge">Sale</div>
            </div>
            <div class="product-info">
                <div class="product-rating">
                    ${renderStars(4)}
                    <span class="rating-count">(4.0)</span>
                </div>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-pricing">
                    <div>
                        <span class="product-price">$${product.price}</span>
                        <span class="product-price-old">$${(
                          product.price * 1.4
                        ).toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    `,
    )
    .join("");
}

// Render Stars
function renderStars(rating) {
  let stars = "";
  for (let i = 0; i < 5; i++) {
    if (i < rating) {
      stars += `
                <svg class="star filled" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
            `;
    } else {
      stars += `
                <svg class="star empty" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
            `;
    }
  }
  return stars;
}

// Add to Cart
function addToCart(productId) {
  const product = products.find((p) => p.id === productId);
  if (!product) return;

  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  updateCartUI();

  // Show quick feedback
  const btn = event.target.closest(".quick-add-btn");
  const originalText = btn.innerHTML;
  btn.innerHTML = "✓ Added!";
  btn.style.background = "#10b981";
  btn.style.color = "white";

  setTimeout(() => {
    btn.innerHTML = originalText;
    btn.style.background = "";
    btn.style.color = "";
  }, 1000);
}

// Update Cart UI
function updateCartUI() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Update cart count
  if (totalItems > 0) {
    cartCount.textContent = totalItems;
    cartCount.style.display = "flex";
  } else {
    cartCount.style.display = "none";
  }

  // Update cart items
  if (cart.length === 0) {
    cartItems.innerHTML = `
            <div class="empty-cart">
                <svg width="64" height="64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <p>Your cart is empty</p>
            </div>
        `;
    cartFooter.style.display = "none";
  } else {
    cartItems.innerHTML = cart
      .map(
        (item) => `
            <div class="cart-item">
                <img src="${item.image}" alt="${
                  item.name
                }" class="cart-item-image">
                <div class="cart-item-info">
                    <h3 class="cart-item-name">${item.name}</h3>
                    <p class="cart-item-price">$${item.price}</p>
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="updateQuantity(${
                          item.id
                        }, ${item.quantity - 1})">
                            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                        </button>
                        <span class="quantity-value">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${
                          item.id
                        }, ${item.quantity + 1})">
                            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                        </button>
                    </div>
                </div>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">
                    <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        `,
      )
      .join("");
    cartFooter.style.display = "block";
  }

  // Update total
  totalAmount.textContent = `$${total.toFixed(2)}`;
}

// Update Quantity
function updateQuantity(productId, newQuantity) {
  if (newQuantity <= 0) {
    removeFromCart(productId);
    return;
  }

  const item = cart.find((item) => item.id === productId);
  if (item) {
    item.quantity = newQuantity;
    updateCartUI();
  }
}

// Remove from Cart
function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  updateCartUI();
}

// Open Cart
function openCart() {
  cartOverlay.classList.add("active");
  cartSidebar.classList.add("active");
  document.body.style.overflow = "hidden";
}

// Close Cart
function closeCart() {
  cartOverlay.classList.remove("active");
  cartSidebar.classList.remove("active");
  document.body.style.overflow = "";
}

// Close cart on Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeCart();
  }
});
