const express = require('express');
const bodyParser = require('body-parser');
const Stripe = require('stripe');

// Replace with your Stripe secret key
const stripe = Stripe('sk_test_51QA7S8AWH1At8PiUzUgL0hKv5UQyQ4lpQuDWLdwMvk8iSxbviNDzTfCAEZOgF5DXMI7IZFiXR9ikaZ2YTrDxH0PQ00GsKMNpLf');

const app = express();
const PORT = 3000;

// Middleware to parse JSON requests
app.use(bodyParser.json());

// API endpoint to create a customer
app.post('/api/create-customer', async (req, res) => {
  try {
    const { name, email, payment_method } = req.body;

    // Create a new customer in Stripe
    const customer = await stripe.customers.create({
      name,
      email,
      payment_method,
      invoice_settings: { default_payment_method: payment_method },
    });

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      customer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
