import React, { useState } from "react"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { WindowButtons ,NotesList } from "@/assets/SharedComponents"
import Editor from "./Editor"
import { useMainStore } from "@/shared/zust-store"
import EmptyNoteUI from "./EmptyNoteUI"
import { INoteData, TNote } from "@/shared/types"
import { ScrollArea } from "@/components/ui/scroll-area"
import { sectionize_notes } from "@/shared/functins"
import { PenBox, Section, Trash } from "lucide-react"
import { Switch } from "@/components/ui/switch"

const sort_notes = (a: INoteData, b: INoteData) => {
  return (b.note as TNote).time - (a.note as TNote).time;
};
export default React.memo((props:any)=>{
  const active_note=useMainStore(state=>state.active_note)
      const notes = useMainStore(state => state.notes);
  const set_state=useMainStore(state=>state.set_state);
  // const [notes,set_notes]=React.useState<INoteData[]>([])
const section_notes = React.useMemo(() => sectionize_notes(notes), [notes]);
const [dark_mode,setdarkmode]=useState<boolean>(localStorage.getItem('dark_mode')=='dark')

const handle_create_new_note=React.useCallback(async()=>{
  const dummy_date={
    id:null  ,
    note:"{}",
  } as INoteData
  const notes=await window.electron.set_note(dummy_date)
const sort_note = [...notes].sort(sort_notes);
  set_state('active_note',sort_note[0])
  console.log("not!",notes)
  set_state('notes',sort_note)

},[]) 

const handle_set_active_note=React.useCallback((note:INoteData)=>{
console.log(note);
  set_state('active_note',note)

},[])

const handle_delete_note =React.useCallback(()=>{
  if(confirm("Are you sure you want to delete this note, this action is irreversible")){
    window.electron.delete_note(active_note.id.toString())
  }
},[active_note])

const handle_Toggle_Dark_mode=React.useCallback(()=>{
  const isDark =document.documentElement.classList.contains('dark')
  localStorage.setItem('dark_mode',isDark ? 'light':'dark')
  setdarkmode(!isDark)
  isDark? document.documentElement.classList.remove('dark') :
  document.documentElement.classList.add('dark')
  window.electron.set_dark_mode(isDark);

},[])
// useLayoutEffect: مثل useEffect لكنه ينفّذ قبل رسم الواجهة (DOM Paint)
// تستخدمه عندما بدك التغيير يصير مباشرة قبل ما الشاشة تنعرض
React.useLayoutEffect(() => {
  
 async function loadNotes() {
    await window.electron.fetch_all_notes();
  }
  loadNotes();
    // نضيف "listener" على window ليستقبل الحدث 'all-note-data'
  // هذا الحدث عم تجيبه من الـ Electron preload لما الداتا تتغيّر بالقاعدة
  window.addEventListener(
    'all-note-data',
    (ev: Event & { detail: INoteData[] }) => { 
    const sorted = ev.detail.sort(sort_notes);
      // (ev.detail) يحتوي على كل الملاحظات الجديدة القادم من electron

      // نحط أول ملاحظة كـ "الملاحظة النشطة"
      // لأن ev.detail[0] يعني آخر نوت تم تعديلها (حسب ترتيبك)
      console.log("ev", ev.detail);

      sorted.length ==0 ?  set_state('active_note', null): set_state('active_note', sorted[0]);

      // لعرض الملاحظات الجديدة على الكونسول

      // نخزن الملاحظات في الـ zustand store
      // حتى باقي الواجهة تعرف أنه تم تحديث قائمة الملاحظات
      set_state('notes', sorted);
    }
  );

}, []);  // [] يعني ينفّذ مرة واحدة فقط عند أول تحميل للصفحة
 console.log("section",section_notes)
    return(
        <div className="h-[100vh] w-[100%]">
        <ResizablePanelGroup direction="horizontal">
        <ResizablePanel minSize={30} defaultSize={35}>
          <div className="h-[40px] w-[100%] border-b-[.5px] border-b-stone-300 app-dragger dark:border-b-stone-800  px-2 flex items-center justify-end">
       
            <span title="New note">
             <PenBox onClick={handle_create_new_note} className="text-stone-900 dark:text-stone-100 h-[22px] w-[22px] cursor-pointer"/>
            </span>
            {          
             notes.length >0 &&
            <span title="Delete note">
             <Trash onClick={handle_delete_note} className="text-stone-900 dark:text-stone-100 [&:hover]:text-red-600 h-[22px] w-[22px] ml-3 cursor-pointer"/>
            </span>
              }
          </div>

          <ScrollArea className="h-[calc(100%-40px)]">
          {
           notes.length == 0?
          <div className='h-100 flex font-medium items-center justify-center text-sm text-stone-600 dark:text-stone-500'>
          <span>No notes</span>
           </div>:
              Object.keys(section_notes).map(section => (
                <NotesList
                  key={section}
                  section={section}
                  data={section_notes[section as keyof typeof section_notes]}
                  onClick={handle_set_active_note}
                  
                />
             
              )) 
          }  
          </ScrollArea>
          
          </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel minSize={30}>
          <div className="h-[40px] w-[100%] px-2  border-b-[.5px] border-b-stone-300 app-dragger dark:border-b-stone-800  flex justify-between items-center">
             <div className="flex" onClick={handle_Toggle_Dark_mode}>
             <small className="mr-2">Dark mode</small>
             <Switch checked={dark_mode}/>

             </div>
             {
              // !window.navigator.userAgent.toLowerCase().includes('mac') && //انوا نحنه windows
              <WindowButtons/>
             } 
          </div>
          {
            active_note == null ?
            <EmptyNoteUI onClick={handle_create_new_note}/>:
             <Editor  isChild={false}/>
          }
         
          </ResizablePanel>
        </ResizablePanelGroup>
        </div>
    )
})