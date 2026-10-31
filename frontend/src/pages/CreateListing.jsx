import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Upload,
  MapPin,
  Clock,
  AlertTriangle,
  Package,
  Loader2,
  Image,
  X,
  CheckCircle2,
} from 'lucide-react';
import { foodListingService } from '../services';

const CATEGORIES = [
  'Cooked Meals',
  'Raw Ingredients',
  'Packaged Food',
  'Bakery Items',
  'Fruits & Vegetables',
  'Dairy',
  'Beverages',
  'Other',
];

const UNITS = ['kg', 'lbs', 'servings', 'items', 'liters', 'boxes'];

const CONDITIONS = ['Freshly Prepared', 'Good', 'Near Expiry', 'Other'];

const ALLERGENS = ['Nuts', 'Dairy', 'Gluten', 'Eggs', 'Soy', 'Fish', 'Shellfish', 'None'];

const initialFormState = {
  foodName: '',
  category: '',
  quantity: '',
  unit: 'kg',
  estimatedServings: '',
  foodCondition: '',
  preparationDate: '',
  pickupStartTime: '',
  pickupEndTime: '',
  storageInstructions: '',
  allergens: [],
  additionalNotes: '',
  pickupAddress: '',
  landmark: '',
  contactPhone: '',
  latitude: '',
  longitude: '',
};

