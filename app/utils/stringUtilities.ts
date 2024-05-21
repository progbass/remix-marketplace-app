
// Function that trims the number of characters and adds '...' when excedding
export function trimWithEllipsis(content:string = "", limit = 80 ):string {
    let formattedString = content;
    if(formattedString.length > limit){
        return formattedString.substring(0, (limit - 3)) + '...';
    }
    return formattedString;
}
