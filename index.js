const express = require('express');
const app = express();
app.set('trust proxy', 1);
const port = 3000;
const { Cashfree, CFEnvironment } = require('cashfree-pg');
const dotenv = require('dotenv');
dotenv.config();

const expressrateLimit = require('express-rate-limit');

const limiter = expressrateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the deprecated `X-RateLimit-*` headers
    message: 'Too many requests, please try again later.'
});

const cashfree = new Cashfree(
    CFEnvironment.PRODUCTION,
    process.env.APP_ID,
    process.env.APP_SECRET
);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

function createOrder() {
    var request = {
		order_amount: "1",
		order_currency: "INR",
		customer_details: {
			customer_id: "node_sdk_test",
			customer_name: "",
			customer_email: "example@gmail.com",
			customer_phone: "9999999999",
		},
		order_note: "",
        // order_expiry_time: "2026-02-03T00:00:+05:30"
	};

    return cashfree.PGCreateOrder(request);
}

app.use(limiter);
app.use(express.json());

app.get('/create-order', async (req, res) => {
    // cashfree.orders.create(orderData)
    //     .then(response => {
    //         res.json(response);
    //     })
    //     .catch(error => {
    //         res.status(500).json({ error: error.message });
    //     });

    try {
        let response = await createOrder();
        console.log(response);
        if(response.status===200){
            res.json({
                status: response.status,
                message: response.message,
                data: response.data
            });
        } else {
            res.status(500).json({ 
                status: response.status,
                error: response.message 
            });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

module.exports = app;