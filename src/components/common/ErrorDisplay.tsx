"use client"

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ErrorDisplayProps {
  error: string
  showBackButton?: boolean
  onBack?: () => void
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  error, 
  showBackButton = true, 
  onBack 
}) => {
  const router = useRouter()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-800 via-blue-500 to-white p-4 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 text-center space-y-4">
          <div className="text-red-500 text-lg font-semibold">Error</div>
          <p className="text-gray-600">{error}</p>
          {showBackButton && (
            <Button onClick={handleBack} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}