"use client"

import { usePathname } from 'next/navigation'
import Navbar from "@/components/layout/navbar"
import Footer from "@/components/layout/footer"
import Preloader from "@/components/layout/preloader"

interface LayoutWrapperProps {
  children: React.ReactNode
}

// Routes where navbar, footer, and preloader should be hidden
const EXCLUDED_ROUTES = ['/admin', '/login', '/create-admin']

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname()
  
  // Check if current route should exclude layout components
  const isExcludedRoute = EXCLUDED_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )

  if (isExcludedRoute) {
    // Admin/Login routes: no navbar, footer, or preloader
    return <>{children}</>
  }

  // Public routes: include all layout components
  return (
    <>
      <Preloader />
      <Navbar />
      {children}
      <Footer />
    </>
  )
}
