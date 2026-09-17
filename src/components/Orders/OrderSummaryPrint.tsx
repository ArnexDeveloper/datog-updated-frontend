import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

interface OrderSummaryPrintProps {
  orderData: {
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    bookingDate: string;
    trialDate?: string;
    deliveryDate: string;
    totalAmount: number;
    advance: number;
    balance: number;
    shafa?: string;
    juti?: string;
    garments: Array<{
      name: string;
      type: string;
      measurements: Record<string, number>;
      fit?: string;
    }>;
    notes?: string;
  };
}

const OrderSummaryPrint: React.FC<OrderSummaryPrintProps> = ({ orderData }) => {
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });

  // Measurement rows for upper body
  const upperBodyMeasurements = [
    'Length', 'Chest', 'Shape', 'Tummy', 'Hips',
    'Neck', 'Shoulder', 'Sleeves', 'Biceps', 'Forearms'
  ];

  // Measurement rows for lower body
  const lowerBodyMeasurements = [
    'Length', 'Waist', 'Hips', 'Thigh', 'Knee',
    'Calf', 'Bottom', 'Fly (U)'
  ];

  // Garment type mapping
  const upperBodyGarments = ['SHIRT', 'KURTA', 'WC/NHR', 'BLAZER', 'SHERWANI'];
  const lowerBodyGarments = ['', 'PANT/SHL', 'GHO/PAJAMA'];

  // Garment checkboxes
  const garmentTypes1 = ['Shirt', 'Kurta', 'Pathani', 'Front Open Kurta', 'Pant', 'Cargo'];
  const garmentTypes2 = ['Trouser', 'Nehru Jacket', 'Waistcoat', 'Blazer', 'Sherwani', 'Jodhpuri', 'Indo'];

  // Fit types
  const fitTypes = ['Smart Fit', 'Medium Fit', 'Uncle Fit', 'Regular Fit'];

  // Get measurement value for a garment
  const getMeasurementValue = (garmentType: string, measurementKey: string) => {
    const garment = orderData.garments.find(g =>
      g.type.toLowerCase().includes(garmentType.toLowerCase()) ||
      g.name.toLowerCase().includes(garmentType.toLowerCase())
    );
    return garment?.measurements[measurementKey] || '';
  };

  // Check if garment type is selected
  const isGarmentSelected = (garmentName: string) => {
    return orderData.garments.some(g =>
      g.name.toLowerCase().includes(garmentName.toLowerCase()) ||
      g.type.toLowerCase().includes(garmentName.toLowerCase())
    );
  };

  // Get selected fit
  const getSelectedFit = () => {
    const garment = orderData.garments[0];
    return garment?.fit || '';
  };

  return (
    <div>
      <button
        onClick={handlePrint}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 print:hidden"
      >
        Print Order Summary
      </button>

      <div ref={componentRef} className="order-summary-print bg-white p-8">
        {/* Header */}
        <div className="text-center mb-2">
          <p className="text-lg" style={{ fontFamily: 'Arial' }}>Order</p>
        </div>

        <div className="border-4 border-black p-4">
          {/* Top Section with Order Number and Logo */}
          <div className="flex justify-between items-center mb-4 pb-3 border-b-2 border-black">
            <div className="text-left">
              <p className="text-sm font-bold">No. <span className="text-xl ml-2">{orderData.orderNumber}</span></p>
            </div>
            <div className="text-center flex-1">
              <h1 className="text-4xl font-bold tracking-wider">DA TOG'S</h1>
              <p className="text-sm tracking-widest">DESIGNER LOUNGE</p>
            </div>
            <div className="w-20"></div>
          </div>

          {/* Customer Information Grid */}
          <div className="grid grid-cols-2 gap-0 mb-4 text-sm">
            <div className="flex border border-black">
              <div className="bg-gray-700 text-white px-3 py-1 font-bold" style={{ width: '40%' }}>Name</div>
              <div className="px-2 py-1 flex-1">{orderData.customerName}</div>
            </div>
            <div className="flex border border-black border-l-0">
              <div className="bg-gray-700 text-white px-3 py-1 font-bold" style={{ width: '50%' }}>Mob.No.</div>
              <div className="px-2 py-1 flex-1">{orderData.customerPhone}</div>
            </div>

            <div className="flex border border-black border-t-0">
              <div className="bg-gray-700 text-white px-3 py-1 font-bold" style={{ width: '40%' }}>Booking Date</div>
              <div className="px-2 py-1 flex-1">{new Date(orderData.bookingDate).toLocaleDateString()}</div>
            </div>
            <div className="flex border border-black border-l-0 border-t-0">
              <div className="bg-gray-700 text-white px-3 py-1 font-bold" style={{ width: '50%' }}>Total Amount</div>
              <div className="px-2 py-1 flex-1">₹{orderData.totalAmount}</div>
            </div>

            <div className="flex border border-black border-t-0">
              <div className="bg-gray-700 text-white px-3 py-1 font-bold" style={{ width: '40%' }}>Trial Date</div>
              <div className="px-2 py-1 flex-1">{orderData.trialDate ? new Date(orderData.trialDate).toLocaleDateString() : ''}</div>
            </div>
            <div className="flex border border-black border-l-0 border-t-0">
              <div className="bg-gray-700 text-white px-3 py-1 font-bold" style={{ width: '50%' }}>Balance</div>
              <div className="px-2 py-1 flex-1">₹{orderData.balance}</div>
            </div>

            <div className="flex border border-black border-t-0">
              <div className="bg-gray-700 text-white px-3 py-1 font-bold" style={{ width: '40%' }}>Delivery Date</div>
              <div className="px-2 py-1 flex-1">{new Date(orderData.deliveryDate).toLocaleDateString()}</div>
            </div>
            <div className="flex border border-black border-l-0 border-t-0">
              <div className="bg-gray-700 text-white px-3 py-1 font-bold" style={{ width: '50%' }}>Advance</div>
              <div className="px-2 py-1 flex-1">₹{orderData.advance}</div>
            </div>

            <div className="flex border border-black border-t-0">
              <div className="bg-gray-700 text-white px-3 py-1 font-bold" style={{ width: '40%' }}>Shafa</div>
              <div className="px-2 py-1 flex-1">{orderData.shafa || ''}</div>
            </div>
            <div className="flex border border-black border-l-0 border-t-0">
              <div className="bg-gray-700 text-white px-3 py-1 font-bold" style={{ width: '50%' }}>Juti</div>
              <div className="px-2 py-1 flex-1">{orderData.juti || ''}</div>
            </div>
          </div>

          {/* Measurement Table */}
          <div className="mb-4">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr>
                  <th className="border border-black bg-gray-400 px-2 py-1 text-left font-bold" style={{ width: '12%' }}>
                    UPPER BODY
                  </th>
                  {upperBodyGarments.map((garment, idx) => (
                    <th key={idx} className="border border-black bg-gray-300 px-1 py-1 text-center font-bold" style={{ width: '8%' }}>
                      {garment}
                    </th>
                  ))}
                  <th className="border border-black bg-gray-400 px-2 py-1 text-center font-bold" style={{ width: '13%' }}>
                    MEASUREMENT
                  </th>
                  <th className="border border-black bg-gray-400 px-2 py-1 text-center font-bold" colSpan={3} style={{ width: '27%' }}>
                    LOWER BODY
                  </th>
                </tr>
              </thead>
              <tbody>
                {upperBodyMeasurements.map((measurement, idx) => (
                  <tr key={idx}>
                    <td className="border border-black px-2 py-1 font-semibold bg-gray-100">{measurement}</td>
                    {upperBodyGarments.map((garment, gIdx) => (
                      <td key={gIdx} className="border border-black px-1 py-1 text-center">
                        {getMeasurementValue(garment, measurement)}
                      </td>
                    ))}
                    <td className="border border-black px-1 py-1 text-center bg-gray-200">
                      {/* Center measurement column - empty */}
                    </td>
                    {idx < lowerBodyMeasurements.length ? (
                      <>
                        <td className="border border-black px-2 py-1 font-semibold bg-gray-100" style={{ width: '9%' }}>
                          {lowerBodyMeasurements[idx]}
                        </td>
                        {lowerBodyGarments.map((garment, gIdx) => (
                          <td key={gIdx} className="border border-black px-1 py-1 text-center" style={{ width: '9%' }}>
                            {garment && getMeasurementValue(garment, lowerBodyMeasurements[idx])}
                          </td>
                        ))}
                      </>
                    ) : (
                      <>
                        <td className="border border-black"></td>
                        <td className="border border-black"></td>
                        <td className="border border-black"></td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Garment Type Checkboxes */}
          <div className="mb-3 text-sm">
            <div className="flex items-center gap-4 mb-2">
              {garmentTypes1.map((type, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <span className="border border-black w-4 h-4 inline-block text-center text-xs">
                    {isGarmentSelected(type) ? '✓' : ''}
                  </span>
                  <span>{type}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4">
              {garmentTypes2.map((type, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <span className="border border-black w-4 h-4 inline-block text-center text-xs">
                    {isGarmentSelected(type) ? '✓' : ''}
                  </span>
                  <span>{type}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Fit Type and Notes Section */}
          <div className="grid grid-cols-2 gap-3">
            {/* Left Side - Fit Types and Notes Lines */}
            <div>
              <div className="flex items-center gap-4 mb-3 text-sm">
                {fitTypes.map((fit, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <span className="border border-black w-4 h-4 inline-block text-center text-xs">
                      {getSelectedFit().toLowerCase().includes(fit.split(' ')[0].toLowerCase()) ? '✓' : ''}
                    </span>
                    <span>{fit}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((line) => (
                  <div key={line} className="border-b border-black h-6"></div>
                ))}
              </div>
            </div>

            {/* Right Side - Large Notes Box */}
            <div className="border-2 border-black rounded-lg p-2 min-h-[160px]">
              <p className="text-xs whitespace-pre-wrap">{orderData.notes || ''}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .order-summary-print,
          .order-summary-print * {
            visibility: visible;
          }
          .order-summary-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 10mm;
          }
          @page {
            size: A4;
            margin: 10mm;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default OrderSummaryPrint;
