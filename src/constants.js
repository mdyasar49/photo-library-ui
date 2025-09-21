import { alpha } from "@mui/material/styles";

export const BASE_URL = 'http://localhost:5000';

export function fGetScrollStyles(initialMaxHeight = '80vh') {
    return{
        maxHeight: initialMaxHeight,
        overflow: 'auto',
        "&::-webkit-scrollbar": {
            width: "8px",
            height: "8px",
        }, 
        "&::-webkit-scrollbar-thumb": {
            backgroundColor: alpha("#637381", 0.48),
            borderRadius: "4px",
        }
    }
}