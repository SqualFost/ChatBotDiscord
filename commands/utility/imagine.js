const { SlashCommandBuilder } = require('discord.js');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API);
const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

module.exports = {
	data: new SlashCommandBuilder()
		.setName('imagine')
		.setDescription('Génère une image basée sur du texte')
        .addStringOption(option =>
            option.setName("prompt")
                .setDescription("Description de l'image")
                .setRequired(true)),
	async execute(interaction) {
        await interaction.deferReply();

        const prompt = interaction.options.getString("prompt");

        try {
            const result = await model.generateContent(prompt)

            const imageUrl = result.image_url;

            if (!imageUrl) {
                return await interaction.editReply("Je n'ai pas pu générer l'image. Veuillez réessayer.");
            }

            await interaction.editReply({
                content: `Voici l'image générée avec le texte suivant : ${prompt} :`,
                embeds: [{
                    image: { url: imageUrl }
                }]
            });

        } catch (error) {
            console.error(error);
            await interaction.editReply("Une erreur est survenue lors de la génération de l'image.");
        }
	},
};
