import { IChildRenderer } from "./child-procress/preload";
import { IRenderer } from "./preload";

declare global{
    interface Window{
        electron :IRenderer & IChildRenderer
        
    }
}