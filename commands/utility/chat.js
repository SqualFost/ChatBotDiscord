const { SlashCommandBuilder } = require('discord.js');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

module.exports = {
	data: new SlashCommandBuilder()
		.setName('chat')
		.setDescription('Génère du texte')
        .addStringOption(option =>
            option.setName("prompt")
                .setDescription("Texte envoyé à l'IA.")
                .setRequired(true)),
	async execute(interaction) {
        await interaction.deferReply();

        const prompt = interaction.options.getString("prompt") + "Instructions : -Tu t'appelles Zoulou, tu es un bot discord pour le server N2T - Si l'utilisateur demande de faire un script, chaque partie du script doit être entourée de backticks, au début et à la fin.- Utilisez des commentaires pour expliquer chaque étape du processus. - Ne pas inclure de code supplémentaire ou de texte. Merci !";

        try {
            const result = await model.generateContent(prompt);

            let generatedText = result.response.text();
            if (!generatedText) {
                generatedText = "Je n'ai pas pu générer une réponse. Veuillez réessayer.";
            }

            // Fonction pour découper le texte tout en gardant les sections de code intactes
            const splitText = (text) => {
                const regex = /(```[\s\S]+?```)/g;
                let parts = [];
                let lastIndex = 0;
                let match;

                // Parcourir toutes les correspondances
                while ((match = regex.exec(text)) !== null) {
                    // Ajoute le texte avant les backticks
                    if (match.index > lastIndex) {
                        parts.push(text.slice(lastIndex, match.index));
                    }
                    // Ajoute le texte entre les backticks
                    parts.push(match[0]);
                    lastIndex = regex.lastIndex;
                }
                // Ajoute le texte restant après la dernière correspondance
                if (lastIndex < text.length) {
                    parts.push(text.slice(lastIndex));
                }
                return parts;
            };

            // Fonction pour découper le texte en morceaux de moins de 2000 caractères
            const splitIntoChunks = (text) => {
                const chunks = [];
                let chunk = '';
                
                const parts = splitText(text);
                for (let part of parts) {
                    // Si ajouter la partie dépasse la limite de 2000 caractères
                    if ((chunk + part).length > 2000) {
                        // Push le chunk actuel et recommence avec la partie suivante
                        chunks.push(chunk);
                        chunk = part;
                    } else {
                        // Sinon, ajoute la partie au chunk actuel
                        chunk += part;
                    }
                }
                // Ajoute le dernier chunk
                if (chunk.length > 0) {
                    chunks.push(chunk);
                }

                return chunks;
            };

            // Diviser le texte généré en morceaux
            const messageChunks = splitIntoChunks(generatedText);

            // Envoyer chaque morceau comme un message séparé
            for (let chunk of messageChunks) {
                // Ne pas envoyer de message vide
                if (chunk.trim().length > 0) {
                    await interaction.followUp(chunk);
                }
            }
        } catch (error) {
            console.error(error);
            await interaction.editReply("Une erreur est survenue lors de la génération du texte.");
        }
	},
};
