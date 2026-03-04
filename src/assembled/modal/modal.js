import React from "react";
import Button from "../../components/button/Button";

const Modal = ({ isOpen, type, title, message, buttonText, onClose }) => {
  if (!isOpen) return null;

  const isSuccess = type === "success";
  const isError = type === "error";
  const isLoading = type === "loading";

  const modalClass = isSuccess
    ? "modal-success"
    : isError
    ? "modal-error"
    : "modal-loading";

  return (
    <div className="modal-overlay">
      <div className={`modal-container ${modalClass}`}>
        {isLoading ? (
          <div className="modal-loading-content">
            <div className="spinner"></div>
            <p>Aguarde...</p>
          </div>
        ) : (
          <>
            <div className="modal-icon">
              {isSuccess ? (
                <span className="modal-check">&#10003;</span>
              ) : (
                <span className="modal-warning">&#9888;</span>
              )}
            </div>
            <h2 className="modal-title">{title}</h2>
            <p className="modal-message">{message}</p>
            <Button onClick={onClose} className="modal-button" label={buttonText}></Button>
          </>
        )}
      </div>
    </div>
  );
};

export default Modal;
