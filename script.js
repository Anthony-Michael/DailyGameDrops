// Placeholder for fetching and rendering deals - to be implemented next
fetchDeals();

// Function to fetch deals
async function fetchDeals() {
    const dealsContainer = document.getElementById('deals-container');
    if (!dealsContainer) {
        console.error('Deals container not found!');
        return;
    }

    try {
        console.log('Fetching deals from deals.json...');
        const response = await fetch('deals.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const deals = await response.json();
        console.log('Deals loaded:', deals);

        dealsContainer.innerHTML = ''; // Clear any existing placeholders or old content

        if (deals.length === 0) {
            dealsContainer.innerHTML = '<p>No deals found today. Check back later!</p>';
            return;
        }

        deals.forEach(deal => {
            const card = createDealCard(deal);
            dealsContainer.appendChild(card);
        });

    } catch (error) {
        console.error('Error fetching or processing deals:', error);
        dealsContainer.innerHTML = '<p>Could not load deals. Please try again later.</p>';
    }
}

// Function to create a deal card element
function createDealCard(deal) {
    const card = document.createElement('article');
    card.className = 'deal-card';

    let priceHtml = '';
    if (deal.isFree) {
        priceHtml = `<span class="free">FREE!</span>`;
        if (deal.originalPrice) {
             priceHtml += ` <span class="original-price">${deal.originalPrice}</span>`;
        }
    } else if (deal.priceDescription) {
        priceHtml = `<span class="current-price">${deal.priceDescription}</span>`;
         if (deal.discountPercent) {
            priceHtml = `<span class="discount">-${deal.discountPercent}%</span> ` + priceHtml;
        }
    } else {
        if (deal.discountPercent) {
            priceHtml += `<span class="discount">-${deal.discountPercent}%</span> `;
        }
        if (deal.originalPrice) {
            priceHtml += `<span class="original-price">${deal.originalPrice}</span> `;
        }
        if (deal.currentPrice) {
            priceHtml += `<span class="current-price">${deal.currentPrice}</span>`;
        }
    }

    let buttonText = deal.isFree ? 'Claim Free Game' : 'Get Deal';
    if (deal.store === 'Humble Bundle') buttonText = 'View Bundle'; // Example customization

    card.innerHTML = `
        <img src="${deal.imageUrl || 'https://via.placeholder.com/300x150.png?text=No+Image'}" alt="${deal.title}">
        <div class="card-content">
            <h3>${deal.title}</h3>
            <p class="details">Platform: ${deal.platform || 'N/A'} | Store: ${deal.store || 'N/A'}</p>
            <p class="price">
                ${priceHtml}
            </p>
            <a href="${deal.affiliateLink || '#'}" class="affiliate-button" target="_blank" rel="noopener sponsored">${buttonText}</a>
        </div>
    `;

    return card;
}

// Newsletter form submission
function handleNewsletterFormSubmission() {
    const emailInput = document.getElementById('email');
    const newsletterMessage = document.getElementById('newsletter-message');

    if (emailInput && newsletterMessage) {
        const email = emailInput.value.trim();

        if (email && email.includes('@')) {
            // Simulate successful signup
            newsletterMessage.textContent = `Thanks for subscribing, ${email}!`;
            newsletterMessage.style.color = 'green';
            newsletterMessage.classList.remove('fade-out'); // Remove class if it exists from previous message
            newsletterMessage.style.opacity = 1; // Reset opacity
            // Add the fade-out class to trigger the animation
            // Use requestAnimationFrame to ensure the class removal is processed before adding it again
            requestAnimationFrame(() => {
                newsletterMessage.classList.add('fade-out');
            });

            emailInput.value = ''; // Clear input field

            // TODO: Integrate with actual email service API later
            console.log(`Email submitted: ${email}`);
        } else {
            newsletterMessage.textContent = 'Please enter a valid email address.';
            newsletterMessage.style.color = 'red';
            newsletterMessage.classList.remove('fade-out'); // Also remove on error
             newsletterMessage.style.opacity = 1; // Reset opacity
            // Add the fade-out class for the error message too
             requestAnimationFrame(() => {
                newsletterMessage.classList.add('fade-out');
            });
        }
    }
}

// Fetch and render deals when the page loads
fetchDeals();

// Add event listener for newsletter form submission
document.getElementById('newsletter-form').addEventListener('submit', function(event) {
    event.preventDefault();
    handleNewsletterFormSubmission();
}); 