import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import ThemeToggle from "../components/ThemeToggle";
import Layout from "../components/Layout";

interface FormData {
  name: string;
  topics: string[];
  description: string;
  podcast_formats: string[];
  suggested_guest: string;
}

const TOPICS = [
  "Software Development (Web, Mobile, Game)",
  "Artificial Intelligence & Machine Learning",
  "Cyber Security & Ethical Hacking",
  "Cloud Computing & DevOps",
  "Data Science & Big Data",
  "Blockchain & Web3",
  "Internet of Things (IoT) & Robotics",
  "UI/UX Design & Product Management",
  "Open Source Contribution",
  "Tech Career Roadmaps (Internship & Jobs)",
  "Startup & Digital Business",
  "IT Student Survival Guide (Tips Kuliah)",
  "Tech Trends & News",
  "Competitive Programming & Hackathons",
  "Linux & Open Source Culture",
  "Other (Isikan di kolom Deskripsi)",
];

const PODCAST_FORMATS = [
  "Expert Interview (Wawancara Dosen/Praktisi)",
  "Alumni Success Story (Berbagi pengalaman lulusan)",
  "Student Talk (Ngobrol santai antar mahasiswa)",
  "Tech News Roundup (Rangkuman berita IT mingguan)",
  "Q&A Session (Menjawab pertanyaan dari audiens)",
];

function SurveyForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    topics: [],
    description: "",
    podcast_formats: [],
    suggested_guest: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleCheckboxChange = (
    field: "topics" | "podcast_formats",
    value: string,
  ) => {
    setFormData((prev) => {
      const currentArray = prev[field];
      const newArray = currentArray.includes(value)
        ? currentArray.filter((item) => item !== value)
        : [...currentArray, value];
      return { ...prev, [field]: newArray };
    });
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (formData.topics.length === 0) {
      setError("Pilih minimal satu topik yang ingin kamu dengarkan");
      return;
    }

    if (formData.podcast_formats.length === 0) {
      setError("Pilih minimal satu format podcast");
      return;
    }

    setLoading(true);

    try {
      // Insert single row with arrays
      const { error: insertError } = await supabase.from("surveys").insert({
        name: formData.name,
        topics: formData.topics,
        description: formData.description,
        podcast_formats: formData.podcast_formats,
        suggested_guest: formData.suggested_guest || null,
      });

      if (insertError) {
        throw insertError;
      }

      setSuccess(true);
      setFormData({
        name: "",
        topics: [],
        description: "",
        podcast_formats: [],
        suggested_guest: "",
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="w-full md:w-[25%] flex flex-col gap-4 p-6 md:p-4 shadow-[0_2px_4px_rgba(0,0,0,0.1)] dark:shadow-[0_2px_4px_rgba(255,255,255,0.1)] rounded my-4">
        <div className="flex items-center gap-5 justify-center">
          <h1 className="text-2xl md:text-3xl font-bold">InformaTalks Survey</h1>
          <ThemeToggle />
        </div>
        <p className="flex flex-col items-center text-lg text-center text-slate-600 dark:text-slate-400">
          Bantu Kami membuat podcast yang lebih baik dengan mengisi survei singkat ini! 🎙️
        </p>

        {success && (
          <div className="text-green-800 p-4 border border-green-800 rounded bg-green-100 dark:bg-green-900/30">
            Terima kasih atas partisipasi Anda! 🎉
          </div>
        )}

        {error && (
          <div className="text-red-700 p-4 border border-red-700 rounded bg-red-100 dark:bg-red-900/30">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="name" className="font-bold">
              Nama (Opsional)
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full p-2.5 text-base rounded border border-slate-300 dark:border-slate-600"
            />
          </div>

          <div className="flex flex-col gap-4 border border-slate-300 dark:border-slate-600 rounded p-4">
            <label className="font-bold">
              Topik yang ingin kamu dengarkan di podcast kami? <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2.5">
              {TOPICS.map((topic) => (
                <label key={topic} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.topics.includes(topic)}
                    onChange={() => handleCheckboxChange("topics", topic)}
                    className="mr-2 cursor-pointer"
                  />
                  {topic}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block font-bold">
              Deskripsi (Opsional)
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              className="w-full p-2.5 text-base rounded border border-slate-300 dark:border-slate-600"
            />
          </div>

          <div className="flex flex-col gap-4 border border-slate-300 dark:border-slate-600 rounded p-4">
            <label className="block font-bold">
              {/* Preferred Podcast Format * */}
              Format Podcast yang kamu sukai? <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2.5">
              {PODCAST_FORMATS.map((format) => (
                <label
                  key={format}
                  className="flex items-center cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.podcast_formats.includes(format)}
                    onChange={() =>
                      handleCheckboxChange("podcast_formats", format)
                    }
                    className="mr-2 cursor-pointer"
                  />
                  {format}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="suggested_guest" className="block font-bold">
              {/* Suggested Guest */}
              Sara (Opsional)
            </label>
            <input
              id="suggested_guest"
              type="text"
              value={formData.suggested_guest}
              onChange={(e) =>
                setFormData({ ...formData, suggested_guest: e.target.value })
              }
              className="w-full p-2.5 text-base rounded border border-slate-300 dark:border-slate-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 text-lg font-bold text-white border-none rounded-lg cursor-pointer disabled:cursor-not-allowed disabled:bg-slate-400 bg-indigo-500 hover:bg-indigo-600"
          >
            {loading ? "Submitting..." : "Submit Survey"}
          </button>
        </form>
      </div>
    </Layout>
  );
}

export default SurveyForm;
