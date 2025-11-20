import EditorJS from "@/app-components/Editor";
import { INoteData } from "@/shared/types";
import { useMainStore } from "@/shared/zust-store";
import { X } from "lucide-react";
import React from "react";

export default React.memo((props:any)=>{
  const active_note=useMainStore(state=>state.active_note)
  const [note,set_note1]=React.useState<INoteData | undefined>()
  const set_state=useMainStore(state=>state.set_state);
  const handle_get_note=React.useCallback( async()=>{
window.electron.child_note_id(async (id) => { 
     console.log("NOTE:",typeof id );
  const note = await window.electron.get_note(id);
       console.log("NOTE1:", note); 



  set_note1(note);
}); 
  },[])

  React.useLayoutEffect(()=>{
   handle_get_note();
    //  window.addEventListener(
    //    'one-note-child',
    //    (ev: Event & { detail: INoteData[] }) => { 
    //      // (ev.detail) يحتوي على كل الملاحظات الجديدة القادم من electron
   
    //      // نحط أول ملاحظة كـ "الملاحظة النشطة"
    //      // لأن ev.detail[0] يعني آخر نوت تم تعديلها (حسب ترتيبك)
    //      console.log("ev", ev.detail);
   
    //     set_state('active_note', ev.detail[0]);
   
    //      // لعرض الملاحظات الجديدة على الكونسول
   
    //      // نخزن الملاحظات في الـ zustand store
    //      // حتى باقي الواجهة تعرف أنه تم تحديث قائمة الملاحظات
    //      set_state('notes', ev.detail);
    //    }
    //  );
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
                <EditorJS note={note}/>

            }

        </div>
    )
})