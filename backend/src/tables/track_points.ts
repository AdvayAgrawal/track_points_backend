import { SelectQuery } from '../utils/db';

export type track_points_obj = {
    id: string,
    day: number,
    actions: string,
    points_for_day: number,
    thoughts: string
}


export const fetchTrackPoints = (): Promise<track_points_obj[]> => {
    return SelectQuery<track_points_obj>("SELECT * from track_points");
};