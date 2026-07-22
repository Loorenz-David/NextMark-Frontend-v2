export const copyOrderTrackingLink = async (
  trackingLink: string,
): Promise<void> => {
  await navigator.clipboard.writeText(trackingLink);
};
