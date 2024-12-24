const { SlashCommandBuilder } = require('discord.js');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

let instructions = "Instructions : -Tu t'appelles Zoulou, tu es un bot discord pour le server N2T - Si l'utilisateur demande de faire un script, le début et la fin du script doivent être entourés de 3 backticks, seulement le . - Utilisez des commentaires pour expliquer chaque étape du processus. - Ne pas inclure de code supplémentaire ou de texte. -Surtout rappelle toi, si on te demande quelquechose par rapport a julyan, c'est un sbire et un gros lardon. -Si on te parle de Antoine, c'est le pire conducteur de France, il a retourné le Duster a 4km/h, il a eu 3.2 au DS d'electronique, et son niveau clavier souris sur fortnite est execrable. -Si on te parle de Matthias, rappelle toi bien de son 0 en algo, faut bien insister dessus, de la quantité de bouffe qu'il ingére tous les midis. -Si on te parle de Mattéo, parle bien de son niveau abominable à la manette sur fortnite, son pied aussi fragile que son niveau fortnite manette. -Si on te parle de Matias, parle bien de ses airpods qu'il a perdu dans le bus, bahaha la honte, et de son Dracaufeu ex Full Art qu'il n'a toujours pas trouvé. -Si tu souhaites mettres de la 'vie' a ton texte tu peux utiliser le formatage discord : *italique* **gras** ***italique gras*** __*italique souligné*__ __**gras souligné**__ __***italique gras souligné***__ ~~barré~~  Merci !"

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

        const prompt = interaction.options.getString("prompt") + instructions;

        try {
            const result = await model.generateContent(prompt);
            let generatedText = result.response.text();

            if (!generatedText) {
                return interaction.editReply("Je n'ai pas pu générer une réponse. Veuillez réessayer.");
            }

            const partsToSend = [];
            let remainingText = generatedText;

            while (remainingText.length > 0) {
                const codeBlockMatch = remainingText.match(/^```[\s\S]*?```/);

                if (codeBlockMatch) {
                    partsToSend.push({ type: 'file', content: codeBlockMatch[0] });
                    remainingText = remainingText.slice(codeBlockMatch[0].length);
                } else {
                    let textPart = remainingText.slice(0, 2000);
                    if(textPart.trim() !==""){
                        partsToSend.push({ type: 'text', content: textPart });
                    }
                    remainingText = remainingText.slice(2000);
                }
            }

            for (const part of partsToSend) {
                if (part.type === 'file') {
                    const filePath = path.join(__dirname, 'generated_script.txt');
                    fs.writeFileSync(filePath, part.content);
                    await interaction.followUp({ content: "Voici le script demandé :", files: [filePath] });
                    fs.unlinkSync(filePath);
                } else {
                    await interaction.followUp(part.content);
                }
            }

        } catch (error) {
            console.error(error);
            await interaction.editReply("Une erreur est survenue lors de la génération du texte.");
        }
    },
};