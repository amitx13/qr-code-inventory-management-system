import React, { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import QrCodeScanner from "./QrCodeScanner";

const ScanQrCode = () => {
  const [file, setFile] = useState(null);
  const fileRef = useRef();
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (data) {
      /* console.log(data);*/
      if (data.quantity.dispatched_quantity === null) {
        Generate(data);
      } else if (data.quantity.dispatched_quantity) {
        Generate2(data);
      }
    } else {
      console.log('Invalid or missing data in the scanned result.');
    }
  }, [data]);

  const handleClick = () => {
    fileRef.current.click();
  };

  async function Generate({ _id, name, date, quantity }) {
    try {
      const { received_date, dispatched_date } = date;
      const { received_quantity, dispatched_quantity } = quantity;
      const parsedDate = new Date(received_date).toISOString().split('T')[0];

      console.log('Parsed Date:', parsedDate);

      await axios.put(`http://localhost:3000/api/components/${_id}`, {
        name: name,
        received_quantity: parseInt(received_quantity),
        dispatched_quantity: 1,
        received_date: parsedDate,
        dispatched_date: new Date().toISOString().split('T')[0],
      });

      console.log('Generate successful');
      navigate('/');
    } catch (error) {
      console.error('Error updating QRData:', error);
    }
  }

  async function Generate2({ _id, name, date, quantity }) {
    try {
      const { received_date, dispatched_date } = date;
      const { received_quantity, dispatched_quantity } = quantity;
      const parsedDateR = new Date(received_date).toISOString().split('T')[0];
      const parsedDateD = new Date(dispatched_date).toISOString().split('T')[0];

      //console.log('Parsed Date:', parsedDate);

      await axios.put(`http://localhost:3000/api/components/${_id}`, {
        name: name,
        received_quantity: parseInt(received_quantity),
        dispatched_quantity: parseInt(dispatched_quantity) + 1,
        received_date: parsedDateR,
        dispatched_date: parsedDateD,
      });
      console.log('Generate successful');
      navigate('/');
    } catch (error) {
      console.error('Error updating QRData:', error);
    }
  }

  const handleChange = async (e) => {
    const file = e.target.files[0];
    setFile(file);

    try {
      const result = await QrScanner.scanImage(file);
      const jsonData = JSON.parse(result);
      setData(jsonData);
    } catch (error) {
      console.error('Error scanning image:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 justify-items-center items-center">
      {/* Upload QR Code Section */}
      <div className="text-center w-full">
        <div className="text-blue-900 text-xl font-semibold">Upload QR Code</div>
        <div className="border-black border shadow-2xl w-full md:w-4/6 mx-auto h-96 bg-fixed flex items-center justify-center">
          {file && <img className="max-w-full max-h-full" src={URL.createObjectURL(file)} alt="Qrcode" />}
        </div>
        <button className="bg-blue-900 text-white rounded-sm h-9 my-3 w-full md:w-4/6" onClick={handleClick}>
          Upload
        </button>
        <input ref={fileRef} type="file" accept=".png,.jpg,.jpeg" className="hidden" onChange={handleChange} />
      </div>

      {/* Scan QR Code Section */}
      <div className="w-full md:justify-items-center md:items-center">
        <div className="text-blue-900 text-xl font-semibold text-center">Scan QR Code</div>
        <div className="w-full md:w-4/6 mx-auto h">
          <QrCodeScanner />
        </div>
      </div>
    </div>

  );
};

export default ScanQrCode;
