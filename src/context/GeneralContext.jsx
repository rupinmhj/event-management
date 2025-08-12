import { createContext,useState } from "react";
const GeneralContext=createContext();

export const GeneralProvider=({children})=>{
    const [isCreateEvent,setIsCreateEvent]=useState(false);
    const create=()=>{
        setIsCreateEvent(true)
    } 
    const submitCreate=()=>{
        setIsCreateEvent(false)
    }
    return (
        <GeneralContext.Provider value={{ create, submitCreate,isCreateEvent,setIsCreateEvent }}>
            {children}
        </GeneralContext.Provider>
    )


}
export default GeneralContext