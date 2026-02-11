const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;

const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

/**
 * Send note submission details to the admin Telegram channel for review.
 *
 * @param {Object} noteData
 * @param {string} noteData.title - Note title
 * @param {string} noteData.description - Note description
 * @param {string} noteData.topics - Topics (comma-separated)
 * @param {string} noteData.subject - Subject name
 * @param {number} noteData.price - Price in BDT
 * @param {string} noteData.uploaderName - Uploader's display name
 * @param {string} noteData.uploaderId - Uploader's User ID
 * @param {string} noteData.noteId - Note document ID
 * @param {string} noteData.fileUrl - Public URL of the uploaded PDF
 * @returns {Promise<Object>} Telegram API response
 */
export async function sendToTelegram(noteData) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHANNEL_ID) {
    console.warn(
      "[Telegram] Bot token or channel ID not configured. Skipping notification."
    );
    return null;
  }

  const caption = [
    `📚 **New Note Submission**`,
    ``,
    `📖 **Title:** ${noteData.title}`,
    `📂 **Topics:** ${noteData.topics}`,
    `📝 **Subject:** ${noteData.subject}`,
    `💰 **Price:** ৳${noteData.price} BDT`,
    ``,
    `📄 **Description:**`,
    noteData.description.substring(0, 500),
    ``,
    `👤 **Uploader:** ${noteData.uploaderName}`,
    `🆔 **User ID:** ${noteData.uploaderId}`,
    `📋 **Note ID:** ${noteData.noteId}`,
    ``,
    `⏳ Status: **Pending Review**`,
  ].join("\n");

  try {
    // Send the document with caption
    if (noteData.fileUrl) {
      const response = await fetch(`${TELEGRAM_API}/sendDocument`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHANNEL_ID,
          document: noteData.fileUrl,
          caption: caption,
          parse_mode: "Markdown",
        }),
      });

      const data = await response.json();

      if (!data.ok) {
        console.error("[Telegram] API error:", data.description);
        // Fallback to text message if document sending fails
        return sendTextMessage(caption);
      }

      return data;
    }

    // Fallback: send text message if no file URL
    return sendTextMessage(caption);
  } catch (error) {
    console.error("[Telegram] Failed to send notification:", error.message);
    return null;
  }
}

/**
 * Send a plain text message to the admin channel
 * @param {string} text
 * @returns {Promise<Object|null>}
 */
async function sendTextMessage(text) {
  try {
    const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHANNEL_ID,
        text: text,
        parse_mode: "Markdown",
      }),
    });

    return response.json();
  } catch (error) {
    console.error("[Telegram] Text message failed:", error.message);
    return null;
  }
}
