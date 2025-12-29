import React, { useState, useEffect } from 'react';
import { Input } from './Input';
import { Select } from './Select';
import { TextArea } from './TextArea';
import { Checkbox } from './Checkbox';
import { FileUpload } from './FileUpload';
import { TradeFormData } from '../types';

const INITIAL_DATA: TradeFormData = {
  businessEmail: '',
  firstName: '',
  lastName: '',
  companyName: '',
  title: '',
  country: 'US',
  phone: '',
  streetAddress: '',
  aptSuite: '',
  city: '',
  state: '',
  zipCode: '',
  role: '',
  roleOther: '',
  businessFocus: '',
  website: '',
  source: '',
  sourceOther: '',
  referralEmail: '',
  message: '',
  agreeToTerms: false,
  subscribeToUpdates: false,
};

// Mock Backend API
const mockApi = {
  saveDraft: async (email: string, data: TradeFormData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`[API] Saved draft for ${email}`, data);
        localStorage.setItem(`trade_draft_${email}`, JSON.stringify(data));
        resolve({ success: true });
      }, 600);
    });
  },
  getDraft: async (email: string) => {
    return new Promise<TradeFormData | null>((resolve) => {
        const stored = localStorage.getItem(`trade_draft_${email}`);
        resolve(stored ? JSON.parse(stored) : null);
    })
  },
  submitApplication: async (data: TradeFormData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('[API] Application Submitted', data);
        resolve({ success: true });
      }, 1500);
    });
  }
};

