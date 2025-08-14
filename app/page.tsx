"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpDown, TrendingUp, Star } from "lucide-react"

// Currency data with country codes for flags
const currencies = [
  { code: "USD", name: "US Dollar", country: "us" },
  { code: "EUR", name: "Euro", country: "eu" },
  { code: "GBP", name: "British Pound", country: "gb" },
  { code: "JPY", name: "Japanese Yen", country: "jp" },
  { code: "AUD", name: "Australian Dollar", country: "au" },
  { code: "CAD", name: "Canadian Dollar", country: "ca" },
  { code: "CHF", name: "Swiss Franc", country: "ch" },
  { code: "CNY", name: "Chinese Yuan", country: "cn" },
  { code: "SEK", name: "Swedish Krona", country: "se" },
  { code: "NZD", name: "New Zealand Dollar", country: "nz" },
  { code: "MXN", name: "Mexican Peso", country: "mx" },
  { code: "SGD", name: "Singapore Dollar", country: "sg" },
  { code: "HKD", name: "Hong Kong Dollar", country: "hk" },
  { code: "NOK", name: "Norwegian Krone", country: "no" },
  { code: "KRW", name: "South Korean Won", country: "kr" },
  { code: "TRY", name: "Turkish Lira", country: "tr" },
  { code: "RUB", name: "Russian Ruble", country: "ru" },
  { code: "INR", name: "Indian Rupee", country: "in" },
  { code: "BRL", name: "Brazilian Real", country: "br" },
  { code: "ZAR", name: "South African Rand", country: "za" },
]

interface ExchangeRates {
  [key: string]: number
}

