import AsyncStorage from "@react-native-async-storage/async-storage"

export const setItem = async (key: string, value: any): Promise<void> => {
try {
const jsonValue = JSON.stringify(value)
await AsyncStorage.setItem(key, jsonValue)
  } catch (e) {
    console.error("Error saving data to AsyncStorage", e)
  }
}

export const getItem = async <T>(key: string): Promise<T | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key)
    return jsonValue != null ? JSON.parse(jsonValue) : null
  } catch (e) {
    console.error("Error reading data from AsyncStorage", e)
    return null
  }
}

export const removeItem = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key)
  } catch (e) {
    console.error("Error removing data from AsyncStorage", e)
  }
}

export const clearStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.clear()
  } catch (e) {
    console.error("Error clearing AsyncStorage", e)
  }
}
