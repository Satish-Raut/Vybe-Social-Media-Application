// ─────────────────────────────────────────────────────────────────────────────
// Shared Email Template Utilities for Vybe
// Import and call the relevant function to get { subject, body } for any email.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds the shared HTML wrapper (header + footer) used by all email templates.
 * @param {string} receiverName - The full name of the email recipient.
 * @param {string} content      - The inner HTML content to inject into the body section.
 * @returns {string}            - A full HTML email string.
 */
const buildEmailWrapper = (receiverName, content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Vybe Notification</title>
</head>
<body style="margin:0; padding:0; background-color:#0f0f0f; font-family: 'Segoe UI', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0f0f; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#1a1a2e; border-radius:16px; overflow:hidden; border: 1px solid #2a2a4a;">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #6c63ff, #a855f7); padding: 32px; text-align:center;">
              <h1 style="margin:0; color:#ffffff; font-size:28px; font-weight:800; letter-spacing:2px;">VYBE</h1>
              <p style="margin:6px 0 0; color:rgba(255,255,255,0.75); font-size:13px; letter-spacing:1px;">SOCIAL PLATFORM</p>
            </td>
          </tr>

          <!-- Dynamic Content -->
          <tr>
            <td style="padding: 40px 48px;">
              <p style="margin:0 0 8px; color:#a0a0c0; font-size:14px;">Hey ${receiverName},</p>
              ${content}
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 48px;">
              <hr style="border:none; border-top: 1px solid #2a2a4a; margin:0;" />
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 48px; text-align:center;">
              <p style="margin:0; color:#606080; font-size:12px; line-height:1.8;">
                You received this email because you are a member of Vybe.<br/>
                If you don't want these notifications, you can manage them in your
                <a href="${process.env.CLIENT_URL}/settings" style="color:#6c63ff; text-decoration:none;">account settings</a>.
              </p>
              <p style="margin:12px 0 0; color:#404060; font-size:11px;">
                © ${new Date().getFullYear()} Vybe Social Platform. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

// ─────────────────────────────────────────────────────────────────────────────
// Template: Connection Request (Initial + Reminder)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generates the subject and HTML body for a new or reminder connection request email.
 * @param {object} sender   - The user who sent the connection request (populated Mongoose doc).
 * @param {object} receiver - The user who received the connection request (populated Mongoose doc).
 * @param {boolean} isReminder - Pass true to change the subject/heading to a reminder tone.
 * @returns {{ subject: string, body: string }}
 */
export const connectionRequestTemplate = (sender, receiver, isReminder = false) => {
  const avatarUrl =
    sender.profile_picture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(sender.full_name)}&background=6c63ff&color=fff&size=64`;

  const subject = isReminder
    ? `⏰ Reminder: ${sender.full_name} is still waiting for your response on Vybe!`
    : `👋 ${sender.full_name} sent you a Connection Request on Vybe!`;

  const heading = isReminder
    ? `Don't leave them hanging! ⏳`
    : `You have a new connection request! 🎉`;

  const description = isReminder
    ? `<strong style="color:#c0c0e0;">${sender.full_name}</strong> sent you a connection request yesterday and is still waiting for your response. Don't miss out on a great connection!`
    : `<strong style="color:#c0c0e0;">${sender.full_name}</strong> wants to connect with you on Vybe. Accept their request to start building your network!`;

  const content = `
    <h2 style="margin:0 0 24px; color:#ffffff; font-size:22px; font-weight:700;">
      ${heading}
    </h2>

    <!-- Sender Card -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#252545; border-radius:12px; padding:24px; margin-bottom:28px;">
      <tr>
        <td width="64" valign="middle">
          <img
            src="${avatarUrl}"
            alt="${sender.full_name}"
            width="64" height="64"
            style="border-radius:50%; border: 3px solid #6c63ff; display:block;"
          />
        </td>
        <td style="padding-left:16px;" valign="middle">
          <p style="margin:0; color:#ffffff; font-size:18px; font-weight:700;">${sender.full_name}</p>
          <p style="margin:4px 0 0; color:#a0a0c0; font-size:14px;">@${sender.username}</p>
          ${sender.bio ? `<p style="margin:8px 0 0; color:#c0c0e0; font-size:13px; line-height:1.5;">"${sender.bio}"</p>` : ""}
        </td>
      </tr>
    </table>

    <!-- Description -->
    <p style="color:#a0a0c0; font-size:15px; line-height:1.7; margin:0 0 32px;">
      ${description}
    </p>

    <!-- CTA Button -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <a
            href="${process.env.CLIENT_URL}/profile/${sender._id}"
            style="display:inline-block; background: linear-gradient(135deg, #6c63ff, #a855f7); color:#ffffff; text-decoration:none; font-size:16px; font-weight:700; padding:14px 40px; border-radius:50px; letter-spacing:0.5px;"
          >
            View Profile &amp; Respond
          </a>
        </td>
      </tr>
    </table>`;

  const body = buildEmailWrapper(receiver.full_name, content);

  return { subject, body };
};
