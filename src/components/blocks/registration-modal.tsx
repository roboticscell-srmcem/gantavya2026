"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Plus, Trash2, CreditCard, CheckCircle2 } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface Event {
  slug: string;
  name: string;
  minTeamSize: number;
  maxTeamSize: number;
  prize: string;
}

interface RegistrationModalProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
}

export default function RegistrationModal({ event, isOpen, onClose }: RegistrationModalProps) {
  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
  
  // Form states
  const [teamName, setTeamName] = useState('');
  const [captainName, setCaptainName] = useState('');
  const [captainEmail, setCaptainEmail] = useState('');
  const [college, setCollege] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  // Payment states
  const [upiId, setUpiId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize minimum team members
  const initializeTeamMembers = () => {
    const initialMembers: TeamMember[] = [];
    for (let i = 0; i < event.minTeamSize - 1; i++) {
      initialMembers.push({
        id: `member-${i}`,
        name: '',
        email: '',
        phone: ''
      });
    }
    setTeamMembers(initialMembers);
  };

  const addMember = () => {
    if (teamMembers.length < event.maxTeamSize - 1) {
      setTeamMembers([
        ...teamMembers,
        {
          id: `member-${Date.now()}`,
          name: '',
          email: '',
          phone: ''
        }
      ]);
    }
  };

  const removeMember = (id: string) => {
    if (teamMembers.length > event.minTeamSize - 1) {
      setTeamMembers(teamMembers.filter(member => member.id !== id));
    }
  };

  const updateMember = (id: string, field: keyof TeamMember, value: string) => {
    setTeamMembers(teamMembers.map(member => 
      member.id === id ? { ...member, [field]: value } : member
    ));
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate form
    if (!teamName || !captainName || !captainEmail || !college || !contactNumber) {
      alert('Please fill all required fields');
      return;
    }
    
    // Check if all team members are filled
    const allMembersFilled = teamMembers.every(m => m.name && m.email && m.phone);
    if (!allMembersFilled) {
      alert('Please fill all team member details');
      return;
    }

    setStep('payment');
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create registration data
    const registrationData = {
      event: event.name,
      teamName,
      captain: {
        name: captainName,
        email: captainEmail,
        contactNumber,
      },
      college,
      teamMembers: teamMembers.map(m => ({
        name: m.name,
        email: m.email,
        phone: m.phone
      })),
      totalMembers: teamMembers.length + 1,
      payment: {
        amount: '500', // You can make this dynamic
        transactionId: `TXN${Date.now()}`,
        timestamp: new Date().toISOString()
      }
    };

    // Call webhook
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      if (response.ok) {
        setIsProcessing(false);
        setStep('success');
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    // Reset form
    setStep('details');
    setTeamName('');
    setCaptainName('');
    setCaptainEmail('');
    setCollege('');
    setContactNumber('');
    setTeamMembers([]);
    setUpiId('');
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleClose();
    } else {
      // Initialize team members when opening
      if (teamMembers.length === 0) {
        initializeTeamMembers();
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-[var(--color-bg-charcoal)] border-2 border-[var(--color-primary-cyan)]/30 text-white p-0 overflow-hidden">
        {step === 'details' && (
          <>
            <DialogHeader className="p-6 border-b border-[var(--color-primary-cyan)]/20">
              <DialogTitle className="text-2xl font-orbitron font-bold text-[var(--color-primary-cyan)]">
                Register for {event.name}
              </DialogTitle>
              <DialogDescription className="text-[var(--color-text-secondary)] font-inter">
                Fill in your team details to register for this event
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="h-[60vh] overflow-y-auto">
              <div className="p-6">
                <form onSubmit={handleDetailsSubmit} className="space-y-6">
                {/* Team Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-orbitron font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                    <span className="w-1 h-5 bg-[var(--color-primary-cyan)]"></span>
                    Team Information
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="teamName" className="text-[var(--color-text-secondary)] font-space-mono text-sm">
                        Team Name *
                      </Label>
                      <Input
                        id="teamName"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        className="bg-[var(--color-bg-slate)] border-[var(--color-primary-cyan)]/30 text-white focus:border-[var(--color-primary-cyan)]"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="college" className="text-[var(--color-text-secondary)] font-space-mono text-sm">
                        College/Institution *
                      </Label>
                      <Input
                        id="college"
                        value={college}
                        onChange={(e) => setCollege(e.target.value)}
                        className="bg-[var(--color-bg-slate)] border-[var(--color-primary-cyan)]/30 text-white focus:border-[var(--color-primary-cyan)]"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Captain Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-orbitron font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                    <span className="w-1 h-5 bg-[var(--color-primary-cyan)]"></span>
                    Team Captain
                  </h3>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="captainName" className="text-[var(--color-text-secondary)] font-space-mono text-sm">
                        Full Name *
                      </Label>
                      <Input
                        id="captainName"
                        value={captainName}
                        onChange={(e) => setCaptainName(e.target.value)}
                        className="bg-[var(--color-bg-slate)] border-[var(--color-primary-cyan)]/30 text-white focus:border-[var(--color-primary-cyan)]"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="captainEmail" className="text-[var(--color-text-secondary)] font-space-mono text-sm">
                        Email *
                      </Label>
                      <Input
                        id="captainEmail"
                        type="email"
                        value={captainEmail}
                        onChange={(e) => setCaptainEmail(e.target.value)}
                        className="bg-[var(--color-bg-slate)] border-[var(--color-primary-cyan)]/30 text-white focus:border-[var(--color-primary-cyan)]"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactNumber" className="text-[var(--color-text-secondary)] font-space-mono text-sm">
                        Contact Number *
                      </Label>
                      <Input
                        id="contactNumber"
                        type="tel"
                        value={contactNumber}
                        onChange={(e) => setContactNumber(e.target.value)}
                        className="bg-[var(--color-bg-slate)] border-[var(--color-primary-cyan)]/30 text-white focus:border-[var(--color-primary-cyan)]"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Team Members */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-orbitron font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                      <span className="w-1 h-5 bg-[var(--color-primary-cyan)]"></span>
                      Team Members ({teamMembers.length + 1}/{event.maxTeamSize})
                    </h3>
                    {teamMembers.length < event.maxTeamSize - 1 && (
                      <Button
                        type="button"
                        onClick={addMember}
                        className="bg-[var(--color-primary-cyan)]/20 hover:bg-[var(--color-primary-cyan)]/30 text-[var(--color-primary-cyan)] border border-[var(--color-primary-cyan)]/30"
                        size="sm"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Member
                      </Button>
                    )}
                  </div>

                  {teamMembers.map((member, index) => (
                    <div
                      key={member.id}
                      className="border border-[var(--color-primary-cyan)]/20 bg-[var(--color-bg-slate)]/30 p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-space-mono text-[var(--color-primary-cyan)]">
                          Member {index + 2}
                        </span>
                        {teamMembers.length > event.minTeamSize - 1 && (
                          <Button
                            type="button"
                            onClick={() => removeMember(member.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <Input
                          placeholder="Full Name"
                          value={member.name}
                          onChange={(e) => updateMember(member.id, 'name', e.target.value)}
                          className="bg-[var(--color-bg-slate)] border-[var(--color-primary-cyan)]/30 text-white"
                          required
                        />
                        <Input
                          placeholder="Email"
                          type="email"
                          value={member.email}
                          onChange={(e) => updateMember(member.id, 'email', e.target.value)}
                          className="bg-[var(--color-bg-slate)] border-[var(--color-primary-cyan)]/30 text-white"
                          required
                        />
                        <Input
                          placeholder="Phone"
                          type="tel"
                          value={member.phone}
                          onChange={(e) => updateMember(member.id, 'phone', e.target.value)}
                          className="bg-[var(--color-bg-slate)] border-[var(--color-primary-cyan)]/30 text-white"
                          required
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-primary-cyan)]/20">
                  <Button
                    type="button"
                    onClick={handleClose}
                    variant="outline"
                    className="border-[var(--color-primary-cyan)]/30 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-slate)]"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[var(--color-primary-cyan)] hover:bg-[var(--color-primary-cyan)]/80 text-[var(--color-bg-black)] font-orbitron font-bold"
                  >
                    Proceed to Payment
                  </Button>
                </div>
              </form>
              </div>
            </ScrollArea>
          </>
        )}

        {step === 'payment' && (
          <>
            <DialogHeader className="p-6 border-b border-[var(--color-primary-cyan)]/20">
              <DialogTitle className="text-2xl font-orbitron font-bold text-[var(--color-primary-cyan)]">
                Payment Details
              </DialogTitle>
              <DialogDescription className="text-[var(--color-text-secondary)] font-inter">
                Complete your registration by making the payment
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="h-[60vh] overflow-y-auto">
              <div className="p-6">
                <form onSubmit={handlePayment} className="space-y-6">
                  {/* Payment Summary */}
                  <div className="border border-[var(--color-primary-orange)]/30 bg-[var(--color-bg-slate)]/30 p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[var(--color-text-secondary)] font-inter">Event</span>
                      <span className="text-[var(--color-text-primary)] font-orbitron">{event.name}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[var(--color-text-secondary)] font-inter">Team</span>
                      <span className="text-[var(--color-text-primary)] font-inter">{teamName}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[var(--color-text-secondary)] font-inter">Members</span>
                      <span className="text-[var(--color-text-primary)] font-inter">{teamMembers.length + 1}</span>
                    </div>
                    <div className="h-px bg-[var(--color-primary-cyan)]/20 my-3"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--color-primary-orange)] font-orbitron font-bold">Total Amount</span>
                      <span className="text-2xl text-[var(--color-primary-orange)] font-orbitron font-bold">₹500</span>
                    </div>
                  </div>

                  {/* UPI Payment Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-orbitron font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                      <svg className="w-5 h-5 text-[var(--color-primary-cyan)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      UPI Payment
                    </h3>

                    {/* Payment Provider Notice */}
                    <div className="border border-[var(--color-primary-orange)]/30 bg-[var(--color-primary-orange)]/5 p-4 rounded">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-[var(--color-primary-orange)] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-[var(--color-primary-orange)] font-semibold font-inter text-sm mb-1">
                            Payment Gateway Integration Pending
                          </p>
                          <p className="text-[var(--color-text-secondary)] font-inter text-sm">
                            The payment provider is currently being set up. You can continue with registration and complete payment later.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="upiId" className="text-[var(--color-text-secondary)] font-space-mono text-sm">
                        UPI ID (Optional)
                      </Label>
                      <Input
                        id="upiId"
                        placeholder="yourname@upi"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="bg-[var(--color-bg-slate)] border-[var(--color-primary-cyan)]/30 text-white focus:border-[var(--color-primary-cyan)]"
                      />
                      <p className="text-xs text-[var(--color-text-tertiary)] font-inter">
                        Enter your UPI ID for future payment processing
                      </p>
                    </div>

                    {/* QR Code Placeholder */}
                    <div className="border border-[var(--color-primary-cyan)]/20 bg-[var(--color-bg-slate)]/20 p-6 text-center">
                      <div className="w-48 h-48 mx-auto bg-[var(--color-bg-slate)]/50 border-2 border-dashed border-[var(--color-primary-cyan)]/30 flex items-center justify-center">
                        <div className="text-center">
                          <svg className="w-12 h-12 mx-auto text-[var(--color-primary-cyan)]/30 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                          </svg>
                          <p className="text-[var(--color-text-tertiary)] text-sm font-inter">UPI QR Code</p>
                          <p className="text-[var(--color-text-tertiary)] text-xs font-inter">Will be available soon</p>
                        </div>
                      </div>
                      <p className="text-[var(--color-text-secondary)] text-sm font-inter mt-4">
                        Scan QR code with any UPI app to pay
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between gap-3 pt-4 border-t border-[var(--color-primary-cyan)]/20">
                    <Button
                      type="button"
                      onClick={() => setStep('details')}
                      variant="outline"
                      className="border-[var(--color-primary-cyan)]/30 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-slate)]"
                      disabled={isProcessing}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="bg-[var(--color-primary-cyan)] hover:bg-[var(--color-primary-cyan)]/80 text-[var(--color-bg-black)] font-orbitron font-bold"
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Continue to Confirmation'}
                    </Button>
                  </div>
                </form>
              </div>
            </ScrollArea>
          </>
        )}

        {step === 'success' && (
          <div className="p-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-orbitron font-bold text-[var(--color-primary-cyan)]">
                Registration Successful!
              </h2>
              <p className="text-[var(--color-text-secondary)] font-inter">
                You have successfully registered for {event.name}
              </p>
            </div>

            <div className="border border-[var(--color-primary-cyan)]/30 bg-[var(--color-bg-slate)]/30 p-6 space-y-3 text-left">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Team Name</span>
                <span className="text-[var(--color-text-primary)] font-semibold">{teamName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Captain</span>
                <span className="text-[var(--color-text-primary)] font-semibold">{captainName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Email</span>
                <span className="text-[var(--color-text-primary)] font-semibold">{captainEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Transaction ID</span>
                <span className="text-[var(--color-primary-cyan)] font-space-mono">TXN{Date.now()}</span>
              </div>
            </div>

            <p className="text-sm text-[var(--color-text-tertiary)] font-inter">
              A confirmation email with your registration details and event lanyard has been sent to {captainEmail}
            </p>

            <Button
              onClick={handleClose}
              className="bg-[var(--color-primary-cyan)] hover:bg-[var(--color-primary-cyan)]/80 text-[var(--color-bg-black)] font-orbitron font-bold w-full"
            >
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
