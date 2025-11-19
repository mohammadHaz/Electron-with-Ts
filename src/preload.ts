// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from "electron";
import { INoteData } from "./shared/types";
import { broadcast_event } from "./shared/events";


ipcRenderer.on("onstart-notes-data",(event,data)=>{
    document.onreadystatechange=(event)=>{
     console.log("event onreadystatechange", data);     
        window.dispatchEvent(broadcast_event("all-note-data",data));

    }
})

ipcRenderer.on('update-notes-data', (ev, data) => {
    window.dispatchEvent(broadcast_event('all-note-data', data));                    
})

const renderer={
    closeApp:()=>{
        ipcRenderer.send('close-app')
    },
    maximizeApp:()=>{
        ipcRenderer.send('maximize-app')
    },
    minimizeApp:()=>{
        ipcRenderer.send('minimize-app')
    },
    set_note: async (data: any, explicit=false): Promise<INoteData[]> => {
        const notes = await ipcRenderer.invoke('set-note', data)
        // console.log("notes", notes);
        if (explicit) {
            window.dispatchEvent(broadcast_event('all-note-data', notes));
            return;
        }
        return notes;
    },
    fetch_all_notes: async () => {

    // 1️⃣ استدعاء دالة من الـ Main Process باستخدام invoke
    // هذا يعني: اطلب من الـ main أن يرجّع كل الملاحظات من قاعدة البيانات
    const all_notes = await ipcRenderer.invoke("fetch-all-notes");
    // console.log("all_notes",all_notes)
 
    // 2️⃣ بعد استلام الملاحظات من الـ main
    // نعمل event مخصص اسمه "all-notes-data" ونبعث معه كل الملاحظات
    // الفكرة: نرسلها للواجهة (React) بدون استخدام ipcRenderer.on
    window.dispatchEvent(broadcast_event('all-note-data', all_notes));
    },
   delete_note : async (note_id:string)=>{
     const delete_note = await ipcRenderer.invoke("delete-note",note_id);
      window.dispatchEvent(broadcast_event('all-note-data', delete_note));

   },

   get_note: async(note_id :string)=>{
     return await  ipcRenderer.invoke("get-note",note_id);

   },
   open_note_in_child_proc:(note_id:string)=>{
    ipcRenderer.send("open-note-in-child-process",note_id)
   },
   open_note_in_item_context:(note_id:string)=>{
    ipcRenderer.send("open-note-in-item-context",note_id)
   }
   
} 

contextBridge.exposeInMainWorld('electron',renderer)
export type IRenderer=typeof renderer