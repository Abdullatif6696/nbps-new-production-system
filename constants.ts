export const K_BLADE_THICKNESS = 2.0; // mm
export const K_TRIM_MARGIN = 10.0; // mm per side (total 20mm per roll)

// Initial Mock Data
export const MOCK_INVENTORY = [
  { id: 'RM-001', batchNumber: 'BATCH-X99', width: 1200, weight: 500, materialType: 'PVC-A', isRemnant: false, entryDate: '2023-10-01' },
  { id: 'RM-002', batchNumber: 'BATCH-X99-OFF', width: 350, weight: 45, materialType: 'PVC-A', isRemnant: true, entryDate: '2023-10-05' },
  { id: 'RM-003', batchNumber: 'BATCH-Y01', width: 1000, weight: 400, materialType: 'ALU-FOIL', isRemnant: false, entryDate: '2023-10-10' },
  { id: 'RM-004', batchNumber: 'BATCH-Z22', width: 1250, weight: 550, materialType: 'PVC-B', isRemnant: false, entryDate: '2023-10-12' },
];

export const MOCK_ORDERS = [
  { id: 'ORD-101', customerName: 'PharmaCorp', requiredWidth: 220, targetWeight: 100, isFulfilled: false, dueDate: '2023-11-01' },
  { id: 'ORD-102', customerName: 'MediLife', requiredWidth: 310, targetWeight: 50, isFulfilled: false, dueDate: '2023-11-02' },
  { id: 'ORD-103', customerName: 'HealthPlus', requiredWidth: 150, targetWeight: 200, isFulfilled: false, dueDate: '2023-11-05' },
  { id: 'ORD-104', customerName: 'BioGen', requiredWidth: 220, targetWeight: 80, isFulfilled: false, dueDate: '2023-11-06' },
  { id: 'ORD-105', customerName: 'PharmaCorp', requiredWidth: 400, targetWeight: 150, isFulfilled: false, dueDate: '2023-11-07' },
];