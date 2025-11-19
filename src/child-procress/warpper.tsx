import EditorJS from "@/app-components/Editor";
import { INoteData } from "@/shared/types";
import { useMainStore } from "@/shared/zust-store";
import React from "react";

export default React.memo((props:any)=>{
  const active_note=useMainStore(state=>state.active_note)
  const [note,set_note1]=React.useState<INoteData | undefined>()
  const handle_get_note=React.useCallback( async()=>{
const note_id = (new URLSearchParams(window.location.href.split('?')[1]).get("note_id"));
console.log("note_id",note_id)
    const note =await window.electron.get_note(note_id)
    console.log(note);
    set_note1(note);
  },[])
  React.useLayoutEffect(()=>{

  },[])
    return(
        <div className="h-[1000vh] w-[100%]">
            {
                note==undefined ?
                <div className="h-[100%] w-[100%] bg-red-600 flex justify-center align-center">
                    <span>Loading</span>

                </div>:
                <EditorJS note={note}/>

            }

        </div>
    )
})