import { FiPrinter } from "react-icons/fi";

const PrintMessageButton = ({ message_id }) => {
  const handlePrint = () => {
    const messageElement = document.getElementById(message_id);
    if (messageElement) {
      const printWindow = window.open('', '_blank');
      const content = messageElement.cloneNode(true);
      
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Message</title>
            <style>
              body {
                font-family: system-ui, -apple-system, sans-serif;
                padding: 20px;
                max-width: 880px;
                margin: 0 auto;
              }
              .group {
                margin-top: 1rem;
              }
              button {
                display: none;
              }
            </style>
          </head>
          <body>
            ${content.innerHTML}
          </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
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
