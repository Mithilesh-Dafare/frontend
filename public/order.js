// Millet Products Data (same as products.js)
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
let razorpayOrderId = null;

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

// Handle payment
async function handlePayment() {
    const form = document.getElementById('orderForm');
    
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    if (Object.keys(selectedProducts).length === 0) {
        alert('Please select at least one product');
        return;
    }

    const formData = {
        name: document.getElementById('name').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        email: document.getElementById('email').value.trim(),
        address: document.getElementById('address').value.trim(),
        city: document.getElementById('city').value.trim(),
        country: document.getElementById('country').value.trim(),
        postalCode: document.getElementById('postalCode').value.trim(),
        items: Object.values(selectedProducts),
        totalAmount: parseFloat(document.getElementById('totalAmount').textContent.replace('₹', ''))
    };

    try {
        // Create Razorpay order
        const response = await fetch('/api/create-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Failed to create order');
        }

        razorpayOrderId = data.orderId;

        // Initialize Razorpay checkout
        const options = {
            key: 'your_razorpay_key_id', // Replace with your Razorpay key
            amount: data.amount,
            currency: data.currency,
            name: 'SayOne Ventures',
            description: 'Millet Order',
            order_id: data.orderId,
            handler: function(response) {
                verifyPayment(response, formData);
            },
            prefill: {
                name: formData.name,
                email: formData.email,
                contact: formData.phone
            },
            theme: {
                color: '#2d5016'
            },
            modal: {
                ondismiss: function() {
                    alert('Payment cancelled');
                }
            }
        };

        const razorpay = new Razorpay(options);
        razorpay.open();
    } catch (error) {
        console.error('Payment error:', error);
        alert('Failed to process payment. Please try again.');
    }
}

// Verify payment
async function verifyPayment(paymentResponse, formData) {
    try {
        const response = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...formData,
                paymentId: paymentResponse.razorpay_payment_id,
                orderId: paymentResponse.razorpay_order_id
            })
        });

        const data = await response.json();

        if (data.success) {
            // Show success modal
            document.getElementById('successModal').style.display = 'block';
            // Reset form
            document.getElementById('orderForm').reset();
            selectedProducts = {};
            updateOrderSummary();
        } else {
            throw new Error(data.error || 'Payment verification failed');
        }
    } catch (error) {
        console.error('Verification error:', error);
        alert('Payment verification failed. Please contact support.');
    }
}

// Close modal
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('successModal');
    const closeModal = document.querySelector('.close-modal');
    
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }

    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});

