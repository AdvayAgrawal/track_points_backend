import { SelectQuery } from '../utils/db';

export type target_obj = {
  id: string,
  action_key: string,
  target: number,
}


export const fetchTargets = (): Promise<target_obj[]> => {
  return SelectQuery<target_obj>("SELECT * from targets");
};