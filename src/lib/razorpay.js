// Utility helper to dynamically load Razorpay checkout script and open payment gateway

export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const DEFAULT_RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_TFicYTXOl4wTZ1';

/**
 * Open Razorpay Checkout Modal
 * @param {Object} options 
 * @param {number} options.amount Amount in Rupees (e.g. 14999)
 * @param {string} options.name Business/Merchant Name
 * @param {string} options.description Payment description
 * @param {string} [options.key] Razorpay Key ID
 * @param {Object} [options.prefill] User prefill information { name, email, contact }
 * @param {Function} options.onSuccess Success callback (paymentResponse)
 * @param {Function} [options.onFailure] Failure callback (errorResponse)
 */
export const initializeRazorpayPayment = async ({
  amount,
  currency = 'INR',
  name = 'DinePulse',
  description = 'Restaurant Payment',
  image = '/logo.png',
  key,
  prefill = {},
  onSuccess,
  onFailure
}) => {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded) {
    alert('Failed to load Razorpay SDK. Please check your internet connection.');
    if (onFailure) onFailure(new Error('Razorpay SDK failed to load'));
    return;
  }

  const razorpayKey = key || DEFAULT_RAZORPAY_KEY;

  const options = {
    key: razorpayKey,
    amount: Math.round(amount * 100), // Razorpay accepts amount in paise
    currency: currency === '₹' ? 'INR' : currency,
    name: name,
    description: description,
    image: image,
    prefill: {
      name: prefill.name || '',
      email: prefill.email || '',
      contact: prefill.contact || ''
    },
    theme: {
      color: '#f59e0b' // Champagne Gold matching DinePulse theme
    },
    handler: function (response) {
      // response includes razorpay_payment_id, razorpay_order_id, razorpay_signature
      if (onSuccess) onSuccess(response);
    },
    modal: {
      ondismiss: function () {
        if (onFailure) onFailure({ dismissed: true });
      }
    }
  };

  const paymentObject = new window.Razorpay(options);
  paymentObject.on('payment.failed', function (response) {
    if (onFailure) onFailure(response.error);
  });
  paymentObject.open();
};
