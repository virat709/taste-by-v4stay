export const printKitchenTicket = (order) => {
  const printWindow = window.open('', '_blank', 'width=380,height=500');
  if (!printWindow || printWindow.closed) return;

  const orderId = (order.id || '').slice(-6).toUpperCase();
  const time = order.createdAt?.toDate?.()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Kitchen Ticket - ${orderId}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Courier New', Courier, monospace;
            font-size: 16px;
            padding: 16px;
            color: #000;
            background: #fff;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #000;
            padding-bottom: 12px;
            margin-bottom: 12px;
          }
          .kitchen-label {
            font-size: 13px;
            font-weight: bold;
            letter-spacing: 3px;
            text-transform: uppercase;
            color: #555;
          }
          .table-num {
            font-size: 42px;
            font-weight: 900;
            line-height: 1;
            margin: 4px 0;
          }
          .meta {
            font-size: 13px;
            color: #444;
            margin-top: 2px;
          }
          .items {
            margin: 12px 0;
          }
          .item {
            display: flex;
            gap: 10px;
            padding: 8px 0;
            border-bottom: 1px dashed #ccc;
            align-items: flex-start;
          }
          .item:last-child { border-bottom: none; }
          .qty {
            font-size: 22px;
            font-weight: 900;
            min-width: 36px;
            color: #000;
          }
          .item-name {
            font-size: 18px;
            font-weight: 700;
            line-height: 1.3;
          }
          .modifiers {
            font-size: 13px;
            color: #555;
            margin-top: 3px;
          }
          .instructions {
            margin-top: 12px;
            padding: 10px;
            border: 2px solid #000;
            border-radius: 4px;
            font-size: 14px;
            font-weight: 600;
          }
          .instructions .label {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 4px;
            color: #555;
          }
          .footer {
            text-align: center;
            margin-top: 16px;
            font-size: 11px;
            color: #888;
            border-top: 1px dashed #ccc;
            padding-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="kitchen-label">🍳 Kitchen Ticket</div>
          <div class="table-num">${order.source === 'hotel' ? `Room ${order.roomNumber}` : `Table ${order.tableNumber}`}</div>
          <div class="meta">Order #${orderId} &nbsp;|&nbsp; ${time}</div>
        </div>

        <div class="items">
          ${(order.items || []).map(item => `
            <div class="item">
              <div class="qty">${item.qty}×</div>
              <div>
                <div class="item-name">${item.name}</div>
                ${item.modifiers?.length > 0 ? `<div class="modifiers">→ ${item.modifiers.map(m => m.optionName).join(', ')}</div>` : ''}
              </div>
            </div>
          `).join('')}
        </div>

        ${order.instructions ? `
        <div class="instructions">
          <div class="label">📝 Special Instructions</div>
          ${order.instructions}
        </div>
        ` : ''}

        <div class="footer">Printed at ${new Date().toLocaleTimeString()}</div>
      </body>
    </html>
  `;

  try {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
  } catch (e) {
    console.error('Kitchen print failed:', e);
    return;
  }

  setTimeout(() => {
    try {
      printWindow.print();
      printWindow.close();
    } catch { /* window already closed */ }
  }, 400);
};

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
          <p>${order.source === 'hotel' ? `Room: ${order.roomNumber}` : `Table: ${order.tableNumber}`}</p>
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
          <p>Powered by DinePulse</p>
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
    } catch { /* window already closed */ }
  }, 500);
};
