import EditorJS from "@/app-components/Editor";
import { INoteData, TNote } from "@/shared/types";
import { useMainStore } from "@/shared/zust-store";
import { X } from "lucide-react";
import React from "react";

export default React.memo((props:any)=>{
  const [note,set_note1]=React.useState<INoteData | undefined>()

  const set_state=useMainStore(state=>state.set_state);
  const handle_get_note=React.useCallback( async()=>{
window.electron.child_note_id(async (id) => { 
     console.log("NOTE:",typeof id );
     const note1 :INoteData = await window.electron.get_note(id);
     console.log("NOTE1:", note1); 
     
  set_note1(note1);
   }); 
  },[])

  React.useLayoutEffect(()=>{
   handle_get_note();
  },[])
    return(
        <div className="h-[1000vh] w-[100%]">
          <div className="h-[40px] w-[100%]  border-b-[.5px] border-b-stone-300 app-dragger dark:border-b-stone-800 bg-white-600 flex justify-end">
                {
                // !window.navigator.userAgent.toLowerCase().includes('mac') && //انوا نحنه windows
                  <div  className="p-2 flex justify-center items-center cursor-pointer" onClick={() => window.close()}>
                      <X className="w-[20px] h-[20px] text-black dark:text-[#e7e5e4]" />
                  </div>
                } 
          </div>
            {
                note==undefined ?
                <div className="h-[100%] w-[100%] ml:0px bg-red-600 flex justify-center align-center">
                    <span>Loading</span>

                </div>:
                <EditorJS note={note} isChild={true}/>

            }

        </div>
    )
})