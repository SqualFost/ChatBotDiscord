const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('gpt')
		.setDescription('Génère du texte'),
	async execute(interaction) {
		await interaction.reply('Pong!');
	},
};