export default function CurrencyConverter() {
  const [amount, setAmount] = useState<string>("1")
  const [fromCurrency, setFromCurrency] = useState<string>("USD")
  const [toCurrency, setToCurrency] = useState<string>("EUR")
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({})
  const [convertedAmount, setConvertedAmount] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(false)
  const [favorites, setFavorites] = useState<string[]>([])
  const [lastUpdated, setLastUpdated] = useState<string>("")

  const containerRef = useRef<HTMLDivElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)
  const swapRef = useRef<HTMLButtonElement>(null)

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem("currencyFavorites")
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }
  }, [])

  // Fetch exchange rates
  const fetchExchangeRates = async () => {
    setLoading(true)
    try {
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`)
      const data = await response.json()
      setExchangeRates(data.rates)
      setLastUpdated(new Date().toLocaleTimeString())
    } catch (error) {
      console.error("Error fetching exchange rates:", error)
      // Fallback rates for demo
      setExchangeRates({
        USD: 1,
        EUR: 0.85,
        GBP: 0.73,
        JPY: 110,
        AUD: 1.35,
        CAD: 1.25,
      })
    } finally {
      setLoading(false)
    }
  }

  // Convert currency
  useEffect(() => {
    if (exchangeRates[toCurrency] && amount) {
      const result = Number.parseFloat(amount) * exchangeRates[toCurrency]
      setConvertedAmount(result)
    }
  }, [amount, toCurrency, exchangeRates])

  // Fetch rates on currency change
  useEffect(() => {
    fetchExchangeRates()
  }, [fromCurrency])

  // Initialize GSAP animations
  useEffect(() => {
    // Load GSAP
    const script = document.createElement("script")
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"
    script.onload = () => {
      // @ts-ignore
      const { gsap } = window

      // Initial animations
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 50, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "back.out(1.7)" },
      )

      // Parallax background animation
      gsap.to(".bg-layer-1", {
        x: -50,
        duration: 20,
        repeat: -1,
        ease: "none",
      })

      gsap.to(".bg-layer-2", {
        x: 30,
        duration: 15,
        repeat: -1,
        ease: "none",
      })

      // Floating animation for currency symbols
      gsap.to(".floating-symbol", {
        y: -20,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
        stagger: 0.5,
      })
    }
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  // Animate result changes
  useEffect(() => {
    if (typeof window !== "undefined" && window.gsap && resultRef.current) {
      window.gsap.fromTo(
        resultRef.current,
        { scale: 1.1, opacity: 0.7 },
        { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" },
      )
    }
  }, [convertedAmount])

  const swapCurrencies = () => {
    if (typeof window !== "undefined" && window.gsap && swapRef.current) {
      window.gsap.to(swapRef.current, {
        rotation: 180,
        duration: 0.5,
        ease: "back.out(1.7)",
      })
    }

    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
  }

  const toggleFavorite = (currencyCode: string) => {
    const newFavorites = favorites.includes(currencyCode)
      ? favorites.filter((fav) => fav !== currencyCode)
      : [...favorites, currencyCode]

    setFavorites(newFavorites)
    localStorage.setItem("currencyFavorites", JSON.stringify(newFavorites))
  }

  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(value)
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      {/* Animated Background Layers */}
      <div className="absolute inset-0 opacity-20">
        <div className="bg-layer-1 absolute top-10 left-10 w-32 h-32 bg-blue-200 dark:bg-blue-800 rounded-full blur-xl"></div>
        <div className="bg-layer-2 absolute top-32 right-20 w-24 h-24 bg-purple-200 dark:bg-purple-800 rounded-full blur-lg"></div>
        <div className="bg-layer-1 absolute bottom-20 left-1/4 w-40 h-40 bg-indigo-200 dark:bg-indigo-800 rounded-full blur-2xl"></div>
        <div className="bg-layer-2 absolute bottom-32 right-1/3 w-28 h-28 bg-pink-200 dark:bg-pink-800 rounded-full blur-xl"></div>
      </div>

      {/* Floating Currency Symbols */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="floating-symbol absolute top-20 left-1/4 text-4xl opacity-10 dark:opacity-20">$</div>
        <div className="floating-symbol absolute top-40 right-1/4 text-3xl opacity-10 dark:opacity-20">€</div>
        <div className="floating-symbol absolute bottom-40 left-1/3 text-5xl opacity-10 dark:opacity-20">£</div>
        <div className="floating-symbol absolute bottom-20 right-1/5 text-3xl opacity-10 dark:opacity-20">¥</div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <Card
          ref={containerRef}
          className="w-full max-w-2xl backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-0 shadow-2xl"
        >
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Currency Converter
            </CardTitle>
            <p className="text-muted-foreground mt-2">Real-time exchange rates • Last updated: {lastUpdated}</p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Amount Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Amount</label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="text-lg h-12 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-2 focus:border-blue-500 transition-all duration-300"
              />
            </div>

            {/* Currency Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              {/* From Currency */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">From</label>
                <Select value={fromCurrency} onValueChange={setFromCurrency}>
                  <SelectTrigger className="h-12 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-2 hover:border-blue-400 transition-all duration-300">
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        <img
                          src={`https://flagcdn.com/24x18/${currencies.find((c) => c.code === fromCurrency)?.country}.png`}
                          alt={fromCurrency}
                          className="w-6 h-4 object-cover rounded-sm"
                        />
                        <span className="font-medium">{fromCurrency}</span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        <div className="flex items-center gap-2">
                          <img
                            src={`https://flagcdn.com/24x18/${currency.country}.png`}
                            alt={currency.code}
                            className="w-6 h-4 object-cover rounded-sm"
                          />
                          <span className="font-medium">{currency.code}</span>
                          <span className="text-muted-foreground text-sm">{currency.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleFavorite(currency.code)
                            }}
                            className="ml-auto p-1 h-6 w-6"
                          >
                            <Star
                              className={`h-3 w-3 ${favorites.includes(currency.code) ? "fill-yellow-400 text-yellow-400" : "text-gray-400"}`}
                            />
                          </Button>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* To Currency */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">To</label>
                <Select value={toCurrency} onValueChange={setToCurrency}>
                  <SelectTrigger className="h-12 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-2 hover:border-blue-400 transition-all duration-300">
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        <img
                          src={`https://flagcdn.com/24x18/${currencies.find((c) => c.code === toCurrency)?.country}.png`}
                          alt={toCurrency}
                          className="w-6 h-4 object-cover rounded-sm"
                        />
                        <span className="font-medium">{toCurrency}</span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        <div className="flex items-center gap-2">
                          <img
                            src={`https://flagcdn.com/24x18/${currency.country}.png`}
                            alt={currency.code}
                            className="w-6 h-4 object-cover rounded-sm"
                          />
                          <span className="font-medium">{currency.code}</span>
                          <span className="text-muted-foreground text-sm">{currency.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleFavorite(currency.code)
                            }}
                            className="ml-auto p-1 h-6 w-6"
                          >
                            <Star
                              className={`h-3 w-3 ${favorites.includes(currency.code) ? "fill-yellow-400 text-yellow-400" : "text-gray-400"}`}
                            />
                          </Button>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <Button
                ref={swapRef}
                variant="outline"
                size="sm"
                onClick={swapCurrencies}
                className="rounded-full w-12 h-12 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-2 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-all duration-300 hover:scale-110"
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>

            {/* Conversion Result */}
            <div
              ref={resultRef}
              className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 rounded-xl p-6 text-center backdrop-blur-sm border border-blue-200/50 dark:border-blue-700/50"
            >
              <div className="text-sm text-muted-foreground mb-2">Converted Amount</div>
              <div className="text-3xl font-bold text-foreground">
                {loading ? (
                  <div className="animate-pulse">Loading...</div>
                ) : (
                  formatCurrency(convertedAmount, toCurrency)
                )}
              </div>
              {exchangeRates[toCurrency] && (
                <div className="text-sm text-muted-foreground mt-2 flex items-center justify-center gap-1">
                  <TrendingUp className="h-3 w-3" />1 {fromCurrency} = {exchangeRates[toCurrency].toFixed(6)}{" "}
                  {toCurrency}
                </div>
              )}
            </div>

            {/* Favorite Currencies */}
            {favorites.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  Favorite Currencies
                </h3>
                <div className="flex flex-wrap gap-2">
                  {favorites.map((fav) => {
                    const currency = currencies.find((c) => c.code === fav)
                    return currency ? (
                      <Button
                        key={fav}
                        variant="outline"
                        size="sm"
                        onClick={() => setFromCurrency(fav)}
                        className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-all duration-300"
                      >
                        <img
                          src={`https://flagcdn.com/16x12/${currency.country}.png`}
                          alt={currency.code}
                          className="w-4 h-3 object-cover rounded-sm mr-1"
                        />
                        {currency.code}
                      </Button>
                    ) : null
                  })}
                </div>
              </div>
            )}

            {/* Refresh Button */}
            <div className="flex justify-center pt-4">
              <Button
                onClick={fetchExchangeRates}
                disabled={loading}
                variant="outline"
                className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-all duration-300"
              >
                {loading ? "Updating..." : "Refresh Rates"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
