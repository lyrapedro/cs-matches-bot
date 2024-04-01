const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, StringSelectMenuOptionBuilder} = require('discord.js');
const { HLTV } = require('hltv');
const { axios } = require('axios');

let options = [];
let matches = [];
let maps = [];
let currentResults = [];

const myHLTV = HLTV.createInstance({loadPage: (url) => axios.get(url)});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('results')
        .setDescription('Show CS results'),
    async execute(interaction) {
        let channel = interaction.channel;
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

            const filter = (interaction) => interaction.customId === 'menu';
            const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 }); // Tempo em milissegundos

            collector.on('collect', async (interaction) => {
                const selectedEventId = interaction.values[0]; // Pega o ID do evento selecionado
                const selectedEvent = response.find(event => event.id.toString() === selectedEventId);

                HLTV.getMatches({eventIds: [selectedEvent.id]}).then((res) => {
                    var currentMatches = res.filter(matchInProgress);
                    for (let i = 0; i < currentMatches.length; i++) {
                        matches.push(currentMatches[i].id);
                    }
                });

                for(let i = 0; i < matches.length; i++) {
                    HLTV.getMatchStats({id: matches[i]}).then((res) => {
                        maps.push({id: matches[i], maps: res.mapStatIds});
                    });
                }

                for(let i = 0; i < maps.length; i++) {
                    HLTV.getMatchMapStats({id: maps[i]}).then((res) => {
                        currentResults.push({mapName: res.map.toString(), team1: res.team1.name, team2: res.team2.name, team1Score: res.result.team1TotalRounds, team2Score: res.result.team2TotalRounds});
                    })
                }

                const embedMessage = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle(selectedEvent.name)

                for (let i = 0; i < matches.length; i++) {
                    embedMessage.addFields({ name: `${matches[i].team1} x ${matches[i].team2}`, value: ''});
                    embedMessage.addFields({ name: '\u200B', value: '\u200B'});
                    for(let j = 0; j < currentResults.length; j++) {
                        embedMessage.addFields({ name: currentResults[j].mapName, value: `${currentResults[j].team1Score} - ${currentResults[j].team2Score}` });
                    }
                }

                channel.send({embeds: [embedMessage]});
            });
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