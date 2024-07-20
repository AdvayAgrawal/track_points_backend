import { SelectQuery } from '../utils/db';

export type track_points_obj = {
    day: number,
    actions: string,
    points_for_day: number,
}


export const fetchTrackPoints = (): Promise<track_points_obj[]> => {
    return SelectQuery<track_points_obj>("SELECT * from track_points");
};