"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { getUserId } from "@/lib/auth";

export default function AdminRentalsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [rentals, setRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filterProject, setFilterProject] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  // Form state
  const [form, setForm] = useState({
    project_id: "",
    customer_name: "",
    rental_date: new Date().toISOString().split("T")[0],
    duration_days: "1",
    gross_revenue: "",
    operational_cost: "",
    notes: "",
  });

  // Detail modal state
  const [viewingRental, setViewingRental] = useState<any>(null);
  const [earningsForRental, setEarningsForRental] = useState<any[]>([]);
  const [loadingEarnings, setLoadingEarnings] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [{ data: projectsData }, { data: rentalsData }] = await Promise.all([
      supabase
        .from("projects")
        .select("id,name,category,status")
        .order("name"),
      supabase
        .from("rental_revenues")
        .select("*, projects(name,category)")
        .order("rental_date", { ascending: false }),
    ]);

    if (projectsData) setProjects(projectsData);
    if (rentalsData) setRentals(rentalsData);
    setLoading(false);
  };

  const formatRupiah = (num: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num || 0);

  const parseNumber = (str: string) =>
    parseInt(str.replace(/\D/g, "") || "0");

  const formatInputRupiah = (value: string) => {
    const num = parseNumber(value);
    if (num === 0) return "";
    return num.toLocaleString("id-ID");
  };

  const netRevenue = parseNumber(form.gross_revenue) - parseNumber(form.operational_cost);

  const handleSubmit = async () => {
    if (!form.project_id || !form.customer_name || parseNumber(form.gross_revenue) === 0) {
      alert("Proyek, nama penyewa, dan pendapatan kotor harus diisi!");
      return;
    }

    setSubmitting(true);
    const userId = await getUserId();

    const { error } = await supabase.from("rental_revenues").insert([
      {
        project_id: form.project_id,
        customer_name: form.customer_name,
        rental_date: form.rental_date,
        duration_days: parseInt(form.duration_days) || 1,
        gross_revenue: parseNumber(form.gross_revenue),
        operational_cost: parseNumber(form.operational_cost),
        notes: form.notes || null,
        created_by: userId,
      },
    ]);

    if (error) {
      alert("Gagal menyimpan: " + error.message);
    } else {
      setIsFormOpen(false);
      setForm({
        project_id: "",
        customer_name: "",
        rental_date: new Date().toISOString().split("T")[0],
        duration_days: "1",
        gross_revenue: "",
        operational_cost: "",
        notes: "",
      });
      fetchData();
    }
    setSubmitting(false);
  };

  const viewRentalDetail = async (rental: any) => {
    setViewingRental(rental);
    setLoadingEarnings(true);
    const { data } = await supabase
      .from("investor_earnings")
      .select("*, profiles:investor_id(full_name)")
      .eq("rental_revenue_id", rental.id)
      .order("earning_amount", { ascending: false });
    setEarningsForRental(data || []);
    setLoadingEarnings(false);
  };

  // Summary stats
  const thisMonth = new Date().toISOString().slice(0, 7);
  const thisMonthRentals = rentals.filter((r) => r.rental_date?.startsWith(thisMonth));
  const totalGrossThisMonth = thisMonthRentals.reduce((acc, r) => acc + (r.gross_revenue || 0), 0);
  const totalCostThisMonth = thisMonthRentals.reduce((acc, r) => acc + (r.operational_cost || 0), 0);
  const totalNetThisMonth = totalGrossThisMonth - totalCostThisMonth;

  // Filter & paginate
  const filteredRentals = filterProject === "Semua"
    ? rentals
    : rentals.filter((r) => r.project_id === filterProject);

  const totalPages = Math.ceil(filteredRentals.length / ITEMS_PER_PAGE);
  const paginatedRentals = filteredRentals.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filterProject]);

  return (
    <div className="flex-1 w-full p-6 md:p-8 pt-8 min-h-screen animate-fade-in">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Pendapatan Sewa
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Catat transaksi sewa motor dan distribusi keuntungan otomatis ke
            investor.
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm shadow-emerald-600/20 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Catat Sewa Baru
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Total Sewa Bulan Ini
          </p>
          <p className="text-2xl font-bold text-slate-900">
            {loading ? "..." : thisMonthRentals.length}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">transaksi</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Pendapatan Kotor
          </p>
          <p className="text-2xl font-bold text-slate-900">
            {loading ? "..." : formatRupiah(totalGrossThisMonth)}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">bulan ini</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Biaya Operasional
          </p>
          <p className="text-2xl font-bold text-amber-600">
            {loading ? "..." : formatRupiah(totalCostThisMonth)}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">bulan ini</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm bg-gradient-to-br from-emerald-50 to-white">
          <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-1">
            Net Revenue
          </p>
          <p className="text-2xl font-bold text-emerald-700">
            {loading ? "..." : formatRupiah(totalNetThisMonth)}
          </p>
          <p className="text-xs text-emerald-600 mt-0.5">didistribusikan ke investor</p>
        </div>
      </div>

      {/* FILTER */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFilterProject("Semua")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
            filterProject === "Semua"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Semua Proyek
        </button>
        {projects
          .filter((p) => p.status === "Aktif")
          .map((p) => (
            <button
              key={p.id}
              onClick={() => setFilterProject(p.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                filterProject === p.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {p.name}
            </button>
          ))}
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Penyewa
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Proyek
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Tanggal & Durasi
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Gross
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Biaya
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Net Profit
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-slate-500 font-medium"
                  >
                    Memuat data sewa...
                  </td>
                </tr>
              ) : paginatedRentals.length > 0 ? (
                paginatedRentals.map((rental) => (
                  <tr
                    key={rental.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-900">
                        {rental.customer_name}
                      </div>
                      {rental.notes && (
                        <div className="text-xs text-slate-400 mt-0.5 max-w-[180px] truncate" title={rental.notes}>
                          {rental.notes}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border bg-blue-50 text-blue-700 border-blue-200">
                        {rental.projects?.name || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-700">
                        {new Date(rental.rental_date).toLocaleDateString(
                          "id-ID",
                          { day: "2-digit", month: "short", year: "numeric" }
                        )}
                      </div>
                      <div className="text-xs text-slate-400">
                        {rental.duration_days} hari
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-700">
                      {formatRupiah(rental.gross_revenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-600 font-medium">
                      -{formatRupiah(rental.operational_cost)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-emerald-600">
                        {formatRupiah(rental.net_revenue)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => viewRentalDetail(rental)}
                        className="text-slate-500 hover:text-emerald-600 bg-slate-50 hover:bg-emerald-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-slate-200 hover:border-emerald-200"
                      >
                        Lihat Detail
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <svg
                        className="w-12 h-12 mb-4 text-slate-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p className="text-lg font-medium text-slate-600">
                        Belum ada data sewa
                      </p>
                      <p className="text-sm text-slate-400 mt-1">
                        Klik &quot;Catat Sewa Baru&quot; untuk mulai mencatat pendapatan.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredRentals.length > ITEMS_PER_PAGE && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <span className="text-sm text-slate-500 font-medium">
              Menampilkan{" "}
              <span className="text-slate-900 font-bold">
                {paginatedRentals.length > 0
                  ? (currentPage - 1) * ITEMS_PER_PAGE + 1
                  : 0}{" "}
                -{" "}
                {Math.min(
                  currentPage * ITEMS_PER_PAGE,
                  filteredRentals.length
                )}
              </span>{" "}
              dari{" "}
              <span className="text-slate-900 font-bold">
                {filteredRentals.length}
              </span>{" "}
              data
            </span>
            <div className="flex gap-1">
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.max(prev - 1, 1))
                }
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-500 bg-white hover:bg-slate-50 disabled:opacity-50 transition-all"
              >
                Sebelumnya
              </button>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage >= totalPages}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-500 bg-white hover:bg-slate-50 disabled:opacity-50 transition-all"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: Catat Sewa Baru */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
              <h3 className="text-lg font-bold text-slate-900">
                Catat Sewa Baru
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Proyek */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Proyek <span className="text-rose-500">*</span>
                </label>
                <select
                  value={form.project_id}
                  onChange={(e) =>
                    setForm({ ...form, project_id: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white transition-colors text-sm"
                >
                  <option value="">Pilih proyek...</option>
                  {projects
                    .filter((p) => p.status === "Aktif")
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.category})
                      </option>
                    ))}
                </select>
              </div>

              {/* Nama Penyewa */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Nama Penyewa <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.customer_name}
                  onChange={(e) =>
                    setForm({ ...form, customer_name: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-sm"
                  placeholder="Nama orang yang nyewa"
                />
              </div>

              {/* Tanggal & Durasi */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    Tanggal Sewa
                  </label>
                  <input
                    type="date"
                    value={form.rental_date}
                    onChange={(e) =>
                      setForm({ ...form, rental_date: e.target.value })
                    }
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    Durasi (Hari)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.duration_days}
                    onChange={(e) =>
                      setForm({ ...form, duration_days: e.target.value })
                    }
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-sm"
                  />
                </div>
              </div>

              {/* Pendapatan Kotor */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Pendapatan Kotor (Rp){" "}
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formatInputRupiah(form.gross_revenue)}
                  onChange={(e) =>
                    setForm({ ...form, gross_revenue: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-sm"
                  placeholder="Contoh: 600000"
                />
              </div>

              {/* Biaya Operasional */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Biaya Operasional (Rp)
                </label>
                <input
                  type="text"
                  value={formatInputRupiah(form.operational_cost)}
                  onChange={(e) =>
                    setForm({ ...form, operational_cost: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-sm"
                  placeholder="Bensin, servis, dll (opsional)"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Kosongkan jika tidak ada biaya
                </p>
              </div>

              {/* Net Revenue Preview */}
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
                  Net Revenue (akan didistribusikan)
                </p>
                <p className="text-xl font-bold text-emerald-700">
                  {formatRupiah(netRevenue)}
                </p>
                <p className="text-xs text-emerald-500 mt-1">
                  = Pendapatan Kotor - Biaya Operasional
                </p>
              </div>

              {/* Catatan */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Catatan (Opsional)
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) =>
                    setForm({ ...form, notes: e.target.value })
                  }
                  rows={2}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-sm resize-none"
                  placeholder="Info tambahan..."
                />
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 transition-all disabled:opacity-50"
              >
                {submitting ? "Menyimpan..." : "Simpan & Distribusikan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Detail Sewa + Distribusi */}
      {viewingRental && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden transform transition-all">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
              <h3 className="text-lg font-bold text-slate-900">
                Detail Sewa
              </h3>
              <button
                onClick={() => { setViewingRental(null); setEarningsForRental([]); }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {/* Rental Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Penyewa</p>
                  <p className="text-sm font-bold text-slate-900">
                    {viewingRental.customer_name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Proyek</p>
                  <p className="text-sm font-bold text-slate-900">
                    {viewingRental.projects?.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Tanggal</p>
                  <p className="text-sm font-bold text-slate-900">
                    {new Date(viewingRental.rental_date).toLocaleDateString(
                      "id-ID",
                      { day: "2-digit", month: "long", year: "numeric" }
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Durasi</p>
                  <p className="text-sm font-bold text-slate-900">
                    {viewingRental.duration_days} hari
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">
                    Gross Revenue
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {formatRupiah(viewingRental.gross_revenue)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">
                    Biaya Operasional
                  </p>
                  <p className="text-sm font-bold text-amber-600">
                    -{formatRupiah(viewingRental.operational_cost)}
                  </p>
                </div>
              </div>

              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 mb-6">
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
                  Net Revenue
                </p>
                <p className="text-xl font-bold text-emerald-700">
                  {formatRupiah(viewingRental.net_revenue)}
                </p>
              </div>

              {viewingRental.notes && (
                <div className="mb-6 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-xs font-bold text-slate-500 mb-1">Catatan</p>
                  <p className="text-sm text-slate-700">{viewingRental.notes}</p>
                </div>
              )}

              {/* Distribusi ke Investor */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Distribusi Profit ke Investor
                </h4>

                {loadingEarnings ? (
                  <p className="text-sm text-slate-500 text-center py-4">
                    Memuat data distribusi...
                  </p>
                ) : earningsForRental.length > 0 ? (
                  <div className="space-y-2">
                    {earningsForRental.map((earning) => (
                      <div
                        key={earning.id}
                        className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs font-bold flex-shrink-0">
                            {earning.ownership_percentage}%
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              {earning.profiles?.full_name || "Investor"}
                            </p>
                            <p className="text-xs text-slate-400">
                              Modal: {formatRupiah(earning.investment_amount)}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-emerald-600">
                          +{formatRupiah(earning.earning_amount)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 text-center py-4 bg-slate-50 rounded-xl border border-slate-200">
                    Belum ada investor di proyek ini.
                  </p>
                )}
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => { setViewingRental(null); setEarningsForRental([]); }}
                className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
