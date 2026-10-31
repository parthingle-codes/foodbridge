import { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { otpService } from '../services';
import toast from 'react-hot-toast';
import {
  Key, KeyRound, CheckCircle2, XCircle, RefreshCw, Clock,
  ArrowLeft, Loader2, Shield, Truck, Package, Send
} from 'lucide-react';

const TIMELINE_STEPS = [
  { key: 'assigned', label: 'Assigned', icon: Package },
  { key: 'safety_check', label: 'Safety Check', icon: Shield },
  { key: 'pickup_otp', label: 'Pickup OTP', icon: Key },
  { key: 'in_transit', label: 'In Transit', icon: Truck },
  { key: 'delivery_otp', label: 'Delivery OTP', icon: KeyRound },
  { key: 'completed', label: 'Completed', icon: CheckCircle2 },
];

export default function OtpPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const type = searchParams.get('type') || 'pickup';
  const assignmentId = searchParams.get('id') || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [demoOtp, setDemoOtp] = useState(null);
  const inputRefs = useRef([]);

  const currentStepIndex = type === 'pickup' ? 2 : 4;

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleInputChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    if (pasted.length > 0) {
      inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP');
      return;
    }
    if (!assignmentId) {
      toast.error('No assignment ID provided');
      return;
    }

    setVerifying(true);
    try {
      const response = type === 'pickup'
        ? await otpService.verifyPickupOtp(assignmentId, otpCode)
        : await otpService.verifyDeliveryOtp(assignmentId, otpCode);

      if (response?.success) {
        setResult({ status: 'success', message: response.message || 'OTP verified successfully', timestamp: new Date().toISOString() });
        toast.success('OTP verified successfully!');
      } else {
        setResult({ status: 'failed', message: response?.message || 'Invalid OTP' });
        toast.error(response?.message || 'Invalid OTP');
      }
    } catch (err) {
      setResult({ status: 'failed', message: err.message || 'Verification failed' });
      toast.error(err.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      const response = await otpService.resendOtp(type, assignmentId);
      if (response?.success) {
        toast.success('OTP resent successfully');
        setResendCooldown(60);
        if (response.data?.demoOtp) {
          setDemoOtp(response.data.demoOtp);
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to resend OTP');
    }
  };

  const handleRequestOtp = async () => {
    try {
      const response = type === 'pickup'
        ? await otpService.requestPickupOtp(assignmentId)
        : await otpService.requestDeliveryOtp(assignmentId);
      if (response?.success) {
        toast.success('OTP sent!');
        setResendCooldown(60);
        if (response.data?.demoOtp) {
          setDemoOtp(response.data.demoOtp);
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to request OTP');
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Timeline */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[500px]">
          {TIMELINE_STEPS.map((step, i) => {
            const Icon = step.icon;
            const isCompleted = i < currentStepIndex;
            const isCurrent = i === currentStepIndex;
            return (
              <div key={step.key} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isCompleted ? 'bg-green-600 text-white' : isCurrent ? 'bg-green-100 text-green-600 ring-2 ring-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className={`text-xs mt-1 whitespace-nowrap ${isCurrent ? 'text-green-600 font-semibold' : 'text-gray-400'}`}>
                    {step.label}
                  </span>
                </div>
                {i < TIMELINE_STEPS.length - 1 && (
                  <div className={`w-8 h-0.5 mx-1 mt-[-16px] ${isCompleted ? 'bg-green-600' : 'bg-gray-200'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        {!result ? (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                {type === 'pickup' ? 'Pickup OTP Verification' : 'Delivery OTP Verification'}
              </h1>
              <p className="text-gray-500 mt-2 text-sm">
                {type === 'pickup'
                  ? 'Enter the OTP provided by the donor to confirm food pickup'
                  : 'Enter the OTP to confirm food delivery to the organization'}
              </p>
            </div>

            {demoOtp && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
                <p className="text-xs text-amber-600 font-medium">🔧 Development Mode</p>
                <p className="text-lg font-bold text-amber-700 tracking-widest mt-1">{demoOtp}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 text-center">Enter 6-digit OTP</label>
              <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleInputChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="w-12 h-14 text-center text-xl font-bold rounded-lg border-2 border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
                  />
                ))}
              </div>
            </div>

            <button
              onClick={handleVerify}
              disabled={verifying || otp.join('').length !== 6}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {verifying ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Verifying...</>
              ) : (
                <><CheckCircle2 className="w-5 h-5" /> Verify OTP</>
              )}
            </button>

            <div className="flex items-center justify-between text-sm">
              <button
                onClick={handleRequestOtp}
                className="text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
              >
                <Send className="w-4 h-4" /> Request OTP
              </button>
              <button
                onClick={handleResend}
                disabled={resendCooldown > 0}
                className="text-gray-500 hover:text-gray-700 font-medium flex items-center gap-1 disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4" />
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
              </button>
            </div>
          </div>
        ) : result.status === 'success' ? (
          <div className="text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-green-700">OTP Verified Successfully!</h2>
            <p className="text-gray-500">{result.message}</p>
            {result.timestamp && (
              <p className="text-xs text-gray-400">Verified at: {new Date(result.timestamp).toLocaleString()}</p>
            )}
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-700 font-medium">
                {type === 'pickup' ? '✅ Pickup handover confirmed' : '✅ Delivery handover confirmed'}
              </p>
            </div>
            <Link
              to="/volunteer/dashboard"
              className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
            >
              Back to Dashboard <ArrowLeft className="w-4 h-4 rotate-180" />
            </Link>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-red-700">Invalid OTP</h2>
            <p className="text-gray-500">{result.message}</p>
            <button
              onClick={() => { setResult(null); setOtp(['', '', '', '', '', '']); }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-5 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
