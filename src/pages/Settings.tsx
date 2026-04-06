import React, { useState } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { NeuCard } from '../components/ui/NeuCard';
import { NeuButton } from '../components/ui/NeuButton';
import { NeuInput } from '../components/ui/NeuInput';
import { Save, CheckCircle, Upload, Trash2 } from 'lucide-react';

export const Settings = () => {
  const { settings, updateSettings } = useSettingsStore();

  const [formData, setFormData] = useState(settings);
  const [saved, setSaved] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'cgstPercent' || name === 'sgstPercent' || name === 'invoiceCounter'
        ? Number(value)
        : value,
    }));
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, signatureImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const clearSignature = () => {
    setFormData(prev => ({ ...prev, signatureImage: '' }));
  };

  const handleSave = () => {
    updateSettings(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="animate-fade-in w-full max-w-4xl mx-auto pb-10">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">System Settings</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your agency details and default configurations.</p>
        </div>
        <NeuButton variant="primary" icon={saved ? <CheckCircle size={18} /> : <Save size={18} />} onClick={handleSave}>
          {saved ? 'Saved!' : 'Save Settings'}
        </NeuButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <NeuCard>
          <h3 className="text-lg font-bold text-slate-700 mb-4 border-b border-white/20 pb-2">Business Details</h3>
          <div className="space-y-4">
            <NeuInput label="Agency Name" name="agencyName" value={formData.agencyName} onChange={handleChange} />
            <NeuInput label="Address" name="address" value={formData.address} onChange={handleChange} />
            <div className="grid grid-cols-2 gap-4">
              <NeuInput label="Mobile No" name="mobile" value={formData.mobile} onChange={handleChange} />
              <NeuInput label="State" name="state" value={formData.state} onChange={handleChange} />
            </div>
            <NeuInput label="Website" name="website" value={formData.website} onChange={handleChange} />
          </div>
        </NeuCard>

        <NeuCard>
          <h3 className="text-lg font-bold text-slate-700 mb-4 border-b border-white/20 pb-2">Legal & Tax Configuration</h3>
          <div className="space-y-4">
            <NeuInput label="CGST Number" name="cgstNo" value={formData.cgstNo} onChange={handleChange} />
            <NeuInput label="Drug License (D.L. No)" name="dlNo" value={formData.dlNo} onChange={handleChange} />
            <div className="grid grid-cols-2 gap-4">
              <NeuInput label="Default CGST (%)" name="cgstPercent" type="number" step="0.1" value={formData.cgstPercent} onChange={handleChange} />
              <NeuInput label="Default SGST (%)" name="sgstPercent" type="number" step="0.1" value={formData.sgstPercent} onChange={handleChange} />
            </div>
          </div>
        </NeuCard>

        <NeuCard className="md:col-span-2">
          <h3 className="text-lg font-bold text-slate-700 mb-4 border-b border-white/20 pb-2">Branding & Automations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="max-w-xs">
              <NeuInput label="Invoice Starting Number" name="invoiceCounter" type="number" value={formData.invoiceCounter} onChange={handleChange} />
              <p className="text-xs text-slate-500 mt-2">Next invoice will generate with this sequence number.</p>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold pl-1 text-slate-700">Digital Signature (Shown on Print)</label>
              <div className="p-4 border-2 border-dashed border-slate-300 rounded-neu-card flex flex-col items-center justify-center min-h-[120px] relative bg-white/50">
                {formData.signatureImage ? (
                  <div className="flex flex-col items-center gap-2">
                    <img src={formData.signatureImage} alt="Signature" className="h-16 object-contain" />
                    <button onClick={clearSignature} className="text-xs text-danger flex items-center gap-1 hover:underline">
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center gap-2 cursor-pointer text-slate-500 hover:text-primary transition-colors">
                    <Upload size={24} />
                    <span className="text-sm font-medium">Click to upload signature</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleSignatureUpload} />
                  </label>
                )}
              </div>
            </div>
          </div>
        </NeuCard>
      </div>

    </div>
  );
};
