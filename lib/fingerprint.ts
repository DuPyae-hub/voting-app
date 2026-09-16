import fpPromise from '@fingerprintjs/fingerprintjs';

export const getDeviceFingerprint = async () => {
  const fp = await fpPromise.load();
  const result = await fp.get();
  return result.visitorId;
};