/** @format */

// src/components/ConfirmationModal.tsx
import React from "react";
import Modal from "./Modal";

interface ConfirmationModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: "positive" | "negative";
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  message,
  onConfirm,
  onCancel,
  type = "positive",
}) => {
  return (
    <Modal onClose={onCancel}>
      <div className="space-y-4 text-center">
        <h2 className="text-lg font-semibold">¿Estás seguro?</h2>
        <p>{message}</p>
        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-md dark:bg-neutral-700 dark:hover:bg-neutral-600"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded-md ${
              type === "positive"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            Confirmar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
