import { FiPrinter } from "react-icons/fi";

const PrintMessageButton = ({ message_id }) => {
  const handlePrint = () => {
    const messageElement = document.getElementById(message_id);
    if (!messageElement) return;

    // Create a temporary container for print content
    const printContainer = document.createElement("div");
    printContainer.id = "print-container";
    printContainer.style.display = "none";
    
    // Clone the message content
    const content = messageElement.cloneNode(true);
    
    // Remove buttons and interactive elements from cloned content
    const buttonsToRemove = content.querySelectorAll("button, [role='button']");
    buttonsToRemove.forEach(btn => btn.remove());
    
    printContainer.appendChild(content);
    document.body.appendChild(printContainer);

    // Create print styles
    const printStyle = document.createElement("style");
    printStyle.id = "print-style";
    printStyle.innerHTML = `
      @media print {
        body * {
          visibility: hidden;
        }
        #print-container,
        #print-container * {
          visibility: visible;
        }
        #print-container {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          display: block !important;
          padding: 20px;
        }
        button,
        [role="button"] {
          display: none !important;
        }
        .max-h-\\[160px\\] {
          max-height: none !important;
        }
        .overflow-hidden {
          overflow: visible !important;
        }
        .bg-gradient-to-t {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(printStyle);

    // Trigger print
    window.print();

    // Cleanup after print dialog closes
    setTimeout(() => {
      document.body.removeChild(printContainer);
      document.head.removeChild(printStyle);
    }, 100);
  };

  return (
    <button
      onClick={handlePrint}
      className="p-[6px] hover:bg-[#E8E8E8] dark:hover:bg-[#1d1d1d] rounded-md"
      title="Print message"
    >
      <FiPrinter />
    </button>
  );
};

export default PrintMessageButton;
