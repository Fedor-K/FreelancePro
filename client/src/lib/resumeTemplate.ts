import { jsPDF } from "jspdf";

// Define a common resume template function that will be used for both preview and download
export const createResumeDocument = (formData: any, resumeName: string = "Resume"): jsPDF => {
  // Create PDF document
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Add header with name and professional title
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(formData.name || "Your Name", pageWidth/2, 20, { align: "center" });
  
  if (formData.professionalTitle) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text(formData.professionalTitle, pageWidth/2, 30, { align: "center" });
  }
  
  // Add contact info
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  const contactInfo = [];
  if (formData.email) contactInfo.push(formData.email);
  if (formData.phone) contactInfo.push(formData.phone);
  if (formData.location) contactInfo.push(formData.location);
  if (formData.website) contactInfo.push(formData.website);
  
  if (contactInfo.length > 0) {
    doc.text(contactInfo.join(" • "), pageWidth/2, 40, { align: "center" });
  }
  
  // Summary
  let yPosition = 50;
  if (formData.summary) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Professional Summary", 20, yPosition);
    doc.line(20, yPosition + 1, pageWidth - 20, yPosition + 1);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const splitSummary = doc.splitTextToSize(formData.summary, pageWidth - 40);
    doc.text(splitSummary, 20, yPosition + 10);
    
    yPosition += 10 + (splitSummary.length * 5) + 10;
  }
  
  // Skills
  if (formData.skills && formData.skills.length > 0) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Skills", 20, yPosition);
    doc.line(20, yPosition + 1, pageWidth - 20, yPosition + 1);
    
    yPosition += 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    // Format skills as comma-separated list
    const skills = formData.skills;
    let skillsText = "";
    skills.forEach((skill: string, i: number) => {
      skillsText += skill;
      if (i < skills.length - 1) skillsText += ", ";
    });
    
    const splitSkills = doc.splitTextToSize(skillsText, pageWidth - 40);
    doc.text(splitSkills, 20, yPosition);
    
    yPosition += (splitSkills.length * 5) + 15;
  }
  
  // Languages
  if (formData.languages && formData.languages.length > 0) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Languages", 20, yPosition);
    doc.line(20, yPosition + 1, pageWidth - 20, yPosition + 1);
    
    yPosition += 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    // Format languages in a two-column grid
    const languages = formData.languages;
    const languageRows = Math.ceil(languages.length / 2);
    
    for (let i = 0; i < languageRows; i++) {
      // First column
      if (i < languages.length) {
        const lang = languages[i];
        doc.setFont("helvetica", "bold");
        doc.text(`${lang.language}:`, 20, yPosition);
        doc.setFont("helvetica", "normal");
        doc.text(lang.level, 60, yPosition);
      }
      
      // Second column (if there's an item)
      if (i + languageRows < languages.length) {
        const lang = languages[i + languageRows];
        doc.setFont("helvetica", "bold");
        doc.text(`${lang.language}:`, pageWidth/2, yPosition);
        doc.setFont("helvetica", "normal");
        doc.text(lang.level, pageWidth/2 + 40, yPosition);
      }
      
      yPosition += 7;
    }
    
    yPosition += 8;
  }
  
  // Work Experience
  if (formData.experience && formData.experience.length > 0) {
    // Check if we need a new page
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Work Experience", 20, yPosition);
    doc.line(20, yPosition + 1, pageWidth - 20, yPosition + 1);
    
    yPosition += 10;
    
    formData.experience.forEach((exp: any) => {
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(exp.role, 20, yPosition);
      yPosition += 5;
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`${exp.company}`, 20, yPosition);
      
      // Add dates if they exist
      if (exp.startDate || exp.endDate) {
        let dateText = "";
        if (exp.startDate) dateText += exp.startDate;
        if (exp.startDate && exp.endDate) dateText += " - ";
        if (exp.endDate) dateText += exp.endDate;
        
        doc.text(dateText, 20, yPosition + 5);
        yPosition += 5;
      }
      
      yPosition += 5;
      
      if (exp.description) {
        const splitDesc = doc.splitTextToSize(exp.description, pageWidth - 40);
        doc.text(splitDesc, 20, yPosition);
        yPosition += (splitDesc.length * 5);
      }
      
      yPosition += 10; // Space between experiences
    });
  }
  
  // Education
  if (formData.education && formData.education.length > 0) {
    // Check if we need a new page
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Education", 20, yPosition);
    doc.line(20, yPosition + 1, pageWidth - 20, yPosition + 1);
    
    yPosition += 10;
    
    formData.education.forEach((edu: any) => {
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(edu.degree, 20, yPosition);
      yPosition += 5;
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(edu.institution, 20, yPosition);
      
      if (edu.year) {
        doc.text(edu.year, 20, yPosition + 5);
        yPosition += 5;
      }
      
      yPosition += 5;
      
      if (edu.description) {
        const splitDesc = doc.splitTextToSize(edu.description, pageWidth - 40);
        doc.text(splitDesc, 20, yPosition);
        yPosition += (splitDesc.length * 5);
      }
      
      yPosition += 10; // Space between education entries
    });
  }
  
  // Projects section (if selected)
  if (formData.selectedProjects && formData.selectedProjects.length > 0) {
    // Check if we need a new page
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Projects", 20, yPosition);
    doc.line(20, yPosition + 1, pageWidth - 20, yPosition + 1);
    
    yPosition += 10;
    
    formData.selectedProjects.forEach((project: any) => {
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(project.name, 20, yPosition);
      yPosition += 5;
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      
      if (project.description) {
        const splitDesc = doc.splitTextToSize(project.description, pageWidth - 40);
        doc.text(splitDesc, 20, yPosition);
        yPosition += (splitDesc.length * 5);
      }
      
      if (project.sourceLang && project.targetLang) {
        doc.text(`${project.sourceLang} → ${project.targetLang}`, 20, yPosition);
        yPosition += 5;
      }
      
      yPosition += 10; // Space between projects
    });
  }
  
  return doc;
};

