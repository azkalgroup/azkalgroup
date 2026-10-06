"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminOpportunitiesPage() {
  const [filter, setFilter] = useState("Semua");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [viewingProject, setViewingProject] = useState<any>(null);
  
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form States
  const [addForm, setAddForm] = useState({ name: "", category: "Kesehatan", target: "", roi: "10% - 15% p.a", status: "Aktif" });
  const [editForm, setEditForm] = useState({ name: "", status: "Aktif" });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Error fetching projects:", error);
    } else if (data) {
      setProjects(data);
    }
    setIsLoading(false);
  };

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number || 0);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
  };

  const handleAddProject = async () => {
    const targetAmount = parseInt(addForm.target.replace(/\D/g, '') || '0');
    if (!addForm.name || targetAmount === 0) {
      alert("Nama dan Target Dana harus diisi!");
      return;
    }

    // Default 6 months from now
    const deadlineDate = new Date();
    deadlineDate.setMonth(deadlineDate.getMonth() + 6);

    let imageUrl = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop'; // Default placeholder

    if (imageFile) {
      // Upload ke Supabase Storage
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('projects')
        .upload(fileName, imageFile);

      if (uploadError) {
        alert("Gagal mengunggah foto: " + uploadError.message);
        return;
      }

      // Ambil URL publik dari foto yang diunggah
      const { data } = supabase.storage.from('projects').getPublicUrl(uploadData.path);
      imageUrl = data.publicUrl;
    }

    const newProject = {
      name: addForm.name,
      category: addForm.category,
      target_amount: targetAmount,
      roi: addForm.roi,
      deadline: deadlineDate.toISOString(),
      status: addForm.status,
      image_url: imageUrl
    };

    const { data: insertedData, error } = await supabase.from('projects').insert([newProject]).select();
    
    if (error) {
      alert("Gagal menyimpan: " + error.message);
    } else {
      // Kirim notifikasi ke semua investor
      const { data: investors } = await supabase.from('profiles').select('id').eq('role', 'investor');
      console.log('[Admin] Investors found:', investors?.length);
      if (investors && investors.length > 0) {
        const notifs = investors.map((inv: any) => ({
          user_id: inv.id,
          title: '🆕 Proyek Baru Tersedia!',
          message: `Proyek "${addForm.name}" (${addForm.category}) baru saja ditambahkan dengan target dana ${formatRupiah(parseInt(addForm.target.replace(/\D/g, '') || '0'))}. Cek sekarang!`,
        }));
        const { error: notifError } = await supabase.from('notifications').insert(notifs);
        console.log('[Admin] Notification insert result:', notifError ? notifError.message : 'SUCCESS');
      }

      setIsAddModalOpen(false);
      setAddForm({ name: "", category: "Kesehatan", target: "", roi: "10% - 15% p.a", status: "Aktif" });
      setImageFile(null);
      fetchProjects();
    }
  };

  const openEditModal = (project: any) => {
    setEditingProject(project);
    setEditForm({ name: project.name, status: project.status });
  };

  const handleEditProject = async () => {
    if (!editingProject) return;

    let imageUrl = editingProject.image_url;

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('projects')
        .upload(fileName, imageFile);

      if (!uploadError) {
        const { data } = supabase.storage.from('projects').getPublicUrl(uploadData.path);
        imageUrl = data.publicUrl;
      }
    }

    const { error } = await supabase
      .from('projects')
      .update({ name: editForm.name, status: editForm.status, image_url: imageUrl })
      .eq('id', editingProject.id);

    if (error) {
      alert("Gagal memperbarui: " + error.message);
    } else {
      // Jika status diubah menjadi "Aktif", kirim notifikasi ke semua investor
      if (editForm.status === 'Aktif' && editingProject.status !== 'Aktif') {
        const { data: investors } = await supabase.from('profiles').select('id').eq('role', 'investor');
        if (investors && investors.length > 0) {
          const notifs = investors.map((inv: any) => ({
            user_id: inv.id,
            title: '🚀 Proyek Sekarang Aktif!',
            message: `Proyek "${editForm.name}" kini dibuka untuk investasi. Segera investasikan dana Anda!`,
          }));
          await supabase.from('notifications').insert(notifs);
        }
      }
      setEditingProject(null);
      setImageFile(null);
      fetchProjects();
    }
  };

  const filteredProjects = projects.filter(p => filter === "Semua" || p.status === filter);

  return (
    <div className="flex-1 w-full p-6 md:p-8 pt-8 min-h-screen animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Manajemen Proyek Pendanaan</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Buat dan kelola daftar peluang investasi untuk investor.</p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm shadow-emerald-600/20 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          Buat Proyek Baru
        </button>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {["Semua", "Aktif", "Draf", "Selesai"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              filter === tab 
                ? "bg-slate-900 text-white shadow-sm" 
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="w-full flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="w-full text-center py-20 bg-white rounded-2xl border border-slate-200">
          <p className="text-slate-500 font-medium">Belum ada proyek yang ditemukan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
              {/* Image Placeholder */}
              <div className="h-48 bg-slate-200 relative overflow-hidden">
                <img 
                  src={project.image_url || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop'} 
                  alt={project.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md ${
                    project.status === 'Aktif' ? 'bg-emerald-500/90 text-white' : 
                    project.status === 'Selesai' ? 'bg-blue-500/90 text-white' : 'bg-slate-800/90 text-white'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/90 text-slate-700 shadow-sm backdrop-blur-md">
                    {project.category}
                  </span>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-slate-900 line-clamp-1 group-hover:text-emerald-600 transition-colors" title={project.name}>{project.name}</h3>
                </div>
                <p className="text-xs text-slate-500 mb-4 font-medium">Estimasi ROI: <span className="text-emerald-600 font-bold">{project.roi}</span></p>

                <div className="mt-auto space-y-4">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-medium text-slate-500">Terkumpul</span>
                      <span className="font-bold text-slate-700">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className={`${project.progress >= 100 ? 'bg-blue-500' : 'bg-emerald-500'} h-2 rounded-full transition-all duration-1000`} style={{ width: `${Math.min(project.progress, 100)}%` }}></div>
                    </div>
                    <div className="flex justify-between text-xs mt-1.5">
                      <span className="font-bold text-slate-900">{formatRupiah(project.collected_amount)}</span>
                      <span className="text-slate-500">dari {formatRupiah(project.target_amount)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-3 border-t border-slate-100">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Total Investor</p>
                      <p className="text-sm font-bold text-slate-900">{project.investors_count} <span className="text-xs text-slate-500 font-normal">Orang</span></p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Tenggat Waktu</p>
                      <p className="text-sm font-bold text-slate-900">{formatDate(project.deadline)}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button onClick={() => openEditModal(project)} className="flex-1 bg-white border border-slate-200 text-slate-700 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
                      Edit Proyek
                    </button>
                    <button onClick={() => setViewingProject(project)} className="flex-1 bg-slate-900 text-white py-2 rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm shadow-slate-900/20">
                      Lihat Detail
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Tambah Proyek */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
              <h3 className="text-lg font-bold text-slate-900">Buat Proyek Baru</h3>
              <button onClick={() => { setIsAddModalOpen(false); setImageFile(null); }} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Foto Proyek</label>
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="dropzone-file-add" className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors overflow-hidden relative">
                    {imageFile ? (
                      <>
                        <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <p className="text-white font-medium text-sm">Ganti Foto</p>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                        <p className="mb-1 text-sm text-slate-500"><span className="font-bold text-emerald-600">Klik untuk unggah</span></p>
                        <p className="text-xs text-slate-400">PNG, JPG (Maks 2MB)</p>
                      </div>
                    )}
                    <input 
                      id="dropzone-file-add" 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          setImageFile(e.target.files[0]);
                        }
                      }} 
                    />
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Nama Proyek</label>
                <input 
                  type="text" 
                  value={addForm.name} 
                  onChange={(e) => setAddForm({...addForm, name: e.target.value})}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-sm" 
                  placeholder="Contoh: Klinik Sehat" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Kategori</label>
                <select 
                  value={addForm.category}
                  onChange={(e) => setAddForm({...addForm, category: e.target.value})}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white transition-colors text-sm"
                >
                  <option>Kesehatan</option>
                  <option>F&B</option>
                  <option>Manufaktur</option>
                  <option>Teknologi</option>
                  <option>Properti</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Target Dana (Rp)</label>
                <input 
                  type="text" 
                  value={addForm.target}
                  onChange={(e) => setAddForm({...addForm, target: e.target.value})}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-sm" 
                  placeholder="Contoh: 500000000" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Estimasi ROI</label>
                <input 
                  type="text" 
                  value={addForm.roi}
                  onChange={(e) => setAddForm({...addForm, roi: e.target.value})}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-sm" 
                  placeholder="Contoh: 12% - 15% p.a" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Status Publikasi</label>
                <select 
                  value={addForm.status}
                  onChange={(e) => setAddForm({...addForm, status: e.target.value})}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white transition-colors text-sm"
                >
                  <option value="Aktif">🟢 Aktif — langsung tampil ke investor</option>
                  <option value="Draf">🔘 Draf — simpan dulu, belum tampil</option>
                </select>
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => { setIsAddModalOpen(false); setImageFile(null); }} className="px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">Batal</button>
              <button onClick={handleAddProject} className="px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 transition-all">Simpan Proyek</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit Proyek */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
              <h3 className="text-lg font-bold text-slate-900">Edit Proyek</h3>
              <button onClick={() => { setEditingProject(null); setImageFile(null); }} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Foto Proyek</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                    <img src={imageFile ? URL.createObjectURL(imageFile) : (editingProject.image_url || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')} alt={editingProject.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <input 
                      type="file" 
                      id="edit-photo" 
                      className="hidden" 
                      accept="image/*" 
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          setImageFile(e.target.files[0]);
                        }
                      }}
                    />
                    <button onClick={() => document.getElementById('edit-photo')?.click()} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                      Ubah Foto
                    </button>
                    <p className="text-[10px] text-slate-400 mt-1.5 font-medium">Format JPG, PNG (Maks 2MB)</p>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Nama Proyek</label>
                <input 
                  type="text" 
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-sm" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Status</label>
                <select 
                  value={editForm.status}
                  onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white transition-colors text-sm"
                >
                  <option>Aktif</option>
                  <option>Draf</option>
                  <option>Selesai</option>
                </select>
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => { setEditingProject(null); setImageFile(null); }} className="px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">Batal</button>
              <button onClick={handleEditProject} className="px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 transition-all">Simpan Perubahan</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Lihat Detail */}
      {viewingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden transform transition-all">
            <div className="h-40 bg-slate-200 relative">
              <img src={viewingProject.image_url || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop'} className="w-full h-full object-cover" alt="" />
              <div className="absolute inset-0 bg-slate-900/40"></div>
              <button onClick={() => setViewingProject(null)} className="absolute top-4 right-4 text-white hover:text-slate-200 bg-black/20 hover:bg-black/40 p-1.5 rounded-full backdrop-blur-md transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <div className="absolute bottom-4 left-6 pr-6">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${viewingProject.status === 'Aktif' ? 'bg-emerald-500' : viewingProject.status === 'Selesai' ? 'bg-blue-500' : 'bg-slate-700'} text-white mb-2 inline-block shadow-sm`}>
                  {viewingProject.status}
                </span>
                <h3 className="text-xl font-bold text-white shadow-sm">{viewingProject.name}</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Kategori</p>
                  <p className="text-sm font-bold text-slate-900">{viewingProject.category}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Target Dana</p>
                  <p className="text-sm font-bold text-slate-900">{formatRupiah(viewingProject.target_amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Terkumpul</p>
                  <p className="text-sm font-bold text-emerald-600">{formatRupiah(viewingProject.collected_amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Progress</p>
                  <p className="text-sm font-bold text-slate-900">{viewingProject.progress}%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Estimasi ROI</p>
                  <p className="text-sm font-bold text-slate-900">{viewingProject.roi}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Tenggat Waktu</p>
                  <p className="text-sm font-bold text-slate-900">{formatDate(viewingProject.deadline)}</p>
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button onClick={() => setViewingProject(null)} className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
