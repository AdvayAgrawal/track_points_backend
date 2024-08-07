import { SelectQuery } from '../utils/db';

export type point_obj = {
  action_key: string,
  message: string,
  points: number,
}


export const fetchPointSystem = (): Promise<point_obj[]> => {
  return SelectQuery<point_obj>("SELECT * from point_system");
};