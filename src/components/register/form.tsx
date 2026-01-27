"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { XIcon, CheckCircle2, AlertCircle, Plus, X, ArrowLeft, ArrowRight, Users, QrCode as QrCodeIcon, Copy, Check } from 'lucide-react';
import SplashScreen from '@/components/layout/splash-screen';

interface RegistrationFormProps {
  eventId: string;
  eventTitle: string;
  eventSlug: string;
  participationFee: string;
  teamSize: string;
  onClose: () => void;
}

interface TeamMember {
  name: string;
  email: string;
  phone: string;
  college: string;
}

export function RegistrationForm({
  eventId,
  eventTitle,
  eventSlug,
  participationFee,
  teamSize,
  onClose,
}: RegistrationFormProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Multi-step state (1=Details, 2=Members, 3=Payment)
  const [step, setStep] = useState<1 | 2 | 3>(1);
  
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [showSplash, setShowSplash] = useState(false);

  // New states for enhancements
  const [lastSubmitTime, setLastSubmitTime] = useState<number>(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // Scroll to top when step changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [step]);
  
  // Form data
  const [formData, setFormData] = useState({
    teamName: '',
    leaderName: '',
    leaderEmail: '',
    leaderPhone: '',
    college: '',
  });

  // Payment data
  const [paymentData, setPaymentData] = useState({
    transactionId: '',
    accountHolderName: '',
  });
  
  // Team members
  const [members, setMembers] = useState<TeamMember[]>([]);
  
  // Parse team size
  const maxTeamSize = parseInt(teamSize.split('-')[1]) || parseInt(teamSize) || 4;
  const minTeamSize = parseInt(teamSize.split('-')[0]) || 1;

  // Parse participation fee
  const registrationFee = parseFloat(participationFee.replace(/[^0-9.]/g, '')) || 0;

  // UPI Configuration
  const upiId = process.env.NEXT_PUBLIC_UPI_ID || "grobotsclub@upi";
  const upiPayeeName = process.env.NEXT_PUBLIC_UPI_PAYEE_NAME || "Grobots Club";

  // QR Code state
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [qrLoading, setQrLoading] = useState(false);

  // Generate UPI QR code when reaching payment step
  useEffect(() => {
    if (step === 3 && registrationFee > 0) {
      generateUpiQrCode();
    }
  }, [step, registrationFee]);

  const generateUpiQrCode = async () => {
    setQrLoading(true);
    try {
      const transactionNote = `Gantavya-${eventTitle.replace(/[^a-zA-Z0-9]/g, '').substring(0, 20)}`;
      const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiPayeeName)}&am=${registrationFee.toFixed(2)}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
      
      const qrDataUrl = await QRCode.toDataURL(upiUrl, {
        width: 256,
        margin: 2,
        color: { dark: '#000000', light: '#FFFFFF' },
      });
      
      setQrCodeDataUrl(qrDataUrl);
    } catch (error) {
      // Error generating QR code - silent fail
    } finally {
      setQrLoading(false);
    }
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper functions for enhancements
  const sanitizeInput = (input: string) => {
    return input.trim().replace(/[<>]/g, ''); // Remove potential XSS characters
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isValid = emailRegex.test(email);
    const hasValidDomain = email.split('@')[1]?.includes('.');
    return isValid && hasValidDomain && email.length <= 254;
  };

  const validatePhone = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    return /^[6-9]\d{9}$/.test(cleanPhone);
  };

  const validateTransactionId = (txnId: string) => {
    return /^[A-Za-z0-9]{12}$/.test(txnId);
  };

  const validateName = (name: string) => {
    return /^[a-zA-Z\s.'-]{2,100}$/.test(name);
  };

  // Custom debounce for email validation
  const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  };

  const checkEmailFormat = useCallback(
    debounce((email: string, fieldName: string) => {
      if (email && !validateEmail(email)) {
        setSubmitStatus('error');
        setSubmitMessage(`Invalid email format for ${fieldName}`);
      }
    }, 500),
    []
  );

  // Validations
  const validateStep1 = () => {
    const trimmedTeamName = sanitizeInput(formData.teamName);
    const trimmedLeaderName = sanitizeInput(formData.leaderName);
    const trimmedLeaderEmail = sanitizeInput(formData.leaderEmail);
    const trimmedLeaderPhone = sanitizeInput(formData.leaderPhone);
    const trimmedCollege = sanitizeInput(formData.college);

    if (!trimmedTeamName || trimmedTeamName.length < 3 || trimmedTeamName.length > 50) {
      setSubmitStatus('error');
      setSubmitMessage('Team name must be 3-50 characters');
      return false;
    }
    if (!validateName(trimmedLeaderName)) {
      setSubmitStatus('error');
      setSubmitMessage('Leader name can only contain letters, spaces, and basic punctuation');
      return false;
    }
    if (!validateEmail(trimmedLeaderEmail)) {
      setSubmitStatus('error');
      setSubmitMessage('Please enter a valid email address');
      return false;
    }
    if (!validatePhone(trimmedLeaderPhone)) {
      setSubmitStatus('error');
      setSubmitMessage('Please enter a valid 10-digit phone number starting with 6-9');
      return false;
    }
    if (!trimmedCollege || trimmedCollege.length < 2 || trimmedCollege.length > 200) {
      setSubmitStatus('error');
      setSubmitMessage('College name is required (2-200 characters)');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    for (let i = 0; i < members.length; i++) {
      const member = members[i];
      const trimmedName = sanitizeInput(member.name);
      const trimmedEmail = sanitizeInput(member.email);
      const trimmedPhone = sanitizeInput(member.phone);
      const trimmedCollege = sanitizeInput(member.college);

      if (trimmedName || trimmedEmail || trimmedPhone) {
        if (!validateName(trimmedName)) {
          setSubmitStatus('error');
          setSubmitMessage(`Member ${i + 1}: Name can only contain letters, spaces, and basic punctuation`);
          return false;
        }
        if (!validateEmail(trimmedEmail)) {
          setSubmitStatus('error');
          setSubmitMessage(`Member ${i + 1}: Please enter a valid email address`);
          return false;
        }
        if (!validatePhone(trimmedPhone)) {
          setSubmitStatus('error');
          setSubmitMessage(`Member ${i + 1}: Please enter a valid 10-digit phone number starting with 6-9`);
          return false;
        }
        if (trimmedCollege && (trimmedCollege.length < 2 || trimmedCollege.length > 200)) {
          setSubmitStatus('error');
          setSubmitMessage(`Member ${i + 1}: College must be 2-200 characters`);
          return false;
        }
      }
    }
    
    const validMembers = members.filter(m => m.email);
    const emails = [formData.leaderEmail.toLowerCase(), ...validMembers.map(m => m.email.toLowerCase())];
    const uniqueEmails = new Set(emails);
    if (uniqueEmails.size !== emails.length) {
      setSubmitStatus('error');
      setSubmitMessage('Each team member must have a unique email address');
      return false;
    }

    const phones = [formData.leaderPhone, ...validMembers.map(m => m.phone)];
    const uniquePhones = new Set(phones);
    if (uniquePhones.size !== phones.length) {
      setSubmitStatus('error');
      setSubmitMessage('Each team member must have a unique phone number');
      return false;
    }

    const totalMembers = validMembers.length + 1;
    if (totalMembers < minTeamSize) {
      setSubmitStatus('error');
      setSubmitMessage(`Minimum team size is ${minTeamSize}. You have ${totalMembers} member(s).`);
      return false;
    }
    
    return true;
  };

  const validateStep3 = () => {
    if (registrationFee > 0) {
      const trimmedTransactionId = sanitizeInput(paymentData.transactionId);
      const trimmedAccountHolderName = sanitizeInput(paymentData.accountHolderName);

      if (!validateTransactionId(trimmedTransactionId)) {
        setSubmitStatus('error');
        setSubmitMessage('Invalid transaction ID format (12 alphanumeric characters)');
        return false;
      }
      if (!validateName(trimmedAccountHolderName)) {
        setSubmitStatus('error');
        setSubmitMessage('Account holder name can only contain letters, spaces, and basic punctuation');
        return false;
      }
    }
    return true;
  };

  const goToNextStep = () => {
    setSubmitStatus('idle');
    setSubmitMessage('');
    
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const goToPrevStep = () => {
    setSubmitStatus('idle');
    setSubmitMessage('');
    if (step > 1) setStep((s) => (s - 1) as 1 | 2 | 3);
  };

  const addMember = () => {
    if (members.length < maxTeamSize - 1) {
      setMembers([...members, { name: '', email: '', phone: '', college: formData.college }]); // Auto-populate college
    }
  };

  const removeMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const updateMember = (index: number, field: keyof TeamMember, value: string) => {
    const updated = [...members];
    updated[index][field] = sanitizeInput(value); // Sanitize on update
    setMembers(updated);
    if (field === 'email') {
      checkEmailFormat(value, `Member ${index + 1}`);
    }
  };

  const handleSubmit = async () => {
    const now = Date.now();
    if (now - lastSubmitTime < 5000) {
      setSubmitStatus('error');
      setSubmitMessage('Please wait before submitting again');
      return;
    }
    setLastSubmitTime(now);

    if (isSubmitted) {
      setSubmitStatus('error');
      setSubmitMessage('Form already submitted');
      return;
    }

    if (!validateStep3()) return;

    try {
      setSubmitStatus('processing');
      setSubmitMessage('Submitting your registration...');
      setIsSubmitted(true);

      const registerResponse = await fetch('/api/teams/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: eventId,
          team_name: formData.teamName,
          college_name: formData.college,
          captain: {
            name: formData.leaderName,
            email: formData.leaderEmail,
            contact: formData.leaderPhone,
          },
          members: members.filter(m => m.name && m.email && m.phone).map(m => ({
            member_name: m.name,
            member_email: m.email,
            member_contact: m.phone,
          })),
          payment: registrationFee > 0 ? {
            transaction_id: paymentData.transactionId,
            account_holder_name: paymentData.accountHolderName,
            amount: registrationFee,
          } : null,
        }),
      });

      if (!registerResponse.ok) {
        const error = await registerResponse.json();
        throw new Error(error.error || 'Registration failed');
      }

      setSubmitStatus('success');
      setSubmitMessage(
        registrationFee > 0 
          ? 'Registration submitted! Your payment is pending verification. You will receive a confirmation email once verified.' 
          : 'Registration successful! You will receive a confirmation email shortly.'
      );
      
      setShowSplash(true);

    } catch (error: any) {
      setSubmitStatus('error');
      setSubmitMessage(error.message || 'Registration failed. Please try again.');
      setIsSubmitted(false); // Allow retry on error
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: sanitizeInput(e.target.value) });
    if (e.target.name === 'leaderEmail') {
      checkEmailFormat(e.target.value, 'Leader');
    }
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentData({ ...paymentData, [e.target.name]: sanitizeInput(e.target.value) });
  };

  const handleClose = () => {
    // Clear sensitive data for security
    setPaymentData({ transactionId: '', accountHolderName: '' });
    setFormData({
      teamName: '',
      leaderName: '',
      leaderEmail: '',
      leaderPhone: '',
      college: '',
    });
    setMembers([]);
    setIsSubmitted(false);
    onClose();
  };

  // Prevent scroll propagation
  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation();
  };

  // Show splash screen on successful registration
  if (showSplash) {
    return (
      <SplashScreen 
        onClose={() => {
          setShowSplash(false);
          handleClose();
        }} 
      />
    );
  }

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm"
      style={{ touchAction: 'none' }}
    >
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div 
          className="relative w-full max-w-2xl bg-neutral-900 rounded-2xl border border-neutral-800 shadow-2xl flex flex-col"
          style={{ 
            maxHeight: 'min(90vh, 800px)',
            height: 'auto'
          }}
        >
          {/* Fixed Header */}
          <div className="flex-none border-b border-neutral-800 p-4 sm:p-6 bg-neutral-900 rounded-t-2xl">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h2 className="text-xl sm:text-2xl font-bold text-white truncate">Register for {eventTitle}</h2>
                <p className="text-sm text-neutral-400 mt-1">Fill in the details below</p>
              </div>
              <button
                onClick={handleClose}
                className="flex-none p-2 hover:bg-neutral-800 rounded-lg transition-colors"
                aria-label="Close"
              >
                <XIcon className="w-5 h-5 text-neutral-400" />
              </button>
            </div>
            
            {/* Step Indicator */}
            <div className="flex items-center gap-2 mt-4 overflow-x-auto">
              <div className={`flex-none px-3 py-1 rounded-full text-xs sm:text-sm whitespace-nowrap ${step === 1 ? 'bg-orange-600 text-white' : step > 1 ? 'bg-green-600 text-white' : 'bg-neutral-800 text-neutral-400'}`}>
                1. Details
              </div>
              <div className={`flex-none px-3 py-1 rounded-full text-xs sm:text-sm whitespace-nowrap ${step === 2 ? 'bg-orange-600 text-white' : step > 2 ? 'bg-green-600 text-white' : 'bg-neutral-800 text-neutral-400'}`}>
                2. Members
              </div>
              <div className={`flex-none px-3 py-1 rounded-full text-xs sm:text-sm whitespace-nowrap ${step === 3 ? 'bg-orange-600 text-white' : 'bg-neutral-800 text-neutral-400'}`}>
                3. Payment
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div 
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain"
            onWheel={handleWheel}
            onTouchMove={handleTouchMove}
            style={{ 
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'thin',
              scrollbarColor: '#525252 transparent'
            }}
          >
            <div className="p-4 sm:p-6">
              {/* Status Messages */}
              {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-900/30 border border-green-700 rounded-lg flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-none mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-green-300">Registration Successful!</h3>
                    <p className="text-sm text-green-200 mt-1">{submitMessage}</p>
                  </div>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-none mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-300">Error</h3>
                    <p className="text-sm text-red-200 mt-1">{submitMessage}</p>
                  </div>
                </div>
              )}

              {/* Step 1: Details */}
              {step === 1 && (
                <div className="space-y-5">
                  <div className="p-4 bg-neutral-800/50 rounded-lg border border-neutral-700">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-neutral-500">Entry Fee:</span>
                        <span className="ml-2 text-white font-semibold">{participationFee}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500">Team Size:</span>
                        <span className="ml-2 text-white font-semibold">{teamSize}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="teamName" className="text-sm font-medium text-white">
                      Team Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="teamName"
                      name="teamName"
                      value={formData.teamName}
                      onChange={handleChange}
                      placeholder="Enter your team name"
                      className="bg-neutral-800 border-neutral-700 text-white"
                      maxLength={50}
                      minLength={3}
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white border-b border-neutral-800 pb-2">
                      Team Leader Details
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="leaderName" className="text-sm font-medium text-white">
                          Full Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="leaderName"
                          name="leaderName"
                          value={formData.leaderName}
                          onChange={handleChange}
                          placeholder="John Doe"
                          className="bg-neutral-800 border-neutral-700 text-white"
                          maxLength={100}
                          minLength={2}
                          autoComplete="name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="leaderEmail" className="text-sm font-medium text-white">
                          Email <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="leaderEmail"
                          name="leaderEmail"
                          type="email"
                          value={formData.leaderEmail}
                          onChange={handleChange}
                          placeholder="john@example.com"
                          className="bg-neutral-800 border-neutral-700 text-white"
                          maxLength={254}
                          autoComplete="email"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="leaderPhone" className="text-sm font-medium text-white">
                          Phone Number <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="leaderPhone"
                          name="leaderPhone"
                          value={formData.leaderPhone}
                          onChange={handleChange}
                          placeholder="9876543210"
                          className="bg-neutral-800 border-neutral-700 text-white"
                          maxLength={10}
                          pattern="[0-9]*"
                          inputMode="numeric"
                          autoComplete="tel"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="college" className="text-sm font-medium text-white">
                          College/Institution <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="college"
                          name="college"
                          value={formData.college}
                          onChange={handleChange}
                          placeholder="Your college name"
                          className="bg-neutral-800 border-neutral-700 text-white"
                          maxLength={200}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Team Members */}
              {step === 2 && (
                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-600/20 rounded-lg">
                      <Users className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Add Team Members</h3>
                      <p className="text-sm text-neutral-400">Team size: {minTeamSize}-{maxTeamSize}</p>
                    </div>
                  </div>
                  
                  {/* Leader Card */}
                  <div className="p-4 bg-neutral-800/50 rounded-lg border border-neutral-700">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-orange-600 text-white text-xs rounded-full">Captain</span>
                    </div>
                    <p className="text-white font-medium">{formData.leaderName}</p>
                    <p className="text-sm text-neutral-400">{formData.leaderEmail}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-300">Members: {members.length + 1}/{maxTeamSize}</span>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={addMember}
                      disabled={members.length >= maxTeamSize - 1}
                      className="border-orange-600 text-orange-500 hover:bg-orange-600/10"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Member
                    </Button>
                  </div>
                  
                  {members.length === 0 ? (
                    <div className="p-6 border-2 border-dashed border-neutral-700 rounded-lg text-center">
                      <Users className="w-10 h-10 text-neutral-600 mx-auto mb-2" />
                      <p className="text-neutral-400 text-sm">No team members added</p>
                      <p className="text-neutral-500 text-xs mt-1">
                        {minTeamSize > 1 ? `Add at least ${minTeamSize - 1} member(s)` : 'Members are optional'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {members.map((member, index) => (
                        <div key={index} className="p-4 bg-neutral-800/50 rounded-lg border border-neutral-700">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-sm font-medium text-neutral-300">Member {index + 1}</span>
                            <button
                              type="button"
                              onClick={() => removeMember(index)}
                              className="p-1 hover:bg-neutral-700 rounded text-red-400"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Input
                              placeholder="Full Name *"
                              value={member.name}
                              onChange={(e) => updateMember(index, 'name', e.target.value)}
                              className="bg-neutral-800 border-neutral-700 text-white text-sm"
                              maxLength={100}
                              minLength={2}
                            />
                            <Input
                              placeholder="Email *"
                              type="email"
                              value={member.email}
                              onChange={(e) => updateMember(index, 'email', e.target.value)}
                              className="bg-neutral-800 border-neutral-700 text-white text-sm"
                              maxLength={254}
                            />
                            <Input
                              placeholder="Phone (10 digits) *"
                              value={member.phone}
                              onChange={(e) => updateMember(index, 'phone', e.target.value)}
                              className="bg-neutral-800 border-neutral-700 text-white text-sm"
                              maxLength={10}
                              pattern="[0-9]*"
                              inputMode="numeric"
                            />
                            <Input
                              placeholder="College"
                              value={member.college}
                              onChange={(e) => updateMember(index, 'college', e.target.value)}
                              className="bg-neutral-800 border-neutral-700 text-white text-sm"
                              maxLength={200}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Payment */}
              {step === 3 && (
                <div className="space-y-5">
                  <h3 className="text-lg font-semibold text-white">Payment & Confirmation</h3>
                  
                  {/* Summary */}
                  <div className="p-4 bg-neutral-800 rounded-lg border border-neutral-700">
                    <h4 className="font-medium text-white mb-3">Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Team:</span>
                        <span className="text-white">{formData.teamName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Leader:</span>
                        <span className="text-white">{formData.leaderName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Event:</span>
                        <span className="text-white">{eventTitle}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Members:</span>
                        <span className="text-white">{members.filter(m => m.name).length + 1}</span>
                      </div>
                    </div>
                    <div className="border-t border-neutral-700 mt-3 pt-3">
                      <div className="flex justify-between text-lg font-semibold">
                        <span className="text-white">Total:</span>
                        <span className="text-orange-500">₹{registrationFee.toFixed(0)}</span>
                      </div>
                    </div>
                  </div>

                  {registrationFee > 0 ? (
                    <>
                      {/* QR Code */}
                      <div className="p-5 bg-neutral-800 rounded-lg border border-neutral-700">
                        <div className="flex items-center gap-2 mb-4">
                          <QrCodeIcon className="w-5 h-5 text-orange-500" />
                          <h4 className="font-medium text-white">Scan to Pay</h4>
                        </div>
                        
                        <div className="flex flex-col items-center gap-4">
                          <div className="bg-white p-3 rounded-xl">
                            {qrLoading ? (
                              <div className="w-44 h-44 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                              </div>
                            ) : qrCodeDataUrl ? (
                              <img src={qrCodeDataUrl} alt="Payment QR" className="w-44 h-44" />
                            ) : (
                              <div className="w-44 h-44 flex items-center justify-center bg-neutral-100">
                                <QrCodeIcon className="w-12 h-12 text-neutral-400" />
                              </div>
                            )}
                          </div>
                          
                          <div className="w-full p-3 bg-green-900/30 border border-green-700/50 rounded-lg text-center">
                            <p className="text-green-300 font-semibold">Amount: ₹{registrationFee.toFixed(0)}</p>
                            <p className="text-green-400 text-xs mt-1">Pre-filled in UPI app</p>
                          </div>
                          
                          <div className="text-center">
                            <p className="text-sm text-neutral-400 mb-2">Or pay manually:</p>
                            <div className="flex items-center gap-2 justify-center">
                              <code className="px-3 py-1.5 bg-neutral-700 rounded-lg text-white font-mono text-sm">
                                {upiId}
                              </code>
                              <button
                                type="button"
                                onClick={copyUpiId}
                                className="p-2 hover:bg-neutral-700 rounded-lg"
                              >
                                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-neutral-400" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Payment Details */}
                      <div className="p-4 bg-neutral-800 rounded-lg border border-neutral-700 space-y-4">
                        <h4 className="font-medium text-white">After Payment, Enter:</h4>
                        
                        <div className="space-y-2">
                          <Label htmlFor="transactionId" className="text-sm text-white">
                            Transaction ID / UTR <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="transactionId"
                            name="transactionId"
                            value={paymentData.transactionId}
                            onChange={handlePaymentChange}
                            placeholder="e.g., 123456789012"
                            className="bg-neutral-700 border-neutral-600 text-white"
                            maxLength={12}
                            minLength={12}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="accountHolderName" className="text-sm text-white">
                            Account Holder Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="accountHolderName"
                            name="accountHolderName"
                            value={paymentData.accountHolderName}
                            onChange={handlePaymentChange}
                            placeholder="Name on bank account"
                            className="bg-neutral-700 border-neutral-600 text-white"
                            maxLength={100}
                            minLength={2}
                          />
                        </div>
                      </div>

                      <div className="p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                        <p className="text-sm text-blue-200">
                          <strong>Note:</strong> Payment verification takes up to 24 hours.
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="p-4 bg-green-900/20 border border-green-700/50 rounded-lg">
                      <p className="text-sm text-green-200">
                        <strong>Free Event!</strong> Click below to complete registration.
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Bottom padding for scroll */}
              <div className="h-4"></div>
            </div>
          </div>

          {/* Fixed Footer */}
          <div className="flex-none border-t border-neutral-800 p-4 sm:p-6 bg-neutral-900 rounded-b-2xl">
            <div className="flex gap-3">
              {step > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={goToPrevStep}
                  className="flex-1"
                  disabled={submitStatus === 'processing'}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
              )}
              
              {step < 3 ? (
                <Button
                  type="button"
                  onClick={goToNextStep}
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
                  disabled={submitStatus === 'success' || submitStatus === 'processing' || isSubmitted}
                >
                  {submitStatus === 'processing' ? 'Submitting...' : submitStatus === 'success' ? 'Done!' : 'Complete Registration'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
