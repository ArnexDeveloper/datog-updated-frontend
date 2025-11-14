import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

interface JobCardPrintProps {
  jobCardData: {
    serialNumber: string;
    garmentTypes: string[];
    bookingDate: string;
    deliveryDate: string;
    measurements: Record<string, number>;
    description?: string;
  };
}

const JobCardPrint: React.FC<JobCardPrintProps> = ({ jobCardData }) => {
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });

  // Garment type checkboxes
  const garmentTypesRow1 = ['Jodhpuri', 'Double Brass', 'Formal', 'American'];
  const garmentTypesRow2 = ['Kurta', 'Shirt', 'Waist Coat', 'Nehru Jacket'];

  // Measurement labels
  const measurementLabels = [
    'Length',
    'Chest',
    'Shape',
    'Tummy',
    'Hips',
    'Neck',
    'Shoulder',
    'Sleeves',
    'Biceps',
    'Forearms'
  ];

  // Check if garment type is selected
  const isGarmentSelected = (garmentName: string) => {
    return jobCardData.garmentTypes.some(g =>
      g.toLowerCase().includes(garmentName.toLowerCase())
    );
  };

  return (
    <div>
      <button
        onClick={handlePrint}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 print:hidden"
      >
        Print Job Card
      </button>

      <div ref={componentRef} className="job-card-print bg-white p-6" style={{ width: '210mm', minHeight: '148mm' }}>
        <div className="border-4 border-black p-4">
          {/* Header */}
          <div className="flex justify-between items-start mb-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 border-2 border-black"></div>
              <div>
                <h1 className="text-3xl font-bold tracking-wider leading-none">DA TOG'S</h1>
                <p className="text-xs tracking-widest">DESIGNER LOUNGE</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold tracking-wide">JOB CARD</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-semibold">Sr. No.:</span>
                <span className="border-b border-black px-2 text-sm">{jobCardData.serialNumber}</span>
              </div>
            </div>
          </div>

          {/* Garment Type Checkboxes */}
          <div className="mb-3 text-sm border-b border-black pb-3">
            <div className="flex items-center gap-6 mb-2">
              {garmentTypesRow1.map((type, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <span className="border-2 border-black w-4 h-4 inline-block text-center text-xs leading-none">
                    {isGarmentSelected(type) ? '✓' : ''}
                  </span>
                  <span className="font-semibold">{type}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-6">
              {garmentTypesRow2.map((type, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <span className="border-2 border-black w-4 h-4 inline-block text-center text-xs leading-none">
                    {isGarmentSelected(type) ? '✓' : ''}
                  </span>
                  <span className="font-semibold">{type}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Booking and Delivery Dates */}
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-bold">Booking Date:</span>
              <span className="border-b border-black flex-1 px-1">
                {new Date(jobCardData.bookingDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">Delivery Date:</span>
              <span className="border-b border-black flex-1 px-1">
                {new Date(jobCardData.deliveryDate).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Measurements Table */}
          <div>
            <table className="w-full border-collapse border-2 border-black">
              <thead>
                <tr>
                  <th className="border-2 border-black bg-white px-3 py-2 text-left text-lg font-bold w-1/2">
                    Measurements
                  </th>
                  <th className="border-2 border-black bg-white px-3 py-2 text-left text-lg font-bold w-1/2">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                {measurementLabels.map((label, idx) => (
                  <tr key={idx}>
                    <td className="border-2 border-black px-3 py-3 text-base font-semibold">
                      {label}
                    </td>
                    <td className="border-2 border-black px-3 py-3">
                      {jobCardData.measurements[label] || ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Description area (if needed in future) */}
          {jobCardData.description && (
            <div className="mt-3 p-2 border border-black">
              <p className="text-xs">{jobCardData.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .job-card-print,
          .job-card-print * {
            visibility: visible;
          }
          .job-card-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 5mm;
          }
          @page {
            size: A5 landscape;
            margin: 5mm;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default JobCardPrint;
