import { apiRequest } from "@/lib/queryClient";
import jsPDF from "jspdf";

export type DocumentType = "invoice" | "contract";

// Generate document on the server
export const generateDocument = async (type: DocumentType, projectId: number) => {
  try {
    const response = await apiRequest("POST", "/api/documents/generate", {
      type,
      projectId,
    });
    return await response.json();
  } catch (error) {
    console.error("Error generating document:", error);
    throw new Error(`Failed to generate ${type}. Please try again later.`);
  }
};

// Export document to PDF
export const exportToPdf = (documentContent: string, filename: string) => {
  const doc = new jsPDF();
  
  // Split content into lines
  const lines = documentContent.split("\n");
  let y = 20; // Starting y position
  
  // Add lines to PDF
  for (const line of lines) {
    if (line.trim() === "") {
      y += 5; // Add space for empty lines
    } else if (line.includes("INVOICE") || line.includes("CONTRACT")) {
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(line, 20, y);
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      y += 10;
    } else {
      doc.text(line, 20, y);
      y += 7;
    }
    
    // Check if we need a new page
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  }
  
  // Save the PDF
  doc.save(`${filename}.pdf`);
};

// Copy document content to clipboard
export const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};
