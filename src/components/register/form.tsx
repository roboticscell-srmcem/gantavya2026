"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { XIcon, CheckCircle2, AlertCircle } from 'lucide-react';

interface RegistrationFormProps {
  eventTitle: string;
  eventSlug: string;
  participationFee: string;
  teamSize: string;
  onClose: () => void;
}

export function RegistrationForm({
  eventTitle,
  participationFee,
  teamSize,
  onClose,
}: RegistrationFormProps) {
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');
  const [formData, setFormData] = useState({
    teamName: '',
    leaderName: '',
    leaderEmail: '',
    leaderPhone: '',
    college: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.teamName || !formData.leaderName || !formData.leaderEmail || !formData.leaderPhone || !formData.college) {
      setSubmitStatus('error');
      setSubmitMessage('Please fill in all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.leaderEmail)) {
      setSubmitStatus('error');
      setSubmitMessage('Please enter a valid email address');
      return;
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.leaderPhone)) {
      setSubmitStatus('error');
      setSubmitMessage('Please enter a valid 10-digit phone number');
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitStatus('success');
      setSubmitMessage('Registration successful! You will receive a confirmation email shortly.');
      
      // Reset form after 3 seconds and close
      setTimeout(() => {
        setFormData({
          teamName: '',
          leaderName: '',
          leaderEmail: '',
          leaderPhone: '',
          college: '',
        });
        onClose();
      }, 3000);
    } catch (error) {
      setSubmitStatus('error');
      setSubmitMessage('Registration failed. Please try again.');
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
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-neutral-900 rounded-2xl border border-neutral-800">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-neutral-900 border-b border-neutral-800 p-6">
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
        </div>

        {/* Success/Error Messages */}
        {submitStatus === 'success' && (
          <div className="mx-6 mt-6 p-4 bg-green-900/30 border border-green-700 rounded-lg flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-300">Registration Successful!</h3>
              <p className="text-sm text-green-200 mt-1">{submitMessage}</p>
            </div>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="mx-6 mt-6 p-4 bg-red-900/30 border border-red-700 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-300">Registration Failed</h3>
              <p className="text-sm text-red-200 mt-1">{submitMessage}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
              required
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
                  required
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
                  required
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
                  required
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
                  required
                />
              </div>
            </div>
          </div>

          {/* Info Note */}
          <div className="p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
            <p className="text-sm text-blue-200">
              <strong>Note:</strong> You can add team members after completing initial registration. 
              A confirmation email will be sent with further instructions.
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={submitStatus === 'success'}
            >
              {submitStatus === 'success' ? 'Registered!' : 'Register Now'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