// Function to generate the HTML for the preview that matches the PDF layout
export const createResumePreviewHTML = (formData: any): string => {
  let html = `
    <div class="space-y-6 p-4">
      <!-- Header -->
      <div class="text-center">
        <h1 class="text-2xl font-bold">${formData.name || "Your Name"}</h1>
        ${formData.professionalTitle ? `<h2 class="text-lg mt-1">${formData.professionalTitle}</h2>` : ""}
        
        <!-- Contact Info -->
        <div class="text-sm mt-2">
  `;
  
  const contactInfo = [];
  if (formData.email) contactInfo.push(formData.email);
  if (formData.phone) contactInfo.push(formData.phone);
  if (formData.location) contactInfo.push(formData.location);
  if (formData.website) contactInfo.push(formData.website);
  
  if (contactInfo.length > 0) {
    html += `<p>${contactInfo.join(" • ")}</p>`;
  }
  
  html += `
        </div>
      </div>
  `;
  
  // Summary
  if (formData.summary) {
    html += `
      <!-- Summary Section -->
      <div>
        <h3 class="text-base font-bold border-b pb-1 mb-2">Professional Summary</h3>
        <p class="text-sm">${formData.summary}</p>
      </div>
    `;
  }
  
  // Skills
  if (formData.skills && formData.skills.length > 0) {
    html += `
      <!-- Skills Section -->
      <div>
        <h3 class="text-base font-bold border-b pb-1 mb-2">Skills</h3>
        <p class="text-sm">${formData.skills.join(", ")}</p>
      </div>
    `;
  }
  
  // Languages
  if (formData.languages && formData.languages.length > 0) {
    html += `
      <!-- Languages Section -->
      <div>
        <h3 class="text-base font-bold border-b pb-1 mb-2">Languages</h3>
        <div class="grid grid-cols-2 gap-2 text-sm">
    `;
    
    formData.languages.forEach((lang: any) => {
      html += `
        <div>
          <span class="font-semibold">${lang.language}:</span> ${lang.level}
        </div>
      `;
    });
    
    html += `
        </div>
      </div>
    `;
  }
  
  // Work Experience
  if (formData.experience && formData.experience.length > 0) {
    html += `
      <!-- Work Experience Section -->
      <div>
        <h3 class="text-base font-bold border-b pb-1 mb-2">Work Experience</h3>
    `;
    
    formData.experience.forEach((exp: any) => {
      html += `
        <div class="mb-4">
          <h4 class="text-sm font-bold">${exp.role}</h4>
          <p class="text-sm">${exp.company}</p>
      `;
      
      if (exp.startDate || exp.endDate) {
        let dateText = "";
        if (exp.startDate) dateText += exp.startDate;
        if (exp.startDate && exp.endDate) dateText += " - ";
        if (exp.endDate) dateText += exp.endDate;
        
        html += `<p class="text-sm">${dateText}</p>`;
      }
      
      if (exp.description) {
        html += `<p class="text-sm mt-2">${exp.description}</p>`;
      }
      
      html += `</div>`;
    });
    
    html += `</div>`;
  }
  
  // Education
  if (formData.education && formData.education.length > 0) {
    html += `
      <!-- Education Section -->
      <div>
        <h3 class="text-base font-bold border-b pb-1 mb-2">Education</h3>
    `;
    
    formData.education.forEach((edu: any) => {
      html += `
        <div class="mb-4">
          <h4 class="text-sm font-bold">${edu.degree}</h4>
          <p class="text-sm">${edu.institution}</p>
      `;
      
      if (edu.year) {
        html += `<p class="text-sm">${edu.year}</p>`;
      }
      
      if (edu.description) {
        html += `<p class="text-sm mt-2">${edu.description}</p>`;
      }
      
      html += `</div>`;
    });
    
    html += `</div>`;
  }
  
  // Projects
  if (formData.selectedProjects && formData.selectedProjects.length > 0) {
    html += `
      <!-- Projects Section -->
      <div>
        <h3 class="text-base font-bold border-b pb-1 mb-2">Projects</h3>
    `;
    
    formData.selectedProjects.forEach((project: any) => {
      html += `
        <div class="mb-4">
          <h4 class="text-sm font-bold">${project.name}</h4>
      `;
      
      if (project.description) {
        html += `<p class="text-sm mt-1">${project.description}</p>`;
      }
      
      if (project.sourceLang && project.targetLang) {
        html += `<p class="text-sm">${project.sourceLang} → ${project.targetLang}</p>`;
      }
      
      html += `</div>`;
    });
    
    html += `</div>`;
  }
  
  html += `</div>`;
  
  return html;
};

