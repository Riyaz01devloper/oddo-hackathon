export const isLicenseExpired = (expiryDate) => {
  return new Date(expiryDate) < new Date();
};

export const calculateFuelEfficiency = (distance, fuel) => {
  if (!fuel || fuel <= 0) return 0;

  return (distance / fuel).toFixed(2);
};

export const calculateROI = (
  revenue,
  maintenance,
  fuel,
  acquisitionCost
) => {
  if (!acquisitionCost) return 0;

  return (
    ((revenue - (maintenance + fuel)) / acquisitionCost) *
    100
  ).toFixed(2);
};

export const formatCurrency = (amount) => {
  return `₹${Number(amount).toLocaleString("en-IN")}`;
};