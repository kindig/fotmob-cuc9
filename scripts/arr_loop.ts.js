arr = [5, -6, 7, "a", -1, 1, "b", 9, 2, -2, "c",[0,1]];

/*
Return the positive (>0) cube of each number, and do not return any value that is not a number.
 */

function cube(arr) {
    const new_arr = arr.filter(new_val => typeof new_val === "number")
        .map(new_val => new_val = new_val > 0 ? Math.pow(new_val,3) : Math.pow(new_val*-1,3));
    return new_arr;
}

console.log(cube(arr));