import React from "react"


function Button(props){
    return <button onClick={props.onClick} className={props.className} type="submit">
        {props.label}
    </button>
}


export default Button