export const TradeForm: React.FC = () => {
  const [formData, setFormData] = useState<TradeFormData>(INITIAL_DATA);
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalSteps = 2;

  // Auto-restore draft if email is entered and matches a saved draft
  const handleEmailBlur = async () => {
    if (formData.businessEmail && step === 1) {
        const draft = await mockApi.getDraft(formData.businessEmail);
        if (draft) {
            // Restore draft, but keep current email just in case
            setFormData({ ...draft, businessEmail: formData.businessEmail });
        }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({ ...prev, [name]: newValue }));
    
    // Clear error for this field
    if (errors[name]) {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[name];
            return newErrors;
        });
    }
  };

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (currentStep === 1) {
        if (!formData.businessEmail) newErrors.businessEmail = 'Business Email is required';
        if (!formData.firstName) newErrors.firstName = 'First Name is required';
        if (!formData.lastName) newErrors.lastName = 'Last Name is required';
        if (!formData.companyName) newErrors.companyName = 'Company Name is required';
    } else if (currentStep === 2) {
        if (!formData.country) newErrors.country = 'Country is required';
        if (!formData.phone) newErrors.phone = 'Phone is required';
        if (!formData.streetAddress) newErrors.streetAddress = 'Address is required';
        if (!formData.city) newErrors.city = 'City is required';
        if (!formData.state) newErrors.state = 'State is required';
        if (!formData.zipCode) newErrors.zipCode = 'ZIP Code is required';
        
        if (!formData.role) newErrors.role = 'Role is required';
        if (!formData.businessFocus) newErrors.businessFocus = 'Business focus is required';
        if (!formData.website) newErrors.website = 'Website or social media is required';

        if (formData.source === 'other' && !formData.sourceOther) newErrors.sourceOther = 'Please specify how you heard about us';
        
        if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms';
        if (!formData.subscribeToUpdates) newErrors.subscribeToUpdates = 'Please confirm subscription';
    }

    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        isValid = false;
    }

    return isValid;
  };

  const handleNext = async () => {
    if (!validateStep(step)) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    setIsProcessing(true);

    // Auto-save logic on Step 1 completion
    if (step === 1) {
        await mockApi.saveDraft(formData.businessEmail, formData);
    }
    
    // Slight delay for UX
    setTimeout(() => {
        setStep(prev => Math.min(prev + 1, totalSteps));
        setIsProcessing(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 400);
  };

  const handleBack = () => {
    setStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(step)) return;

    setIsProcessing(true);
    await mockApi.submitApplication(formData);
    
    setIsProcessing(false);
    setSubmitted(true);
    window.scrollTo(0, 0);
  };

  if (submitted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center animate-fade-in bg-secondary rounded-lg border border-gray-200">
        <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-white p-4 border border-gray-100 shadow-sm">
                <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            </div>
        </div>
        <h2 className="text-3xl font-light mb-4 text-primary">Application Received</h2>
        <p className="text-primary/70 max-w-lg mx-auto mb-8">
          Almost ready! We have sent you a <strong className="font-semibold text-primary">confirmation email</strong> where you can <strong className="font-semibold text-primary">activate your account</strong>.<br/>
          You'll be notified as soon as your application is approved and you can start enjoying all the benefits of our Trade Program!
        </p>
        <div className="flex gap-4 justify-center">
             <button 
                onClick={() => { setSubmitted(false); setFormData(INITIAL_DATA); setStep(1); }}
                className="px-8 py-3 bg-primary text-white text-sm font-medium tracking-widest uppercase hover:bg-primary/90 transition-colors rounded-sm"
            >
                Return to Home
            </button>
        </div>
      </div>
    );
  }

  // Progress Bar
  const progressPercentage = step === 1 ? 50 : 100;

  return (
    <div className="max-w-5xl mx-auto">
      
      {/* Progress Indicator */}
      <div className="mb-12">
        <div className="flex justify-between items-end mb-2">
            <h2 className="text-sm font-bold uppercase tracking-widest text-primary">
                Step {step} of {totalSteps}
            </h2>
            <span className="text-xs text-primary/60 font-medium uppercase tracking-wider">
                {step === 1 ? 'Account Access' : 'Business Info'}
            </span>
        </div>
        <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
            <div 
                className="h-full bg-primary transition-all duration-500 ease-out" 
                style={{ width: `${progressPercentage}%` }}
            ></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Step 1: Account Access */}
        {step === 1 && (
            <section className="bg-secondary -mx-4 px-6 py-10 md:p-12 rounded-lg border border-gray-100 animate-fade-in">
                <h2 className="text-2xl font-light text-primary mb-6">Account Access</h2>
                <p className="text-primary/70 mb-8 font-light">
                    Please list the individuals authorized to access and place orders under your Trade account.
                    <br/> <span className="text-xs text-primary/50 mt-1 block">* Indicates required field</span>
                </p>

                <div className="grid grid-cols-1 gap-8">
                    <Input
                        label="Business Email"
                        name="businessEmail"
                        type="email"
                        required
                        placeholder="e.g. design@studio.com"
                        value={formData.businessEmail}
                        onChange={handleChange}
                        onBlur={handleEmailBlur}
                        error={errors.businessEmail}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Input
                            label="First Name"
                            name="firstName"
                            required
                            value={formData.firstName}
                            onChange={handleChange}
                            error={errors.firstName}
                        />
                        <Input
                            label="Last Name"
                            name="lastName"
                            required
                            value={formData.lastName}
                            onChange={handleChange}
                            error={errors.lastName}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Input
                            label="Company Name"
                            name="companyName"
                            required
                            value={formData.companyName}
                            onChange={handleChange}
                            error={errors.companyName}
                        />
                        <Input
                            label="Title (Optional)"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                        />
                    </div>
                </div>
            </section>
        )}

        {/* Step 2: Business Info & Final Details */}
        {step === 2 && (
            <section className="bg-secondary -mx-4 px-6 py-10 md:p-12 rounded-lg border border-gray-100 animate-fade-in">
                <h2 className="text-2xl font-light text-primary mb-8">Tell Us About Your Business</h2>

                <div className="grid grid-cols-1 gap-8">
                    {/* Address Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Select
                            label="Country"
                            name="country"
                            required
                            value={formData.country}
                            onChange={handleChange}
                            error={errors.country}
                            options={[
                                { label: 'United States', value: 'US' },
                                { label: 'Canada', value: 'CA' },
                                { label: 'United Kingdom', value: 'UK' },
                                { label: 'Australia', value: 'AU' },
                            ]}
                        />
                        <Input
                            label="Phone"
                            name="phone"
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={handleChange}
                            error={errors.phone}
                        />
                    </div>

                    <Input
                        label="Street Address"
                        name="streetAddress"
                        required
                        value={formData.streetAddress}
                        onChange={handleChange}
                        error={errors.streetAddress}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        <div className="md:col-span-3">
                            <Input label="Apt/Suite" name="aptSuite" value={formData.aptSuite} onChange={handleChange} />
                        </div>
                        <div className="md:col-span-3">
                            <Input label="City" name="city" required value={formData.city} onChange={handleChange} error={errors.city} />
                        </div>
                        <div className="md:col-span-3">
                            <Input label="State" name="state" required value={formData.state} onChange={handleChange} error={errors.state} />
                        </div>
                        <div className="md:col-span-3">
                            <Input label="ZIP Code" name="zipCode" required value={formData.zipCode} onChange={handleChange} error={errors.zipCode} />
                        </div>
                    </div>

                    {/* Role & Business Focus Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex flex-col gap-2">
                            <Select
                                label="What best describes your role?"
                                name="role"
                                required
                                value={formData.role}
                                onChange={handleChange}
                                error={errors.role}
                                options={[
                                    { label: 'Interior Designer / Decorator', value: 'designer' },
                                    { label: 'Architect', value: 'architect' },
                                    { label: 'Home Stager / Real Estate Styling', value: 'stager' },
                                    { label: 'Real Estate Developer / Investor', value: 'developer' },
                                    { label: 'Hospitality Professional', value: 'hospitality' },
                                    { label: 'Procurement / Sourcing Firm', value: 'procurement' },
                                    { label: 'Design Showroom', value: 'showroom' },
                                    { label: 'Home Decor Retailer', value: 'retailer' },
                                    { label: 'Other', value: 'other' },
                                ]}
                            />
                        </div>

                        <Select
                            label="Primary Business Focus"
                            name="businessFocus"
                            required
                            value={formData.businessFocus}
                            onChange={handleChange}
                            error={errors.businessFocus}
                            options={[
                                { label: 'Residential (Single Family)', value: 'residential_single' },
                                { label: 'Multi-Unit Residential', value: 'residential_multi' },
                                { label: 'Commercial', value: 'commercial' },
                                { label: 'Hospitality', value: 'hospitality' },
                                { label: 'Multi-Disciplinary', value: 'multi' },
                            ]}
                        />
                    </div>

                    <Input 
                        label="Company website or social media page"
                        name="website"
                        required
                        value={formData.website}
                        onChange={handleChange}
                        error={errors.website}
                        placeholder="e.g. www.yourcompany.com"
                    />

                    {/* Upload Section */}
                    <div className="bg-white p-6 rounded-md border border-gray-100">
                        <FileUpload 
                            label="Upload Credentials" 
                            required
                            accept=".pdf,.jpg,.jpeg,.png"
                            footerText="Please Upload up to 5 PDF, JPG, or PNG files, each under 10MB."
                            guidelines={
                                <ul className="list-disc pl-4 space-y-1">
                                    <li>Business license or resale certificate</li>
                                    <li>Business card</li>
                                    <li>Membership in design associations (e.g., ASID, IIDA)</li>
                                    <li>Interior design certification (e.g., NCIDQ)</li>
                                </ul>
                            }
                        />
                    </div>

                    {/* Source */}
                    <div className="flex flex-col gap-2">
                        <Select
                            label="How did you hear about the TWOPAGES Trade Program? (optional)"
                            name="source"
                            value={formData.source}
                            onChange={handleChange}
                            options={[
                                { label: 'Referral/Word of Mouth', value: 'referral' },
                                { label: 'Online Search', value: 'online_search' },
                                { label: 'Instagram', value: 'instagram' },
                                { label: 'Facebook', value: 'facebook' },
                                { label: 'Amazon', value: 'amazon' },
                                { label: 'Pinterest', value: 'pinterest' },
                                { label: 'Houzz', value: 'houzz' },
                                { label: 'Youtube', value: 'youtube' },
                                { label: 'Tiktok', value: 'tiktok' },
                                { label: 'Facebook group', value: 'facebook_group' },
                                { label: 'Press', value: 'press' },
                                { label: 'Design Professional', value: 'design_professional' },
                                { label: 'Other', value: 'other' },
                            ]}
                        />
                         {formData.source === 'other' && (
                            <Input 
                                label="Please specify"
                                name="sourceOther"
                                required
                                value={formData.sourceOther}
                                onChange={handleChange}
                                error={errors.sourceOther}
                                placeholder="Please specify"
                            />
                        )}
                    </div>

                    <TextArea
                        label="Message"
                        name="message"
                        placeholder="Have a specific project or request in mind?"
                        value={formData.message}
                        onChange={handleChange}
                    />

                    {/* Confirmation Checkboxes */}
                    <div className="flex flex-col gap-4 pt-4">
                        <div className={`p-4 rounded-lg border flex flex-col justify-center ${errors.agreeToTerms ? 'border-red-300 bg-red-50' : 'border-gray-100 bg-white'}`}>
                            <Checkbox
                                name="agreeToTerms"
                                required
                                checked={formData.agreeToTerms}
                                onChange={handleChange}
                                label={
                                <span>
                                    I agree to the Trade Program's <a href="#" className="underline decoration-1 underline-offset-2 hover:text-primary font-medium">Privacy Policy</a> and <a href="#" className="underline decoration-1 underline-offset-2 hover:text-primary font-medium">Terms of Use</a>.
                                </span>
                                }
                            />
                            {errors.agreeToTerms && <p className="text-red-500 text-xs mt-2 ml-8">{errors.agreeToTerms}</p>}
                        </div>
                        <div className={`p-4 rounded-lg border flex flex-col justify-center ${errors.subscribeToUpdates ? 'border-red-300 bg-red-50' : 'border-gray-100 bg-white'}`}>
                            <Checkbox
                                name="subscribeToUpdates"
                                required
                                checked={formData.subscribeToUpdates}
                                onChange={handleChange}
                                label="Yes, I would like to receive bi-weekly email updates for Trade Professionals."
                            />
                             {errors.subscribeToUpdates && <p className="text-red-500 text-xs mt-2 ml-8">{errors.subscribeToUpdates}</p>}
                        </div>
                    </div>
                </div>
            </section>
        )}

        {/* Navigation Buttons */}
        <div className="pt-8 border-t border-gray-100 flex flex-col-reverse md:flex-row justify-between items-center gap-4">
            {step > 1 ? (
                <button
                    type="button"
                    onClick={handleBack}
                    className="w-full md:w-auto px-8 py-3 text-primary font-semibold text-xs tracking-widest uppercase hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all rounded-sm"
                >
                    Back
                </button>
            ) : (
                <div className="hidden md:block"></div> /* Spacer */
            )}

            {step < totalSteps ? (
                <button
                    type="button"
                    onClick={handleNext}
                    disabled={isProcessing}
                    className="w-full md:w-auto px-12 py-4 bg-primary text-white font-medium text-sm tracking-widest uppercase hover:bg-primary/90 focus:ring-4 focus:ring-primary/20 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed rounded-sm shadow-md"
                >
                    {isProcessing ? 'Saving...' : 'Next Step'}
                </button>
            ) : (
                <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full md:w-auto px-12 py-4 bg-primary text-white font-medium text-sm tracking-widest uppercase hover:bg-primary/90 focus:ring-4 focus:ring-primary/20 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed rounded-sm shadow-md"
                >
                    {isProcessing ? 'Submitting...' : 'Apply Now'}
                </button>
            )}
        </div>

      </form>
    </div>
  );
};