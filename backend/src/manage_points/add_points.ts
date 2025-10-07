import { ModifyQuery, SelectQuery } from '../utils/db';


//expected: actions parameter will be the total actions done in EOD. try to make this function run at end of day only
export async function add_points_eod(user: string, actionsOfDay: actionsOfDayInput) {
    //TODO: remove these lines if works correctly
    // const point_system = await fetchPointSystem();

    // //makes it into key to point mapping
    // const key_point_map = point_system.reduce((acc,obj)=>{
    //     acc[obj.action_key] = obj.points;
    //     return acc;
    // }, {} as {[action_key:string]:number});

    // const total_points = actions.reduce((acc, action)=>{
    //     acc = acc + key_point_map[action];
    //     return acc;
    // }, 0)
    // const actions_string = actions.reduce((acc, action)=>{
    //     acc = acc + action;
    //     return acc;
    // }, '')
    const dayNo = await getLastDay();
    await ModifyQuery(`INSERT INTO track_points VALUES (?,?,?,?,?);`, [user, dayNo + 1, actionsOfDay.actions, actionsOfDay.points, actionsOfDay.thought]); //increment day value

}

export async function update_action_points(user: string, actions: string[]) {
    //update total_action_points too
    let actions_freq: { [action: string]: number } = {};

    for (const action of actions) {
        if (actions_freq[action]) {
            actions_freq[action]++;
        } else {
            actions_freq[action] = 1;
        }
    }

    //for in: to iterate through all keys
    for (const action in actions_freq) {
        const [res] = await SelectQuery<{ action: string }>(`SELECT action FROM total_action_points WHERE action = ?;`, [action]);
        if (res) {
            console.log(`Updating action ${action}`)
            await ModifyQuery(`UPDATE total_action_points SET total_points = total_points + ? WHERE id = ? AND action = ?`, [actions_freq[action], user, action])
        } else {
            console.log(`New action ${action}`)
            await ModifyQuery(`INSERT INTO total_action_points VALUES (?,?,?);`, [user, action, actions_freq[action]]);
        }
    }
}

export function dayToDate(day: number) {
    const start = new Date('2024-06-17');
    const resultDate = new Date(start);
    resultDate.setDate(start.getDate() + day);
    return resultDate;
}

export function dateToDay(date: Date) {
    const start = new Date('2024-06-17');
    const currDate = new Date(date);
    const diff = currDate.getTime() - start.getTime();
    const day = Math.floor(diff / (1000 * 3600 * 24));
    return day;
}

export async function getLastDay() {
    const [dayNo] = await SelectQuery<{ day: number }>("select max(day) as day from track_points");
    return dayNo.day ?? 1;
}

async function printLastUpdatedDate() {
    const date = dayToDate(await getLastDay());
    console.log("Last Updated: ", date.toDateString(), dateToDay(date))
}


export type actionsOfDayInput = {
    actions: string,
    thought: string,
    points: number,
}

export default async function handler(actionsOfDay: actionsOfDayInput) {
    const user = "user-1"

    const day_points: string[] = actionsOfDay.actions.split("");
    console.log("Adding points: ", actionsOfDay)
    await add_points_eod(user, actionsOfDay)
    await update_action_points(user, day_points)

    await printLastUpdatedDate()
}