export default function CreateListing() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState(initialFormState);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // ---- Handlers ----

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  function handleAllergenToggle(allergen) {
    setForm((prev) => {
      let next;
      if (allergen === 'None') {
        next = prev.allergens.includes('None') ? [] : ['None'];
      } else {
        const filtered = prev.allergens.filter((a) => a !== 'None');
        next = filtered.includes(allergen) ? filtered.filter((a) => a !== allergen) : [...filtered, allergen];
      }
      return { ...prev, allergens: next };
    });
  }

  function handleImageSelect(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5 MB.');
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  }

  function handleFileInputChange(e) {
    handleImageSelect(e.target.files[0]);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleImageSelect(file);
  }

  function handleDragOver(e) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave() {
    setDragOver(false);
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  // ---- Validation ----

  function validate() {
    const newErrors = {};

    if (!form.foodName.trim()) newErrors.foodName = 'Food name is required.';
    if (!form.category) newErrors.category = 'Please select a category.';
    if (!form.quantity || Number(form.quantity) <= 0) newErrors.quantity = 'Quantity must be a positive number.';
    if (form.estimatedServings && Number(form.estimatedServings) <= 0)
      newErrors.estimatedServings = 'Servings must be a positive number.';
    if (!form.pickupStartTime) newErrors.pickupStartTime = 'Pickup start time is required.';
    if (!form.pickupEndTime) newErrors.pickupEndTime = 'Pickup end time is required.';
    if (form.pickupStartTime && form.pickupEndTime && new Date(form.pickupEndTime) <= new Date(form.pickupStartTime))
      newErrors.pickupEndTime = 'Pickup end time must be after start time.';
    if (!form.pickupAddress.trim()) newErrors.pickupAddress = 'Pickup address is required.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // ---- Submit ----

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the errors in the form.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        foodName: form.foodName.trim(),
        category: form.category,
        quantity: Number(form.quantity),
        unit: form.unit,
        estimatedServings: form.estimatedServings ? Number(form.estimatedServings) : undefined,
        foodCondition: form.foodCondition || undefined,
        preparationDate: form.preparationDate || undefined,
        pickupStartTime: form.pickupStartTime,
        pickupEndTime: form.pickupEndTime,
        storageInstructions: form.storageInstructions.trim() || undefined,
        allergens: form.allergens.length > 0 ? form.allergens : undefined,
        additionalNotes: form.additionalNotes.trim() || undefined,
        pickupAddress: form.pickupAddress.trim(),
        landmark: form.landmark.trim() || undefined,
        contactPhone: form.contactPhone.trim() || undefined,
        latitude: form.latitude ? Number(form.latitude) : undefined,
        longitude: form.longitude ? Number(form.longitude) : undefined,
      };

      const response = await foodListingService.create(payload);

      if (response.success) {
        const listingId = response.data?._id || response.data?.id;

        // Upload image if one was selected
        if (imageFile && listingId) {
          const formData = new FormData();
          formData.append('image', imageFile);
          try {
            await foodListingService.uploadImage(listingId, formData);
          } catch {
            // Image upload failed but listing was created
            toast('Listing created, but image upload failed.', { icon: '⚠️' });
          }
        }

        toast.success('Food listing created successfully!');
        navigate('/donor/listings');
      } else {
        toast.error(response.message || 'Failed to create listing.');
      }
    } catch (err) {
      const msg = err.message || 'Something went wrong. Please try again.';
      toast.error(msg);
      if (err.errors && Array.isArray(err.errors)) {
        const fieldErrors = {};
        err.errors.forEach((e) => {
          if (e.field) fieldErrors[e.field] = e.message;
        });
        setErrors((prev) => ({ ...prev, ...fieldErrors }));
      }
    } finally {
      setSubmitting(false);
    }
  }

  // ---- Render helpers ----

  function inputClass(fieldName) {
    const base =
      'w-full px-4 py-2.5 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-sm';
    return errors[fieldName] ? `${base} border-red-400 bg-red-50` : `${base} border-gray-200 bg-white`;
  }

  function FieldError({ name }) {
    if (!errors[name]) return null;
    return (
      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
        <AlertTriangle className="w-3 h-3" /> {errors[name]}
      </p>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          to="/donor/dashboard"
          className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Create Food Listing</h1>
          <p className="text-gray-500 text-sm mt-0.5">Share surplus food with those in need</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-8">
        {/* Section 1 - Food Details */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-5">
            <Package className="w-5 h-5 text-green-600" />
            Food Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Food Name */}
            <div className="sm:col-span-2">
              <label htmlFor="foodName" className="block text-sm font-medium text-gray-700 mb-1">
                Food Name <span className="text-red-500">*</span>
              </label>
              <input
                id="foodName"
                name="foodName"
                type="text"
                value={form.foodName}
                onChange={handleChange}
                placeholder="e.g., Vegetable Biryani, Fresh Bread Loaves"
                className={inputClass('foodName')}
              />
              <FieldError name="foodName" />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                className={inputClass('category')}
              >
                <option value="">Select category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <FieldError name="category" />
            </div>

            {/* Food Condition */}
            <div>
              <label htmlFor="foodCondition" className="block text-sm font-medium text-gray-700 mb-1">
                Food Condition
              </label>
              <select
                id="foodCondition"
                name="foodCondition"
                value={form.foodCondition}
                onChange={handleChange}
                className={inputClass('foodCondition')}
              >
                <option value="">Select condition</option>
                {CONDITIONS.map((cond) => (
                  <option key={cond} value={cond}>
                    {cond}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity + Unit */}
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                Quantity <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  step="any"
                  value={form.quantity}
                  onChange={handleChange}
                  placeholder="e.g., 10"
                  className={inputClass('quantity') + ' flex-1'}
                />
                <select
                  name="unit"
                  value={form.unit}
                  onChange={handleChange}
                  className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 w-28"
                >
                  {UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
              <FieldError name="quantity" />
            </div>

            {/* Estimated Servings */}
            <div>
              <label htmlFor="estimatedServings" className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Servings
              </label>
              <input
                id="estimatedServings"
                name="estimatedServings"
                type="number"
                min="0"
                value={form.estimatedServings}
                onChange={handleChange}
                placeholder="e.g., 50"
                className={inputClass('estimatedServings')}
              />
              <FieldError name="estimatedServings" />
            </div>
          </div>
        </section>

        {/* Section 2 - Time & Storage */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-5">
            <Clock className="w-5 h-5 text-blue-500" />
            Time &amp; Storage
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Preparation Date/Time */}
            <div>
              <label htmlFor="preparationDate" className="block text-sm font-medium text-gray-700 mb-1">
                Preparation Date/Time
              </label>
              <input
                id="preparationDate"
                name="preparationDate"
                type="datetime-local"
                value={form.preparationDate}
                onChange={handleChange}
                className={inputClass('preparationDate')}
              />
            </div>

            {/* empty spacer for grid alignment on desktop */}
            <div className="hidden sm:block" />

            {/* Pickup Start Time */}
            <div>
              <label htmlFor="pickupStartTime" className="block text-sm font-medium text-gray-700 mb-1">
                Pickup Start Time <span className="text-red-500">*</span>
              </label>
              <input
                id="pickupStartTime"
                name="pickupStartTime"
                type="datetime-local"
                value={form.pickupStartTime}
                onChange={handleChange}
                className={inputClass('pickupStartTime')}
              />
              <FieldError name="pickupStartTime" />
            </div>

            {/* Pickup End Time */}
            <div>
              <label htmlFor="pickupEndTime" className="block text-sm font-medium text-gray-700 mb-1">
                Pickup End Time <span className="text-red-500">*</span>
              </label>
              <input
                id="pickupEndTime"
                name="pickupEndTime"
                type="datetime-local"
                value={form.pickupEndTime}
                onChange={handleChange}
                className={inputClass('pickupEndTime')}
              />
              <FieldError name="pickupEndTime" />
            </div>

            {/* Storage Instructions */}
            <div className="sm:col-span-2">
              <label htmlFor="storageInstructions" className="block text-sm font-medium text-gray-700 mb-1">
                Storage Instructions
              </label>
              <textarea
                id="storageInstructions"
                name="storageInstructions"
                rows={3}
                value={form.storageInstructions}
                onChange={handleChange}
                placeholder="e.g., Keep refrigerated, Consume within 4 hours"
                className={inputClass('storageInstructions')}
              />
            </div>
          </div>
        </section>

        {/* Section 3 - Safety Information */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-5">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Safety Information
          </h2>

          {/* Allergens */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Allergen Information</label>
            <div className="flex flex-wrap gap-2">
              {ALLERGENS.map((allergen) => {
                const isSelected = form.allergens.includes(allergen);
                return (
                  <button
                    type="button"
                    key={allergen}
                    onClick={() => handleAllergenToggle(allergen)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
                      isSelected
                        ? 'bg-green-600 text-white border-green-600'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-green-400 hover:text-green-700'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />}
                    {allergen}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              id="additionalNotes"
              name="additionalNotes"
              rows={3}
              value={form.additionalNotes}
              onChange={handleChange}
              placeholder="Any additional information about the food..."
              className={inputClass('additionalNotes')}
            />
          </div>
        </section>

        {/* Section 4 - Pickup Location */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-5">
            <MapPin className="w-5 h-5 text-red-500" />
            Pickup Location
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Pickup Address */}
            <div className="sm:col-span-2">
              <label htmlFor="pickupAddress" className="block text-sm font-medium text-gray-700 mb-1">
                Pickup Address <span className="text-red-500">*</span>
              </label>
              <input
                id="pickupAddress"
                name="pickupAddress"
                type="text"
                value={form.pickupAddress}
                onChange={handleChange}
                placeholder="Full address for pickup"
                className={inputClass('pickupAddress')}
              />
              <FieldError name="pickupAddress" />
            </div>

            {/* Landmark */}
            <div>
              <label htmlFor="landmark" className="block text-sm font-medium text-gray-700 mb-1">
                Landmark <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <input
                id="landmark"
                name="landmark"
                type="text"
                value={form.landmark}
                onChange={handleChange}
                placeholder="Near park, beside mall, etc."
                className={inputClass('landmark')}
              />
            </div>

            {/* Contact Phone */}
            <div>
              <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Phone
              </label>
              <input
                id="contactPhone"
                name="contactPhone"
                type="text"
                value={form.contactPhone}
                onChange={handleChange}
                placeholder="+91 XXXXX XXXXX"
                className={inputClass('contactPhone')}
              />
            </div>

            {/* Map Picker Placeholder */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Location on Map</label>
              <div
                id="map-picker"
                className="h-64 rounded-lg bg-gray-100 border border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition"
              >
                <MapPin className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 font-medium">Map location picker</p>
                <p className="text-xs text-gray-400">Click to set location</p>
              </div>
              <input type="hidden" name="latitude" value={form.latitude} />
              <input type="hidden" name="longitude" value={form.longitude} />
              <div className="flex gap-4 mt-2">
                <div className="flex-1">
                  <input
                    name="latitude"
                    type="number"
                    step="any"
                    value={form.latitude}
                    onChange={handleChange}
                    placeholder="Latitude (auto-filled from map)"
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="flex-1">
                  <input
                    name="longitude"
                    type="number"
                    step="any"
                    value={form.longitude}
                    onChange={handleChange}
                    placeholder="Longitude (auto-filled from map)"
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5 - Image Upload */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-5">
            <Image className="w-5 h-5 text-purple-500" />
            Food Image
          </h2>

          {imagePreview ? (
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Food preview"
                className="w-full max-w-sm h-48 object-cover rounded-xl border border-gray-200"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow hover:bg-red-50 transition"
              >
                <X className="w-4 h-4 text-red-500" />
              </button>
            </div>
          ) : (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`h-48 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition ${
                dragOver
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 bg-gray-50 hover:border-green-400 hover:bg-green-50/50'
              }`}
            >
              <Upload className={`w-10 h-10 mb-2 ${dragOver ? 'text-green-500' : 'text-gray-400'}`} />
              <p className="text-sm font-medium text-gray-600">
                Drag &amp; drop an image here or <span className="text-green-600 underline">browse</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5 MB</p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </section>

        {/* Submit */}
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-end pt-2 pb-8">
          <Link
            to="/donor/dashboard"
            className="w-full sm:w-auto px-6 py-2.5 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition text-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-8 py-2.5 bg-green-600 text-white font-semibold rounded-xl shadow-sm hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Create Listing
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
