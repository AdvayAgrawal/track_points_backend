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
    await ModifyQuery(`INSERT INTO track_points (actions, points_for_day) VALUES (?,?);`, [actions_string, total_points]);

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


const day_points = ['B', 'B'];

add_points_eod(day_points)
update_action_points(day_points)
console.log("done")