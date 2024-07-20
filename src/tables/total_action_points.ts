import { SelectQuery } from '../utils/db';

export type total_points_obj = {
    action: string,
    total_points: number,
}


export const fetchTotalActionPoints = (): Promise<total_points_obj[]> => {
    return SelectQuery<total_points_obj>("SELECT * from point_system");
};