export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    // Forward the request to the newsletter service with the API key
    const response = await fetch(process.env.NEWSLETTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEWSLETTER_API_KEY}`
      },
      body: JSON.stringify({ email })
    });

    if (!response.ok) {
      throw new Error('Newsletter service error');
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return res.status(500).json({ error: 'Subscription failed' });
  }
} 