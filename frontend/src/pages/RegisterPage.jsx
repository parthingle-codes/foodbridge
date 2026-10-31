import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Store,
  Building2,
  Truck,
  Leaf,
  Mail,
  Lock,
  Phone,
  MapPin,
  Clock,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  {
    id: 'donor',
    label: 'Individual Donor',
    icon: User,
    description: 'Donate surplus food from home or events',
    color: 'green',
  },
  {
    id: 'restaurant',
    label: 'Restaurant / Business',
    icon: Store,
    description: 'Donate from your restaurant, hotel, or business',
    color: 'orange',
  },
  {
    id: 'ngo',
    label: 'NGO / Organization',
    icon: Building2,
    description: 'Receive and distribute food to communities',
    color: 'blue',
  },
  {
    id: 'volunteer',
    label: 'Volunteer',
    icon: Truck,
    description: 'Help pickup and deliver food donations',
    color: 'purple',
  },
  {
    id: 'biofarm',
    label: 'Biofarm',
    icon: Leaf,
    description: 'Recover food waste for composting & biogas',
    color: 'emerald',
  },
];

const VEHICLE_TYPES = [
  { value: 'walk', label: 'Walk' },
  { value: 'bike', label: 'Bike' },
  { value: 'car', label: 'Car' },
  { value: 'van', label: 'Van' },
];

const PROCESSING_METHODS = [
  { value: 'composting', label: 'Composting' },
  { value: 'biogas', label: 'Biogas' },
  { value: 'approved_reuse', label: 'Approved Reuse' },
  { value: 'other', label: 'Other' },
];

const colorMap = {
  green: {
    border: 'border-green-500',
    bg: 'bg-green-50',
    text: 'text-green-600',
    ring: 'ring-green-500/30',
    iconBg: 'bg-green-100',
  },
  orange: {
    border: 'border-orange-500',
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    ring: 'ring-orange-500/30',
    iconBg: 'bg-orange-100',
  },
  blue: {
    border: 'border-blue-500',
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    ring: 'ring-blue-500/30',
    iconBg: 'bg-blue-100',
  },
  purple: {
    border: 'border-purple-500',
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    ring: 'ring-purple-500/30',
    iconBg: 'bg-purple-100',
  },
  emerald: {
    border: 'border-emerald-500',
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    ring: 'ring-emerald-500/30',
    iconBg: 'bg-emerald-100',
  },
};

const inputBaseClass =
  'w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all';
const inputErrorClass =
  'w-full px-4 py-2.5 rounded-lg border border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all';
