import React from "react"


function InputForm(props){
    return <div>
        <label htmlFor="email">{props.label}</label>
        <input 
        type={props.type}
        placeholder={props.placeholder}
        onChange={props.onChange}
        accept={props.accept}
        required/>
    </div>
}


export default InputForm

