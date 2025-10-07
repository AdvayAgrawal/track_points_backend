import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { fetchPointSystem } from "../tables/point_system";
import { fetchTargets } from "../tables/targets";
import { fetchTotalActionPoints } from "../tables/total_action_points";
import { fetchTrackPoints } from "../tables/track_points";

function delay(milliseconds:number){
  return new Promise(resolve => {
      setTimeout(resolve, milliseconds);
  });
}

export const main = async () => {
  
};
const handler = async ()=>{
  const client = new DynamoDBClient({});
  const docClient = DynamoDBDocumentClient.from(client);
  const t1 = await fetchPointSystem()
  const t2 = await fetchTargets()
  const t3 = await fetchTotalActionPoints()
  const t4 = await fetchTrackPoints()
  const l = [[t1, "point-system"], [t2, "targets"], [t3, "total-action-points"], [t4, "points-thoughts-per-day"]]
  for (const [table, tablename] of l){
    // console.log(table, tablename)
    if (typeof table === 'string' || table instanceof String){
      continue
    }
    if (typeof tablename !== 'string'){
      continue
    }
    for (const entry of table){
      let data: any = {
        id: "user-1"
      }
      let toadd = {}
      if ("actions" in entry){
        data = {
          ...data,
          day: entry.day,
          action: entry.actions ?? "",
        }
        toadd = (({ day,actions, ...o }) => o)(entry)
      } else if ("action_key" in entry){
        data = {
          ...data,
          action: entry.action_key
        }
        toadd = (({ action_key, ...o }) => o)(entry)
      } else{
        data = {
          ...data,
          action: entry.action
        }
        toadd = (({ action, ...o }) => o)(entry)
      }

      data = {
        ...data,
        ...toadd
      }
      const command = new PutCommand({
        TableName: tablename,
        Item: data,
      });
    
      const response = await docClient.send(command);
      console.log(response.$metadata.httpStatusCode)
      await delay(500)
    }
    // console.log(data)
  }
  console.log("done")
}

handler()