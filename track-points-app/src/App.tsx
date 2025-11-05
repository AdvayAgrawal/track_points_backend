import { FC, useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from 'react-query';
import { BrowserRouter, Navigate, Outlet, Route, Routes, useParams } from "react-router-dom";
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

const backendPort = 3000;


const getPointSystem = async() => {
  const response = await fetch(`http://localhost:${backendPort}/tables/point_system`, {
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
  const response = await fetch(`http://localhost:${backendPort}/tables/targets`, {
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
  const response = await fetch(`http://localhost:${backendPort}/tables/total_points`, {
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
  const response = await fetch(`http://localhost:${backendPort}/uploaded_actions`, {
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

const getWeeklySummary = async(action: string) => {
  const response = await fetch(`http://localhost:${backendPort}/weekly_summary?action=${action}`, {
    method: 'GET',
    headers: {
      "Content-Type": "application/json"
    }
  });
  if (response.ok){
    const fetchdata = await response.json();
    return fetchdata;
  }
  return []
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
    const response = await fetch(`http://localhost:${backendPort}/update_current_points`, {
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
    const response = await fetch(`http://localhost:${backendPort}/update_current_points`, {
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

export const WeeklySummaryComponent: FC = () => {
  const { action } = useParams<{ action: string }>();

  const { data: weeklyData, status } = useQuery<{ weekStart: string; actionCount: number }[]>({
    queryKey: ["summary"],
    queryFn: () => getWeeklySummary(action ?? "A"),
  });
  console.log("Weekly data:", weeklyData);

  const [hoverInfo, setHoverInfo] = useState<{ week: string; x: number; y: number } | null>(null);

  if (status === "loading") return <div>Loading...</div>;
  if (!weeklyData) return <div>No data</div>;

  // Helper to pick color based on count
  const getColor = (count: number) => {
    if (count === 0) return "#3f3f46"; // gray
    if (count <= 2) return "#84cc16"; // lime-ish
    if (count <= 4) return "#65a30d"; // yellow-green
    if (count <= 6) return "#22c55e"; // bright green
    return "#4ade80"; // very bright green
  };

  const getBoxShadow = (count: number) => {
    if (count >= 7)
      // ✅ Symmetrical glow + subtle base shadow to anchor the box visually
      return "0 0 15px 4px rgba(74, 222, 128, 0.8), 0 2px 6px rgba(0,0,0,0.25)";
    // ✅ Consistent baseline shadow for all others
    return "0 2px 6px rgba(0,0,0,0.25)";
  };

  return (
    <div style={{ position: "relative", padding: "20px", color: "white" }}>
      <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "12px" }}>Weekly Summary</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(8, 40px)",
          gap: "8px",
        }}
      >
        {weeklyData.map(({ weekStart, actionCount }) => (
          <div
            key={weekStart}
            style={{
              width: "40px",
              height: "40px",
              backgroundColor: getColor(actionCount),
              boxShadow: getBoxShadow(actionCount),
              transform: actionCount >= 7 ? "scale(1.03)" : "scale(1)",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "transform 0.1s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
            onMouseMove={(e) => {
              setHoverInfo({
                week: weekStart,
                x: e.clientX + 10, // offset near mouse
                y: e.clientY + 10,
              });
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1.0)";
              setHoverInfo(null);
            }}
          >
            {actionCount}
          </div>
        ))}
      </div>

      {hoverInfo && (
        <div
          style={{
            position: "fixed",
            left: hoverInfo.x,
            top: hoverInfo.y,
            backgroundColor: "rgba(0,0,0,0.85)",
            color: "white",
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "12px",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            zIndex: 10,
          }}
        >
          {hoverInfo.week}
        </div>
      )}
    </div>
  );
};

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
            <Route path="dashboard" element={<Navigate to="I" replace />} />
            <Route path="dashboard/:action" element={<WeeklySummaryComponent />} />
            <Route path="targets" element={<TargetComponent />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App;
