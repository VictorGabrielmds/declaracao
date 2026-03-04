import React from "react"
import { useState } from "react"
import InputForm from "../../components/inputForm/inputForm"  
import Button from "../../components/button/Button"
import Modal from "../modal/modal"
import CodeInPaper from "../../assets/images/codeInPaper.jpeg"


function Form(){
    const [code, setCode] = useState()
    const [requirerEmail, setRequirerEmail] = useState()
    const [requirerName, setRequirerName] = useState()
    const [modalData, setModalData] = useState({
      isOpen: false,
      type: "loading", // "loading", "success" ou "error"
      title: "",
      message: "",
      buttonText: "",
    });
    
    const closeModal = () => {
      setModalData((prev) => ({ ...prev, isOpen: false }));
    };
    var errorText = "Erro"
    var buttonText = "ok"
    const handleSubmit = async (e) => {
      setModalData({
        isOpen: true,
        type: "loading",
      });
      e.preventDefault(); // Evita reload da página
  
      try {
        // URL da Firebase Function (substitua pela URL da sua função)
        const url = 'https://us-central1-portaldedeclaracoessvt.cloudfunctions.net/echoInputs';
        
        // Faz a requisição POST usando fetch
        const res = await fetch(url, {
          method: 'POST', // Método HTTP
          headers: {
            'Content-Type': 'application/json', // Tipo de conteúdo enviado
          },
          body: JSON.stringify({ code, requirerName, requirerEmail}), // Dados no body da requisição
        });
        if (!res.ok) {
          
          switch (res.status) {
            case 400:
              throw new Error("Os dados enviados estão incorretos.");
            case 401:
              throw new Error("Você não tem permissão para acessar.");
            case 403:
              throw new Error("Acesso negado.");
            case 404:
              buttonText = "Tentar novamente"
              errorText = "Verifique o código do certificado digitado e tente novamente."
              throw new Error("Nenhum certificado encontrado.");
            case 500:
              throw new Error("Erro interno no servidor.");
            case 503:
            case 504:

              throw new Error("Serviço indisponível no momento.");
            default:
              throw new Error("Ocorreu um erro desconhecido.");
          }
          
        }
        
        
        setModalData({
          isOpen: true,
          type: "success",
          title: "A solicitação foi feita com sucesso!",
          message:
            "Logo você receberá no seu email a declaração de autenticidade do certificado.",
          buttonText: "OK",
        });
        
      } catch (error) {
        if (error.message.includes("Failed to fetch")) {
          setModalData({
            isOpen: true,
            type: "error",
            title: "Erro de Conexão",
            message: "Não foi possível se conectar ao servidor. Verifique sua conexão com a internet e tente novamente.",
            buttonText: "OK",
          });
        } else{      
          setModalData({
            isOpen: true,
            type: "error",
            title: error.message || "Algo deu errado.",
            message: errorText,
            buttonText: buttonText,
          });
        }   
      }
    };

    return <form onSubmit={handleSubmit}>

        <InputForm type="text" onChange={(e) => setRequirerName(e.target.value)} label="Nome do requisitante" placeholder="Insira seu nome aqui"></InputForm>
        <InputForm type="text" onChange={(e) => setRequirerEmail(e.target.value)} label="Email" placeholder="aluno@gmail.com"></InputForm>
        <InputForm type="text" onChange={(e) => setCode(e.target.value)}  label="Código" placeholder="21032420"></InputForm>
        <a href={CodeInPaper} target="blank" className="onde-encontrar">Onde encontro código?</a>
        <Button type="submit" className="btn-solicitar" label="SOLICITAR"></Button>
        <Modal
          isOpen={modalData.isOpen}
          type={modalData.type}
          title={modalData.title}
          message={modalData.message}
          buttonText={modalData.buttonText}
          onClose={closeModal}
        />
        
    </form>
}


export default Form