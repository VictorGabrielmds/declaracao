import React from "react"
import img from '../../assets/images/Logo Svt copiar.png'

function Footer(){
    return (
      <footer className="footer">
        <hr className="line-left" />
        <img src={img} alt="SVT Faculdade"/>
        <hr className="line-right" />
      </footer>
    )
}


export default Footer