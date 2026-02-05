import express from 'express';
import axios from 'axios';

const app = express();
const port = 3000;

let billingPolicy: any = null;

async function fetchBillingPolicy() {
  try {
    // Assuming the service runs on localhost in development.
    // In production, this URL would come from a configuration service.
    const response = await axios.get('http://localhost:3001/marp/policies/active?subsystem=billing');
    billingPolicy = response.data;
    console.log('Successfully fetched billing policy:', billingPolicy);
  } catch (error) {
    console.error('Failed to fetch billing policy:', error.message);
    // In a real application, we would have a retry mechanism or a fallback policy.
    process.exit(1); // Exit if we can't get a policy
  }
}

app.get('/health', (req, res) => {
  res.status(200).send('Billing Engine is running');
});

app.get('/policy', (req, res) => {
  res.status(200).json(billingPolicy);
});


async function startServer() {
  await fetchBillingPolicy();
  app.listen(port, () => {
    console.log(`Billing Engine listening at http://localhost:${port}`);
  });
}

startServer();