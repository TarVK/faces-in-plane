declare module "react-tex" {
    import {FC} from "react";
    export const Tex: FC<{texContent: string}>;
    export const InlineTex: FC<{texContent: string}>;
}
