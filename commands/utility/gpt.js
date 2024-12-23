const { SlashCommandBuilder } = require('discord.js');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

module.exports = {
	data: new SlashCommandBuilder()
		.setName('gpt')
		.setDescription('Génère du texte')
        .addStringOption(option =>
            option.setName("prompt")
                .setDescription("Texte envoyé à l'IA.")
                .setRequired(true)),
	async execute(interaction) {
        const prompt = interaction.options.getString("prompt");
        //le prompt retourne bien le texte de l'utilisateur
        const response = await model.generateContent(prompt);
        console.log(response);
        while(response == null){
            await interaction.editReply("En cours de génération mon copaing");
        }
        await interaction.editReply(response);
	},
};
