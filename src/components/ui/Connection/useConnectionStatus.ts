'use client'

import { useState, useEffect } from 'react'

type ConnectionStatus = 'good' | 'acceptable' | 'poor' | 'offline'

const SPEED_GOOD_THRESHOLD = 250 // Kbps
const SPEED_ACCEPTABLE_THRESHOLD = 100 // Kbps
const LATENCY_THRESHOLD = 300 // ms (puedes ajustarlo también según tu experiencia)

export function useConnectionStatus() {
  const [status, setStatus] = useState<ConnectionStatus>('good')

  useEffect(() => {
    const checkConnection = async () => {
      if (!navigator.onLine) {
        setStatus('offline')
        return
      }

      try {
        const startTime = performance.now()
        const response = await fetch('https://www.cloudflare.com/cdn-cgi/trace', { cache: 'no-store' })
        const endTime = performance.now()

        if (!response.ok) {
          throw new Error('Network response was not ok')
        }

        const data = await response.text()
        const bytes = new Blob([data]).size
        const durationInSeconds = (endTime - startTime) / 1000
        const speedKbps = (bytes) / durationInSeconds // Convert to kbps
        const latency = endTime - startTime // Latency in ms

        console.log(`Speed: ${speedKbps} Kbps, Latency: ${latency} ms`)
        console.log(`
        Speed: ${speedKbps}, 
        Threshold: ${SPEED_GOOD_THRESHOLD}Kbps, 
        Latency: ${latency} ms
         ${LATENCY_THRESHOLD} ms
        
        `, speedKbps >= SPEED_GOOD_THRESHOLD, latency <= LATENCY_THRESHOLD)

        // Ajuste de estados según rangos
        if (speedKbps >= SPEED_GOOD_THRESHOLD && latency <= LATENCY_THRESHOLD) {
          setStatus('good')
        } else if (speedKbps >= SPEED_ACCEPTABLE_THRESHOLD) {
          setStatus('acceptable')
        } else {
          setStatus('poor')
        }
      } catch (error) {
        console.error('Error checking connection:', error)
        setStatus('poor') // Asume una conexión pobre en caso de error
      }
    }

    const handleOnline = () => checkConnection()
    const handleOffline = () => setStatus('offline')

    // Initial check
    checkConnection()

    // Set up interval for periodic checks
    const intervalId = setInterval(checkConnection, 30000) // Check every 30 seconds

    // Add event listeners
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Cleanup
    return () => {
      clearInterval(intervalId)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return status
}
