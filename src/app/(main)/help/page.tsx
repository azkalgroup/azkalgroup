"use client";

import { useState } from 'react';

const faqs = [
  {
    question: "1. Bagaimana langkah awal untuk mulai berinvestasi?",
    answer: "Langkah pertama adalah mengisi saldo dengan menekan tombol 'Setor Dana' di menu kiri. Anda akan diarahkan ke WhatsApp Admin untuk mengonfirmasi nominal dan mengirim bukti transfer. Setelah divalidasi, saldo Anda akan otomatis masuk ke akun dan siap digunakan."
  },
  {
    question: "2. Bagaimana cara memilih dan mendanai proyek?",
    answer: "Buka menu 'Peluang Investasi' untuk melihat daftar motor atau proyek yang sedang membuka pendanaan. Pilih proyek yang Anda minati, pelajari detailnya, dan masukkan nominal investasi yang ingin Anda berikan dari saldo aktif Anda."
  },
  {
    question: "3. Kapan dan bagaimana saya mendapatkan keuntungan?",
    answer: "Sistem keuntungan kami berjalan secara real-time. Setiap kali motor dari proyek yang Anda danai disewa, Admin akan mencatat pendapatan sewa tersebut. Sistem akan otomatis membagikan profit bersih (setelah dipotong biaya operasional) langsung ke akun Anda, secara proporsional sesuai dengan persentase modal Anda. Anda juga akan menerima notifikasi setiap kali ada profit masuk."
  },
  {
    question: "4. Di mana saya bisa memantau aset dan detail keuntungan?",
    answer: "Semua aset investasi aktif Anda bisa dipantau di menu 'Portofolio'. Di sana Anda dapat melihat total modal, total keuntungan, dan ROI. Anda juga bisa menekan tombol 'Riwayat Keuntungan' pada masing-masing aset untuk melihat rincian setiap transaksi sewa yang memberikan Anda profit."
  },
  {
    question: "5. Bagaimana cara menarik dana (Withdraw) uang saya?",
    answer: "Anda dapat menarik saldo yang tersedia kapan saja dengan menekan tombol 'Tarik Dana' di menu navigasi. Masukkan nominal yang ingin ditarik, dan setelah disetujui oleh Admin, dana akan ditransfer kembali ke rekening bank yang Anda daftarkan."
  }
];

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="p-4 pt-4 md:p-8 md:pt-8 pb-24 w-full max-w-4xl mx-auto animate-fade-in">
      {/* HEADER */}
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Pusat Bantuan</h1>
        <p className="text-slate-500 font-medium mt-2">Temukan jawaban untuk pertanyaan umum atau hubungi tim dukungan kami.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FAQ SECTION */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Pertanyaan yang Sering Diajukan (FAQ)</h2>
          
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm transition-all duration-200"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between focus:outline-none"
                >
                  <span className="font-bold text-slate-800 text-sm">{faq.question}</span>
                  <div className={`w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}>
                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </button>
                
                <div 
                  className={`px-5 overflow-hidden transition-all duration-300 ease-in-out ${
                    openIndex === index ? 'max-h-40 pb-5 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="text-slate-500 text-sm leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CONTACT SUPPORT */}
        <div className="lg:col-span-1">
          <div className="bg-emerald-500 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-5 backdrop-blur-sm border border-white/20">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </div>
            
            <h3 className="text-xl font-bold mb-2">Butuh Bantuan Lebih?</h3>
            <p className="text-emerald-50 text-sm mb-6 leading-relaxed">Tim dukungan kami siap membantu Anda kapan saja. Silakan hubungi kami melalui WhatsApp.</p>
            
            <a 
              href="https://wa.me/6281234567890?text=Halo%20Admin%20InvestTrack,%20saya%20butuh%20bantuan." 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-full bg-white text-emerald-600 font-bold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-emerald-50 transition-colors shadow-sm"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.89-4.443 9.893-9.892.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.738-.974zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.347-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.876 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
              Chat dengan Admin
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
