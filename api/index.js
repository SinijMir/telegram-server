const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.use(express.json());

// Отладочный маршрут для проверки переменных окружения
app.get('/debug', (req, res) => {
    res.json({
        botToken: process.env.BOT_TOKEN,
        chatId: process.env.CHAT_ID
    });
});

app.post('/send-order', async (req, res) => {
    const { name, phone, services, comment } = req.body;
    if (!name || !phone || !services) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    const botToken = process.env.BOT_TOKEN;
    const chatId = process.env.CHAT_ID;
    const message = `Новая заявка:\nИмя: ${name}\nТелефон: ${phone}\nУслуги: ${services}${comment ? `\nКомментарий: ${comment}` : ''}`;
    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    try {
        const response = await fetch(telegramUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
            }),
        });
        if (response.ok) {
            res.status(200).json({ success: true });
        } else {
            res.status(500).json({ success: false, error: 'Failed to send message to Telegram' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

app.post('/send-location', async (req, res) => {
    const { name, phone, address, latitude, longitude, comment } = req.body;
    if (!name || !phone || !address || !latitude || !longitude) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    const botToken = process.env.BOT_TOKEN;
    const chatId = process.env.CHAT_ID;
    const mapUrl = `https://yandex.ru/maps/?ll=${longitude},${latitude}&z=15`;
    const message = `Новая заявка (место захоронения):\nИмя: ${name}\nТелефон: ${phone}\nАдрес: <a href="${mapUrl}">${address}</a>\nКоординаты: ${latitude}, ${longitude}${comment ? `\nКомментарий: ${comment}` : ''}`;
    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    try {
        const response = await fetch(telegramUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML',
            }),
        });
        if (response.ok) {
            res.status(200).json({ success: true });
        } else {
            res.status(500).json({ success: false, error: 'Failed to send message to Telegram' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Обработка вебхуков от Telegram
app.post('/webhook', async (req, res) => {
    const update = req.body;

    // Проверяем, что это сообщение от Telegram
    if (update && update.message) {
        const chatId = update.message.chat.id;
        const text = update.message.text || 'No text provided';

        // Отправляем ответное сообщение
        const botToken = process.env.BOT_TOKEN;
        const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
        const message = `Получено сообщение: ${text}`;

        try {
            await fetch(telegramUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message,
                }),
            });
            res.status(200).json({ success: true });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    } else {
        res.status(400).json({ success: false, error: 'Invalid update' });
    }
});

module.exports = app;