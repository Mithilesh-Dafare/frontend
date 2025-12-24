// Millet Products Data
const milletProducts = [
    { id: 1, name: 'Finger Millet (Ragi)', price: 120 },
    { id: 2, name: 'Pearl Millet (Bajra)', price: 100 },
    { id: 3, name: 'Foxtail Millet', price: 110 },
    { id: 4, name: 'Sorghum Millet (Jowar)', price: 95 },
    { id: 5, name: 'Proso Millet', price: 130 },
    { id: 6, name: 'Kodo Millet', price: 115 },
    { id: 7, name: 'Little Millet', price: 105 },
    { id: 8, name: 'Barnyard Millet', price: 125 }
];

let selectedProducts = {};

// Initialize order page
document.addEventListener('DOMContentLoaded', function() {
    displayProductSelection();
    updateOrderSummary();
    
    // Check if product was selected from products page
    const selectedProduct = sessionStorage.getItem('selectedProduct');
    if (selectedProduct) {
        const product = JSON.parse(selectedProduct);
        selectProduct(product.id);
        sessionStorage.removeItem('selectedProduct');
    }

    // Form submission
    document.getElementById('proceedPayment').addEventListener('click', handlePayment);
    document.getElementById('orderForm').addEventListener('input', validateForm);
});

// Display product selection
function displayProductSelection() {
    const productsSelection = document.getElementById('productsSelection');
    if (!productsSelection) return;

    productsSelection.innerHTML = milletProducts.map(product => `
        <div class="product-selection-item" data-product-id="${product.id}">
            <input type="checkbox" id="product-${product.id}" onchange="toggleProduct(${product.id})">
            <label for="product-${product.id}">
                <span class="product-name">${product.name}</span>
                <span class="product-price">₹${product.price}/Kg</span>
            </label>
            <div class="quantity-input" id="quantity-${product.id}" style="display: none;">
                <input type="number" id="qty-${product.id}" min="0.1" step="0.1" value="1" onchange="updateQuantity(${product.id})" oninput="updateQuantity(${product.id})">
                <select id="unit-${product.id}" onchange="updateQuantity(${product.id})">
                    <option value="kg">Kg</option>
                    <option value="ton">Tons</option>
                </select>
            </div>
        </div>
    `).join('');
}

// Toggle product selection
function toggleProduct(productId) {
    const checkbox = document.getElementById(`product-${productId}`);
    const quantityDiv = document.getElementById(`quantity-${productId}`);
    const productItem = document.querySelector(`[data-product-id="${productId}"]`);

    if (checkbox.checked) {
        quantityDiv.style.display = 'flex';
        productItem.classList.add('selected');
        const product = milletProducts.find(p => p.id === productId);
        if (product) {
            const quantity = parseFloat(document.getElementById(`qty-${productId}`).value) || 1;
            const unit = document.getElementById(`unit-${productId}`).value;
            selectedProducts[productId] = {
                milletName: product.name,
                price: product.price,
                quantity: unit === 'ton' ? quantity * 1000 : quantity,
                unit: unit
            };
            updateOrderSummary();
        }
    } else {
        quantityDiv.style.display = 'none';
        productItem.classList.remove('selected');
        delete selectedProducts[productId];
        updateOrderSummary();
    }
}

// Select product (used when coming from products page)
function selectProduct(productId) {
    const checkbox = document.getElementById(`product-${productId}`);
    if (checkbox && !checkbox.checked) {
        checkbox.checked = true;
        const quantityDiv = document.getElementById(`quantity-${productId}`);
        const productItem = document.querySelector(`[data-product-id="${productId}"]`);
        if (quantityDiv) {
            quantityDiv.style.display = 'flex';
            productItem.classList.add('selected');
        }
    }
    
    const product = milletProducts.find(p => p.id === productId);
    if (product) {
        const quantity = parseFloat(document.getElementById(`qty-${productId}`)?.value || 1);
        const unit = document.getElementById(`unit-${productId}`)?.value || 'kg';
        
        selectedProducts[productId] = {
            milletName: product.name,
            price: product.price,
            quantity: unit === 'ton' ? quantity * 1000 : quantity,
            unit: unit
        };
        updateOrderSummary();
    }
}