// Function to download the resume as PDF
export const downloadResume = (formData: any, resumeName: string): void => {
  try {
    const doc = createResumeDocument(formData, resumeName);
    doc.save(`${resumeName.replace(/\s+/g, "-").toLowerCase()}.pdf`);
  } catch (error) {
    console.error("Error downloading resume:", error);
    throw error;
  }
};

// Similar function for cover letter
export const createCoverLetterDocument = (formData: any): jsPDF => {
  // Create PDF document
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  
  // Add current date at the top right
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(dateStr, pageWidth - margin, margin);
  
  // Add sender info
  let yPos = margin + 15;
  if (formData.name) {
    doc.text(formData.name, margin, yPos);
    yPos += 5;
  }
  
  if (formData.email) {
    doc.text(formData.email, margin, yPos);
    yPos += 5;
  }
  
  if (formData.phone) {
    doc.text(formData.phone, margin, yPos);
    yPos += 5;
  }
  
  if (formData.location) {
    doc.text(formData.location, margin, yPos);
    yPos += 5;
  }
  
  // Add recipient info (if available)
  yPos += 10;
  if (formData.targetCompany) {
    doc.text(`Hiring Manager`, margin, yPos);
    yPos += 5;
    doc.text(formData.targetCompany, margin, yPos);
    yPos += 15;
  } else {
    doc.text("Hiring Manager", margin, yPos);
    yPos += 15;
  }
  
  // Add salutation
  doc.text("Dear Hiring Manager,", margin, yPos);
  yPos += 10;
  
  // Add cover letter content with sanitization to remove any potential HTML
  doc.setFontSize(10);
  const sanitizedText = formData.coverLetter ? formData.coverLetter.replace(/<[^>]*>/g, '') : "";
  const splitText = doc.splitTextToSize(sanitizedText, pageWidth - (margin * 2));
  doc.text(splitText, margin, yPos);
  
  // Calculate the position for the closing, accounting for the text height
  yPos += (splitText.length * 5) + 20;
  
  // Add closing
  doc.text("Sincerely,", margin, yPos);
  yPos += 15;
  // Sanitize name to remove any HTML content
  const sanitizedName = formData.name ? formData.name.replace(/<[^>]*>/g, '') : "Your Name";
  doc.text(sanitizedName, margin, yPos);
  
  return doc;
};

// Function to generate the HTML for the cover letter preview that matches the PDF layout
export const createCoverLetterPreviewHTML = (formData: any): string => {
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  let html = `
    <div class="space-y-4 p-4 text-sm">
      <!-- Date -->
      <div class="text-right">
        <p>${dateStr}</p>
      </div>
      
      <!-- Sender Info -->
      <div>
  `;
  
  if (formData.name) {
    html += `<p>${formData.name}</p>`;
  }
  
  if (formData.email) {
    html += `<p>${formData.email}</p>`;
  }
  
  if (formData.phone) {
    html += `<p>${formData.phone}</p>`;
  }
  
  if (formData.location) {
    html += `<p>${formData.location}</p>`;
  }
  
  html += `
      </div>
      
      <!-- Recipient Info -->
      <div class="mt-8">
        <p>Hiring Manager</p>
  `;
  
  if (formData.targetCompany) {
    html += `<p>${formData.targetCompany}</p>`;
  }
  
  html += `
      </div>
      
      <!-- Salutation -->
      <div class="mt-8">
        <p>Dear Hiring Manager,</p>
      </div>
      
      <!-- Content -->
      <div class="mt-4">
        <p style="white-space: pre-line">${formData.coverLetter ? formData.coverLetter.replace(/<[^>]*>/g, '') : ""}</p>
      </div>
      
      <!-- Closing -->
      <div class="mt-8">
        <p>Sincerely,</p>
        <p class="mt-8">${formData.name ? formData.name.replace(/<[^>]*>/g, '') : "Your Name"}</p>
      </div>
    </div>
  `;
  
  return html;
};

// Function to download the cover letter as PDF
export const downloadCoverLetter = (formData: any): void => {
  try {
    const doc = createCoverLetterDocument(formData);
    
    const filename = formData.targetCompany
      ? `cover-letter-${formData.targetCompany.toLowerCase().replace(/\s+/g, "-")}.pdf`
      : "cover-letter.pdf";
      
    doc.save(filename);
  } catch (error) {
    console.error("Error downloading cover letter:", error);
    throw error;
  }
};