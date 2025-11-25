module.exports = (user, resetLink) => `
  <div style="font-family:Arial; padding:20px; color:#333;">
    <h2>Password Reset Request</h2>
    <p>Hello ${user.firstName || "User"},</p>

    <p>You requested to reset your password.</p>

    <p>Click the button below to create a new password:</p>

    <a href="${resetLink}" 
       style="display:inline-block; padding:10px 20px; background:#4CAF50; color:#fff; 
              text-decoration:none; border-radius:5px; margin-top:10px;">
      Reset Password
    </a>

    <p>This link expires in <strong>1 hour</strong>.</p>

    <br>
    <p>If you didn’t request this, simply ignore this email.</p>
  </div>
`;
