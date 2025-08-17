import { createContext,useState } from "react";
const GeneralContext=createContext();

export const GeneralProvider=({children})=>{
    const [isCreateEvent,setIsCreateEvent]=useState(false);
    const [eventName,setEventName]=useState("");
    const create=()=>{
        setIsCreateEvent(true);
    } 
    const submitCreate=()=>{
        setIsCreateEvent(false);
    }
    const eventNameFunc=(event_name)=>{
        setEventName(event_name);
    }
    return (
        <GeneralContext.Provider value={{ create, submitCreate,isCreateEvent,setIsCreateEvent,eventName,eventNameFunc}}>
            {children}
        </GeneralContext.Provider>
    )


}
export default GeneralContext