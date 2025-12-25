import { FiPrinter } from "react-icons/fi";

const PrintMessageButton = ({ message_id }) => {
  const handlePrint = () => {
    const messageElement = document.getElementById(message_id);
    if (messageElement) {
      const printWindow = window.open('', '_blank');
      const content = messageElement.cloneNode(true);
      
      // Collect all stylesheets from the current document
      const stylesheets = Array.from(document.styleSheets)
        .map(styleSheet => {
          try {
            // Try to get CSS rules from the stylesheet
            return Array.from(styleSheet.cssRules)
              .map(rule => rule.cssText)
              .join('\n');
          } catch (e) {
            // If we can't access the stylesheet (CORS), try to get the href
            if (styleSheet.href) {
              return `<link rel="stylesheet" href="${styleSheet.href}">`;
            }
            return '';
          }
        })
        .filter(css => css.length > 0);
      
      // Get inline styles from style tags
      const styleTags = Array.from(document.querySelectorAll('style'))
        .map(style => style.innerHTML)
        .join('\n');
      
      // Build the print window HTML
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Message</title>
            ${stylesheets.filter(css => css.startsWith('<link')).join('\n')}
            <style>
              ${stylesheets.filter(css => !css.startsWith('<link')).join('\n')}
              ${styleTags}
              
              /* Print-specific overrides */
              body {
                padding: 20px;
                max-width: 880px;
                margin: 0 auto;
              }
              button {
                display: none !important;
              }
              /* Hide action buttons and interactive elements */
              .group button,
              [role="button"] {
                display: none !important;
              }
              /* Expand collapsed prompt box */
              .max-h-\\[160px\\] {
                max-height: none !important;
              }
              .overflow-hidden {
                overflow: visible !important;
              }
              /* Hide gradient overlay in collapsed prompts */
              .bg-gradient-to-t {
                display: none !important;
              }
            </style>
          </head>
          <body class="${document.body.className}">
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
