export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    res.status(200).json({ 
      status: 'OK', 
      message: 'Serverless API is running',
      timestamp: new Date().toISOString(),
      method: req.method
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 