"use client"

import { createContext, useContext, useState, useEffect } from "react"

// Define the CreditsContext type
type CreditsContextType = {
  credits: number
  isLoading: boolean
  addCredits: (amount: number) => Promise<void>
  useCredits: (amount: number) => Promise<boolean>
}

// Create the CreditsContext
const CreditsContext = createContext<CreditsContextType | undefined>(undefined)

// Create the CreditsProvider component
export const CreditsProvider = ({ children }) => {
  const [credits, setCredits] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load initial credits
    loadCredits()
  }, [])

  const loadCredits = async () => {
    setIsLoading(true)
    try {
      // In a real app, you would fetch credits from your API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock credits data
      setCredits(100)
    } catch (error) {
      console.error("Failed to load credits:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const addCredits = async (amount: number) => {
    setIsLoading(true)
    try {
      // In a real app, you would call your API to add credits
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setCredits((prevCredits) => prevCredits + amount)
      return
    } catch (error) {
      console.error("Failed to add credits:", error)
      throw new Error("Failed to add credits. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const useCredits = async (amount: number): Promise<boolean> => {
    if (credits < amount) {
      return false
    }

    setIsLoading(true)
    try {
      // In a real app, you would call your API to use credits
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setCredits((prevCredits) => prevCredits - amount)
      return true
    } catch (error) {
      console.error("Failed to use credits:", error)
      throw new Error("Failed to use credits. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <CreditsContext.Provider
      value={{
        credits,
        isLoading,
        addCredits,
        useCredits,
      }}
    >
      {children}
    </CreditsContext.Provider>
  )
}

// Create a hook to use the CreditsContext
export const useCredits = () => {
  const context = useContext(CreditsContext)
  if (context === undefined) {
    throw new Error("useCredits must be used within a CreditsProvider")
  }
  return context
}
