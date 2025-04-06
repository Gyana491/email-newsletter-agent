import express from 'express';
import cors from 'cors';
import { main, sendNewsletter } from './generate-newsletter.js';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// API Route
app.get('/send-newsletter', async (req, res) => {
  console.log('🔄 Starting newsletter generation and sending process...');
  
  try {
    console.log('📨 Step 1: Generating newsletter content...');
    const newsletterContent = await main();
    console.log('✅ Newsletter content generated successfully');
    
    console.log('📧 Step 2: Attempting to send newsletter...');
    const result = await sendNewsletter(newsletterContent);
    console.log('✅ Newsletter sent successfully:', result);
    
    res.json({ 
      success: true, 
      message: 'Newsletter generated and sent successfully!',
      details: result
    });
  } catch (error) {
    console.error('❌ Error in newsletter process:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: error.details || {}
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({ 
    success: false, 
    error: err.message,
    details: err.details || {}
  });
});

// Create server with detailed logging
const server = app.listen(port, '0.0.0.0', (err) => {
  if (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
  console.log(`
🚀 Server Status:
- Running on port: ${port}
- Time: ${new Date().toISOString()}
- Environment: ${process.env.NODE_ENV || 'development'}
  `);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${port} is already in use`);
  } else {
    console.error('❌ Server error:', err);
  }
  process.exit(1);
});