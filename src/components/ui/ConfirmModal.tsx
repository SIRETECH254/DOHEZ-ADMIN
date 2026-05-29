import { useEffect } from 'react';

/**
 * ConfirmModal Component
 * 
 * A reusable confirmation modal dialog for destructive actions.
 * Displays a message and provides Cancel and Confirm buttons.
 * 
 * @param isOpen - Boolean to control modal visibility
 * @param onClose - Callback function when modal is closed (Cancel or backdrop click)
 * @param onConfirm - Callback function when user confirms the action
 * @param title - Modal title text
 * @param message - Modal message/description text
 * @param confirmText - Text for confirm button (default: "Confirm")
 * @param cancelText - Text for cancel button (default: "Cancel")
 * @param confirmButtonClass - Additional classes for confirm button (default: "btn-primary")
 * @param isLoading - Boolean to show loading state on confirm button
 */

export type ConfirmModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
  isLoading?: boolean;
};

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmButtonClass = 'btn-primary',
  isLoading = false,
}: ConfirmModalProps) => {
  /**
   * Handle Escape key to close modal
   * Adds event listener when modal is open
   */
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, isLoading, onClose]);

  // Don't render if not open
  if (!isOpen) return null;

  /**
   * Handle backdrop click to close modal
   * Only closes if clicking the backdrop itself, not the modal content
   */
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      {/* Modal content */}
      <div className="w-[90%] md:w-[70%] lg:w-[60%] rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
        {/* Modal header */}
        <div className="mb-4">
          <h2 id="modal-title" className="text-xl font-semibold text-gray-900">
            {title}
          </h2>
        </div>

        {/* Modal body */}
        <div className="mb-6">
          <p id="modal-description" className="text-sm text-gray-600">
            {message}
          </p>
        </div>

        {/* Modal footer with actions */}
        <div className="flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={confirmButtonClass}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
