// Utility helper to dynamically load Razorpay checkout script and open payment gateway

export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.onload = () => resolve(true);
      existingScript.onerror = () => resolve(false);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      script.remove(); // Allow clean retries if network failed
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export const DEFAULT_RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_TFicYTXOl4wTZ1';

/**
 * Open Razorpay Checkout Modal
 * @param {Object} options 
 * @param {number} options.amount Amount in Rupees (e.g. 14999)
 * @param {string} [options.currency] Currency code (default: 'INR')
 * @param {string} [options.name] Business/Merchant Name
 * @param {string} [options.description] Payment description
 * @param {string} [options.key] Razorpay Key ID
 * @param {Object} [options.prefill] User prefill information { name, email, contact }
 * @param {Function} options.onSuccess Success callback (paymentResponse)
 * @param {Function} [options.onFailure] Failure callback (errorResponse)
 */
export const initializeRazorpayPayment = async ({
  amount,
  currency = 'INR',
  name = 'DinePulse',
  description = 'Restaurant Subscription Payment',
  image = '/logo.png',
  key,
  prefill = {},
  onSuccess,
  onFailure
}) => {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded) {
    const err = new Error('Failed to load Razorpay Checkout SDK. Please check your internet connection.');
    alert(err.message);
    if (onFailure) onFailure(err);
    return;
  }

  const razorpayKey = (key || DEFAULT_RAZORPAY_KEY || '').trim();
  if (!razorpayKey) {
    const err = new Error('Razorpay Merchant Key is missing.');
    alert(err.message);
    if (onFailure) onFailure(err);
    return;
  }

  // Sanitize Currency
  const sanitizedCurrency = (currency === '₹' || !currency) ? 'INR' : currency.toUpperCase();
  const numAmount = Number(amount) || 0;

  if (numAmount <= 0) {
    const err = new Error('Invalid payment amount specified.');
    alert(err.message);
    if (onFailure) onFailure(err);
    return;
  }

  // Resolve absolute image URL
  const absoluteImage = image.startsWith('http')
    ? image
    : `${window.location.origin}${image.startsWith('/') ? '' : '/'}${image}`;

  const options = {
    key: razorpayKey,
    amount: Math.round(numAmount * 100), // Razorpay accepts amount in paise
    currency: sanitizedCurrency,
    name: name,
    description: description,
    image: absoluteImage,
    prefill: {
      name: (prefill.name || '').trim(),
      email: (prefill.email || '').trim(),
      contact: (prefill.contact || '').trim()
    },
    theme: {
      color: '#f59e0b' // Champagne Gold matching DinePulse theme
    },
    handler: function (response) {
      if (onSuccess) onSuccess(response);
    },
    modal: {
      ondismiss: function () {
        if (onFailure) onFailure({ dismissed: true });
      }
    }
  };

  try {
    const paymentObject = new window.Razorpay(options);
    paymentObject.on('payment.failed', function (response) {
      if (onFailure) onFailure(response.error || response);
    });
    paymentObject.open();
  } catch (err) {
    console.error('Razorpay initialization exception:', err);
    if (onFailure) onFailure(err);
  }
};
