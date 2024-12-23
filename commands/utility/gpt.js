const { SlashCommandBuilder } = require('discord.js');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

module.exports = {
	data: new SlashCommandBuilder()
		.setName('gpt')
		.setDescription('Génère du texte')
        .addStringOption(option =>
            option.setName("prompt")
                .setDescription("Texte envoyé à l'IA.")
                .setRequired(true)),
	async execute(interaction) {
        await interaction.deferReply();

        const prompt = interaction.options.getString("prompt");
        //le prompt retourne bien le texte de l'utilisateur
        try {
            const result = await model.generateContent(prompt);

            let generatedText = result.response.text();
            if (!generatedText) {
                generatedText = "Je n'ai pas pu générer une réponse. Veuillez réessayer.";
            }

            await interaction.editReply(generatedText);
        } catch (error) {
            console.error(error);
            await interaction.editReply("Une erreur est survenue lors de la génération du texte.");
        }
	},
};
