const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
    config: {
        name: "bounty",
        version: "3.2.0",
        author: "Tawhid Ahmed",
        countDown: 10,
        role: 0,
        description: {
            bn: "কারো নামে হুলিয়া জারি করার ফানি কমান্ড (Wanted Frame)",
            en: "Funny bounty alert with guaranteed name and pic"
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
            return api.sendMessage("⚠️ আরে সোনা, কার নামে হুলিয়া জারি করবে তাকে মেনশন দাও বা রিপ্লাই করো! 🤠", threadID, messageID);
        }

        try {
            // ১. নাম সংগ্রহ (১০০% কাজ করবে, কখনো NULL আসবে না)
            let name;
            const info = await api.getUserInfo(mentionID);
            if (info[mentionID] && info[mentionID].name) {
                name = info[mentionID].name;
            } else {
                name = await usersData.getName(mentionID) || "প্রিয় অপরাধী";
            }

            // ২. র্যান্ডম ফানি কারণ (Ex-এর কাহিনীসহ)
            const criminalReasons = [
                `📢 এর "Ex" একে হন্যে হয়ে খুঁজে বেড়াচ্ছে! সে নাকি বিয়ের প্রলোভন দেখিয়ে টাকা হাতিয়ে পালিয়েছে। 💸 ইশ! কি ভয়ংকর চোর! 😹`,
                `🕵️ সাবধান! এলাকার সব কিউট মানুষের মন চুরি করার দায়ে ${name}-এর নামে হুলিয়া জারি করা হলো। ❤️`,
                `🚫 এই ব্যক্তি অতিরিক্ত সিঙ্গেল থেকে সবার মাথায় জ্বালা ধরানোর অপরাধে মোস্ট ওয়ান্টেড! 🙄`,
                `🍕 বিনা অনুমতিতে অন্যের প্লেট থেকে বিরিয়ানি চুরি করে খাওয়ার অপরাধে একে গ্রেফতারের আদেশ দেওয়া হলো! 🍖`,
                `😂 সারাদিন বটের সাথে ফাজলামি করার অপরাধে ${name}-কে ২০ বছরের জন্য জেল দেওয়া হলো! 👮`,
                `💔 ${name} নকি বিয়ের নাম করে ওর এক্স এর থেকে আইফোন ১৪ প্রো ম্যাক্স গিফট নিয়ে এখন ব্লক মেরে দিয়েছে! 📱🤡`
            ];

            const randomReason = criminalReasons[Math.floor(Math.random() * criminalReasons.length)];
            api.sendMessage(`📜 ${name}-এর প্রোফাইল চেক করছি... একটু দাঁড়াও সোনা!`, threadID, messageID);

            // ৩. ইমেজ প্রসেসিং (Canvas)
            const canvas = createCanvas(800, 1000);
            const ctx = canvas.getContext("2d");

            // ব্যাকগ্রাউন্ড ফ্রেম এবং প্রোফাইল পিকচার
            const bgUrl = "https://i.imgur.com/7IOnYid.png"; // Wanted Frame
            const avatarUrl = `https://graph.facebook.com/${mentionID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

            const [bg, avatar] = await Promise.all([
                loadImage(bgUrl),
                loadImage(avatarUrl)
            ]);

            // ড্রয়িং লজিক
            ctx.drawImage(bg, 0, 0, 800, 1000); // ফ্রেম
            ctx.drawImage(avatar, 150, 250, 500, 500); // প্রোফাইল পিকচার

            // ৪. স্টাইলিশ টেক্সট (নাম ও প্রাইজ)
            ctx.textAlign = "center";
            ctx.font = "bold 60px Arial";
            ctx.fillStyle = "#3e2723"; 
            ctx.fillText(name.toUpperCase(), 400, 850);

            const amount = Math.floor(Math.random() * 90000) + 10000;
            ctx.font = "bold 55px Arial";
            ctx.fillStyle = "#b71c1c";
            ctx.fillText(`REWARD: $${amount.toLocaleString()}`, 400, 930);

            // ৫. ফাইল পাঠানো
            const cacheDir = path.join(__dirname, "cache");
            if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
            const cachePath = path.join(cacheDir, `bounty_${mentionID}.png`);
            
            fs.writeFileSync(cachePath, canvas.toBuffer("image/png"));

            const finalMsg = `⚖️ [ 𝗪𝗔𝗡𝗧𝗘𝗗 𝗔𝗟𝗘𝗥𝗧 ] ⚖️\n━━━━━━━━━━━━━━━━━━\n\n${randomReason}\n\n━━━━━━━━━━━━━━━━━━\n👤 𝗢𝘄𝗻𝗲𝗿: 𝓣𝓪𝔀𝓱𝓲𝓭 𝓐𝓱𝓶𝓮𝓭 💞\n🎀 𝗔𝘀𝘀𝗶𝘀𝘁𝗮𝗻𝘁: 𝗡𝗲𝘇𝘂𝗸𝗼 𝗖𝗵𝗮𝗻`;

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
