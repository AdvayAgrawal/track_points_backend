
//onclick, make css backgroud green, and put
// box-shadow: rgba(20, 22, 21, 0.2) 0 -25px 18px -14px inset,rgba(44, 187, 99, .15) 0 1px 2px,rgba(44, 187, 99, .15) 0 2px 4px,rgba(44, 187, 99, .15) 0 4px 8px,rgba(44, 187, 99, .15) 0 8px 16px,rgba(44, 187, 99, .15) 0 16px 32px;

import { FC } from "react";

interface actionprops {
  increment: ()=>void;
  decrement: ()=>void;
  data: {
    action_key: string,
    message: string,
    points: number,
    count: number,
  }
};

function Counter(props: {count: number, increment: ()=>void, decrement: ()=>void}){
  if (props.count == 0){
    return <div className="counter">
            <button onClick={props.increment} className="add-button">ADD</button>
          </div>
  } else{
    return <div className="counter">
            <button onClick={props.decrement} className="counter-button">-</button>
            <span className="counter-display">{props.count}</span>
            <button onClick={props.increment} className="counter-button">+</button>
          </div>
  }
  
}

export const ActionButton: FC<actionprops> = (props) => {
  
  return (
    <div className="action-button">
      <div
      className={props.data.count > 0 ? "button-33-done" : "button-33"}>
        {props.data.message} ({props.data.points} points)
      </div>
      
      <Counter count={props.data.count} increment={props.increment} decrement={props.decrement}/>
    </div>
  )
}

