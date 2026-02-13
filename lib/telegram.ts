import type { NoteData, BalanceRequestData } from "@/types";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;

const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

interface TelegramResponse {
    ok: boolean;
    description?: string;
    [key: string]: unknown;
}

/**
 * Send note submission details to the admin Telegram channel for review.
 */
export async function sendToTelegram(noteData: NoteData): Promise<TelegramResponse | null> {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHANNEL_ID) {
        console.warn("[Telegram] Bot token or channel ID not configured. Skipping notification.");
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

            const data: TelegramResponse = await response.json();

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
        console.error("[Telegram] Failed to send notification:", (error as Error).message);
        return null;
    }
}

/**
 * Send a plain text message to the admin channel
 */
async function sendTextMessage(text: string): Promise<TelegramResponse | null> {
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
        console.error("[Telegram] Text message failed:", (error as Error).message);
        return null;
    }
}

/**
 * Send balance request notification to the admin Telegram channel for review.
 */
export async function sendBalanceRequestToTelegram(requestData: BalanceRequestData): Promise<TelegramResponse | null> {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHANNEL_ID) {
        console.warn("[Telegram] Bot token or channel ID not configured. Skipping notification.");
        return null;
    }

    const methodEmoji = requestData.method === "bkash" ? "🔴" : "🟠";
    const methodName = requestData.method === "bkash" ? "bKash" : "Nagad";

    const message = [
        `💳 **New Balance Request**`,
        ``,
        `${methodEmoji} **Method:** ${methodName}`,
        `💰 **Amount:** ৳${requestData.amount} BDT`,
        `🧾 **Transaction ID:** \`${requestData.transactionId}\``,
        ``,
        `👤 **User:** ${requestData.userName}`,
        `📧 **Email:** ${requestData.userEmail}`,
        `🆔 **User ID:** ${requestData.userId}`,
        `📋 **Request ID:** ${requestData.requestId}`,
        ``,
        `⏳ Status: **Pending Review**`,
        ``,
        `_Please verify the payment and approve/reject in the admin dashboard._`,
    ].join("\n");

    return sendTextMessage(message);
}
