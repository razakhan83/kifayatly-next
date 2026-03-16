/**
 * Generates a clean HTML template for order notification emails.
 * 
 * @param {Object} order - The order object from MongoDB
 * @returns {string} HTML string
 */
export function generateOrderEmailHtml(order) {
  const {
    orderId,
    customerName,
    customerPhone,
    customerAddress,
    items,
    totalAmount,
    notes,
    createdAt
  } = order;

  // Format date
  const dateStr = new Date(createdAt).toLocaleString('en-PK', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  // Generate items table rows
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">
        <div style="font-weight: 600; color: #111;">${item.name || item.Name}</div>
        ${item.variant ? `<div style="font-size: 12px; color: #666;">Variant: ${item.variant}</div>` : ''}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">PKR ${Number(item.price).toLocaleString('en-PK')}</td>
    </tr>
  `).join('');

  const adminUrl = `${process.env.NEXTAUTH_URL || 'https://chinaunique.pk'}/admin/orders`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Inter', system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
        .header { background: #065f46; color: white; padding: 24px; text-align: center; }
        .content { padding: 24px; }
        .section { margin-bottom: 24px; }
        .section-title { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #065f46; margin-bottom: 12px; border-bottom: 2px solid #ecfdf5; padding-bottom: 4px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
        .info-card { background: #f9fafb; padding: 16px; border-radius: 8px; }
        .label { font-size: 12px; color: #6b7280; margin-bottom: 4px; }
        .value { font-weight: 600; color: #111827; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        .total-row { background: #f0fdf4; font-weight: 700; font-size: 18px; color: #065f46; }
        .footer { background: #f3f4f6; padding: 20px; text-align: center; font-size: 14px; color: #6b7280; }
        .button { display: inline-block; background: #065f46; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px; transition: background 0.2s; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 20px;">New Order Received</h1>
          <p style="margin: 4px 0 0; opacity: 0.9; font-size: 14px;">Order ID: ${orderId}</p>
        </div>
        
        <div class="content">
          <div class="section">
            <div class="section-title">Customer Information</div>
            <div style="background: #f9fafb; border-radius: 12px; padding: 20px; border: 1px solid #f3f4f6;">
              <div style="margin-bottom: 12px;">
                <div class="label">Name</div>
                <div class="value" style="font-size: 16px;">${customerName}</div>
              </div>
              <div style="margin-bottom: 12px;">
                <div class="label">Phone</div>
                <div class="value">${customerPhone}</div>
              </div>
              <div>
                <div class="label">Shipping Address</div>
                <div class="value" style="line-height: 1.4;">${customerAddress}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Order Details</div>
            <table>
              <thead>
                <tr style="text-align: left; font-size: 12px; color: #6b7280;">
                  <th style="padding: 12px;">Product</th>
                  <th style="padding: 12px; text-align: center;">Qty</th>
                  <th style="padding: 12px; text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
                <tr class="total-row">
                  <td colspan="2" style="padding: 16px; text-align: right;">Grand Total</td>
                  <td style="padding: 16px; text-align: right;">PKR ${totalAmount.toLocaleString('en-PK')}</td>
                </tr>
              </tbody>
            </table>
          </div>

          ${notes ? `
          <div class="section">
            <div class="section-title">Order Notes</div>
            <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px; font-style: italic; color: #92400e;">
              "${notes}"
            </div>
          </div>
          ` : ''}

          <div style="text-align: center; margin-top: 32px;">
            <a href="${adminUrl}" class="button">Manage Order in Admin Panel</a>
            <div style="margin-top: 12px; font-size: 12px; color: #9ca3af;">
              Received on ${dateStr}
            </div>
          </div>
        </div>

        <div class="footer">
          <strong>China Unique - Home and Lifestyle Store</strong><br>
          Automated System Notification
        </div>
      </div>
    </body>
    </html>
  `;
}
