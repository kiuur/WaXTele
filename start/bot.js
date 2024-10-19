const fs = require('fs');
const { Telegraf } = require('telegraf');
const yts = require('yt-search');
const { ytdl } = require('./lib/scrape/scrape-ytdl');

const BOT_TOKEN = ''; //masukkin token
const bot = new Telegraf(BOT_TOKEN);

const userStates = {};

bot.start((ctx) => {
    ctx.reply('Halo! Selamat datang di bot! Klik tombol di bawah untuk melakukan sesuatu.', {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: 'Cari Lagu', callback_data: 'search_song' },
                    { text: 'Informasi Bot', callback_data: 'info_bot' }
                ]
            ]
        }
    });
});

bot.action('search_song', (ctx) => {
    userStates[ctx.from.id] = 'waiting_for_song';
    ctx.reply('Silakan ketik nama lagu yang ingin dicari.');
});

bot.action('info_bot', (ctx) => {
    ctx.reply('Bot ini digunakan untuk mencari dan mengunduh lagu dari YouTube.');
});

bot.command('play', async (ctx) => {
    const text = ctx.message.text.split(' ').slice(1).join(' ');
    if (!text) return ctx.reply('Mau lagu apa? Contoh: /play photograph');

    try {
        ctx.reply('🔒 Sedang mencari...');
        const search = await yts(text);
        const telaso = search.all[0].url;
        const response = await ytdl(telaso);
        const puki = response.data.mp3;

        await ctx.replyWithAudio({ url: puki }, {
            caption: `Judul: ${search.all[0].title}\nDurasi: ${search.all[0].timestamp}`,
        });
        ctx.reply('🔓 Selesai!');
    } catch (error) {
        console.error(error);
        ctx.reply('Terjadi kesalahan saat mengunduh lagu, coba lagi nanti.');
    }
});

bot.on('text', async (ctx) => {
    const userId = ctx.from.id;

    if (userStates[userId] === 'waiting_for_song') {
        const text = ctx.message.text;

        try {
            ctx.reply('🔒 Sedang mencari...');
            const search = await yts(text);
            const telaso = search.all[0].url;
            const response = await ytdl(telaso);
            const puki = response.data.mp3;

            await ctx.replyWithAudio({ url: puki }, {
                caption: `Judul: ${search.all[0].title}\nDurasi: ${search.all[0].timestamp}`,
            });
            ctx.reply('🔓 Selesai!');
        } catch (error) {
            console.error(error);
            ctx.reply('Terjadi kesalahan saat mengunduh lagu, coba lagi nanti.');
        }

        delete userStates[userId];
    }
});

bot.command('scrip', (ctx) => {
    ctx.reply("Do you want to have the script?", {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: 'GitHub', url: "https://github.com/kiuur" }
                ]
            ]
        }
    });
});

bot.launch()
    .then(() => console.log('Bot berhasil dijalankan'))
    .catch(err => console.error('Error saat menjalankan bot:', err));

module.exports = bot;
