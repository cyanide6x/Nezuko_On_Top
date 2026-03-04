module.exports = {
    config: {
        name: "bounty",
        version: "2.3.0",
        author: "Tawhid Ahmed",
        countDown: 5,
        role: 0,
        description: {
            bn: "কারো নামে হুলিয়া বা বাউন্টি জারি করার ফানি কমান্ড",
            en: "Issue a funny bounty/wanted alert on someone"
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

        // ১. রিপ্লাই বা মেনশন থেকে আইডি নেওয়া
        if (type === "message_reply") {
            mentionID = messageReply.senderID;
        } else if (Object.keys(mentions).length > 0) {
            mentionID = Object.keys(mentions)[0];
        } else {
            return api.sendMessage("⚠️ আরে সোনা, কার নামে হুলিয়া জারি করবে তাকে মেনশন দাও বা রিপ্লাই করো! 🤠", threadID, messageID);
        }

        try {
            const name = await usersData.getName(mentionID) || "Unknown Criminal";
            const amount = Math.floor(Math.random() * 90000) + 10000;

            const bountyLines = [
                `📢 [ 𝗪𝗔𝗡𝗧𝗘𝗗 𝗔𝗟𝗘𝗥𝗧 ] 📢\n━━━━━━━━━━━━━━━━━━\n⚠️ সতর্কবার্তা! এলাকায় এক ভয়ংকর অপরাধী দেখা গেছে!`,
                `👤 𝗡𝗮𝗺𝗲: ${name}\n🕵️ 𝗖𝗿𝗶𝗺𝗲: অতিরিক্ত কিউটনেস দিয়ে মানুষের মন চুরি করা! 💘`,
                `💰 𝗕𝗼𝘂𝗻𝘁𝘆 𝗣𝗿𝗶𝘇𝗲: $${amount.toLocaleString()}\n📌 যে একে ধরে দিতে পারবে, তাকে Tawhid Ahmed পুরস্কৃত করবে!`,
                `🔥 𝗦𝘁𝗮𝘁𝘂𝘀: মোস্ট ওয়ান্টেড (𝗠𝗼𝘀𝘁 𝗪𝗮𝗻𝘁𝗲𝗱)\n🚫 একে দেখামাত্রই জড়িয়ে ধরার আদেশ দেওয়া হলো! 😹`,
                `✅ এই হুলিয়া জারি করেছেন স্বয়ং অ্যাডমিন Tawhid Ahmed!`
            ];

            await api.sendMessage(`📜 ${name}-এর নামে হুলিয়া জারি করা হচ্ছে... একটু দাঁড়াও সোনা!`, threadID, messageID);

            // একে একে মেসেজ পাঠানোর লজিক (Loop with Delay)
            for (const line of bountyLines) {
                await new Promise(resolve => setTimeout(resolve, 5000));
                api.sendMessage(line, threadID);
            }

            // ফাইনাল মেসেজ
            return setTimeout(() => {
                api.sendMessage(`⚖️ বিচারকার্য সম্পন্ন হলো!\n━━━━━━━━━━━━━━━━━━\n👤 𝗢𝘄𝗻𝗲𝗿: 𝗧𝗮𝘄𝗵𝗶𝗱 𝗔𝗵𝗺𝗲𝗱\n🎀 𝗔𝘀𝘀𝗶𝘀𝘁𝗮𝗻𝘁: 𝗡𝗲𝘇𝘂𝗸𝗼 𝗖𝗵𝗮𝗻`, threadID);
            }, 2500);

        } catch (err) {
            return api.sendMessage(`❌ এরর এসেছে সোনা: ${err.message}`, threadID, messageID);
        }
    }
};
