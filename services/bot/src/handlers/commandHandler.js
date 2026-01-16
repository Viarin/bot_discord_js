const fs = require('fs');
const path = require('path');

module.exports = (client) => {
    const foldersPath = path.join(__dirname, '../commands');
    
    if (!fs.existsSync(foldersPath)) return;

    const commandFolders = fs.readdirSync(foldersPath);

    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
           
            delete require.cache[require.resolve(filePath)];
            
            const command = require(filePath);

            if ('name' in command && 'execute' in command) {
                client.commands.set(command.name, command);
                console.log(`🔹 Team loaded: !${command.name}`);
            } else {
                console.warn(`File missing ${file}: "name" or "execute" property.`);
            }
        }
    }
    
    console.log('✅ All prefix commands are ready!');
};