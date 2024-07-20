import { fetchTrackPoints } from '../tables/track_points';
import { update_action_points } from './add_points';

async function backfill_all(){
    const track_points = await fetchTrackPoints();

    const all_actions = track_points.reduce((acc, obj)=>{
        acc.push(obj.actions);
        return acc;
    }, [] as string[])

    await update_action_points(all_actions);
}
backfill_all()
