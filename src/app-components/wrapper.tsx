import React from "react"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { WindowButtons ,NotesList } from "@/assets/SharedComponents"
import Editor from "./Editor"
import { useMainStore } from "@/shared/zust-store"
import EmptyNoteUI from "./EmptyNoteUI"
import { INoteData } from "@/shared/types"
import { ScrollArea } from "@/components/ui/scroll-area"
import { sectionize_notes } from "@/shared/functins"
import { Section } from "lucide-react"
export default React.memo((props:any)=>{
  const active_note=useMainStore(state=>state.active_note)
      const notes = useMainStore(state => state.notes);
  const set_state=useMainStore(state=>state.set_state);
  // const [notes,set_notes]=React.useState<INoteData[]>([])
// const section_notes = React.useMemo(() => sectionize_notes(notes), [notes]);


const handle_create_new_note=React.useCallback(async()=>{
  const dummy_date={
    id:null  ,
    note:"{}",
  } as INoteData
  const notes=await window.electron.set_note(dummy_date)
  set_state('active_note',notes[0])
  console.log("not!",notes)
  set_state('notes',notes)

},[]) 

const handle_set_active_note=React.useCallback((note:INoteData)=>{
console.log(note);
  set_state('active_note',note)

},[])


// useLayoutEffect: مثل useEffect لكنه ينفّذ قبل رسم الواجهة (DOM Paint)
// تستخدمه عندما بدك التغيير يصير مباشرة قبل ما الشاشة تنعرض
React.useLayoutEffect(() => {
   window.electron.fetch_all_notes();
  // نضيف "listener" على window ليستقبل الحدث 'all-note-data'
  // هذا الحدث عم تجيبه من الـ Electron preload لما الداتا تتغيّر بالقاعدة
  window.addEventListener(
    'all-note-data',
    (ev: Event & { detail: INoteData[] }) => { 
      // (ev.detail) يحتوي على كل الملاحظات الجديدة القادم من electron
      console.log("ev", ev.detail[0]);

      // نحط أول ملاحظة كـ "الملاحظة النشطة"
      // لأن ev.detail[0] يعني آخر نوت تم تعديلها (حسب ترتيبك)
      set_state('active_note', ev.detail[0]);

      // لعرض الملاحظات الجديدة على الكونسول
      console.log("ev", ev.detail);

      // نخزن الملاحظات في الـ zustand store
      // حتى باقي الواجهة تعرف أنه تم تحديث قائمة الملاحظات
      set_state('notes', ev.detail);
    }
  );

}, []);  // [] يعني ينفّذ مرة واحدة فقط عند أول تحميل للصفحة

    return(
        <div className="h-[100vh] w-[100%]">
        <ResizablePanelGroup direction="horizontal">
        <ResizablePanel minSize={30} defaultSize={35}>
          <div className="h-[40px] w-[100%] border-b-[.5px] border-b-stone-300 app-dragger dark:border-b-stone-800 bg-red-600 flex justify-center"></div>

          <ScrollArea className="h-[calc(100%-40px)]">
          {
          //  notes.length == 0?
          // <div className='h-100 flex font-medium items-center justify-center text-sm text-stone-600 dark:text-stone-500'>
          // <span>No notes</span>
          //  </div>:
          //     Object.keys(section_notes).map(section => (
          //       <NotesList
          //         key={section}
          //         section={section}
          //         data={section_notes[section as keyof typeof section_notes]}
          //         onClick={handle_set_active_note}
          //       />
          //     ))
          }
          </ScrollArea>
          
          </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel minSize={30}>
          <div className="h-[40px] w-[100%]  border-b-[.5px] border-b-stone-300 app-dragger dark:border-b-stone-800 bg-red-600 f  lex justify-end">
             {
              !window.navigator.userAgent.toLowerCase().includes('mac') && //انوا نحنه windows
              <WindowButtons/>
             } 
          </div>
          {
            active_note == null ?
            <EmptyNoteUI onClick={handle_create_new_note}/>:
             <Editor/>
          }
         
          </ResizablePanel>
        </ResizablePanelGroup>
        </div>
    )
})