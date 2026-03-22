import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Generates a PDF from an HTML element and downloads it.
 * @param elementId The ID of the HTML element to capture.
 * @param fileName The name of the PDF file to save.
 */
export const generatePDF = async (elementId: string, fileName: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with ID ${elementId} not found.`);
    return;
  }

  try {
    // Create a clone of the element to avoid layout issues during capture
    const canvas = await html2canvas(element, {
      scale: 3, // High quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
          // Fix for oklch colors: html2canvas doesn't support them.
          // We traverse the cloned element and replace oklch colors with computed RGB values.
          const allElements = clonedElement.getElementsByTagName('*');
          
          // Helper to convert oklch/oklab to rgb if needed
          const fixColors = (el: HTMLElement, originalEl: HTMLElement) => {
            const style = window.getComputedStyle(originalEl);
            
            // List of properties that might contain oklch/oklab colors
            // We iterate over all properties to be safe, but focus on these common ones
            const colorProps = [
              'backgroundColor', 'color', 'borderColor', 'borderTopColor', 'borderRightColor', 
              'borderBottomColor', 'borderLeftColor', 'outlineColor', 'fill', 'stroke',
              'boxShadow', 'textShadow', 'columnRuleColor', 'textDecorationColor',
              'background', 'outline', 'border'
            ];
            
            colorProps.forEach(prop => {
              const value = style[prop as any];
              if (value && (value.includes('oklch') || value.includes('oklab') || value.includes('var('))) {
                // If computed style still has oklch/oklab, we try to force it to rgb using a temp element
                const temp = document.createElement('div');
                try {
                  if (prop === 'boxShadow' || prop === 'textShadow') {
                    temp.style[prop as any] = value;
                    document.body.appendChild(temp);
                    const rgbValue = window.getComputedStyle(temp)[prop as any];
                    document.body.removeChild(temp);
                    (el.style as any)[prop] = rgbValue;
                  } else {
                    temp.style.color = value;
                    document.body.appendChild(temp);
                    const rgbValue = window.getComputedStyle(temp).color;
                    document.body.removeChild(temp);
                    (el.style as any)[prop] = rgbValue;
                  }
                } catch (e) {
                  console.warn(`Failed to fix color for property ${prop}:`, e);
                  // Fallback to original value if temp conversion fails
                  (el.style as any)[prop] = value;
                }
              } else if (value) {
                (el.style as any)[prop] = value;
              }
            });
          };

          // Fix the main element
          fixColors(clonedElement, element);

          // Fix all children
          const originalElements = element.getElementsByTagName('*');
          for (let i = 0; i < allElements.length; i++) {
            if (originalElements[i]) {
              fixColors(allElements[i] as HTMLElement, originalElements[i] as HTMLElement);
            }
          }

          clonedElement.style.borderRadius = '0';
          clonedElement.style.boxShadow = 'none';
        }
      }
    });

    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`${fileName}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    // Fallback to print if PDF fails
    window.print();
  }
};
