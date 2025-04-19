const fs = require('fs');
const path = require('path');

// --- Configuration ---
const API_BASE_URL = 'https://www.cheapshark.com/api/1.0';
const DEALS_ENDPOINT = `${API_BASE_URL}/deals?sortBy=Savings&pageSize=10&upperPrice=50`; // Get top 10 deals under $50 sorted by savings
const STORES_ENDPOINT = `${API_BASE_URL}/stores`;
const OUTPUT_FILE = path.join(__dirname, 'deals.json'); // Output file in the same directory as the script

// --- Helper Functions ---

/**
 * Fetches data from a given URL.
 * @param {string} url The URL to fetch data from.
 * @returns {Promise<object>} The JSON response data.
 */
async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} for URL: ${url}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Fetch Error:', error.message);
        throw error; // Re-throw to be caught by the main execution block
    }
}

/**
 * Maps CheapShark store IDs to store names.
 * @returns {Promise<Map<string, string>>} A map of storeID to store name.
 */
async function getStoreMap() {
    try {
        const storesData = await fetchData(STORES_ENDPOINT);
        const storeMap = new Map();
        storesData.forEach(store => {
            if (store.isActive) {
                storeMap.set(store.storeID, store.storeName);
            }
        });
        return storeMap;
    } catch (error) {
        console.error("Failed to fetch or process store data.");
        return new Map(); // Return empty map on failure
    }
}

/**
 * Formats the price fields.
 * @param {string} price The price string.
 * @returns {string} Formatted price string (e.g., $9.99).
 */
function formatPrice(price) {
    const priceNum = parseFloat(price);
    if (isNaN(priceNum)) {
        return 'N/A';
    }
    return `$${priceNum.toFixed(2)}`;
}

// --- Main Execution ---

async function updateDeals() {
    console.log('Starting deal update process...');

    let storeMap;
    try {
        storeMap = await getStoreMap();
        if (storeMap.size === 0) {
            console.warn("Store map is empty, proceeding without store names.");
        }
    } catch (error) {
        // Error already logged in getStoreMap
        console.error("Exiting due to failure fetching store map.");
        process.exitCode = 1; // Indicate failure but don't crash workflow
        return;
    }

    try {
        const dealsData = await fetchData(DEALS_ENDPOINT);
        console.log(`Fetched ${dealsData.length} deals from CheapShark.`);

        const formattedDeals = dealsData.map(deal => {
            // Basic format structure
            const formattedDeal = {
                title: deal.title || 'Unknown Title',
                imageUrl: deal.thumb || null, // Use 'thumb' for image
                originalPrice: formatPrice(deal.normalPrice),
                currentPrice: formatPrice(deal.salePrice),
                discountPercent: `${Math.round(parseFloat(deal.savings || 0))}%`,
                store: storeMap.get(deal.storeID) || 'Unknown Store',
                platform: 'PC', // Assuming PC platform focus
                // Placeholder affiliate link as requested
                affiliateLink: `https://example.com/deal?title=${encodeURIComponent(deal.title || 'Unknown Title')}`,
                // --- Additional useful info from CheapShark (Optional) ---
                // cheapSharkDealID: deal.dealID,
                // steamRatingPercent: deal.steamRatingPercent,
                // releaseDate: deal.releaseDate ? new Date(deal.releaseDate * 1000).toLocaleDateString() : 'N/A',
            };

             // Determine if it's free
             const currentPriceNum = parseFloat(deal.salePrice);
             formattedDeal.isFree = currentPriceNum === 0;

            return formattedDeal;
        }).slice(0, 10); // Ensure only top 10 are kept

        console.log(`Formatted ${formattedDeals.length} deals.`);

        // Write to deals.json
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(formattedDeals, null, 2)); // Pretty print JSON
        console.log(`Successfully updated ${OUTPUT_FILE}`);

    } catch (error) {
        // Error already logged in fetchData
        console.error(`Failed to fetch or process deals. ${OUTPUT_FILE} was not updated.`);
        process.exitCode = 1; // Indicate failure but don't crash workflow
    }
}

updateDeals(); // Run the main function 