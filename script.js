document.addEventListener('DOMContentLoaded', () => {
  // Set current year in footer
  const yearSpan = document.getElementById('year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // Handle newsletter signup form
  const newsletterForm = document.getElementById('newsletter-form');
  const emailInput = document.getElementById('email-input');
  const newsletterMessage = document.getElementById('newsletter-message');

  if (newsletterForm && emailInput && newsletterMessage) {
    newsletterForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const email = emailInput.value.trim();
      newsletterMessage.classList.remove('fade-out');
      newsletterMessage.style.opacity = 1;
      if (email && email.includes('@')) {
        newsletterMessage.textContent = `Thanks for subscribing, ${email}!`;
        newsletterMessage.style.color = 'green';
        emailInput.value = '';
      } else {
        newsletterMessage.textContent = 'Please enter a valid email address.';
        newsletterMessage.style.color = 'red';
      }
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          newsletterMessage.classList.add('fade-out');
        });
      });
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

async function fetchDeals() {
  const dealsContainer = document.getElementById('deals-container');
  const loader = document.getElementById('loader');
  if (!dealsContainer || !loader) {
    console.error('Deals container or loader not found!');
    if (dealsContainer)
      dealsContainer.innerHTML =
        '<p style="color: red; text-align: center;">Error: UI elements missing.</p>';
    return;
  }
  dealsContainer.innerHTML = '';
  dealsContainer.appendChild(loader);
  loader.style.display = 'block';
  try {
    console.log("Fetching deals from deals.json...");
    const response = await fetch('deals.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch deals. Status: ${response.status}`);
    }
    const deals = await response.json();
    console.log('Deals loaded:', deals);
    loader.style.display = 'none';
    dealsContainer.innerHTML = '';
    if (!deals || deals.length === 0) {
      dealsContainer.innerHTML =
        '<p style="text-align: center; padding: 20px;">No deals found today. Check back later!</p>';
      return;
    }
    deals.forEach(deal => {
      const cardElement = createDealCard(deal);
      dealsContainer.appendChild(cardElement);
    });
  } catch (error) {
    console.error('Error fetching or processing deals:', error);
    loader.style.display = 'none';
    dealsContainer.innerHTML = `
      <div style="color: red; text-align: center; padding: 40px;">
          <p><strong>Oops! Could not load game deals.</strong></p>
          <p>${error.message}</p>
          <p>Please try refreshing the page later.</p>
      </div>
    `;
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
  card.innerHTML = `
    <img src="${deal.imageUrl || 'https://via.placeholder.com/300x150.png?text=No+Image'}" alt="${deal.title || 'Game Deal'}">
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