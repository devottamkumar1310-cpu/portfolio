import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { UploadCloud, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function CertificateUpload() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    issuer: "",
    date: "",
    category: "Software Development",
    skills: "",
    verificationLink: "",
    featured: false
  });
  
  const [file, setFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const target = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: target.checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (!file) throw new Error("A certificate file is required.");
      if (!formData.title || !formData.issuer) throw new Error("Title and Issuer are required.");

      // 1. Upload File to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `certificates/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('certificate_files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('certificate_files')
        .getPublicUrl(filePath);

      // 3. Process Metadata
      const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(Boolean);

      // 4. Insert into Database
      const { error: dbError } = await supabase.from('certificates').insert([
        {
          title: formData.title,
          issuer: formData.issuer,
          issue_date: formData.date,
          category: formData.category,
          skills: skillsArray,
          verification_url: formData.verificationLink || publicUrl, // Fallback to public URL if no official link
          file_url: publicUrl,
          featured: formData.featured
        }
      ]);

      if (dbError) throw dbError;

      setSuccess(true);
      // Reset form on success
      setFormData({
        title: "", issuer: "", date: "", category: "Software Development", 
        skills: "", verificationLink: "", featured: false
      });
      setFile(null);
      
      // Clear file input visually
      const fileInput = document.getElementById("file-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during upload.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.015] border border-white/10 space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white tracking-tight">Upload New Certificate</h3>
        <p className="text-sm text-gray-400 font-sans mt-1">
          Upload a PDF or image file and enter the certificate details.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-widest text-gray-400">Title</label>
            <input 
              name="title" 
              value={formData.title} 
              onChange={handleChange} 
              required
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors" 
              placeholder="e.g. Data Science Specialization" 
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-widest text-gray-400">Issuing Organization</label>
            <input 
              name="issuer" 
              value={formData.issuer} 
              onChange={handleChange} 
              required
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors" 
              placeholder="e.g. Coursera / IBM" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-widest text-gray-400">Category</label>
            <select 
              name="category" 
              value={formData.category} 
              onChange={handleChange} 
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
            >
              <option value="Software Development">Software Development</option>
              <option value="Data Science & Analytics">Data Science & Analytics</option>
              <option value="Professional Development">Professional Development</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-widest text-gray-400">Date Completed</label>
            <input 
              name="date" 
              value={formData.date} 
              onChange={handleChange} 
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors" 
              placeholder="e.g. May 2026 or YYYY-MM-DD" 
            />
          </div>
        </div>

        {/* Detailed Information */}
        <div className="space-y-2">
          <label className="text-xs font-mono uppercase tracking-widest text-gray-400">Skills Gained (Comma Separated)</label>
          <input 
            name="skills" 
            value={formData.skills} 
            onChange={handleChange} 
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors" 
            placeholder="e.g. Python, Machine Learning, API Design" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-mono uppercase tracking-widest text-gray-400">Official Verification URL (Optional)</label>
          <input 
            name="verificationLink" 
            type="url"
            value={formData.verificationLink} 
            onChange={handleChange} 
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors" 
            placeholder="https://coursera.org/verify/..." 
          />
        </div>

        {/* File Upload and Flags */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 flex-1">
            <label className="text-xs font-mono uppercase tracking-widest text-gray-400 block">Certificate File (PDF or Image)</label>
            <input 
              id="file-upload"
              type="file" 
              accept=".pdf,image/png,image/jpeg,image/webp"
              onChange={handleFileChange} 
              required
              className="block w-full text-sm text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-white/10 file:text-white hover:file:bg-white/20 file:transition-colors cursor-pointer" 
            />
          </div>
          
          <div className="flex items-center space-x-3 pb-2">
            <input 
              type="checkbox" 
              id="featured" 
              name="featured" 
              checked={formData.featured} 
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-600 text-amber-500 focus:ring-amber-500 focus:ring-offset-black bg-black" 
            />
            <label htmlFor="featured" className="text-sm text-amber-400 font-semibold cursor-pointer">
              Mark as Featured Certificate
            </label>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/20 flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-200 font-sans leading-relaxed">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/20 flex items-start space-x-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-sm text-emerald-200 font-sans leading-relaxed">
              Certificate successfully uploaded and synchronized with the database!
            </p>
          </div>
        )}

        {/* Submit */}
        <div className="pt-4 border-t border-white/10">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:hover:bg-cyan-500 text-cyan-950 font-bold text-sm rounded-xl flex items-center justify-center space-x-2 transition-colors shadow-[0_0_20px_-5px_rgba(6,182,212,0.4)]"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
            <span>{loading ? "Processing Upload..." : "Upload & Publish Certificate"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
