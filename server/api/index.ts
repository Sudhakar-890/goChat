import serverless from 'serverless-http';
import app from '../src/app';

// Wrap Express app for Vercel Serverless Functions
export default serverless(app);