// Update quantity
function updateQuantity(productId) {
    const quantity = parseFloat(document.getElementById(`qty-${productId}`).value) || 0;
    const unit = document.getElementById(`unit-${productId}`).value;
    
    if (quantity > 0 && selectedProducts[productId]) {
        selectedProducts[productId].quantity = unit === 'ton' ? quantity * 1000 : quantity;
        selectedProducts[productId].unit = unit;
        updateOrderSummary();
    }
}

// Update order summary
function updateOrderSummary() {
    const orderItems = document.getElementById('orderItems');
    const totalAmountEl = document.getElementById('totalAmount');
    const proceedBtn = document.getElementById('proceedPayment');

    if (Object.keys(selectedProducts).length === 0) {
        orderItems.innerHTML = '<p>No products selected</p>';
        totalAmountEl.textContent = '₹0.00';
        proceedBtn.disabled = true;
        return;
    }

    let total = 0;
    orderItems.innerHTML = Object.values(selectedProducts).map(item => {
        const itemTotal = item.quantity * item.price;
        total += itemTotal;
        return `
            <div class="order-item">
                <span>${item.milletName} (${item.quantity} ${item.unit === 'ton' ? 'Kg' : 'Kg'})</span>
                <span>₹${itemTotal.toFixed(2)}</span>
            </div>
        `;
    }).join('');

    totalAmountEl.textContent = `₹${total.toFixed(2)}`;
    proceedBtn.disabled = total === 0;
}

// Validate form
function validateForm() {
    const form = document.getElementById('orderForm');
    const proceedBtn = document.getElementById('proceedPayment');
    const isValid = form.checkValidity() && Object.keys(selectedProducts).length > 0;
    proceedBtn.disabled = !isValid;
}

// Handle order submission
async function handlePayment() {
    const form = document.getElementById('orderForm');
    const submitBtn = document.getElementById('proceedPayment');
    
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    if (Object.keys(selectedProducts).length === 0) {
        alert('Please select at least one product');
        return;
    }

    // Disable button to prevent multiple submissions
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    const formData = {
        name: document.getElementById('name').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        email: document.getElementById('email').value.trim(),
        address: document.getElementById('address').value.trim(),
        city: document.getElementById('city').value.trim(),
        country: document.getElementById('country').value.trim(),
        postalCode: document.getElementById('postalCode').value.trim(),
        items: Object.values(selectedProducts).map(item => ({
            ...item,
            quantity: item.unit === 'ton' ? item.quantity * 1000 : item.quantity,
            unit: 'kg' // Convert all to kg for backend
        })),
        totalAmount: parseFloat(document.getElementById('totalAmount').textContent.replace('₹', ''))
    };

    try {
        // Submit order to backend
        const response = await fetch('https://backend-sandy-delta-67.vercel.app/api/order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to submit order');
        }

        // Show success message
        document.getElementById('successModal').style.display = 'block';
        document.getElementById('orderForm').reset();
        selectedProducts = {};
        updateOrderSummary();
        
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.textContent = 'Place Order';
        
    } catch (error) {
        console.error('Order submission error:', error);
        alert('Failed to submit order. Please try again.');
        
        // Reset button state on error
        submitBtn.disabled = false;
        submitBtn.textContent = 'Place Order';
    }
}

// Close modal
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('successModal');
    const closeModal = document.querySelector('.close-modal');
    
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            modal.style.display = 'none';
            // Redirect to home page after closing modal
            window.location.href = '/';
        });
    }

    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
            // Redirect to home page after clicking outside modal
            window.location.href = '/';
        }
    });
});

