const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
    config: {
        name: "pair",
        version: "7.0.0",
        author: "Tawhid Ahmed",
        countDown: 10,
        role: 0,
        description: {
            bn: "মেম্বারদের মধ্যে জোড়া মেলান এবং লাভ ফ্রেমে ছবি দেখুন",
            en: "Pair with a member in a love frame"
        },
        category: "love",
        guide: { bn: '{pn}' }
    },

    onStart: async function ({ api, event, usersData }) {
        const { threadID, messageID, senderID } = event;

        try {
            // ১. গ্রুপের মেম্বার লিস্ট নেওয়া
            const threadInfo = await api.getThreadInfo(threadID);
            const listMember = threadInfo.participantIDs.filter(id => id != senderID);

            if (listMember.length === 0) return api.sendMessage("❌ এই গ্রুপে আপনি ছাড়া কেউ নেই!", threadID, messageID);

            // ২. র্যান্ডম পার্টনার সিলেক্ট
            const partnerID = listMember[Math.floor(Math.random() * listMember.length)];
            
            api.sendMessage(`💞 [ 𝗣𝗮𝗶𝗿𝗶𝗻𝗴... ] 💞\n━━━━━━━━━━━━━━━━━━\nলাভলী ফ্রেমে তোমাদের জোড়া সাজাচ্ছি, একটু অপেক্ষা করো বেবি!`, threadID, messageID);

            // ৩. নাম ফেচ করা (বিকল্প পদ্ধতিসহ)
            let nameSender, namePartner;
            try {
                const info = await api.getUserInfo([senderID, partnerID]);
                nameSender = info[senderID].name;
                namePartner = info[partnerID].name;
            } catch (e) {
                nameSender = await usersData.getName(senderID) || "User";
                namePartner = await usersData.getName(partnerID) || "Partner";
            }

            // ৪. ইমেজ ইউআরএল (টোকেন ছাড়া কাজ করে এমন লিঙ্ক)
            const img1 = `https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
            const img2 = `https://graph.facebook.com/${partnerID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

            const canvas = createCanvas(1200, 600);
            const ctx = canvas.getContext("2d");

            // ব্যাকগ্রাউন্ড গ্রেডিয়েন্ট
            const gradient = ctx.createLinearGradient(0, 0, 1200, 600);
            gradient.addColorStop(0, '#ff9a9e');
            gradient.addColorStop(1, '#fad0c4');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 1200, 600);

            // ৫. ছবি লোড এবং ড্রয়িং
            try {
                const [avatar1, avatar2] = await Promise.all([
                    loadImage(img1),
                    loadImage(img2)
                ]);

                // ছবি ১
                ctx.save();
                ctx.beginPath();
                ctx.arc(300, 300, 200, 0, Math.PI * 2, true);
                ctx.closePath();
                ctx.clip();
                ctx.drawImage(avatar1, 100, 100, 400, 400);
                ctx.restore();

                // ছবি ২
                ctx.save();
                ctx.beginPath();
                ctx.arc(900, 300, 200, 0, Math.PI * 2, true);
                ctx.closePath();
                ctx.clip();
                ctx.drawImage(avatar2, 700, 100, 400, 400);
                ctx.restore();
            } catch (e) {
                // ছবি লোড না হলে টেক্সট দিয়ে লিখে দেওয়া
                ctx.fillStyle = "#ffffff";
                ctx.font = "bold 50px Arial";
                ctx.textAlign = "center";
                ctx.fillText("No Image", 300, 300);
                ctx.fillText("No Image", 900, 300);
            }

            // মাঝখানে হার্ট
            ctx.fillStyle = "#ff0000";
            ctx.font = "bold 150px Arial";
            ctx.textAlign = "center";
            ctx.fillText("❤️", 600, 350);

            // ৬. ফাইল সেভ
            const cachePath = path.join(__dirname, "cache", `pair_${senderID}.png`);
            if (!fs.existsSync(path.join(__dirname, "cache"))) fs.mkdirSync(path.join(__dirname, "cache"));
            
            fs.writeFileSync(cachePath, canvas.toBuffer("image/png"));

            const lovePercent = Math.floor(Math.random() * 20) + 80;
            const msg = `╭─────────────╮\n   ❤️ 𝗠𝗮𝘁𝗰𝗵 𝗠𝗮𝗱𝗲! ❤️\n╰─────────────╯\n\n` +
                        `👤 𝗡𝗮𝗺𝗲: ${nameSender}\n` +
                        `👩‍❤️‍👨 𝗣𝗮𝗿𝘁𝗻𝗲𝗿: ${namePartner}\n\n` +
                        `✨ তোমরা একে অপরের জন্য ${lovePercent}% পারফেক্ট! ✨\n\n` +
                        `👤 𝗢𝘄𝗻𝗲𝗿: 𝗧𝗮𝘄𝗵𝗶𝗱 𝗔𝗵𝗺𝗲𝗱\n` +
                        `🎀 𝗔𝘀𝘀𝗶𝘀𝘁𝗮𝗻𝘁: 𝗡𝗲𝘇𝘂𝗸𝗼 𝗖𝗵𝗮𝗻`;

            return api.sendMessage({
                body: msg,
                attachment: fs.createReadStream(cachePath)
            }, threadID, () => fs.unlinkSync(cachePath), messageID);

        } catch (err) {
            return api.sendMessage(`❌ এরর: ${err.message}`, threadID, messageID);
        }
    }
};
