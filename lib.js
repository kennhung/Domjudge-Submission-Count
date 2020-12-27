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

if (typeof window === 'undefined') {
    module.exports = {
        getTeamsStat
    }
}