import { IRenderer } from "./preload";

declare global{
    interface Window{
        electron :IRenderer
    }
}