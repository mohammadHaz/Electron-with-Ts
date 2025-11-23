// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { broadcast_event } from "@/shared/events";
import { INoteData } from "@/shared/types";
import { contextBridge, ipcRenderer } from "electron";




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

   get_note: async(note_id : string) =>{
     const note= await  ipcRenderer.invoke('get-note',note_id);
    //  console.log(note)
     return note;
   },

    child_note_id: (callback: (id: any) => void) => {
    ipcRenderer.on("child-note-id", (_event, id) => {
        callback(id);
    });
    },
    set_note: async (data: any, explicit=false): Promise<INoteData[]> => {
    const notes = await ipcRenderer.invoke('set-note', data)
    console.log("notes", notes);

    if (explicit) {
      await  window.dispatchEvent(broadcast_event('all-note-data', notes));

        return;
    }
    return notes;
     },
    fetch_all_notess: async () => {
    const all_notes = await ipcRenderer.invoke("fetch-all-notes");
     window.dispatchEvent(broadcast_event('all-note-data', all_notes));
    }

} 

contextBridge.exposeInMainWorld('electron',renderer)
export type IChildRenderer=typeof renderer