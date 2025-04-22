export default async function handler(req, res) {
  console.log("Received request to /api/subscribe");

  // Only allow POST requests
  if (req.method !== 'POST') {
    console.error("Method not allowed:", req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;
    console.log("Submitted email:", email);

    if (!email || !email.includes('@')) {
      console.error("Invalid email received:", email);
      return res.status(400).json({ error: 'Valid email is required' });
    }

    const apiUrl = process.env.NEWSLETTER_API_URL;
    const apiKey = process.env.NEWSLETTER_API_KEY;

    console.log("Newsletter API URL:", apiUrl);
    console.log("API Key Present:", !!apiKey); // Log boolean, not the key itself

    if (!apiUrl || !apiKey) {
      console.error("Missing API URL or Key in environment variables.");
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Forward the request to the newsletter service with the API key
    console.log("Forwarding request to:", apiUrl);
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}` // Use the actual API key here
      },
      body: JSON.stringify({ email })
    });

    // Log the response status and attempt to parse the body
    console.log("Newsletter service response status:", response.status);
    let responseData = {};
    try {
        responseData = await response.json();
        console.log("Newsletter service response body:", JSON.stringify(responseData, null, 2));
    } catch (parseError) {
        console.warn("Could not parse newsletter service response as JSON. Raw text:", await response.text());
        responseData = { message: "Received non-JSON response from service." };
    }

    if (!response.ok) {
      console.error("Newsletter service returned an error:", { status: response.status, body: responseData });
      // Relay the error status and message if possible, otherwise use a generic message
      const errorMsg = responseData.error || responseData.message || 'Subscription failed at external service';
      return res.status(response.status < 500 ? response.status : 500).json({ error: errorMsg });
    }

    console.log("Successfully subscribed email:", email);
    return res.status(200).json(responseData);

  } catch (error) {
    console.error('Unhandled error during newsletter subscription:', error);
    return res.status(500).json({ error: 'Internal server error during subscription' });
  }
} 