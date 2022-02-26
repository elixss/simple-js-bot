import { Client, Intents, MessageEmbed } from "discord.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import fetch from "node-fetch";
import inspect from "util";

const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES] });

const ClientID = ''; // add your client id here.

const TOKEN = "my_super_secret_bot_token_which_i_will_never_share_to_someone_else" // add your token here.

const guild = ""; // add a guild id here.

const prefix = "!"; // your responding text prefix

/*
Add all slash commands in the array below.
If you create a slash command, this is what will be shown in Discord.
*/
const commands = [
    { name: "ping", description: "Shows the clients latency." },
    { name: "managebot-stats", description: "Shows ManageBots statistics."},
];


const rest = new REST({version: '9'}).setToken(TOKEN);

// refresh/add new slash commands (i just copied that from discord.js website)
(async () => {
    try {
        console.log('Started refreshing application commands.');

        await rest.put(
            Routes.applicationCommands(ClientID),
            { body: commands },
        );

        console.log("Successfully refreshed application commands.");

    } catch (error) {
        console.error(error);
    }
})();

// do something when youre up
client.on("ready", () => {
    console.log("I am here.");
});

// simple text command
client.on("messageCreate", async message => {
    if (message.content.startsWith(prefix + "hello")) {
        await message.channel.send("Hello");
    }
});


/* exec command
Do not give other users permissions to run this command. IF someone has knowledge, they can do whatever they want with your PC for example.
*/
client.on("messageCreate", async message => {
    if (message.content.startsWith(prefix + "exec")) {
        const args = message.content.split(" ").slice(1);
        if (message.author.id !== "ADD_YOUR_USER_ID_HERE") return; // ADD your user ID here!!
        try {
            await message.channel.send(eval(args.join(" ")));
        } catch (error) {
            await message.channel.send(`\`${error}\``);
        }
    }
});

// Slash command event
// here we are handling the slash commands.
client.on("interactionCreate", async interaction => {
    if (!interaction.isCommand()) return;

    // a simple ping command
    if (interaction.commandName === "ping") {
        const embed = new MessageEmbed()
            .setTitle("🏓 Pong!")
            .setDescription(`Bot latency: ${Date.now() - interaction.createdTimestamp} ms \n`)
            .setColor("BLURPLE");
        await interaction.reply({embeds: [embed]});
    }

    // a command that fetches information from the ManageBot API. You will need the node-fetch module in order to use this.
    if (interaction.commandName === "managebot-stats") {
        await fetch("https://api.managebot.xyz", {
        method: "GET",
        }).then(async response =>  { 
            if (!response.ok) {
                await interaction.reply(
                    {content: `Failed to process request with code ${response.status}: ${response.statusText}`, ephemeral: true} 
                ); return;
            } else { response.json().then(async data => {
                const embed = new MessageEmbed()
                .setTitle("ManageBot Statistics")
                .setDescription("Here you can see ManageBots statistics.")
                .addFields(
                    { name: "Guilds", value: `${data['guild_count']}`, inline: true },
                    { name: "Members", value: `${data['member_count']}`, inline: true },
                    { name: "Channels", value: `${data['channel_count']}`, inline: true },
                    { name: "CPU usage", value: `${data['cpu_usage']} % `, inline: true },
                    { name: "RAM usage", value: `${data['ram_usage']} %`, inline: true },
                    { name: "File extensions", value: `${data['extensions']}`, inline: true },
                    { name: "File size", value: `${data['file_size']} KB`, inline: true },
                    { name: "Version", value: `${data['version']}`, inline: true },
                    { name: "Commands", value: `${data['command_count']}`, inline: true },
                )
                .setColor("BLURPLE");
                await interaction.reply({embeds: [embed]});
            });    
        }}); 
    }
});

// i dont know if this works
client.on("shardError", error => {
    console.error(`An error occurred: ${error}`);
});

client.login(TOKEN);
