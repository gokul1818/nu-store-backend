module.exports = (order, user) => `
  <div style="font-family:Arial;padding:20px;color:#333">
    <h2 style="color:#4CAF50">Order Confirmed 🎉</h2>
    <p>Hi ${user.firstName || "Customer"},</p>

    <p>Your order <strong>#${order._id}</strong> has been successfully placed!</p>

    <h3>Order Summary:</h3>
    <table width="100%" style="border-collapse:collapse">
      ${order.items.map(i => `
        <tr>
          <td>${i.title} (${i.variant.size}/${i.variant.color})</td>
          <td align="right">x${i.qty}</td>
          <td align="right">₹${i.price}</td>
        </tr>
      `).join("")}
    </table>

    <hr>
    <h3>Total Amount: ₹${order.totalAmount}</h3>
    
    <p>We will notify you when your order status changes.</p>

    <br>
    <p>Thanks for shopping with us!</p>
  </div>
`;
