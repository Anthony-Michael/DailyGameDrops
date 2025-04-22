document.addEventListener('DOMContentLoaded', () => {
  // Set current year in footer
  const yearSpan = document.getElementById('year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // Handle newsletter signup form
  const newsletterForm = document.getElementById('newsletter-form');
  const emailInput = document.getElementById('email-input');
  const newsletterContainer = document.getElementById('newsletter-container');
  const newsletterError = document.getElementById('newsletter-error');

  if (newsletterForm && emailInput) {
    newsletterForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      
      // Clear any previous error messages
      newsletterError.style.display = 'none';
      newsletterError.textContent = '';
      
      const email = emailInput.value.trim();
      
      if (!email || !email.includes('@')) {
        newsletterError.textContent = 'Please enter a valid email address.';
        newsletterError.style.display = 'block';
        return;
      }

      try {
        const response = await fetch(import.meta.env.NEWSLETTER_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email })
        });

        if (!response.ok) {
          throw new Error('Newsletter signup failed');
        }

        // Show success message
        newsletterContainer.innerHTML = `
          <div class="newsletter-success">
            <p>Thanks for subscribing! 🎮</p>
            <p>Check your email to confirm your subscription.</p>
          </div>
        `;

      } catch (error) {
        console.error('Newsletter signup error:', error);
        newsletterError.textContent = 'Sorry, something went wrong. Please try again later.';
        newsletterError.style.display = 'block';
      }
    });
  }

  // Affiliate Link Click Tracking
  const dealsContainer = document.getElementById('deals-container');
  if (dealsContainer) {
    dealsContainer.addEventListener('click', (event) => {
      const affiliateButton = event.target.closest('.affiliate-button');
      if (affiliateButton) {
        const linkUrl = affiliateButton.href;
        let gameTitle = 'Unknown Game';
        const card = affiliateButton.closest('.deal-card');
        if (card) {
          const titleElement = card.querySelector('h3');
          if (titleElement) {
            gameTitle = titleElement.textContent;
          }
        }
        console.log('Affiliate link clicked:', { title: gameTitle, url: linkUrl });
        if (typeof gtag === 'function') {
          gtag('event', 'click_affiliate_link', {
            'event_category': 'Affiliate Links',
            'event_label': gameTitle,
            'value': linkUrl
          });
        }
      }
    });
  }

  // Mobile Menu Toggle
  const menu = document.querySelector('#mobile-menu');
  const navMenu = document.querySelector('.nav-menu');

  if (menu && navMenu) {
    menu.addEventListener('click', () => {
      menu.classList.toggle('active');
      navMenu.classList.toggle('active');
    });
  }

  // Call fetchDeals() after all functions have been declared
  fetchDeals();
});

// DOM Elements
const dealsContainer = document.getElementById('deals-container');
const loadingSpinner = document.getElementById('loading-spinner');
const errorMessage = document.getElementById('error-message');

// Hide loading spinner and error message initially
loadingSpinner.style.display = 'none';
errorMessage.style.display = 'none';

async function fetchDeals() {
    // Show loading spinner, hide error message
    loadingSpinner.style.display = 'block';
    errorMessage.style.display = 'none';
    dealsContainer.style.display = 'none';

    try {
        const response = await fetch('deals.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const deals = await response.json();
        displayDeals(deals);
        
        // Hide loading spinner, show deals
        loadingSpinner.style.display = 'none';
        dealsContainer.style.display = 'grid';
    } catch (error) {
        console.error('Error fetching deals:', error);
        
        // Hide loading spinner and deals, show error message
        loadingSpinner.style.display = 'none';
        dealsContainer.style.display = 'none';
        errorMessage.style.display = 'block';
    }
}

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
  if (deal.store === 'Humble Bundle') buttonText = 'View Bundle';
  
  const imageUrl = deal.imageUrl || 'https://via.placeholder.com/300x150.png?text=No+Image';
  const imageAlt = deal.title || 'Game Deal';

  card.innerHTML = `
    <div class="deal-image-wrapper">
      <img src="${imageUrl}" alt="${imageAlt}">
    </div>
    <div class="card-content">
        <h3>${deal.title || 'Unknown Deal'}</h3>
        <p class="details">Platform: ${deal.platform || 'N/A'} | Store: ${deal.store || 'N/A'}</p>
        <p class="price">
            ${priceHtml || 'Price not available'}
        </p>
        <a href="${deal.affiliateLink || '#'}" class="affiliate-button" target="_blank" rel="noopener sponsored">${buttonText}</a>
    </div>
  `;
  return card;
} 