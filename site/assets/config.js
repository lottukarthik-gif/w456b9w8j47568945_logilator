// ===== EDIT THESE (one place for the whole website) =====
window.LOGILATOR = {
  version:      '15.5',                  // current app version shown in the header and footer

  // --- Price ---
  price:        '5.99 USDT',                    // shown on the home page pricing card, e.g. '49 USDT'. Empty = "Contact for price"
  priceNote:    'one-time payment',                    // e.g. 'one-time payment'
  payAmount:    '5.99',                    // number only, shown on the payment page, e.g. '49'

  // --- Crypto payment (manual USDT on TRC20) ---
  wallet:       'TT8ntLibf856q9ZhuQCVTYwMQM3qegdV8Q',                    // YOUR USDT TRC20 address (starts with T, 34 characters). Copy it from your wallet or Bybit deposit page
  network:      'TRC20 (Tron)',
  deliveryTime: 'within 24 hours',       // what you promise buyers after they send proof

  buyUrl:       'buy.html'               // every "Get Logilator" button goes here
};
// If wallet or payAmount is empty or invalid, the payment page shows
// "Payments opening soon" and does NOT show an address.
// ========================================================
