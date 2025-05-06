import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationProp } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';

//check if token is expired
const isTokenExpired = (token: string): boolean => {
  try {
    //only check expiration if token format is valid
    if (!token || !token.includes('.') || token.split('.').length < 2) {
      console.log('Token format invalid for expiration check');
      return true;
    }
    
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    //jhandle padding for correct atob decoding
    const padding = '='.repeat((4 - base64.length % 4) % 4);
    const paddedBase64 = base64 + padding;
    
    // Safer decoding
    try {
      const jsonPayload = decodeURIComponent(
        atob(paddedBase64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);
      
      //check if token is expired
      return payload.exp * 1000 < Date.now();
    } catch (decodingError) {
      console.error('Error decoding token:', decodingError);
      return false;
    }
  } catch (e) {
    console.error('Error checking token expiration:', e);
    return false;
  }
};

//get token and see if its expired
export const getToken = async (navigation?: NavigationProp<any>): Promise<string | null> => {
  try {
    // Try to retrieve token with debug logging
    const token = await AsyncStorage.getItem('authToken');
    console.log('Retrieved token:', token ? `${token.substring(0, 10)}...` : 'null', 
               'Length:', token ? token.length : 0);
    if (!token) {
      console.log("No token has been found. Login required. (Refresh Page!)");
      if (navigation) { 
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          })
        );
      }
      return null;
    }
       
    const expired = false; //temporarily disable expiration check
    if (expired) {
      console.log("Token expired - redirecting to login");
      await clearToken();
      if (navigation) {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          })
        );
      }
      return null;
    }
    return token;
  } catch (error) {
    console.error("AsyncStorage couldn't be accessed!", error);
    return null;
  }
};
//store toke in asyncstorage
export const storeToken = async (token: string): Promise<boolean> => {
  try {
    if (!token || token.trim() === '') {
      console.error("Empty token provided");
      return false;
    }
    console.log(`Storing token: ${token.substring(0, 10)}...`);
    
    await AsyncStorage.setItem('authToken', token);
    
    //verify token was stored
    const storedToken = await AsyncStorage.getItem('authToken');
    const success = storedToken === token;
    console.log('Token stored successfully:', success);
    
    return success;
  } catch (error) {
    console.error("AsyncStorage couldn't store the token", error);
    return false;
  }
};

//clesr token for logout
export const clearToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('authToken');
    console.log('Token cleared successfully');
  } catch (error) {
    console.error("AsyncStorage couldn't clear the token", error);
  }
};

