const { HLTV } = require('hltv');
const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, StringSelectMenuOptionBuilder} = require('discord.js');

const options = [];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('results')
        .setDescription('Show CS results'),
    async execute(interaction) {
        HLTV.getEvents({ eventType: ['MAJOR', 'INTLLAN']}).then((res) => {
            var response = res.filter(eventInProgress);
            for(let i = 0; i < response.length; i++) {
                options.push(new StringSelectMenuOptionBuilder().setLabel(response[i].name).setValue(response[i].id.toString()));
            }
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('menu')
                .setPlaceholder('Selecione uma opção')
                .addOptions(options)

            // Criando a linha de ação para o menu
            const row = new ActionRowBuilder()
                .addComponents(selectMenu);

            interaction.reply({ content: 'Escolha o evento', components: [row] });
        });
    },
};

function eventInProgress(event) {
    var now = Date.now();
    return now >= event.dateStart && now <= event.dateEnd;
}

function matchInProgress(match) {
    return match.live;
}