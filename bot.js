const Discord = require('discord.js');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { MessageActionRow, MessageSelectMenu } = require('discord.js');
const express = require('express');
const app = express();
const port = 3000;


app.use(express.static('public'));

// Configura Express para usar EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Sirve archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para el panel de control
app.get('/dashboard', function(req, res) {
    const serverCount = client.guilds.cache.size;
    let memberCount = 0;
    client.guilds.cache.forEach((guild) => {
        memberCount += guild.memberCount;
    });

    app.get('/', function(req, res) {
        res.send('Bienvenido a la página principal de mi bot!');
    });

    res.render('dashboard', {
        botInvite: 'https://discord.com/api/oauth2/authorize?client_id=1201213495019053127&permissions=8&scope=bot', // Reemplaza YOUR_BOT_CLIENT_ID con el ID de tu bot
        docs: 'https://github.com/KayXSC', // Reemplaza con la URL de tus documentos
        support: 'https://discord.gg/KDeVzUn9ag', // Reemplaza con la URL de tu soporte
        discordInvite: 'https://discord.gg/KDeVzUn9ag', // Reemplaza con tu código de invitación de Discord
        serverCount: serverCount,
        memberCount: memberCount
    });
});

app.get('/api/bot-status-data', (req, res) => {
    // Aquí, reemplaza 'Online' con la lógica para obtener el estado real del bot
    res.send('Online');
});

// Ruta para el estado del bot (página de estado)
app.get('/api/bot-status', (req, res) => {
    res.sendFile(path.join(__dirname, 'status.html'));
});

//  Inicia el servidor
let botStatus = 'Online';

// Comprueba que el bot esté en línea y devuelva un mensaje al usuario
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

const client = new Discord.Client({
    intents: [
        "GUILDS", 
        "GUILD_MESSAGES", 
        "GUILD_VOICE_STATES",
        "DIRECT_MESSAGES"
    ],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'] 
});

client.once('ready', () => {
    console.log('KayX esta funcionando correctamente. Todos los derechos reservados a KayX Co!');
    client.user.setActivity('kayx.es | $help', { type: 'WATCHING' });
});

