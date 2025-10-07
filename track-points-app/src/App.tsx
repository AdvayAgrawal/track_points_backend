import { FC, useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from 'react-query';
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import './App.css';
import { ActionButton } from './components/ActionButton';
import { NavBar } from './components/NavBar';

const target = 10

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 1,
    },
  },
});


const getPointSystem = async() => {
  const response = await fetch('http://localhost:3000/tables/point_system', {
    method: 'GET',
    headers: {
      "Content-Type": "application/json"
    }
  });
  if (response.ok){
    const data = await response.json()
    let updatedData = data.map((ele:any)=>{
      return {
        ...ele,
        count : 0,
      }
    })
    return updatedData;
  }
  return {}
}

const getTargets = async () => {
  const response = await fetch('http://localhost:3000/tables/targets', {
    method: 'GET',
    headers: {
      "Content-Type": "application/json"
    }
  });
  if (response.ok){
    return await response.json()
  }
  return {}
}

const getTotalPoints = async () => {
  const response = await fetch('http://localhost:3000/tables/total_points', {
    method: 'GET',
    headers: {
      "Content-Type": "application/json"
    }
  });
  if (response.ok){
    return await response.json()
  }
  return {}
}

const getUploadedData = async() => {
  const response = await fetch("http://localhost:3000/uploaded_actions", {
    method: 'GET',
    headers: {
      "Content-Type": "application/json"
    }
  });
  if (response.ok){
    const fetchdata = await response.json();
    return fetchdata;
  }
  return {}
}



const AppComponent: FC = () => {
  const { data: pointSystemData, status: status1 } = useQuery("point-system", getPointSystem); //TODO: try find flag that is true only after successful query, and not after that
  const { data: prevUploadedData, status: status2} = useQuery("uploaded-data", getUploadedData);
  const [actionsDone, setActionsDone] = useState<any>();//usePersistState<any>(pointSystemData, "actions") //how to put data into usestate initial value
  const [uploadedData, setUploadedData] = useState("");
  const [thought, setThought] = useState("")
  const [done, setDone] = useState(false);
  if(status1 == "loading" || status2 == "loading") return "loading...";
  // if(Object.keys(pointSystemData).length === 0 || Object.keys(prevUploadedData).length === 0) return "Error loading data...";

  if (!done){
    setActionsDone(pointSystemData)
    setUploadedData(prevUploadedData.actions ?? "")
    setThought(prevUploadedData.thought ?? "")
    setDone(true)
  }
  if(!done) return "loading...";

  function increment(action_key:string){
    setActionsDone((prevActionsDone: any[])=>{
      return prevActionsDone.map(action => {
        return (action_key == action.action_key) ? {...action, count: action.count+1} : action
      })
    })
  }

  function decrement(action_key:string){
    setActionsDone((prevActionsDone: any[])=>{
      return prevActionsDone.map(action => {
        return (action_key == action.action_key) ? {...action, count: action.count-1} : action
      })
    })
  }

  async function submit(){
    console.log("submitting", total_actions, total_actions.length)
    const response = await fetch("http://localhost:3000/update_current_points", {
      method: 'POST',
      body: JSON.stringify({ actions: uploadedData + total_actions, thought: thought, points: total_points}),
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // refresh
    setActionsDone(pointSystemData);
    setUploadedData(uploadedData + total_actions);
  }

  async function reset(){
    const response = await fetch("http://localhost:3000/update_current_points", {
      method: 'POST',
      body: JSON.stringify({ actions: "", thought: "", points: 0}),
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    setUploadedData("")
  }

  const elements = actionsDone.map((ele:any)=>{
    return <ActionButton key={ele.action_key} increment={()=>increment(ele.action_key)} decrement={()=>decrement(ele.action_key)} data={ele}/>
  })

  const total_actions: string = actionsDone.reduce((acc:string, ele:any)=>{
    acc = acc + ele.action_key.repeat(ele.count);
    return acc;
  }, '')

  const key_point_map = actionsDone.reduce((acc:any,obj:any)=>{
    acc[obj.action_key] = {
      "points": obj.points,
      "message": obj.message,
    };
    return acc;
  }, {} as {[action_key:string]:{points: number, message: string}});

  console.log(JSON.stringify(actionsDone))
  console.log(JSON.stringify(uploadedData + total_actions))
  console.log(JSON.stringify(key_point_map))
  
  const total_points = (uploadedData + total_actions).split("").reduce((acc, ele)=>{
    acc = acc + key_point_map[ele].points
    return acc;
  }, 0)

  const action_list_items = (uploadedData).split("").map((ele, i)=>{
    return <li key={i} className='uploaded-item'>{key_point_map[ele].message}</li>
  })
  return (
    <div className="add-points-page">
      <div className='button-grid' style={{width:"30%"}}>
        {elements}
      </div>
      <div className='points-thoughts'>
        <div className='todays-thoughts'>
          <textarea
            className='thought-box'
            placeholder='Your thoughts...'
            onChange={(event)=>{setThought(event.target.value)}}
            value={thought}
          />
          {thought.length}
        </div>
        <div className='total-points' style={{width:"30%"}}>
          <div>Total Points</div>
          <div style={total_points >=target ? {color:"#35a66e"} : {color:"yellow"}}>{total_points}/{target}</div>
          <button className='submit-button' onClick={submit}>Submit</button>
        </div>
        <div className='current-time'>time</div>
      </div>
      
      <div className="uploaded-data" style={{width:"30%"}}>
        <div style={{textAlign: 'center', fontSize: "larger"}}>Actions done</div>
        <ul className='uploaded-list'>
          {action_list_items}
        </ul>
        <div className='reset-actions'>
          {action_list_items.length == 0 ?
            <div className='no-actions-yet'><div>You can do this!</div></div> :
            <><div>Reset actions?</div>
            <button className="reset-button" style={{marginTop:'5px'}} onClick={reset}>Reset</button>
            </>
          }
          
        </div>
      </div>

      
    </div>
  )
}


const TargetComponent: FC = () => {
  const {data: targetData, status: status1} = useQuery("targets", getTargets)
  const {data: totalPoints, status: status2} = useQuery("current", getTotalPoints)
  const {data: pointSystem, status: status3} = useQuery("pointSystem", getPointSystem)
  if(status1 == "loading" || status2 == "loading" || status3 == "loading") return "loading...";
  // console.log(targetData, totalPoints)

  const total_points_map = totalPoints.reduce((acc:any, obj:any)=>{
    acc[obj.action] = obj.total_points
    return acc;
  }, {})

  const key_message_map = pointSystem.reduce((acc:any, obj:any)=>{
    acc[obj.action_key] = obj.message;
    return acc;
  }, {})
  console.log(pointSystem)
  // console.log(JSON.stringify(total_points_map), JSON.stringify(targetData), JSON.stringify(totalPoints))
  const elements = targetData.map((ele:any)=>{
    return (
      <div className='target-component' key={ele.action_key}>
        <div>{key_message_map[ele.action_key]}</div>
        <div className='progressbar'>
          <progress value={total_points_map[ele.action_key] ?? 0} max={ele.target}></progress>
          <span className='progress-text'>{total_points_map[ele.action_key] ?? 0}/{ele.target}</span>
        </div>
      </div>
    )
  })
  return (
    <div>
      Your targets
      {elements}
    </div>
  )
}

const Layout: FC = () => {
  return (
    <div>
      <NavBar />
      <Outlet />
    </div>
  )
}

const App: FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<AppComponent />} />
            <Route path="dashboard" element={<AppComponent />} />
            <Route path="targets" element={<TargetComponent />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App;
