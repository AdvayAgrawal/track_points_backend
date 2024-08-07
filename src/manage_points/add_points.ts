import { fetchPointSystem } from "../tables/point_system";
import { ModifyQuery, SelectQuery } from './../utils/db';


//expected: actions parameter will be the total actions done in EOD. try to make this function run at end of day only
export async function add_points_eod(actions: string[]){
    
    const point_system = await fetchPointSystem();

    //makes it into key to point mapping
    const key_point_map = point_system.reduce((acc,obj)=>{
        acc[obj.action_key] = obj.points;
        return acc;
    }, {} as {[action_key:string]:number});

    const total_points = actions.reduce((acc, action)=>{
        acc = acc + key_point_map[action];
        return acc;
    }, 0)
    const actions_string = actions.reduce((acc, action)=>{
        acc = acc + action;
        return acc;
    }, '')
    const [max_day] = await SelectQuery<{day:number}>("SELECT max(day) as day from track_points");
    await ModifyQuery(`INSERT INTO track_points VALUES (?,?,?);`, [max_day.day+1, actions_string, total_points]); //increment day value

}

export async function update_action_points(actions: string[]){
    //update total_action_points too
    let actions_freq: {[action:string]: number} = {};

    for(const action of actions){
        if (actions_freq[action]){
            actions_freq[action]++;
        } else{
            actions_freq[action] = 1;
        }
    }

    //for in: to iterate through all keys
    for(const action in actions_freq){
        const [res] = await SelectQuery<{action:string}>(`SELECT action FROM total_action_points WHERE action = ?;`, [action]);
        if(res){
            console.log(`Updating action ${action}`)
            await ModifyQuery(`UPDATE total_action_points SET total_points = total_points + ? WHERE action = ?`, [actions_freq[action], action])
        } else{
            console.log(`New action ${action}`)
            await ModifyQuery(`INSERT INTO total_action_points VALUES (?,?);`, [action, actions_freq[action]]);
        }
    }
}

function dayToDate(day: number){
    const start = new Date('2024-06-17');
    const resultDate = new Date(start);
    console.log(start, day)
    resultDate.setDate(start.getDate() + day);
    return resultDate;
}

async function getLastUpdatedDate(){
    const [dayNo] = await SelectQuery<{day:number}>("select max(day) as day from track_points");
    const date = dayToDate(dayNo.day);
    console.log("Last Updated: ", date.toDateString())
}


export default async function handler(actionsOfDay: string){
    const day_points: string[] = actionsOfDay.split("");
    console.log("Adding points: ", day_points)
    await add_points_eod(day_points)
    await update_action_points(day_points)
    await getLastUpdatedDate()
}

