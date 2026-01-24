"use client"

import { useState, useRef, useEffect } from 'react'
import { QrCode, CheckCircle, XCircle, User, Users, Building, Mail, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createClient } from '@/utils/supabase/client'
import jsQR from 'jsqr'

interface ScannedData {
  teamId: string
  name: string
  teamName: string
  eventName: string
  collegeName: string
  participantEmail: string
  participantPhone?: string
  paymentStatus?: string
}

interface TeamMember {
  id: string
  member_name: string
  member_email: string
  member_contact: string
  role: string
  is_present: boolean
  attendance_marked_at?: string
  team_name: string
  college_name: string
  event_name: string
}

export default function ScanPage() {
  const [scannedData, setScannedData] = useState<ScannedData | null>(null)
  const [teamMember, setTeamMember] = useState<TeamMember | null>(null)
  const [isPresent, setIsPresent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const supabase = createClient()

  // Start camera
  const startCamera = async () => {
    console.log('Requesting camera access...')
    try {
      // Try back camera first, fallback to any camera
      let constraints: MediaStreamConstraints = { video: { facingMode: 'environment' } }
      
      let stream
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints)
      } catch (backCameraError) {
        console.log('Back camera not available, trying any camera...')
        constraints = { video: true }
        stream = await navigator.mediaDevices.getUserMedia(constraints)
      }
      
      console.log('Camera stream obtained:', stream)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded, dimensions:', videoRef.current?.videoWidth, videoRef.current?.videoHeight)
          setCameraActive(true)
          setLoading(false)
          console.log('Camera activated')
        }
        
        // Handle errors
        videoRef.current.onerror = () => {
          console.error('Video element error')
          setError('Failed to load camera feed')
          setLoading(false)
        }
      } else {
        console.error('Video element not found')
        setError('Video element not available')
        setLoading(false)
      }
    } catch (err) {
      console.error('Camera access failed:', err)
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Camera access denied. Please allow camera permissions and try again.')
        } else if (err.name === 'NotFoundError') {
          setError('No camera found on this device.')
        } else {
          setError(`Camera error: ${err.message}`)
        }
      } else {
        setError('Failed to access camera. Please ensure camera permissions are granted.')
      }
      setLoading(false)
    }
  }

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setCameraActive(false)
    setScanning(false)
    setLoading(false)
  }

  // Scan QR code from video
  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Get image data for QR processing
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

    // Use jsQR to scan the QR code
    const code = jsQR(imageData.data, imageData.width, imageData.height)

    if (code) {
      try {
        const data: ScannedData = JSON.parse(code.data)
        setScannedData(data)
        fetchTeamMember(data)
        setSuccess('QR code scanned successfully!')
      } catch (err) {
        setError('Invalid QR code data')
      }
    } else {
      setError('No QR code found. Please ensure the pass is clearly visible.')
    }
  }

  // Handle manual QR data input (for testing)
  const handleManualScan = (qrData: string) => {
    try {
      const data: ScannedData = JSON.parse(qrData)
      setScannedData(data)
      fetchTeamMember(data)
    } catch (err) {
      setError('Invalid QR code data')
    }
  }

  // Fetch team member details
  const fetchTeamMember = async (data: ScannedData) => {
    setLoading(true)
    setError(null)

    try {
      // First, find the team by teamId (could be UUID prefix or full UUID)
      let teamQuery = supabase
        .from('teams')
        .select('id')
        .or(`id.ilike.${data.teamId}*,id.eq.${data.teamId}`)

      const { data: teamData, error: teamError } = await teamQuery.single()

      if (teamError || !teamData) {
        setError('Team not found. Please check the QR code.')
        return
      }

      // Now find the team member by email in this team
      const { data: member, error } = await supabase
        .from('team_members')
        .select(`
          id,
          member_name,
          member_email,
          member_contact,
          role,
          is_present,
          attendance_marked_at,
          teams!inner (
            team_name,
            college_name,
            events!inner (
              name
            )
          )
        `)
        .eq('member_email', data.participantEmail)
        .eq('team_id', teamData.id)
        .single()

      if (error || !member) {
        setError('Team member not found. Please check the QR code and try again.')
        return
      }

      const memberData = {
        id: member.id,
        member_name: member.member_name,
        member_email: member.member_email,
        member_contact: member.member_contact,
        role: member.role,
        is_present: member.is_present || false,
        attendance_marked_at: member.attendance_marked_at,
        team_name: (member.teams as any).team_name,
        college_name: (member.teams as any).college_name,
        event_name: (member.teams as any).events.name,
      }

      setTeamMember(memberData)
      setIsPresent(memberData.is_present)
    } catch (err) {
      setError('Failed to fetch team member details')
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Mark attendance
  const markAttendance = async () => {
    if (!teamMember) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/scan/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memberId: teamMember.id,
          isPresent,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to update attendance')
        return
      }

      setSuccess(`Attendance ${isPresent ? 'marked as present' : 'marked as absent'} for ${teamMember.member_name}`)
      setTeamMember({ ...teamMember, is_present: isPresent, attendance_marked_at: new Date().toISOString() })
    } catch (err) {
      setError('Failed to update attendance')
      console.error('Update error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Reset scan
  const resetScan = () => {
    setScannedData(null)
    setTeamMember(null)
    setIsPresent(false)
    setError(null)
    setSuccess(null)
    setScanning(false)
    setLoading(false)
  }

  // Continuous scanning
  useEffect(() => {
    let scanInterval: NodeJS.Timeout

    if (cameraActive && !scannedData && !scanning) {
      scanInterval = setInterval(() => {
        scanQRCode()
      }, 1000) // Scan every second
    }

    return () => {
      if (scanInterval) {
        clearInterval(scanInterval)
      }
    }
  }, [cameraActive, scannedData, scanning])

  // Start scanning
  const startScanning = async () => {
    console.log('Starting scanning...')
    setLoading(true)
    
    // Check if we're in a secure context
    if (!window.isSecureContext) {
      setError('Camera access requires a secure connection (HTTPS or localhost). Please ensure you\'re accessing this page over HTTPS or on localhost.')
      setLoading(false)
      return
    }
    
    try {
      await startCamera()
      setScanning(true)
      console.log('Scanning started successfully')
    } catch (err) {
      console.error('Failed to start scanning:', err)
      setError('Failed to start scanning')
      setLoading(false)
    }
  }

  // Stop scanning
  const stopScanning = () => {
    stopCamera()
    setScanning(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">QR Code Scanner</h1>
          <p className="text-muted-foreground">Scan event passes to mark attendance</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Camera/Scanner Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QR Scanner
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Camera Preview - Always rendered */}
            <div className="relative min-h-[300px]">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full rounded-lg border"
                style={{ display: cameraActive ? 'block' : 'none' }}
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Loading overlay */}
              {loading && !cameraActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Loading camera...</p>
                  </div>
                </div>
              )}
              
              {/* Scanning overlay */}
              {scanning && cameraActive && (
                <div className="absolute inset-0 border-2 border-green-500 rounded-lg animate-pulse pointer-events-none">
                  <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-sm">
                    Scanning...
                  </div>
                </div>
              )}
              
              {/* Initial state */}
              {!loading && !cameraActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
                  <div className="text-center">
                    <QrCode className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <Button onClick={startScanning} size="lg">
                      Start Scanning
                    </Button>
                    <p className="text-sm text-muted-foreground mt-2">
                      Click to start camera and begin scanning QR codes
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Controls */}
            {cameraActive && (
              <div className="flex gap-2">
                <Button onClick={() => scanQRCode()} disabled={!scanning}>
                  Scan Now
                </Button>
                <Button variant="outline" onClick={stopScanning}>
                  Stop Scanning
                </Button>
              </div>
            )}

            {/* Manual input for testing */}
            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground mb-2">For testing - paste QR data or use sample:</p>
              <textarea
                placeholder='{"teamId":"GT-2026-2311","name":"John Doe","teamName":"Test Team","eventName":"Test Event","collegeName":"Test College","participantEmail":"john@test.com","participantPhone":"1234567890","paymentStatus":"PAID"}'
                className="w-full p-2 border rounded text-sm font-mono"
                rows={3}
                onChange={(e) => {
                  if (e.target.value.trim()) {
                    handleManualScan(e.target.value.trim())
                  }
                }}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Tip: Copy the placeholder above and modify with real data for testing
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Participant Details Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Participant Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!scannedData && !teamMember ? (
              <div className="text-center py-8 text-muted-foreground">
                <User className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Scan a QR code to view participant details</p>
              </div>
            ) : teamMember ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{teamMember.member_name}</p>
                      <p className="text-sm text-muted-foreground capitalize">{teamMember.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{teamMember.member_email}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{teamMember.member_contact}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{teamMember.team_name}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{teamMember.college_name}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="attendance"
                      checked={isPresent}
                      onCheckedChange={(checked) => setIsPresent(checked === true)}
                    />
                    <label
                      htmlFor="attendance"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Mark as Present
                    </label>
                  </div>

                  {teamMember.attendance_marked_at && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Last marked: {new Date(teamMember.attendance_marked_at).toLocaleString()}
                    </p>
                  )}

                  <div className="flex gap-2 mt-4">
                    <Button onClick={markAttendance} disabled={loading}>
                      {loading ? 'Updating...' : 'Update Attendance'}
                    </Button>
                    <Button variant="outline" onClick={resetScan}>
                      Scan Another
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading participant details...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}