client.on('messageCreate', async message => {
    if (message.content.startsWith('$ticket')) {
        const requiredRoleId = '942814575668125704';  // Cambiar por el rol que quieras que sea necesario para usar el comando
        if (!message.member.roles.cache.has(requiredRoleId)) {
            return message.reply('No tienes permiso para usar este comando.');
        }
        const row = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('select')
                    .setPlaceholder('Selecciona una categoría')
                    .addOptions([
                        {
                            label: 'Soporte Técnico',
                            description: 'Selecciona esta opción si necesitas soporte técnico',
                            value: 'technical_support',
                        },
                        {
                            label: 'Consultas Generales',
                            description: 'Selecciona esta opción si tienes una consulta general',
                            value: 'general_inquiry',
                        },
                        {
                            label: 'Informes de Bugs',
                            description: 'Selecciona esta opción si quieres informar de un bug',
                            value: 'bug_report',
                        },
                    ]),
            );

            const embed = new Discord.MessageEmbed()
                .setColor('#1e1e1e')
                .setTitle('Centro de tickets')
                .setDescription('Por favor, selecciona una categoría para tu ticket:')
                .setAuthor({ name: 'KayX Ticket Bot', iconURL: 'https://i.imgur.com/NDXEt8d.png' }) // Añade el nombre de tu servidor o el nombre que le quieras dar
                .setThumbnail('https://i.imgur.com/NDXEt8d.png')
                .setImage('') // Añade tu foto de banner
                .setTimestamp()
                .setFooter({ text: 'Todos los derechos reservados a KayX Co!', iconURL: 'https://i.imgur.com/NDXEt8d.png' });

            await message.channel.send({ embeds: [embed], components: [row] });
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isSelectMenu()) return;
    if (interaction.customId === 'select') {
        const category = interaction.values[0];
        const roleMap = {
            'technical_support': '942814575668125704',
            'general_inquiry': '942814575668125704',
            'bug_report': '942814575668125704',
            // Añade más categorías aquí...
        };

        const roleId = roleMap[category];
        const role = interaction.guild.roles.cache.get(roleId);

        await interaction.reply({ content: 'Creando ticket...', ephemeral: true }); // Responde a la interacción inmediatamente

        const channel = await interaction.guild.channels.create(`ticket-${interaction.user.username}-${category}`, {
            type: 'text',
            permissionOverwrites: [
                {
                    id: interaction.guild.id,
                    deny: ['VIEW_CHANNEL'],
                },
                {
                    id: interaction.user.id,
                    allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'ADD_REACTIONS', 'ATTACH_FILES', 'READ_MESSAGE_HISTORY'],
                },
                {
                    id: roleId,
                    allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'ADD_REACTIONS', 'ATTACH_FILES', 'READ_MESSAGE_HISTORY'],
                },
            ],
        });

        const closeTicketButton = new Discord.MessageButton()
            .setCustomId('close_ticket')
            .setLabel('Cerrar Ticket')
            .setStyle('DANGER');

        const saveTicketButton = new Discord.MessageButton()
            .setCustomId('save_ticket')
            .setLabel('Guardar Ticket')
            .setStyle('PRIMARY');

        const row = new Discord.MessageActionRow()
            .addComponents(closeTicketButton, saveTicketButton);

            const embed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle('Nuevo Ticket')
                .setDescription(`Bienvenido al centro de soporte de KayX, ${interaction.user}, has creado un nuevo ticket, porfavor especifica acontinuacion tu problema.`)
                .addFields(
                    { name: 'Usuario', value: interaction.user.tag, inline: true }, // Muestra el nombre de usuario y el tag
                    { name: 'ID del Usuario', value: interaction.user.id, inline: true }, // Muestra el ID del usuario
                    { name: 'Categoría', value: category, inline: true }, // Muestra la categoría del ticket
                    { name: 'Hora de Creación', value: new Date().toLocaleString(), inline: true } // Muestra la hora de creación del ticket
                )
                .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true })) // Muestra el avatar del usuario
                .setTimestamp()
                .setFooter({ text: 'ᴛᴏᴅᴏꜱ ʟᴏꜱ ᴅᴇʀᴇᴄʜᴏꜱ ʀᴇꜱᴇʀᴠᴀᴅᴏꜱ ᴀ ᴋᴀʏx', iconURL: interaction.guild.iconURL() }); // Muestra el icono del servidor en el pie de página
        await channel.send({ content: `<@${interaction.user.id}>`, embeds: [embed], components: [row] });
        await interaction.editReply({ content: 'Ticket creado.', ephemeral: true });
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'close_ticket') {
        // Aquí puedes manejar el cierre del ticket
        // Por ejemplo, podrías modificar los permisos del canal para que el usuario ya no pueda verlo
        await interaction.channel.permissionOverwrites.edit(interaction.user.id, { VIEW_CHANNEL: false });
        await interaction.reply({ content: 'Ticket cerrado.', ephemeral: true });

        // Elimina el canal después de un retraso para dar tiempo a que se envíe el mensaje de cierre del ticket
        setTimeout(() => interaction.channel.delete(), 5000);
    } else if (interaction.customId === 'save_ticket') {
        // Aquí puedes manejar la acción de guardar el ticket
        // Por ejemplo, podrías enviar un mensaje al usuario con el contenido del ticket
        const messages = await interaction.channel.messages.fetch({ limit: 100 });
        const ticketContent = messages.map(message => `${message.author.tag}: ${message.content}`).join('\n');

        // Crea una carpeta para los tickets si no existe
        const ticketsDir = path.join(__dirname, 'tickets');
        if (!fs.existsSync(ticketsDir)) {
            fs.mkdirSync(ticketsDir);
        }

        // Guarda el contenido del ticket en un archivo
        const ticketFile = path.join(ticketsDir, `${interaction.channel.name}.txt`);
        fs.writeFileSync(ticketFile, ticketContent);

        await interaction.reply({ content: 'Ticket guardado.', ephemeral: true });
    }
});

client.login(process.env.TOKEN);