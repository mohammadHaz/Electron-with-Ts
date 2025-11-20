import React from "react"
import EditorJSTemplate from "./EditorJSTemplate"
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMainStore } from "@/shared/zust-store";
export default React.memo((props:any)=>{
    const active_note =useMainStore(state=>state.active_note)
    const set_state=useMainStore(state=>state.set_state);
    const [child, set_child] = React.useState<boolean>(false)
    const [parent, set_parent] = React.useState<boolean>(false)
    React.useEffect(() => {
        if (props.note != undefined) {
            set_child(true)
            set_parent(false)
        } else{
            if(active_note !=undefined){
              set_parent(true)
              set_child(false)
            }
       
        }
    }, [props.note || active_note])
    const handle_change=React.useCallback((api:any,event:any)=>{
        // console.log("api",api);
        api.saver.save().then((data:any)=>{
            // console.log("database",data);
            window.electron.set_note({
                id: props.note != undefined ? props.note.id : active_note.id,
                note:data
                // note:JSON.stringify(data)
               
            },parent,child)
            set_parent(false)
            set_child(false)
        })
    },[props.note || active_note])
    return(
        <ScrollArea className="h-[calc(100%-40px)]">
         <EditorJSTemplate note={props.note}  onChange={handle_change}/>
        </ScrollArea >
    )
})