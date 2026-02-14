/**
 * Helper: Cek apakah customer masih dalam masa langganan aktif.
 * Admin selalu dianggap aktif.
 * @param {Object} user - User object (harus punya role, subscriptionExpiry)
 * @returns {boolean}
 */
export const isCustomerSubscriptionActive = (user) => {
  if (!user) return false;
  if (user.role !== "customer") return true;
  if (!user.subscriptionExpiry) return false;
  return new Date(user.subscriptionExpiry) >= new Date();
};
