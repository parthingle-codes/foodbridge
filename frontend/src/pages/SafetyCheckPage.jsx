import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Shield,
  ShieldCheck,
  ShieldX,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Upload,
  Camera,
  Clock,
  ArrowLeft,
  Loader2,
  ThermometerSun,
  Package,
  Eye,
} from 'lucide-react';
import { safetyService } from '../services';

// ── Donor form defaults ────────────────────────────────
const INITIAL_DONOR = {
  storageCondition: '',
  packaging: '',
  foodAppearance: '',
  allergens: '',
  hasContamination: 'no',
  contaminationDescription: '',
  confirmSafe: false,
};

// ── Pickup form defaults ───────────────────────────────
const INITIAL_PICKUP = {
  packagingIntegrity: '',
  appearanceSmell: '',
  temperatureOk: '',
  transportContainer: '',
  hasContamination: 'no',
  contaminationDescription: '',
  confirmSafe: false,
};

/* ====================================================================
   Select helper
   ==================================================================== */
function SelectField({ label, icon: Icon, value, onChange, options, required }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {Icon && <Icon className="inline w-4 h-4 mr-1 text-green-600" />}
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={onChange}
        required={required}
        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition bg-white"
      >
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ====================================================================
   Result card shown after submission
   ==================================================================== */
function ResultCard({ result, type, onBack }) {
  const statusConfig = {
    passed: {
      bg: 'bg-green-50 border-green-200',
      icon: <CheckCircle2 className="w-12 h-12 text-green-600" />,
      title: 'Safety Check Passed',
      text: 'text-green-800',
      sub: 'This food has been verified as safe.',
    },
    failed: {
      bg: 'bg-red-50 border-red-200',
      icon: <XCircle className="w-12 h-12 text-red-600" />,
      title: 'Safety Check Failed',
      text: 'text-red-800',
      sub: 'This delivery has been blocked due to safety concerns.',
    },
    flagged: {
      bg: 'bg-orange-50 border-orange-200',
      icon: <AlertTriangle className="w-12 h-12 text-orange-500" />,
      title: 'Safety Check Flagged for Review',
      text: 'text-orange-800',
      sub: 'This item has been flagged and will be reviewed by an admin before proceeding.',
    },
  };

  const status = (result?.status || 'passed').toLowerCase();
  const cfg = statusConfig[status] || statusConfig.passed;

  return (
    <div className={`rounded-xl border-2 p-8 text-center ${cfg.bg}`}>
      <div className="flex justify-center mb-4">{cfg.icon}</div>
      <h2 className={`text-2xl font-bold mb-2 ${cfg.text}`}>{cfg.title}</h2>
      <p className={`mb-6 ${cfg.text} opacity-80`}>{cfg.sub}</p>

      {result?.completedBy && (
        <p className="text-sm text-gray-600 mb-1">
          Completed by: <span className="font-medium">{result.completedBy}</span>
        </p>
      )}
      {result?.completedAt && (
        <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {new Date(result.completedAt).toLocaleString()}
        </p>
      )}

      <button
        onClick={onBack}
        className="mt-8 inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Go Back
      </button>
    </div>
  );
}

/* ====================================================================
   MAIN PAGE COMPONENT
   ==================================================================== */
export default function SafetyCheckPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const type = searchParams.get('type'); // 'donor' | 'pickup'
  const id = searchParams.get('id');

  const isDonor = type === 'donor';
  const isPickup = type === 'pickup';

  const [form, setForm] = useState(isDonor ? { ...INITIAL_DONOR } : { ...INITIAL_PICKUP });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [existingCheck, setExistingCheck] = useState(null);
  const [loadingExisting, setLoadingExisting] = useState(true);

  /* ── Load existing check ───────────────────────────── */
  useEffect(() => {
    if (!id) {
      setLoadingExisting(false);
      return;
    }

    const load = async () => {
      try {
        const res = isDonor
          ? await safetyService.getDonorCheck(id)
          : await safetyService.getPickupCheck(id);

        if (res?.success && res.data) {
          setExistingCheck(res.data);
          setResult(res.data);
        }
      } catch {
        // no existing check – that's fine
      } finally {
        setLoadingExisting(false);
      }
    };
    load();
  }, [id, isDonor]);

  /* ── Guard: bad params ─────────────────────────────── */
  if (!type || !id || (!isDonor && !isPickup)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <ShieldX className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-800 mb-2">Invalid Safety Check Link</h1>
          <p className="text-gray-500 mb-6">
            The safety check link is missing required parameters (type &amp; id).
          </p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Go back
          </button>
        </div>
      </div>
    );
  }

  /* ── Handlers ──────────────────────────────────────── */
  const set = (key) => (e) => {
    const val = e.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e;
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5 MB');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const validate = () => {
    if (!form.confirmSafe) {
      toast.error('You must confirm the safety declaration');
      return false;
    }
    if (isDonor) {
      if (!form.storageCondition || !form.packaging || !form.foodAppearance) {
        toast.error('Please fill all required fields');
        return false;
      }
    } else {
      if (!form.packagingIntegrity || !form.appearanceSmell || !form.temperatureOk || !form.transportContainer) {
        toast.error('Please fill all required fields');
        return false;
      }
    }
    if (form.hasContamination === 'yes' && !form.contaminationDescription.trim()) {
      toast.error('Please describe the contamination concern');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = { ...form };
      delete payload.confirmSafe; // backend doesn't need the checkbox itself

      const res = isDonor
        ? await safetyService.submitDonorCheck(id, payload)
        : await safetyService.submitPickupCheck(id, payload);

      // Upload evidence image if selected
      if (imageFile && res?.data?.checkId) {
        try {
          const fd = new FormData();
          fd.append('evidence', imageFile);
          await safetyService.uploadEvidence(res.data.checkId, fd);
        } catch {
          toast.error('Safety check saved but image upload failed');
        }
      }

      if (res?.success) {
        toast.success(res.message || 'Safety check submitted');
        setResult(res.data);
      } else {
        toast.error(res?.message || 'Submission failed');
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to submit safety check');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Loading state ─────────────────────────────────── */
  if (loadingExisting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  /* ── Result state ──────────────────────────────────── */
  if (result) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-lg mx-auto">
          <ResultCard result={result} type={type} onBack={() => navigate(-1)} />
        </div>
      </div>
    );
  }

  /* ── Render form ───────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-lg mx-auto">
        {/* Back link */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-lg bg-green-100">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {isDonor ? 'Donor Food Safety Verification' : 'Pickup Food Safety Verification'}
              </h1>
              <p className="text-sm text-gray-500">
                {isDonor
                  ? 'Complete this checklist to verify food safety before pickup'
                  : 'Verify food safety upon pickup before transport'}
              </p>
            </div>
          </div>
        </div>

        {/* Form card */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
          {/* ─── DONOR FIELDS ────────────────────────── */}
          {isDonor && (
            <>
              {/* Preparation time */}
              <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 border border-gray-200">
                <Clock className="w-5 h-5 text-gray-500 shrink-0" />
                <div className="text-sm text-gray-700">
                  <span className="font-medium">Preparation time noted.</span> Please verify the food
                  was prepared within a safe window.
                </div>
              </div>

              <SelectField
                label="Storage Condition"
                icon={ThermometerSun}
                value={form.storageCondition}
                onChange={set('storageCondition')}
                required
                options={[
                  { value: 'refrigerated', label: 'Refrigerated' },
                  { value: 'room_temperature', label: 'Room Temperature' },
                  { value: 'frozen', label: 'Frozen' },
                  { value: 'heated', label: 'Heated' },
                ]}
              />

              <SelectField
                label="Packaging"
                icon={Package}
                value={form.packaging}
                onChange={set('packaging')}
                required
                options={[
                  { value: 'sealed_container', label: 'Sealed Container' },
                  { value: 'wrapped', label: 'Wrapped' },
                  { value: 'open', label: 'Open' },
                  { value: 'boxed', label: 'Boxed' },
                ]}
              />

              <SelectField
                label="Food Appearance"
                icon={Eye}
                value={form.foodAppearance}
                onChange={set('foodAppearance')}
                required
                options={[
                  { value: 'fresh', label: 'Fresh' },
                  { value: 'normal', label: 'Normal' },
                  { value: 'slightly_aged', label: 'Slightly Aged' },
                  { value: 'concerning', label: 'Concerning' },
                ]}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ingredients / Allergens Listed
                </label>
                <textarea
                  value={form.allergens}
                  onChange={set('allergens')}
                  rows={3}
                  placeholder="e.g. Contains nuts, dairy, gluten…"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition resize-none"
                />
              </div>
            </>
          )}

          {/* ─── PICKUP FIELDS ───────────────────────── */}
          {isPickup && (
            <>
              <SelectField
                label="Packaging Integrity"
                icon={Package}
                value={form.packagingIntegrity}
                onChange={set('packagingIntegrity')}
                required
                options={[
                  { value: 'intact', label: 'Intact' },
                  { value: 'minor_damage', label: 'Minor Damage' },
                  { value: 'compromised', label: 'Compromised' },
                ]}
              />

              <SelectField
                label="Food Appearance and Smell"
                icon={Eye}
                value={form.appearanceSmell}
                onChange={set('appearanceSmell')}
                required
                options={[
                  { value: 'normal', label: 'Normal' },
                  { value: 'slight_concern', label: 'Slight Concern' },
                  { value: 'concerning', label: 'Concerning' },
                ]}
              />

              <SelectField
                label="Temperature Appropriate?"
                icon={ThermometerSun}
                value={form.temperatureOk}
                onChange={set('temperatureOk')}
                required
                options={[
                  { value: 'yes', label: 'Yes' },
                  { value: 'no', label: 'No' },
                  { value: 'not_applicable', label: 'Not Applicable' },
                ]}
              />

              <SelectField
                label="Transport Container Ready?"
                icon={Package}
                value={form.transportContainer}
                onChange={set('transportContainer')}
                required
                options={[
                  { value: 'yes', label: 'Yes' },
                  { value: 'insulated_container', label: 'Insulated Container' },
                  { value: 'standard_container', label: 'Standard Container' },
                  { value: 'no_container', label: 'No Container' },
                ]}
              />
            </>
          )}

          {/* ─── SHARED: Contamination ───────────────── */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <AlertTriangle className="inline w-4 h-4 mr-1 text-orange-500" />
              Visible contamination or spoilage? <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="contamination"
                  value="no"
                  checked={form.hasContamination === 'no'}
                  onChange={set('hasContamination')}
                  className="accent-green-600 w-4 h-4"
                />
                <span className="text-sm text-gray-700">No</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="contamination"
                  value="yes"
                  checked={form.hasContamination === 'yes'}
                  onChange={set('hasContamination')}
                  className="accent-red-500 w-4 h-4"
                />
                <span className="text-sm text-gray-700">Yes</span>
              </label>
            </div>

            {form.hasContamination === 'yes' && (
              <textarea
                value={form.contaminationDescription}
                onChange={set('contaminationDescription')}
                rows={3}
                placeholder="Describe the contamination or spoilage concern…"
                className="w-full mt-3 rounded-lg border border-red-300 px-3 py-2.5 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition resize-none"
              />
            )}
          </div>

          {/* ─── SHARED: Image evidence ──────────────── */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Camera className="inline w-4 h-4 mr-1 text-gray-500" />
              Image Evidence <span className="text-xs text-gray-400">(optional)</span>
            </label>

            {imagePreview ? (
              <div className="relative rounded-lg overflow-hidden border border-gray-200">
                <img src={imagePreview} alt="Evidence" className="w-full h-48 object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 rounded-lg border-2 border-dashed border-gray-300 hover:border-green-400 cursor-pointer transition bg-gray-50 hover:bg-green-50">
                <Upload className="w-6 h-6 text-gray-400 mb-1" />
                <span className="text-sm text-gray-500">Click to upload photo</span>
                <span className="text-xs text-gray-400 mt-0.5">Max 5 MB</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImage}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* ─── SHARED: Confirmation checkbox ───────── */}
          <label className="flex items-start gap-3 p-4 rounded-lg border-2 border-green-200 bg-green-50 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.confirmSafe}
              onChange={set('confirmSafe')}
              className="accent-green-600 w-5 h-5 mt-0.5 shrink-0"
            />
            <span className="text-sm font-medium text-green-800 leading-snug">
              {isDonor
                ? 'I confirm this food is safe for consumption'
                : 'I confirm this food is safe for transport and delivery'}
            </span>
          </label>

          {/* ─── Submit ──────────────────────────────── */}
          <button
            type="submit"
            disabled={submitting || !form.confirmSafe}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-200"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Submitting…
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" /> Submit Safety Check
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
