import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import '../styles/uploadExcelSheet.css'; // Import the CSS file
import { uploadExcelFile } from '../storage/adminStorage';

const UploadExcelSheet = () => {
  const [file, setFile] = useState(null);
  const dispatch = useDispatch();
  const uploadStatus = useSelector((state) => state.user?.uploadStatus);
  const uploadData = useSelector((state) => state.user?.uploadData);
  const error = useSelector((state) => state.user?.error);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    dispatch(uploadExcelFile(file));
  };

  // Optionally handle success or error messages
  if (uploadStatus === 'loading') {
    return <div>Uploading...</div>;
  }

  if (uploadStatus === 'succeeded') {
    return (
      <div>
        <h3>Upload Successful!</h3>
        <pre>{JSON.stringify(uploadData, null, 2)}</pre>
      </div>
    );
  }

  if (uploadStatus === 'failed') {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="settings">
      <div className="settings__wrapper">
        <h2 className="settings__title">Upload Excel Sheet</h2>
        <div className="settings__top">
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            className="file-input"
          />
        </div>
        <button
          onClick={handleUpload}
          className="setting__btn"
        >
          Upload
        </button>
      </div>
    </div>
  );
};

export default UploadExcelSheet;
