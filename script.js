// ===== CART STATE MANAGEMENT =====
        // Maintains cart items in memory with product details and quantities
        let cart = [];

        // ===== DOM ELEMENTS =====
        const cartToggleBtn = document.getElementById('cart-toggle-btn');
        const cartCloseBtn = document.getElementById('cart-close-btn');
        const cartModal = document.getElementById('cart-modal');
        const modalBackdrop = document.getElementById('modal-backdrop');
        const cartCountBadge = document.getElementById('cart-count');
        const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
        const ctaCartBtn = document.getElementById('cta-cart-btn');
        const checkoutForm = document.getElementById('checkout-form');
        const cartItemsList = document.getElementById('cart-items-list');
        const cartItemsContainer = document.getElementById('cart-items-container');
        const emptyCartMessage = document.getElementById('empty-cart-message');
        const cartTotalSection = document.getElementById('cart-total-section');

        // ===== OPEN/CLOSE CART MODAL =====
        // Function: toggleCartModal()
        // Purpose: Show/hide the shopping cart overlay
        function toggleCartModal(show) {
            if (show) {
                cartModal.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
            } else {
                cartModal.classList.add('hidden');
                document.body.style.overflow = 'auto';
            }
        }

        cartToggleBtn.addEventListener('click', () => toggleCartModal(true));
        cartCloseBtn.addEventListener('click', () => toggleCartModal(false));
        modalBackdrop.addEventListener('click', () => toggleCartModal(false));

        // ===== ADD TO CART FUNCTION =====
        // Function: addToCart(productId, productName, productPrice, quantity)
        // Purpose: Add a product to the shopping cart with specified quantity
        // Updates cart state and re-renders the cart display
        function addToCart(productId, productName, productPrice, quantity) {
            const existingItem = cart.find(item => item.productId === productId);

            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                cart.push({
                    productId,
                    productName,
                    productPrice, // in cents
                    quantity
                });
            }

            updateCartDisplay();
            toggleCartModal(true);
        }

        // ===== REMOVE FROM CART FUNCTION =====
        // Function: removeFromCart(productId)
        // Purpose: Remove a product from the shopping cart entirely
        function removeFromCart(productId) {
            cart = cart.filter(item => item.productId !== productId);
            updateCartDisplay();
        }

        // ===== UPDATE QUANTITY FUNCTION =====
        // Function: updateQuantity(productId, newQuantity)
        // Purpose: Change the quantity of an item in the cart
        function updateQuantity(productId, newQuantity) {
            const item = cart.find(item => item.productId === productId);
            if (item) {
                item.quantity = Math.max(1, newQuantity);
                updateCartDisplay();
            }
        }

        // ===== UPDATE CART DISPLAY =====
        // Function: updateCartDisplay()
        // Purpose: Re-render cart items list, totals, and UI state
        function updateCartDisplay() {
            // Update cart count badge
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCountBadge.textContent = totalItems;

            // Update cart items list
            cartItemsList.innerHTML = '';

            if (cart.length === 0) {
                emptyCartMessage.classList.remove('hidden');
                cartTotalSection.classList.add('hidden');
            } else {
                emptyCartMessage.classList.add('hidden');
                cartTotalSection.classList.remove('hidden');

                cart.forEach(item => {
                    const itemTotal = item.productPrice * item.quantity;
                    const itemElement = document.createElement('div');
                    itemElement.className = 'flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200';
                    itemElement.innerHTML = `
                        <div class="flex-grow">
                            <h4 class="font-semibold text-gray-900 text-sm sm:text-base">${item.productName}</h4>
                            <p class="text-teal-primary font-bold mt-1">$${(itemTotal / 100).toFixed(2)}</p>
                        </div>
                        <div class="flex items-center gap-3">
                            <div class="flex items-center gap-2 bg-white border border-gray-300 rounded-lg">
                                <button class="px-2 py-1 text-gray-600 hover:text-gray-900 font-bold" data-action="decrease" data-product-id="${item.productId}">−</button>
                                <span class="w-8 text-center font-semibold text-sm">${item.quantity}</span>
                                <button class="px-2 py-1 text-gray-600 hover:text-gray-900 font-bold" data-action="increase" data-product-id="${item.productId}">+</button>
                            </div>
                            <button class="text-red-500 hover:text-red-700 font-bold text-lg" data-action="remove" data-product-id="${item.productId}">✕</button>
                        </div>
                    `;

                    // Add event listeners for quantity and remove buttons
                    itemElement.querySelector('[data-action="decrease"]').addEventListener('click', () => {
                        updateQuantity(item.productId, item.quantity - 1);
                    });
                    itemElement.querySelector('[data-action="increase"]').addEventListener('click', () => {
                        updateQuantity(item.productId, item.quantity + 1);
                    });
                    itemElement.querySelector('[data-action="remove"]').addEventListener('click', () => {
                        removeFromCart(item.productId);
                    });

                    cartItemsList.appendChild(itemElement);
                });
            }

            // Update cart total
            const totalCents = cart.reduce((sum, item) => sum + (item.productPrice * item.quantity), 0);
            document.getElementById('cart-total').textContent = '$' + (totalCents / 100).toFixed(2);
        }

        // ===== ADD TO CART BUTTON LISTENERS =====
        // Purpose: Attach event listeners to all "Add to Cart" buttons on product cards
        addToCartButtons.forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.dataset.productId;
                const productName = this.dataset.productName;
                const productPrice = parseInt(this.dataset.productPrice);
                const quantityInput = this.closest('.product-card').querySelector('input[type="number"]');
                const quantity = parseInt(quantityInput.value) || 1;

                addToCart(productId, productName, productPrice, quantity);
                quantityInput.value = 1;
            });
        });

        // ===== CTA CART BUTTON =====
        ctaCartBtn.addEventListener('click', () => toggleCartModal(true));

        // ===== CHECKOUT FORM SUBMISSION =====
        // Function: handleCheckoutSubmit(e)
        // Purpose: Validate form, prepare cart items, and process payment
        // Calls window.__processCart() with all items for unified checkout
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Get form values
            const fullName = document.getElementById('customer-name').value.trim();
            const email = document.getElementById('customer-email').value.trim();
            const phone = document.getElementById('customer-phone').value.trim();

            // Validate required fields
            if (!fullName || !email) {
                alert('Please fill in your name and email address.');
                return;
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Please enter a valid email address.');
                return;
            }

            // Check if window.__processCart is available (multi-item checkout)
            if (typeof window.__processCart === 'function') {
                // Build cart items array for __processCart
                const items = cart.map(item => ({
                    name: item.productName,
                    amountCents: item.productPrice,
                    quantity: item.quantity,
                    description: `AI Prompt Playbook - Digital Download`
                }));

                // Call platform payment function with all items
                window.__processCart({
                    items: items,
                    email: email,
                    name: fullName,
                    phone: phone || undefined
                });
            } else if (typeof window.__processPayment === 'function' && cart.length === 1) {
                // Fallback for single-item checkout
                const item = cart[0];
                window.__processPayment({
                    amountCents: item.productPrice * item.quantity,
                    email: email,
                    productName: item.productName,
                    productDescription: 'AI Prompt Playbook - Digital Download',
                    name: fullName,
                    quantity: item.quantity
                });
            } else {
                // No payment function available (development/testing)
                alert('Payment processing is not available in this environment.');
            }
        });

        // ===== INITIALIZE CART DISPLAY =====
        updateCartDisplay();