"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { XIcon, CheckCircle2, AlertCircle, Plus, X, ArrowLeft, ArrowRight, Users } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

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
  // Multi-step state (1=Details, 2=Members, 3=Payment)
  const [step, setStep] = useState<1 | 2 | 3>(1);
  
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');
  
  // Form data
  const [formData, setFormData] = useState({
    teamName: '',
    leaderName: '',
    leaderEmail: '',
    leaderPhone: '',
    college: '',
  });
  
  // Team members
  const [members, setMembers] = useState<TeamMember[]>([]);
  
  // Parse team size
  const maxTeamSize = parseInt(teamSize.split('-')[1]) || parseInt(teamSize) || 4;
  const minTeamSize = parseInt(teamSize.split('-')[0]) || 1;

  // Parse participation fee (remove ₹ and any non-numeric chars except decimal)
  const baseFee = parseFloat(participationFee.replace(/[^0-9.]/g, '')) || 0;
  
  // Platform fee and tax
  const platformFeeRate = 0.02; // 2%
  const taxRate = 0.18; // 18% GST

  // Calculate totals
  const calculateTotals = () => {
    const platformFee = baseFee * platformFeeRate;
    const tax = (baseFee + platformFee) * taxRate;
    const final = baseFee + platformFee + tax;
    return { baseFee, platformFee, tax, final };
  };

  // Validation for step 1
  const validateStep1 = () => {
    if (!formData.teamName || formData.teamName.length < 3) {
      setSubmitStatus('error');
      setSubmitMessage('Team name must be at least 3 characters');
      return false;
    }
    if (!formData.leaderName || formData.leaderName.length < 2) {
      setSubmitStatus('error');
      setSubmitMessage('Leader name must be at least 2 characters');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.leaderEmail)) {
      setSubmitStatus('error');
      setSubmitMessage('Please enter a valid email address');
      return false;
    }
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.leaderPhone)) {
      setSubmitStatus('error');
      setSubmitMessage('Please enter a valid 10-digit phone number');
      return false;
    }
    if (!formData.college || formData.college.length < 2) {
      setSubmitStatus('error');
      setSubmitMessage('College name is required');
      return false;
    }
    
    return true;
  };

  // Validation for step 2 (team members)
  const validateStep2 = () => {
    // Validate each member that has been added
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;
    
    for (let i = 0; i < members.length; i++) {
      const member = members[i];
      // Only validate if member has any data entered
      if (member.name || member.email || member.phone) {
        if (!member.name || member.name.length < 2) {
          setSubmitStatus('error');
          setSubmitMessage(`Member ${i + 1}: Name must be at least 2 characters`);
          return false;
        }
        if (!member.email || !emailRegex.test(member.email)) {
          setSubmitStatus('error');
          setSubmitMessage(`Member ${i + 1}: Please enter a valid email address`);
          return false;
        }
        if (!member.phone || !phoneRegex.test(member.phone)) {
          setSubmitStatus('error');
          setSubmitMessage(`Member ${i + 1}: Please enter a valid 10-digit phone number`);
          return false;
        }
      }
    }
    
    // Check for duplicate emails
    const validMembers = members.filter(m => m.email);
    const emails = [formData.leaderEmail, ...validMembers.map(m => m.email)];
    const uniqueEmails = new Set(emails);
    if (uniqueEmails.size !== emails.length) {
      setSubmitStatus('error');
      setSubmitMessage('Each team member must have a unique email address');
      return false;
    }
    
    return true;
  };

  // Handle next step
  const goToNextStep = () => {
    setSubmitStatus('idle');
    setSubmitMessage('');
    
    if (step === 1) {
      if (validateStep1()) {
        setStep(2);
      }
    } else if (step === 2) {
      if (validateStep2()) {
        setStep(3);
      }
    }
  };

  const goToPrevStep = () => {
    setSubmitStatus('idle');
    setSubmitMessage('');
    if (step > 1) setStep((s) => (s - 1) as 1 | 2 | 3);
  };

  // Add/remove members
  const addMember = () => {
    if (members.length < maxTeamSize - 1) {
      setMembers([...members, { name: '', email: '', phone: '', college: formData.college }]);
    }
  };

  const removeMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const updateMember = (index: number, field: keyof TeamMember, value: string) => {
    const updated = [...members];
    updated[index][field] = value;
    setMembers(updated);
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setSubmitStatus('processing');
      setSubmitMessage('Creating your registration...');

      // Register for the event
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
        }),
      });

      if (!registerResponse.ok) {
        const error = await registerResponse.json();
        throw new Error(error.error || 'Registration failed');
      }

      const { team_id } = await registerResponse.json();

      // Create Razorpay order
      setSubmitMessage('Preparing payment...');
      const orderResponse = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team_id }),
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create payment order');
      }

      const { order_id, amount, currency, key_id } = await orderResponse.json();

      // Initialize Razorpay
      const options = {
        key: key_id,
        amount: amount,
        currency: currency,
        name: 'Gantavya 2026',
        description: `Registration for ${eventTitle}`,
        order_id: order_id,
        handler: function () {
          setSubmitStatus('success');
          setSubmitMessage('Payment successful! Registration complete. You will receive a confirmation email shortly.');
          
          setTimeout(() => {
            onClose();
          }, 3000);
        },
        prefill: {
          name: formData.leaderName,
          email: formData.leaderEmail,
          contact: formData.leaderPhone,
        },
        theme: {
          color: '#ea580c',
        },
        modal: {
          ondismiss: function() {
            setSubmitStatus('error');
            setSubmitMessage('Payment cancelled. Your registration is saved but payment is pending.');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error: any) {
      setSubmitStatus('error');
      setSubmitMessage(error.message || 'Registration failed. Please try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-neutral-900 rounded-2xl border border-neutral-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 border-b border-neutral-800 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Register for {eventTitle}</h2>
              <p className="text-sm text-neutral-400">
                Fill in the details below to register your team
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
              aria-label="Close"
            >
              <XIcon className="w-5 h-5 text-neutral-400" />
            </button>
          </div>
          
          {/* Step Indicator */}
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <div className={`px-3 py-1 rounded-full text-sm ${step === 1 ? 'bg-orange-600 text-white' : step > 1 ? 'bg-green-600 text-white' : 'bg-neutral-800 text-neutral-400'}`}>
              1. Details
            </div>
            <div className={`px-3 py-1 rounded-full text-sm ${step === 2 ? 'bg-orange-600 text-white' : step > 2 ? 'bg-green-600 text-white' : 'bg-neutral-800 text-neutral-400'}`}>
              2. Members
            </div>
            <div className={`px-3 py-1 rounded-full text-sm ${step === 3 ? 'bg-orange-600 text-white' : 'bg-neutral-800 text-neutral-400'}`}>
              3. Payment
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-6">
              {/* Success/Error Messages */}
              {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-900/30 border border-green-700 rounded-lg flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-green-300">Registration Successful!</h3>
                    <p className="text-sm text-green-200 mt-1">{submitMessage}</p>
                  </div>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-300">Error</h3>
                    <p className="text-sm text-red-200 mt-1">{submitMessage}</p>
                  </div>
                </div>
              )}

              {/* Step 1: Basic Details */}
              {step === 1 && (
                <div className="space-y-6">
                  {/* Event Info */}
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

                  {/* Team Name */}
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
                    />
                  </div>

                  {/* Team Leader Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white border-b border-neutral-800 pb-2">
                      Team Leader Details
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Team Members */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-orange-600/20 rounded-lg">
                      <Users className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Add Team Members</h3>
                      <p className="text-sm text-neutral-400">
                        Add your teammates (Team size: {minTeamSize}-{maxTeamSize})
                      </p>
                    </div>
                  </div>
                  
                  {/* Leader Info Card */}
                  <div className="p-4 bg-neutral-800/50 rounded-lg border border-neutral-700">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-orange-600 text-white text-xs rounded-full">Captain</span>
                    </div>
                    <div className="text-sm">
                      <p className="text-white font-medium">{formData.leaderName}</p>
                      <p className="text-neutral-400">{formData.leaderEmail} • {formData.leaderPhone}</p>
                      <p className="text-neutral-500">{formData.college}</p>
                    </div>
                  </div>

                  {/* Add Members Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-300">
                        Team Members: {members.length + 1}/{maxTeamSize}
                      </span>
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
                      <div className="p-8 border-2 border-dashed border-neutral-700 rounded-lg text-center">
                        <Users className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                        <p className="text-neutral-400 text-sm">No team members added yet</p>
                        <p className="text-neutral-500 text-xs mt-1">
                          {minTeamSize > 1 
                            ? `You need at least ${minTeamSize - 1} more member(s)` 
                            : 'You can continue without adding members'}
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
                                className="p-1 hover:bg-neutral-700 rounded text-red-400 hover:text-red-300"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <Label className="text-xs text-neutral-500">Name *</Label>
                                <Input
                                  placeholder="Full Name"
                                  value={member.name}
                                  onChange={(e) => updateMember(index, 'name', e.target.value)}
                                  className="bg-neutral-800 border-neutral-700 text-white text-sm"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs text-neutral-500">Email *</Label>
                                <Input
                                  placeholder="email@example.com"
                                  type="email"
                                  value={member.email}
                                  onChange={(e) => updateMember(index, 'email', e.target.value)}
                                  className="bg-neutral-800 border-neutral-700 text-white text-sm"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs text-neutral-500">Phone *</Label>
                                <Input
                                  placeholder="10-digit number"
                                  value={member.phone}
                                  onChange={(e) => updateMember(index, 'phone', e.target.value)}
                                  className="bg-neutral-800 border-neutral-700 text-white text-sm"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs text-neutral-500">College</Label>
                                <Input
                                  placeholder="College/Institution"
                                  value={member.college}
                                  onChange={(e) => updateMember(index, 'college', e.target.value)}
                                  className="bg-neutral-800 border-neutral-700 text-white text-sm"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {members.length < maxTeamSize - 1 && (
                      <p className="text-xs text-neutral-500">
                        You can add up to {maxTeamSize - 1 - members.length} more member(s).
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Payment Summary */}
              {step === 3 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white">Payment & Confirmation</h3>
                  
                  {/* Summary Card */}
                  <div className="p-4 bg-neutral-800 rounded-lg border border-neutral-700">
                    <h4 className="font-medium text-white mb-3">Registration Summary</h4>
                    
                    <div className="space-y-2 text-sm text-neutral-300">
                      <div className="flex justify-between">
                        <span>Team Name:</span>
                        <span className="text-white font-medium">{formData.teamName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Leader:</span>
                        <span className="text-white">{formData.leaderName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Email:</span>
                        <span className="text-white">{formData.leaderEmail}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>College:</span>
                        <span className="text-white">{formData.college}</span>
                      </div>
                      {members.filter(m => m.name && m.email && m.phone).length > 0 && (
                        <div className="flex justify-between">
                          <span>Team Members:</span>
                          <span className="text-white">{members.filter(m => m.name && m.email && m.phone).length}</span>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-neutral-700 mt-4 pt-4">
                      <h5 className="text-sm font-medium text-white mb-2">Event:</h5>
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-300">{eventTitle}</span>
                        <span className="text-white">{participationFee}</span>
                      </div>
                    </div>

                    {/* Totals */}
                    <div className="border-t border-neutral-700 mt-4 pt-4 space-y-2 text-sm">
                      {(() => {
                        const totals = calculateTotals();
                        return (
                          <>
                            <div className="flex justify-between text-neutral-300">
                              <span>Base Total:</span>
                              <span>₹{totals.baseFee.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-neutral-300">
                              <span>Platform Fee (2%):</span>
                              <span>₹{totals.platformFee.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-neutral-300">
                              <span>GST (18%):</span>
                              <span>₹{totals.tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-white font-semibold text-base pt-2 border-t border-neutral-700">
                              <span>Total Payable:</span>
                              <span>₹{totals.final.toFixed(2)}</span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Info Note */}
                  <div className="p-4 bg-orange-900/20 border border-orange-700/50 rounded-lg">
                    <p className="text-sm text-orange-200">
                      <strong>Note:</strong> After clicking &quot;Pay &amp; Register&quot;, you&apos;ll be redirected to Razorpay to complete payment securely. A confirmation email will be sent upon successful payment.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Fixed Footer */}
        <div className="flex-shrink-0 border-t border-neutral-800 p-6">
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
                onClick={onClose}
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
                disabled={submitStatus === 'success' || submitStatus === 'processing'}
              >
                {submitStatus === 'processing' ? 'Processing...' : submitStatus === 'success' ? 'Registered!' : 'Pay & Register'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
