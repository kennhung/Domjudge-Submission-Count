require('dotenv').config();
const fetch = require('node-fetch');
const { Line } = require('clui');
const chalk = require('chalk');

const authHeaders = {
    Authorization: `Basic ${process.env.DJ_TOKEN}`
};

const getTeamsStat = (teams, submissions, judgements, type) => {
    const processed = submissions.map(({ id, team_id }) => {
        const d = judgements.filter(({ submission_id }) => {
            return submission_id === id;
        });

        if (d.findIndex(({ judgement_type_id }) => judgement_type_id === "AC") !== -1) {
            return {
                team_id,
                judgement_type_id: "AC"
            }
        } else {
            if (d.length === 0) {
                console.log(id, team_id, d);

                return {
                    team_id,
                    judgement_type_id: "ERR"
                }
            }

            return {
                team_id,
                judgement_type_id: d[d.length - 1].judgement_type_id
            }
        }
    }).filter(({ judgement_type_id }) => judgement_type_id === type);


    let total = 0;


    const stat = teams.map((t) => {
        const { name, externalid, id } = t;
        const count = processed.filter(({ team_id }) => team_id === id).length;

        total += count;

        return {
            name,
            externalid,
            count
        }
    }).filter(({ count }) => count > 0).sort((a, b) => {
        return b.count - a.count;
    });

    return {
        stat,
        total
    };
}

(async () => {


    const teams = await fetch('http://113-judge.csie.io:9090/api/v4/contests/6/teams', {
        headers: new fetch.Headers({
            ...authHeaders
        })
    }).then((resp) => resp.json());

    const submissions = await fetch('http://113-judge.csie.io:9090/api/v4/contests/6/submissions', {
        headers: new fetch.Headers({
            ...authHeaders
        })
    }).then((resp) => resp.json());

    const judgements = await fetch('http://113-judge.csie.io:9090/api/v4/contests/6/judgements', {
        headers: new fetch.Headers({
            ...authHeaders
        })
    }).then((resp) => resp.json());


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