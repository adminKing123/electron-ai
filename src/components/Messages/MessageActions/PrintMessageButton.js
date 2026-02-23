import { FiPrinter } from "react-icons/fi";

const PrintMessageButton = ({ message_id }) => {
  const getPageStyles = () => {
    let styles = "";

    const styleSheets = document.querySelectorAll(
      'link[rel="stylesheet"], style',
    );
    styleSheets.forEach((sheet) => {
      if (sheet.tagName === "LINK") {
        styles += `<link rel="stylesheet" href="${sheet.href}" />`;
      } else if (sheet.tagName === "STYLE") {
        styles += `<style>${sheet.innerHTML}</style>`;
      }
    });

    return styles;
  };

  const handlePrint = () => {
    const messageElement = document.getElementById(message_id);
    if (!messageElement) {
      console.warn(`Message element with id "${message_id}" not found`);
      return;
    }

    const content = messageElement.cloneNode(true);
    const elementsToRemove = content.querySelectorAll(
      'button, [role="button"], [data-no-print]',
    );
    elementsToRemove.forEach((el) => el.remove());

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      console.error("Failed to open print window. Check popup blocker.");
      return;
    }

    const htmlClasses = document.documentElement.className;
    const bodyClasses = document.body.className;

    const printDocument = `
      <!DOCTYPE html>
      <html class="${htmlClasses}">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Print Message</title>
          ${getPageStyles()}
          <style>
            /* Print-specific styles */
            body {
              padding: 20px;
              margin: 0;
            }
            
            /* Remove height constraints and gradients */
            .max-h-\\[160px\\] {
              max-height: none !important;
            }
            .overflow-hidden {
              overflow: visible !important;
            }
            .bg-gradient-to-t {
              display: none !important;
            }
            
            /* Ensure images fit on page */
            img {
              max-width: 100% !important;
              height: auto !important;
            }
            
            /* Clean code blocks for printing */
            pre, code {
              white-space: pre-wrap !important;
              word-wrap: break-word !important;
            }
            
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body class="${bodyClasses}">
          <div id="print-content">
            ${content.innerHTML}
          </div>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(printDocument);
    printWindow.document.close();

    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }, 250);
    };
  };

  return (
    <button
      onClick={handlePrint}
      className="p-[6px] hover:bg-[#E8E8E8] dark:hover:bg-[#1d1d1d] rounded-md"
      title="Print message"
      aria-label="Print this message"
    >
      <FiPrinter />
    </button>
  );
};

export default PrintMessageButton;
