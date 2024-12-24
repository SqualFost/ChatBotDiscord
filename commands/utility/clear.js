const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Supprime un nombre spécifique de messages dans le canal.')
        .addIntegerOption(option =>
            option.setName('nombre')
                .setDescription('Nombre de messages à supprimer (max 100).')
                .setRequired(true)),
    async execute(interaction) {
        // ID du salon de log
        const logChannelId = '1321168684018040862'; // Remplace par l'ID de ton salon log.

        // Vérifier les permissions de l'utilisateur
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({
                content: "🚫 Vous n'avez pas la permission de gérer les messages.",
                ephemeral: true
            });
        }

        // Vérifier les permissions du bot
        if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({
                content: "🚫 Je n'ai pas la permission de gérer les messages dans ce canal.",
                ephemeral: true
            });
        }

        // Récupérer l'option "nombre"
        const count = interaction.options.getInteger('nombre');

        // Vérifier que le nombre est valide
        if (count < 1 || count > 100) {
            return interaction.reply({
                content: "🚫 Veuillez entrer un nombre entre 1 et 100.",
                ephemeral: true
            });
        }

        try {
            // Supprimer les messages
            const deletedMessages = await interaction.channel.bulkDelete(count, true);

            // Répondre à l'utilisateur
            await interaction.reply({
                content: `✅ ${deletedMessages.size} messages supprimés avec succès !`,
                ephemeral: true
            });

            // Envoyer une notification dans le canal de log
            const logChannel = interaction.guild.channels.cache.get(logChannelId);
            if (logChannel) {
                if(deletedMessages.size == 1){
                    await logChannel.send(
                        `🗑️ **${deletedMessages.size} message supprimé** par ${interaction.user.tag} dans ${interaction.channel.name}.`
                    );
                }else{
                    await logChannel.send(
                        `🗑️ **${deletedMessages.size} messages supprimés** par ${interaction.user.tag} dans ${interaction.channel.name}.`
                    );
                }
                
            } else {
                console.warn(`Canal de log avec l'ID ${logChannelId} introuvable.`);
            }
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: "🚫 Une erreur est survenue lors de la suppression des messages.",
                ephemeral: true
            });
        }
    },
};
