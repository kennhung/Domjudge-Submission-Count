require('dotenv').config();
const fetch = require('node-fetch');
const { Line } = require('clui');
const chalk = require('chalk');
const { getTeamsStat } = require('./lib');

const authHeaders = {
    Authorization: `Basic ${process.env.DJ_TOKEN}`
};

const getTeams = (judgeURL, contestId) => {
    return fetch(`${judgeURL}/api/v4/contests/${contestId}/teams`, {
        headers: new fetch.Headers({
            ...authHeaders
        })
    }).then((resp) => resp.json());
}

const getSubmissions = (judgeURL, contestId) => {
    return fetch(`${judgeURL}/api/v4/contests/${contestId}/submissions`, {
        headers: new fetch.Headers({
            ...authHeaders
        })
    }).then((resp) => resp.json());
}

const getJudgements = (judgeURL, contestId) => {
    return fetch(`${judgeURL}/api/v4/contests/${contestId}/judgements`, {
        headers: new fetch.Headers({
            ...authHeaders
        })
    }).then((resp) => resp.json());
}

(async () => {


    const teams = await getTeams(process.env.DJ_URL, process.env.CONTEST_ID);

    const submissions = await getSubmissions(process.env.DJ_URL, process.env.CONTEST_ID);

    const judgements = await getJudgements(process.env.DJ_URL, process.env.CONTEST_ID);


    const stat = (type) => {
        const { stat, total } = getTeamsStat(teams, submissions, judgements, type);

        new Line()
            .padding(2)
            .column('team_id', 15, [chalk.cyan])
            .column('name', 40, [chalk.cyan])
            .column('count', 10, [chalk.cyan])
            .output();

        stat.forEach(({ externalid, name, count }) => {
            new Line()
                .padding(2)
                .column(externalid || "n/a", 15, [chalk.grey])
                .column(name, 40, [chalk.green])
                .column(`${count}`, 10, [chalk.yellow])
                .output();
        });

        new Line()
            .padding(2)
            .column("", 15, [chalk.grey])
            .column("Total", 40, [chalk.grey])
            .column(`${total}`, 10, [chalk.yellowBright])
            .output();

    };

    console.log(chalk.bgMagenta("RTE"));
    stat("RTE");

    console.log(chalk.bgMagenta("TLE"));
    stat("TLE");

    console.log(chalk.bgMagenta("WA"));
    stat("WA");

    console.log(chalk.bgMagenta("CE"));
    stat("CE");
})();