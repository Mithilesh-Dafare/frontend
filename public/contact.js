// Handle contact form submission
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const messageDiv = document.getElementById('contactMessage');

    // Check if product info is in URL
    const urlParams = new URLSearchParams(window.location.search);
    const productName = urlParams.get('product');
    const productPrice = urlParams.get('price');

    if (productName && productPrice) {
        // Pre-fill message with product information
        const messageTextarea = document.getElementById('contactMessageText');
        if (messageTextarea) {
            messageTextarea.value = `I am interested in purchasing ${productName} at ₹${productPrice}/Kg.\n\nPlease provide more information about availability and bulk pricing options.`;
        }
    }

    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const formData = {
                name: document.getElementById('contactName').value.trim(),
                email: document.getElementById('contactEmail').value.trim(),
                message: document.getElementById('contactMessageText').value.trim()
            };

            // Validate
            if (!formData.name || !formData.email || !formData.message) {
                showMessage('Please fill in all fields', 'error');
                return;
            }

            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();

                if (data.success) {
                    showMessage(data.message, 'success');
                    contactForm.reset();
                } else {
                    showMessage(data.error || 'Failed to send message', 'error');
                }
            } catch (error) {
                console.error('Contact form error:', error);
                showMessage('Failed to send message. Please try again.', 'error');
            }
        });
    }
});

// Show message
function showMessage(message, type) {
    const messageDiv = document.getElementById('contactMessageDiv');
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`;
        
        // Scroll to message
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Hide after 5 seconds
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }
}

