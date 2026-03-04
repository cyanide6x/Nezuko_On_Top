const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
    config: {
        name: "brainwash",
        version: "3.5.0",
        author: "Tawhid Ahmed",
        countDown: 8,
        role: 0,
        description: {
            bn: "কাউকে শর্ট ও ফানি ব্রেইন শক ট্রিটমেন্ট দিন (Ex-এর স্মৃতি ডিলিট করুন)",
            en: "Funny brain shock treatment with random roasting lines"
        },
        category: "fun",
        guide: {
            bn: "{pn} @mention / reply to message",
            en: "{pn} @mention / reply to message"
        }
    },

    onStart: async function ({ api, event, usersData }) {
        const { threadID, messageID, mentions, type, messageReply } = event;

        let mentionID;
        if (type === "message_reply") {
            mentionID = messageReply.senderID;
        } else if (Object.keys(mentions).length > 0) {
            mentionID = Object.keys(mentions)[0];
        } else {
            return api.sendMessage("⚠️ আরে সোনা, কার বুদ্ধি কম তাকে মেনশন দাও বা রিপ্লাই করো! 🙄", threadID, messageID);
        }

        try {
            // ১. নাম সংগ্রহ (Fix: No Null Name)
            const info = await api.getUserInfo(mentionID);
            let name = info[mentionID].name || "প্রিয় নির্বোধ";

            // ২. তোমার দেওয়া "Ex" এর লাইনসহ মজাদার কিছু লাইন
            const funnyLines = [
                `🤮 ছিঃ! ${name}-এর মাথায় তো দেখি গোবর ভরা! 💩 একে ব্রেইনওয়াশ করে লাভ নেই, সরাসরি ৪৪০ ভোল্টের শক দিতে হবে! ⚡😈`,
                `🧐 ${name}-এর মাথায় বুদ্ধির বদলে আবর্জনা পাওয়া গেছে! 🗑️ সার্ফ এক্সেল দিয়ে মগজ ধোলাই চলছে... একটু দাঁড়াও! 🧼🌀`,
                `💔 ওরে বাবা! ${name}-এর মাথায় তো ওর "Ex"-এর স্মৃতি পাওয়া গেছে! 😭 আহ্! কত্ত ভালোবাসে তারে! চলো শক দিয়ে সব ডিলিট করি! ⚡🤣`,
                `🚫 Warning! ${name}-এর মগজে জং ধরে গেছে। 🛠️ হাতুড়ি দিয়ে পিটিয়ে নাট-বল্টু ঠিক করা হচ্ছে! 🔨🔨`,
                `🧠 ${name}-এর মাথায় ব্রেইন খুঁজতে গিয়ে শুধু বাতাস পাওয়া গেল! 💨 একে একটু শক দিয়ে চার্জ করে দিচ্ছি... 🔋⚡`,
                `🤢 ইশ! ${name}-এর মাথায় এত ময়লা যে বটের অ্যালার্জি হয়ে যাচ্ছে! 🤧 ব্রেইনটা খুলে রোদে শুকোতে দেওয়া দরকার। ☀️🔥`,
                `🌀 ${name}-এর স্মৃতি থেকে পুরনো সব আবর্জনা ডিলিট করা হচ্ছে... [██████▒▒▒▒] 𝟲𝟬% 💾`
            ];

            const randomText = funnyLines[Math.floor(Math.random() * funnyLines.length)];
            api.sendMessage(randomText, threadID, messageID);

            // ৩. ইমেজ প্রসেসিং (Canvas)
            const canvas = createCanvas(1200, 600);
            const ctx = canvas.getContext("2d");

            // ব্যাকগ্রাউন্ড (একটি ফানি শক দেওয়ার বেজ ইমেজ)
            const bgUrl = "https://i.imgur.com/uR5CqUo.jpeg"; 
            const avatarUrl = `https://graph.facebook.com/${mentionID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

            const [bg, avatar] = await Promise.all([
                loadImage(bgUrl),
                loadImage(avatarUrl)
            ]);

            ctx.drawImage(bg, 0, 0, 1200, 600);
            ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
            ctx.fillRect(0, 0, 1200, 600);

            // প্রোফাইল পিকচার ড্রয়িং
            ctx.save();
            ctx.beginPath();
            ctx.arc(600, 200, 150, 0, Math.PI * 2, true);
            ctx.lineWidth = 15;
            ctx.strokeStyle = "#ffcc00"; 
            ctx.stroke();
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(avatar, 450, 50, 300, 300);
            ctx.restore();

            // ৪. স্টাইলিশ টেক্সট ড্রয়িং
            ctx.textAlign = "center";
            ctx.font = "bold 55px Arial";
            ctx.fillStyle = "#ff0000";
            ctx.fillText("🆂🅷🅾🅲🅺 🆃🆁🅴🅰🆃🅼🅴🅽🆃", 600, 430);

            const gradient = ctx.createLinearGradient(0, 440, 0, 510);
            gradient.addColorStop(0, "#ffffff");
            gradient.addColorStop(1, "#FFD700");
            ctx.font = "bold 70px Arial";
            ctx.fillStyle = gradient;
            ctx.fillText(name.toUpperCase(), 600, 500);

            // ৫. ফাইল সেভ ও সেন্ড
            const cacheDir = path.join(__dirname, "cache");
            if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
            const cachePath = path.join(cacheDir, `brainwash_${mentionID}.png`);
            
            fs.writeFileSync(cachePath, canvas.toBuffer("image/png"));

            const finalMsg = `✅ সফলভাবে শক ট্রিটমেন্ট দেওয়া হয়েছে! এখন ${name} আগের চেয়ে ৫% বেশি বুদ্ধিমান। 😹\n━━━━━━━━━━━━━━━━━━\n👤 𝗢𝘄𝗻𝗲𝗿: 𝓣𝓪𝔀𝓱𝓲𝓭 𝓐𝓱𝓶𝓮𝓭 💞\n🎀 𝗔𝘀𝘀𝗶𝘀𝘁𝗮𝗻𝘁: 𝗡𝗲𝘇𝘂𝗸𝗼 𝗖𝗵𝗮𝗻`;

            return api.sendMessage({
                body: finalMsg,
                attachment: fs.createReadStream(cachePath)
            }, threadID, () => {
                if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
            }, messageID);

        } catch (err) {
            return api.sendMessage(`❌ এরর এসেছে সোনা: ${err.message}`, threadID, messageID);
        }
    }
};
