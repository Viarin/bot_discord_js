module.exports = {
    name: 'ping', // Назва команди для !ping
    description: 'Перевірка пінгу',
    // Тепер замість interaction приходить message і args (аргументи)
    async execute(message, args) {
        const sent = await message.reply('🏓 Pinging...');
        
        const latency = sent.createdTimestamp - message.createdTimestamp;
        
        await sent.edit(`Pong! 🚀\nLatency: **${latency}ms**`);
    }
};