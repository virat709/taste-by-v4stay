export const printReceipt = (order, restaurant) => {
  const currency = restaurant?.currency || '₹';
  const taxRate = restaurant?.taxRate || 0;
  const taxAmount = order.taxAmount || 0;
  const subtotal = order.subtotal ?? order.total - taxAmount; // Fallback for older orders
  const time = order.createdAt?.toDate?.()?.toLocaleString() || new Date().toLocaleString();

  const printWindow = window.open('', '_blank', 'width=400,height=600');
  if (!printWindow || printWindow.closed) return;

  const orderId = (order.id || '').slice(-6).toUpperCase();
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Receipt - ${orderId}</title>
        <style>
          body {
            font-family: 'Courier New', Courier, monospace;
            font-size: 14px;
            margin: 0;
            padding: 20px;
            color: #000;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .header img {
            max-width: 100px;
            max-height: 100px;
            margin-bottom: 10px;
          }
          .header h1 {
            font-size: 18px;
            margin: 0 0 5px 0;
          }
          .header p {
            margin: 0;
            font-size: 12px;
          }
          .divider {
            border-top: 1px dashed #000;
            margin: 15px 0;
          }
          .details {
            margin-bottom: 15px;
            font-size: 12px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            text-align: left;
            padding: 5px 0;
          }
          th {
            border-bottom: 1px dashed #000;
          }
          td.right, th.right {
            text-align: right;
          }
          .totals {
            margin-top: 15px;
          }
          .totals div {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
          }
          .totals .grand-total {
            font-weight: bold;
            font-size: 16px;
            border-top: 1px dashed #000;
            padding-top: 5px;
            margin-top: 5px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          ${restaurant.logoUrl ? `<img src="${restaurant.logoUrl}" alt="Logo" />` : ''}
          <h1>${restaurant.name || 'Restaurant'}</h1>
          ${restaurant.phone ? `<p>Phone: ${restaurant.phone}</p>` : ''}
          <p>Table: ${order.tableNumber}</p>
        </div>
        
        <div class="details">
          <div>Order ID: ${orderId}</div>
          <div>Date: ${time}</div>
          <div>Payment: ${order.paymentMethod || 'Cash/Card'}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Qty</th>
              <th>Item</th>
              <th class="right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${(order.items || []).map(item => `
              <tr>
                <td>${item.qty}x</td>
                <td>${item.name}${item.modifiers?.length > 0 ? ' (' + item.modifiers.map(m => m.optionName).join(', ') + ')' : ''}</td>
                <td class="right">${currency}${(item.price * item.qty).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="divider"></div>

        <div class="totals">
          <div>
            <span>Subtotal</span>
            <span>${currency}${subtotal.toFixed(2)}</span>
          </div>
          ${taxRate > 0 ? `
          <div>
            <span>Tax (${taxRate}%)</span>
            <span>${currency}${taxAmount.toFixed(2)}</span>
          </div>
          ` : ''}
          <div class="grand-total">
            <span>Total</span>
            <span>${currency}${(order.total || 0).toFixed(2)}</span>
          </div>
        </div>

        ${order.instructions ? `
        <div style="margin-top: 10px; padding: 8px; background: #fff5f5; border-radius: 4px; font-size: 12px;">
          <strong>📝 Instructions:</strong> ${order.instructions}
        </div>
        ` : ''}

        <div class="divider"></div>

        <div class="footer">
          <p>Thank you for dining with us!</p>
          <p>Powered by Taste by v4stay</p>
        </div>
      </body>
    </html>
  `;

  try {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
  } catch (e) {
    console.error('Print failed:', e);
    return;
  }

  setTimeout(() => {
    try {
      printWindow.print();
      printWindow.close();
    } catch (e) { /* window already closed */ }
  }, 500);
};
