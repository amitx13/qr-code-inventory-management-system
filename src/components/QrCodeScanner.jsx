import React, { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const QrCodeScanner = () => {
  const videoRef = useRef(null);
  const [qrScanner, setQrScanner] = useState(null);
  const [isScannerActive, setIsScannerActive] = useState(false);
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


  useEffect(() => {
    let cleanupFunction;

    const initializeQrScanner = async () => {
      try {
        const hasCamera = await QrScanner.hasCamera();
        if (!hasCamera) {
          console.error('No camera found on the device.');
          return;
        }

        const newQrScanner = new QrScanner(
          videoRef.current,
          result => handleScanResult(result),
          { returnDetailedScanResult: true }
        );

        setQrScanner(newQrScanner);

        if (isScannerActive) {
          newQrScanner.start();
        }

        // Save the cleanup function to be used later
        cleanupFunction = () => {
          newQrScanner.stop();
          newQrScanner.destroy();
        };
      } catch (error) {
        console.error('Error initializing QR scanner:', error);
      }
    };

    initializeQrScanner();

    // Cleanup function for unmounting
    return () => {
      if (cleanupFunction) {
        cleanupFunction();
      }
    };
  }, [isScannerActive]);

  const handleScanResult = result => {

    console.log('Scanned QR Code:', result);
    console.log(result.data);
    const jsonData = JSON.parse(result.data);
    setData(jsonData);
    console.log(jsonData)
    /* const jsonObject = JSON.parse(jsonString);
    console.log(jsonObject) */
  };

  const toggleScanner = () => {
    if (qrScanner) {
      setIsScannerActive(prevState => {
        if (!prevState) {
          qrScanner.start();
        } else {
          qrScanner.stop();
        }
        return !prevState;
      });
    }
  };

  return (
    <div>
      <video className='border-black border shadow-2xl w-full h-96' ref={videoRef}></video>
      <button className='bg-blue-900 text-white rounded-sm h-9 my-3 w-full' onClick={toggleScanner}>
        {isScannerActive ? 'Disable Camera' : 'Enable Camera'}
      </button>
    </div>
  );
};

export default QrCodeScanner;
