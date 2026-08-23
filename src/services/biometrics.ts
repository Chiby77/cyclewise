import * as LocalAuthentication from 'expo-local-authentication';

export type BiometricStatus = {
  hasHardware: boolean;
  isEnrolled: boolean;
  supportedTypes: LocalAuthentication.AuthenticationType[];
};

/**
 * Checks hardware support and biometric enrollment on the device.
 */
export async function checkBiometricSupport(): Promise<BiometricStatus> {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

    return {
      hasHardware,
      isEnrolled,
      supportedTypes,
    };
  } catch (error) {
    console.warn('[Biometrics] Error checking biometric status:', error);
    return {
      hasHardware: false,
      isEnrolled: false,
      supportedTypes: [],
    };
  }
}

/**
 * Prompts the user for biometric authentication (Face ID, Touch ID, or device passcode).
 */
export async function authenticateWithBiometrics(
  promptMessage = 'Unlock CycleWise'
): Promise<boolean> {
  try {
    const { hasHardware, isEnrolled } = await checkBiometricSupport();

    if (!hasHardware || !isEnrolled) {
      // If hardware is unavailable or not enrolled, allow access
      return true;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      fallbackLabel: 'Use Device Passcode',
      disableDeviceFallback: false,
      cancelLabel: 'Cancel',
    });

    return result.success;
  } catch (error) {
    console.warn('[Biometrics] Authentication prompt failed:', error);
    return false;
  }
}