const iconInputClass =
  'w-full pl-11 pr-4 py-2.5 rounded-lg border focus:ring-2 outline-none transition-all';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    organizationName: '',
    registrationNumber: '',
    operatingHours: '',
    capacity: '',
    vehicleType: '',
    availableHours: '',
    farmName: '',
    processingCapacity: '',
    processingMethods: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (apiError) setApiError('');
  };

  const handleMethodToggle = (method) => {
    setFormData((prev) => {
      const methods = prev.processingMethods.includes(method)
        ? prev.processingMethods.filter((m) => m !== method)
        : [...prev.processingMethods, method];
      return { ...prev, processingMethods: methods };
    });
    if (errors.processingMethods) {
      setErrors((prev) => ({ ...prev, processingMethods: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\d\s+\-()]{7,15}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Role-specific validation
    if (selectedRole === 'donor') {
      if (!formData.address.trim()) newErrors.address = 'Address is required';
    }

    if (selectedRole === 'restaurant') {
      if (!formData.organizationName.trim())
        newErrors.organizationName = 'Business name is required';
      if (!formData.address.trim()) newErrors.address = 'Address is required';
    }

    if (selectedRole === 'ngo') {
      if (!formData.organizationName.trim())
        newErrors.organizationName = 'Organization name is required';
      if (!formData.registrationNumber.trim())
        newErrors.registrationNumber = 'Registration number is required';
      if (!formData.address.trim()) newErrors.address = 'Address is required';
      if (!formData.operatingHours.trim())
        newErrors.operatingHours = 'Operating hours are required';
      if (!formData.capacity.trim())
        newErrors.capacity = 'Capacity is required';
    }

    if (selectedRole === 'volunteer') {
      if (!formData.vehicleType)
        newErrors.vehicleType = 'Please select a vehicle type';
      if (!formData.availableHours.trim())
        newErrors.availableHours = 'Available hours are required';
    }

    if (selectedRole === 'biofarm') {
      if (!formData.farmName.trim())
        newErrors.farmName = 'Farm name is required';
      if (!formData.processingCapacity.trim())
        newErrors.processingCapacity = 'Processing capacity is required';
      if (formData.processingMethods.length === 0)
        newErrors.processingMethods =
          'Select at least one processing method';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const redirectByRole = (role) => {
    const r = (role || '').toLowerCase();
    const routes = {
      donor: '/donor/dashboard',
      restaurant: '/donor/dashboard',
      organization: '/organization/dashboard',
      distributor: '/organization/dashboard',
      ngo: '/organization/dashboard',
      volunteer: '/volunteer/dashboard',
      biofarm: '/biofarm/dashboard',
      admin: '/admin/dashboard',
    };
    navigate(routes[r] || '/donor/dashboard');
  };

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setErrors({});
    setApiError('');
  };

  const goToStep2 = () => {
    if (!selectedRole) return;
    setStep(2);
  };

  const goToStep1 = () => {
    setStep(1);
    setErrors({});
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setApiError('');

    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role: selectedRole === 'restaurant' ? 'donor' : selectedRole,
    };

    if (selectedRole === 'donor') {
      payload.address = formData.address;
      if (formData.organizationName.trim()) {
        payload.organizationName = formData.organizationName;
      }
    }

    if (selectedRole === 'restaurant') {
      payload.organizationName = formData.organizationName;
      payload.address = formData.address;
    }

    if (selectedRole === 'ngo') {
      payload.organizationName = formData.organizationName;
      payload.registrationNumber = formData.registrationNumber;
      payload.address = formData.address;
      payload.operatingHours = formData.operatingHours;
      payload.capacity = formData.capacity;
    }

    if (selectedRole === 'volunteer') {
      payload.vehicleType = formData.vehicleType;
      payload.availableHours = formData.availableHours;
    }

    if (selectedRole === 'biofarm') {
      payload.farmName = formData.farmName;
      payload.processingCapacity = formData.processingCapacity;
      payload.processingMethods = formData.processingMethods;
    }

    try {
      const response = await register(payload);

      if (response.success) {
        const user = response.user || response.data?.user || response.data;
        redirectByRole(user?.role || user?.subRole || user?.normalizedRole || selectedRole);
      } else {
        setApiError(
          response.message || 'Registration failed. Please try again.'
        );
      }
    } catch (err) {
      setApiError(
        err?.response?.data?.message ||
          err?.message ||
          'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderField = (id, label, icon, type = 'text', placeholder = '', extraProps = {}) => {
    const Icon = icon;
    const hasError = !!errors[id];
    const isPassword = type === 'password';
    const isShowingPassword =
      id === 'password' ? showPassword : showConfirmPassword;
    const toggleShow =
      id === 'password'
        ? () => setShowPassword((p) => !p)
        : () => setShowConfirmPassword((p) => !p);

    return (
      <div className="mb-4" key={id}>
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          {label}
        </label>
        <div className="relative">
          {Icon && (
            <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
          )}
          <input
            id={id}
            name={id}
            type={isPassword ? (isShowingPassword ? 'text' : 'password') : type}
            placeholder={placeholder}
            value={formData[id]}
            onChange={handleChange}
            className={`${Icon ? 'pl-11' : 'px-4'} ${isPassword ? 'pr-11' : 'pr-4'} py-2.5 w-full rounded-lg border ${
              hasError
                ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                : 'border-gray-300 focus:border-green-500 focus:ring-green-500/20'
            } focus:ring-2 outline-none transition-all`}
            {...extraProps}
          />
          {isPassword && (
            <button
              type="button"
              onClick={toggleShow}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              tabIndex={-1}
              aria-label={isShowingPassword ? 'Hide password' : 'Show password'}
            >
              {isShowingPassword ? (
                <EyeOff className="h-4.5 w-4.5" />
              ) : (
                <Eye className="h-4.5 w-4.5" />
              )}
            </button>
          )}
        </div>
        {hasError && (
          <p className="mt-1 text-sm text-red-500">{errors[id]}</p>
        )}
      </div>
    );
  };

  const renderRoleFields = () => {
    switch (selectedRole) {
      case 'donor':
        return (
          <>
            {renderField('address', 'Address', MapPin, 'text', 'Your pickup address')}
            {renderField(
              'organizationName',
              'Organization Name (optional)',
              Building2,
              'text',
              'If donating on behalf of an organization'
            )}
          </>
        );

      case 'restaurant':
        return (
          <>
            {renderField(
              'organizationName',
              'Business Name',
              Store,
              'text',
              'Restaurant, hotel, or business name'
            )}
            {renderField('address', 'Business Address', MapPin, 'text', 'Full business address')}
          </>
        );

      case 'ngo':
        return (
          <>
            {renderField(
              'organizationName',
              'Organization Name',
              Building2,
              'text',
              'NGO or organization name'
            )}
            {renderField(
              'registrationNumber',
              'Registration Number',
              null,
              'text',
              'Official registration ID'
            )}
            {renderField('address', 'Address', MapPin, 'text', 'Organization address')}
            {renderField('operatingHours', 'Operating Hours', Clock, 'text', 'e.g. Mon-Fri 9am-6pm')}
            {renderField('capacity', 'Capacity (meals/day)', null, 'text', 'Number of meals you can handle daily')}
          </>
        );

      case 'volunteer':
        return (
          <>
            <div className="mb-4">
              <label
                htmlFor="vehicleType"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Vehicle Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {VEHICLE_TYPES.map((v) => (
                  <button
                    key={v.value}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, vehicleType: v.value }));
                      if (errors.vehicleType)
                        setErrors((prev) => ({ ...prev, vehicleType: '' }));
                    }}
                    className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                      formData.vehicleType === v.value
                        ? 'border-green-500 bg-green-50 text-green-700 ring-2 ring-green-500/20'
                        : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
              {errors.vehicleType && (
                <p className="mt-1 text-sm text-red-500">{errors.vehicleType}</p>
              )}
            </div>
            {renderField(
              'availableHours',
              'Available Hours',
              Clock,
              'text',
              'e.g. Weekdays 5pm-9pm, Weekends all day'
            )}
          </>
        );

      case 'biofarm':
        return (
          <>
            {renderField('farmName', 'Farm Name', Leaf, 'text', 'Your farm or facility name')}
            {renderField(
              'processingCapacity',
              'Processing Capacity (kg/day)',
              null,
              'text',
              'Daily waste processing capacity'
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Processing Methods
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PROCESSING_METHODS.map((m) => {
                  const isSelected = formData.processingMethods.includes(m.value);
                  return (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => handleMethodToggle(m.value)}
                      className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all flex items-center gap-2 ${
                        isSelected
                          ? 'border-green-500 bg-green-50 text-green-700 ring-2 ring-green-500/20'
                          : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="h-4 w-4 flex-shrink-0" />}
                      {m.label}
                    </button>
                  );
                })}
              </div>
              {errors.processingMethods && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.processingMethods}
                </p>
              )}
            </div>
          </>
        );

      default:
        return null;
    }
  };

  const selectedRoleInfo = ROLES.find((r) => r.id === selectedRole);

  return (
    <div className="bg-stone-50 min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Branding */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <Leaf className="h-9 w-9 text-green-600 group-hover:text-green-700 transition-colors" />
            <span className="text-3xl font-bold text-green-600 group-hover:text-green-700 transition-colors">
              FOODBRIDGE
            </span>
          </Link>
          <p className="mt-2 text-gray-500">
            Join the movement to eliminate food waste
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span className="font-medium text-gray-700">
              Step {step} of 2
            </span>
            <span>
              {step === 1 ? 'Choose your role' : 'Account details'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: step === 1 ? '50%' : '100%' }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/60 border border-gray-100 p-8">
          {step === 1 ? (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">
                How will you use FoodBridge?
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                Select the role that best describes you
              </p>

              <div className="space-y-3">
                {ROLES.map((role) => {
                  const Icon = role.icon;
                  const isSelected = selectedRole === role.id;
                  const colors = colorMap[role.color];

                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => handleRoleSelect(role.id)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                        isSelected
                          ? `${colors.border} ${colors.bg} ring-4 ${colors.ring}`
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            isSelected ? colors.iconBg : 'bg-gray-100'
                          }`}
                        >
                          <Icon
                            className={`h-6 w-6 ${
                              isSelected ? colors.text : 'text-gray-500'
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3
                            className={`font-semibold ${
                              isSelected ? 'text-gray-900' : 'text-gray-700'
                            }`}
                          >
                            {role.label}
                          </h3>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {role.description}
                          </p>
                        </div>
                        {isSelected && (
                          <CheckCircle2
                            className={`h-6 w-6 flex-shrink-0 ${colors.text}`}
                          />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={goToStep2}
                disabled={!selectedRole}
                className="w-full mt-6 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-5 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <button
                  type="button"
                  onClick={goToStep1}
                  className="p-2 -ml-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  aria-label="Go back"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Create your account
                  </h2>
                  {selectedRoleInfo && (
                    <p className="text-sm text-gray-500 mt-0.5">
                      Registering as{' '}
                      <span className="font-medium text-green-600">
                        {selectedRoleInfo.label}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {apiError && (
                <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {apiError}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                {/* Common Fields */}
                {renderField('name', 'Full Name', User, 'text', 'Your full name')}
                {renderField('email', 'Email Address', Mail, 'email', 'you@example.com')}
                {renderField('phone', 'Phone Number', Phone, 'tel', '+91 98765 43210')}
                {renderField('password', 'Password', Lock, 'password', 'At least 8 characters')}
                {renderField(
                  'confirmPassword',
                  'Confirm Password',
                  Lock,
                  'password',
                  'Re-enter your password'
                )}

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-3 text-gray-500">
                      {selectedRoleInfo?.label} details
                    </span>
                  </div>
                </div>

                {/* Role-specific fields */}
                {renderRoleFields()}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-5 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <CheckCircle2 className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Footer link */}
        <p className="text-center mt-6 text-sm text-gray-500">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-green-600 hover:text-green-700 font-semibold transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
