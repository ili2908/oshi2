import React, { useRef, useState } from 'react';

export const ImportButtonWithModal = ({ onImport }: any) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showModal, setShowModal] = useState(false);
  
    const handleFileInputChange = (e: any) => {
      const file = e.target.files[0];
      // Use FileReader to read the file as text
      const reader = new FileReader();
      reader.onload = (event) => {
        const json = JSON.parse(event.target!.result as string);
        // Do something with the JSON data, e.g. pass it to a callback function
        onImport(json);
        // Close modal after file is imported
        setShowModal(false);
      };
      reader.readAsText(file);
    };
  
    const handleDrop = (e: any) => {
      e.preventDefault();
      setShowModal(false); // Close modal after file is dropped
      const file = e.dataTransfer.files[0];
      // Use FileReader to read the file as text
      const reader = new FileReader();
      reader.onload = (event) => {
        const json = JSON.parse(event.target!.result as string);
        // Do something with the JSON data, e.g. pass it to a callback function
        onImport(json);
      };
      reader.readAsText(file);
    };
  
    const handleDragOver = (e: any) => {
      e.preventDefault();
    };
  
    const handleImportClick = () => {
      setShowModal(true); // Show modal when "Import JSON" button is clicked
    };
  
    const handleCloseModal = () => {
      setShowModal(false); // Close modal when "Close" button is clicked
    };
  
    return (
      <div>
        <button className="import-button" style={{height: '100%', width: '100%', background:"#49524c", border: 'none' , color: "#93a399"}} onClick={handleImportClick}>
          Import
        </button>
        {showModal && (
          <div className="modal" style = {{position: 'fixed' , background: 'white', border:"5px solid", zIndex: 9999, padding: '5px'}}>
            <div className="modal-content">
              <h2>Import Graph JSON</h2>
              <div className="dropzone" style={{width: '100%', height: '100px', border:"1px solid blue", marginBottom: '5px'}} onDrop={handleDrop} onDragOver={handleDragOver}>
                Drag and drop JSON file here
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="file-input"
                onChange={handleFileInputChange}
              />
              <button className="close-modal-button" onClick={handleCloseModal}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };
  