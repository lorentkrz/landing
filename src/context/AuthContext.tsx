"use client"

import { createContext, useContext, useState, useEffect } from "react"

// Define the User type
type User = {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar?: string
  bio?: string
  city?: string
  country?: string
  age?: number
  gender?: string
}

// Define the AuthContext type
type AuthContextType = {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: Partial<User> & { password: string }) => Promise<void>
  logout: () => Promise<void>
  updateUser: (userData: Partial<User>) => Promise<void>
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>
}

// Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Create the AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    setIsLoading(true)
    try {
      // In a real app, you would check for a stored token or session
      // For demo purposes, we'll just simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock user data for demonstration
      const storedUser = {
        id: "user-123",
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1887",
        bio: "Nightlife enthusiast and social butterfly. Love meeting new people and exploring new venues.",
        city: "New York",
        country: "USA",
        age: 28,
        gender: "Male",
      }

      setUser(storedUser)
      setIsAuthenticated(true)
    } catch (error) {
      console.error("Auth check failed:", error)
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // In a real app, you would call your API to authenticate
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mock successful login
      const loggedInUser = {
        id: "user-123",
        firstName: "John",
        lastName: "Doe",
        email,
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1887",
        bio: "Nightlife enthusiast and social butterfly. Love meeting new people and exploring new venues.",
        city: "New York",
        country: "USA",
        age: 28,
        gender: "Male",
      }

      setUser(loggedInUser)
      setIsAuthenticated(true)
    } catch (error) {
      console.error("Login failed:", error)
      throw new Error("Login failed. Please check your credentials and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: Partial<User> & { password: string }) => {
    setIsLoading(true)
    try {
      // In a real app, you would call your API to register
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mock successful registration
      const newUser = {
        id: "user-" + Math.floor(Math.random() * 1000),
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email || "",
        avatar: userData.avatar,
        bio: userData.bio,
        city: userData.city,
        country: userData.country,
        age: userData.age,
        gender: userData.gender,
      }

      setUser(newUser)
      setIsAuthenticated(true)
    } catch (error) {
      console.error("Registration failed:", error)
      throw new Error("Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      // In a real app, you would call your API to logout
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setUser(null)
      setIsAuthenticated(false)
    } catch (error) {
      console.error("Logout failed:", error)
      throw new Error("Logout failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const updateUser = async (userData: Partial<User>) => {
    setIsLoading(true)
    try {
      // In a real app, you would call your API to update user data
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Update user data
      setUser((prevUser) => {
        if (!prevUser) return null
        return { ...prevUser, ...userData }
      })
    } catch (error) {
      console.error("Update user failed:", error)
      throw new Error("Failed to update profile. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    setIsLoading(true)
    try {
      // In a real app, you would call your API to update password
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Password updated successfully
      console.log("Password updated successfully")
    } catch (error) {
      console.error("Update password failed:", error)
      throw new Error("Failed to update password. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Create a hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
