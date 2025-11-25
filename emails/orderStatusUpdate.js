module.exports = (order, user) => `
  <div style="font-family:Arial;padding:20px;color:#333">
    <h2>Order Status Updated</h2>
    <p>Hi ${user.firstName || "Customer"},</p>

    <p>Your order <strong>#${order._id}</strong> status has been updated to:</p>

    <h2 style="color:#3F51B5">${order.status}</h2>

    ${order.trackingNumber ? `<p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>` : ""}

    <br>
    <p>We’ll keep you posted with further updates.</p>
  </div>
`;
