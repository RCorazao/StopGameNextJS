"use client"

import { Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/contexts/LanguageContext"
import { Language } from "@/types/language"

export function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage()

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          size="sm" 
          className="bg-white text-black hover:bg-gray-200 backdrop-blur-sm cursor-pointer"
        >
          <Globe className="w-4 h-4 mr-2" />
          {language === 'en' ? t.english : t.spanish}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="">
        <DropdownMenuItem 
          onClick={() => handleLanguageChange('en')}
          className={language === 'en' ? '!text-blue-500' : 'cursor-pointer'}
        >
          🇺🇸 {t.english}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleLanguageChange('es')}
          className={language === 'es' ? '!text-blue-500' : 'cursor-pointer'}
        >
          🇪🇸 {t.spanish}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}