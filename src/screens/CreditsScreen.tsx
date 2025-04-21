"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import Button from "../components/Button"
import { useCredits } from "../context/CreditsContext"

const CreditPackage = ({ title, amount, price, popular, onSelect, selected }) => {
  return (
    <TouchableOpacity
      style={[
        styles.packageCard,
        selected && styles.selectedPackage,
        popular && styles.popularPackage,
      ]}
      onPress={() => onSelect(amount, price)}
    >
      {popular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>Most Popular</Text>
        </View>
      )}
      <View style={styles.packageContent}>
        <Text style={styles.packageTitle}>{title}</Text>
        <View style={styles.packageCredits}>
          <Ionicons name="flash" size={18} color="#4dabf7" />
          <Text style={styles.creditsAmount}>{amount} Credits</Text>
        </View>
        <Text style={styles.packagePrice}>${price.toFixed(2)}</Text>
        {selected && (
          <View style={styles.selectedIndicator}>
            <Ionicons name="checkmark-circle" size={24} color="#4dabf7" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  )
}

const CreditsScreen = () => {
  const navigation = useNavigation()
  const { credits, addCredits } = useCredits()

  const [isLoading, setIsLoading] = useState(false)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [selectedAmount, setSelectedAmount] = useState(0)
  const [selectedPrice, setSelectedPrice] = useState(0)
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    setIsLoading(true)
    // In a real app, you would fetch transaction history from your API
    setTimeout(() => {
      // Mock transaction data
      setTransactions([
        {
          id: "tx-001",
          date: "2023-11-15",
          amount: 50,
          price: 4.99,
          status: "completed",
        },
        {
          id: "tx-002",
          date: "2023-10-28",
          amount: 100,
          price: 9.99,
          status: "completed",
        },
        {
          id: "tx-003",
          date: "2023-10-05",
          amount: 200,
          price: 19.99,
          status: "completed",
        },
      ])
      setIsLoading(false)
    }, 1000)
  }

  const handleSelectPackage = (amount, price) => {
    setSelectedAmount(amount)
    setSelectedPrice(price)
    setSelectedPackage(amount)
  }

  const handlePurchase = async () => {
    if (!selectedPackage) {
      Alert.alert("Error", "Please select a credit package")
      return
    }

    setIsPurchasing(true)

    try {
      // In a real app, you would call your payment API
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Add credits to user's account
      await addCredits(selectedAmount)

      // Add transaction to history
      const newTransaction = {
        id: `tx-${Math.floor(Math.random() * 1000)}`,
        date: new Date().toISOString().split("T")[0],
        amount: selectedAmount,
        price: selectedPrice,
        status: "completed",
      }

      setTransactions([newTransaction, ...transactions])

      Alert.alert("Success", `${selectedAmount} credits have been added to your account!`)
      setSelectedPackage(null)
    } catch (error) {
      Alert.alert("Error", "Failed to process payment. Please try again.")
    } finally {
      setIsPurchasing(false)
    }
  }

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Credits</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceTitle}>Your Balance</Text>
            <View style={styles.balanceIconContainer}>
              <Ionicons name="flash" size={24} color="#4dabf7" />
            </View>
          </View>
          <Text style={styles.balanceAmount}>{credits}</Text>
          <Text style={styles.balanceSubtitle}>Available Credits</Text>
        </View>

        <Text style={styles.sectionTitle}>Buy Credits</Text>
        <Text style={styles.sectionDescription}>
          Credits are used to unlock premium features and boost your profile visibility.
        </Text>

        <View style={styles.packagesContainer}>
          <CreditPackage
            title="Starter"
            amount={50}
            price={4.99}
            popular={false}
            onSelect={handleSelectPackage}
            selected={selectedPackage === 50}
          />
          <CreditPackage
            title="Popular"
            amount={100}
            price={9.99}
            popular={true}
            onSelect={handleSelectPackage}
            selected={selectedPackage === 100}
          />
          <CreditPackage
            title="Premium"
            amount={200}
            price={19.99}
            popular={false}
            onSelect={handleSelectPackage}
            selected={selectedPackage === 200}
          />
        </View>

        <Button
          title={selectedPackage ? `Buy ${selectedAmount} Credits for $${selectedPrice.toFixed(2)}` : "Select a Package"}
          onPress={handlePurchase}
          disabled={!selectedPackage}
          loading={isPurchasing}
          style={styles.purchaseButton}
          fullWidth
        />

        <View style={styles.paymentMethodsContainer}>
          <Text style={styles.paymentMethodsTitle}>Payment Methods</Text>
          <View style={styles.paymentMethods}>
            <Image
              source={{ uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" }}
              style={styles.paymentMethodIcon}
              resizeMode="contain"
            />
            <Image
              source={{ uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" }}
              style={styles.paymentMethodIcon}
              resizeMode="contain"
            />
            <Image
              source={{ uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/1280px-PayPal.svg.png" }}
              style={styles.paymentMethodIcon}
              resizeMode="contain"
            />
            <Image
              source={{ uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_Pay_logo.svg/1200px-Apple_Pay_logo.svg.png" }}
              style={styles.paymentMethodIcon}
              resizeMode="contain"
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Transaction History</Text>
        {isLoading ? (
          <ActivityIndicator size="small" color="#4dabf7" style={styles.loader} />
        ) : transactions.length > 0 ? (
          <View style={styles.transactionsContainer}>
            {transactions.map((transaction) => (
              <View key={transaction.id} style={styles.transactionItem}>
                <View style={styles.transactionLeft}>
                  <View style={styles.transactionIconContainer}>
                    <Ionicons name="flash" size={16} color="#4dabf7" />
                  </View>
                  <View>
                    <Text style={styles.transactionAmount}>{transaction.amount} Credits</Text>
                    <Text style={styles.transactionDate}>{formatDate(transaction.date)}</Text>
                  </View>
                </View>
                <View style={styles.transactionRight}>
                  <Text style={styles.transactionPrice}>${transaction.price.toFixed(2)}</Text>
                  <View style={styles.transactionStatus}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>Completed</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.noTransactionsText}>No transaction history yet</Text>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0e17",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingTop: 60,
    paddingBottom: 15,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  placeholder: {
    width: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
  },
  balanceCard: {
    backgroundColor: "#1a1f2c",
    borderRadius: 12,
    padding: 20,
    marginVertical: 20,
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  balanceTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  balanceIconContainer: {
    backgroundColor: "rgba(77, 171, 247, 0.1)",
    padding: 10,
    borderRadius: 50,
  },
  balanceAmount: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "700",
    marginBottom: 5,
  },
  balanceSubtitle: {
    color: "#aaa",
    fontSize: 14,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  sectionDescription: {
    color: "#aaa",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  packagesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  packageCard: {
    backgroundColor: "#1a1f2c",
    borderRadius: 12,
    padding: 15,
    width: "31%",
    position: "relative",
    borderWidth: 1,
    borderColor: "transparent",
  },
  selectedPackage: {
    borderColor: "#4dabf7",
  },
  popularPackage: {
    borderColor: "#4dabf7",
  },
  popularBadge: {
    position: "absolute",
    top: -10,
    left: 0,
    right: 0,
    backgroundColor: "#4dabf7",
    paddingVertical: 3,
    borderRadius: 20,
    alignItems: "center",
    marginHorizontal: 10,
  },
  popularText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  packageContent: {
    alignItems: "center",
  },
  packageTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  packageCredits: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  creditsAmount: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 5,
  },
  packagePrice: {
    color: "#4dabf7",
    fontSize: 18,
    fontWeight: "700",
  },
  selectedIndicator: {
    position: "absolute",
    top: -10,
    right: -10,
    backgroundColor: "#0a0e17",
    borderRadius: 50,
  },
  purchaseButton: {
    marginBottom: 30,
  },
  paymentMethodsContainer: {
    marginBottom: 30,
  },
  paymentMethodsTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 15,
  },
  paymentMethods: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentMethodIcon: {
    width: 60,
    height: 30,
    marginRight: 15,
    backgroundColor: "#fff",
    borderRadius: 4,
    padding: 5,
  },
  transactionsContainer: {
    marginBottom: 30,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  transactionIconContainer: {
    backgroundColor: "rgba(77, 171, 247, 0.1)",
    padding: 8,
    borderRadius: 50,
    marginRight: 10,
  },
  transactionAmount: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  transactionDate: {
    color: "#aaa",
    fontSize: 12,
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  transactionPrice: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  transactionStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4dabf7",
    marginRight: 5,
  },
  statusText: {
    color: "#4dabf7",
    fontSize: 12,
  },
  noTransactionsText: {
    color: "#aaa",
    fontSize: 14,
    textAlign: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  loader: {
    marginVertical: 20,
  },
})

export default CreditsScreen
