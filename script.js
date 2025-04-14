// Placeholder for fetching and rendering deals - to be implemented next
fetchDeals();

// Function to fetch deals from deals.json
async function fetchDeals() {
    const dealsContainer = document.getElementById('deals-container');
    const loader = document.getElementById('loader'); // Get loader element

    if (!dealsContainer || !loader) {
        console.error('Deals container or loader not found!');
        if(dealsContainer) dealsContainer.innerHTML = '<p style="color: red; text-align: center;">Error: UI elements missing.</p>';
        return;
    }

    // Keep loader visible initially, clearing previous deals/errors if any
    dealsContainer.innerHTML = ''; 
    dealsContainer.appendChild(loader); // Make sure loader is there
    loader.style.display = 'block'; // Ensure loader is visible

    try {
        console.log('Fetching deals from deals.json...');
        const response = await fetch('deals.json');

        // Simulate network delay for testing loader (remove in production)
        // await new Promise(resolve => setTimeout(resolve, 1500));

        if (!response.ok) {
            // Handle network errors (e.g., file not found, 404, 500)
            throw new Error(`Failed to fetch deals. Status: ${response.status}`);
        }

        const deals = await response.json();
        console.log('Deals loaded:', deals);

        loader.style.display = 'none'; // Hide loader
        dealsContainer.innerHTML = ''; // Clear loader before adding deals

        if (!deals || deals.length === 0) {
            // Display a message if no deals are found
            dealsContainer.innerHTML = '<p style="text-align: center; padding: 20px;">No deals found today. Check back later!</p>';
            return;
        }

        // Loop through each deal and create a card for it
        deals.forEach(deal => {
            const cardElement = createDealCard(deal);
            dealsContainer.appendChild(cardElement);
        });

    } catch (error) {
        console.error('Error fetching or processing deals:', error);
        loader.style.display = 'none'; // Hide loader on error too
        // Display a user-friendly error message within the container
        dealsContainer.innerHTML = `
            <div style="color: red; text-align: center; padding: 40px;">
                <p><strong>Oops! Could not load game deals.</strong></p>
                <p>${error.message}</p>
                <p>Please try refreshing the page later.</p>
            </div>
        `;
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

// --- Add Affiliate Link Click Tracking --- 
const dealsContainer = document.getElementById('deals-container');
if (dealsContainer) {
    dealsContainer.addEventListener('click', (event) => {
        // Check if the clicked element is an affiliate button or inside one
        const affiliateButton = event.target.closest('.affiliate-button');

        if (affiliateButton) {
            const linkUrl = affiliateButton.href;
            let gameTitle = 'Unknown Game';

            // Try to find the game title from the parent card
            const card = affiliateButton.closest('.deal-card');
            if (card) {
                const titleElement = card.querySelector('h3');
                if (titleElement) {
                    gameTitle = titleElement.textContent;
                }
            }

            // Log to console
            console.log('Affiliate link clicked:', {
                title: gameTitle,
                url: linkUrl
            });

            // TODO: Send event to Google Analytics (or other analytics service)
            // Example for GA (if configured):
            if (typeof gtag === 'function') {
                gtag('event', 'click_affiliate_link', {
                    'event_category': 'Affiliate Links',
                    'event_label': gameTitle, // e.g., "Cyberpunk 2077"
                    'value': linkUrl // Send the URL as the value or in a custom dimension
                });
            }
        }
    });
}
// --- End Affiliate Link Click Tracking ---

// Add event listener for newsletter form submission
document.getElementById('newsletter-form').addEventListener('submit', function(event) {
    event.preventDefault();
    handleNewsletterFormSubmission();
}); 