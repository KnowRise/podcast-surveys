import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import ThemeToggle from "../components/ThemeToggle";

interface Survey {
  id: string;
  name: string;
  topics: string[];
  description: string;
  podcast_formats: string[];
  suggested_guest: string | null;
  created_at: string;
}

interface Stats {
  [key: string]: number;
}

function Dashboard() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [filteredSurveys, setFilteredSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [topicFilter, setTopicFilter] = useState("all");
  const [formatFilter, setFormatFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [topicStats, setTopicStats] = useState<Stats>({});
  const [formatStats, setFormatStats] = useState<Stats>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const navigate = useNavigate();
  const [deleteItems, setDeleteItems] = useState<string[]>([]);

  useEffect(() => {
    checkAuth();
    fetchSurveys();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [surveys, topicFilter, formatFilter, searchTerm]);

  const checkAuth = async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      navigate("/login?admin");
    }
  };

  const fetchSurveys = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("surveys")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching surveys:", error);
    } else if (data) {
      setSurveys(data);
      calculateStats(data);
    }
    setLoading(false);
  };

  const calculateStats = (data: Survey[]) => {
    const topics: Stats = {};
    const formats: Stats = {};

    data.forEach((survey) => {
      // Count each topic/format from arrays
      survey.topics.forEach((topic) => {
        topics[topic] = (topics[topic] || 0) + 1;
      });
      survey.podcast_formats.forEach((format) => {
        formats[format] = (formats[format] || 0) + 1;
      });
    });

    setTopicStats(topics);
    setFormatStats(formats);
  };

  const applyFilters = () => {
    let filtered = [...surveys];

    if (topicFilter !== "all") {
      filtered = filtered.filter((s) => s.topics.includes(topicFilter));
    }

    if (formatFilter !== "all") {
      filtered = filtered.filter((s) =>
        s.podcast_formats.includes(formatFilter),
      );
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(term) ||
          s.description.toLowerCase().includes(term) ||
          (s.suggested_guest && s.suggested_guest.toLowerCase().includes(term)),
      );
    }

    setFilteredSurveys(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Change handleDeleteSurvey to accept an array of IDs for bulk deletion
  const handleDeleteSurvey = async (ids: string[]) => {
    if (window.confirm("Are you sure you want to delete these surveys?")) {
      const { error } = await supabase.from("surveys").delete().in("id", ids);
      if (error) {
        console.error("Error deleting surveys:", error);
      } else {
        setSurveys((prev) => prev.filter((s) => !ids.includes(s.id)));
        setDeleteItems([]);
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login?admin");
  };

  const uniqueTopics = Array.from(
    new Set(surveys.flatMap((s) => s.topics)),
  ).sort();
  const uniqueFormats = Array.from(
    new Set(surveys.flatMap((s) => s.podcast_formats)),
  ).sort();

  // Pagination logic
  const totalPages = Math.ceil(filteredSurveys.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSurveys = filteredSurveys.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-5">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Survey Dashboard
          </h1>
          <div className="flex gap-5 items-center">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="px-5 py-2.5 bg-red-600 text-white border-none rounded cursor-pointer hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-900 dark:text-gray-100">Loading...</p>
        ) : (
          <>
            {/* Statistics Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Statistics
              </h2>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-5">
                <div className="p-5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <h3 className="mt-0 text-gray-900 dark:text-gray-100 mb-3">
                    Topics ({Object.keys(topicStats).length})
                  </h3>
                  <div className="max-h-75 overflow-y-auto">
                    {Object.entries(topicStats)
                      .sort(([, a], [, b]) => b - a)
                      .map(([topic, count]) => (
                        <div
                          key={topic}
                          className="flex justify-between py-2 border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                        >
                          <span>{topic}</span>
                          <span className="font-bold">{count}</span>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="p-5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <h3 className="mt-0 text-gray-900 dark:text-gray-100 mb-3">
                    Podcast Formats ({Object.keys(formatStats).length})
                  </h3>
                  <div className="max-h-75 overflow-y-auto">
                    {Object.entries(formatStats)
                      .sort(([, a], [, b]) => b - a)
                      .map(([format, count]) => (
                        <div
                          key={format}
                          className="flex justify-between py-2 border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                        >
                          <span>{format}</span>
                          <span className="font-bold">{count}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Filters Section */}
            <div className="mb-5 p-5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800">
              <h3 className="mt-0 text-gray-900 dark:text-gray-100 mb-4">
                Filters
              </h3>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
                <div>
                  <label className="block mb-1 font-bold text-gray-900 dark:text-gray-100">
                    Topic
                  </label>
                  <select
                    value={topicFilter}
                    onChange={(e) => setTopicFilter(e.target.value)}
                    className="w-full p-2 text-base rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"
                  >
                    <option value="all">All Topics</option>
                    {uniqueTopics.map((topic) => (
                      <option key={topic} value={topic}>
                        {topic}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-bold text-gray-900 dark:text-gray-100">
                    Format
                  </label>
                  <select
                    value={formatFilter}
                    onChange={(e) => setFormatFilter(e.target.value)}
                    className="w-full p-2 text-base rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"
                  >
                    <option value="all">All Formats</option>
                    {uniqueFormats.map((format) => (
                      <option key={format} value={format}>
                        {format}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-bold text-gray-900 dark:text-gray-100">
                    Search (Name/Description/Guest)
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Type to search..."
                    className="w-full p-2 text-base rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"
                  />
                </div>
              </div>
              <div className="mt-2.5">
                <button
                  onClick={() => {
                    setTopicFilter("all");
                    setFormatFilter("all");
                    setSearchTerm("");
                  }}
                  className="px-4 py-2 cursor-pointer bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Clear Filters
                </button>
              </div>
            </div>
            {deleteItems.length > 0 && (
              <div className="mt-2.5">
                <button
                  onClick={() => handleDeleteSurvey(deleteItems)}
                  className="px-4 py-2 cursor-pointer bg-red-500 text-white border border-red-600 rounded hover:bg-red-600"
                >
                  Delete Selected ({deleteItems.length})
                </button>
              </div>
            )}

            {/* Results */}
            <div>
              <h3 className="text-gray-900 dark:text-gray-100 mb-4">
                Survey Results (Showing {startIndex + 1}-
                {Math.min(endIndex, filteredSurveys.length)} of{" "}
                {filteredSurveys.length})
              </h3>
              {filteredSurveys.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">
                  No surveys found with the current filters.
                </p>
              ) : (
                <>
                  <div className="grid gap-4">
                    {currentSurveys.map((survey) => (
                      <div
                        key={survey.id}
                        className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 cursor-pointer"
                        onClick={() => {
                          if (deleteItems.includes(survey.id)) {
                            setDeleteItems(
                              deleteItems.filter((id) => id !== survey.id),
                            );
                          } else {
                            setDeleteItems([...deleteItems, survey.id]);
                          }
                        }}
                      >
                        <div className="mb-2.5">
                          <input
                            type="checkbox"
                            checked={deleteItems.includes(survey.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setDeleteItems([...deleteItems, survey.id]);
                              } else {
                                setDeleteItems(
                                  deleteItems.filter((id) => id !== survey.id),
                                );
                              }
                            }}
                            className="mr-2"
                          />
                          <strong className="text-lg text-gray-900 dark:text-gray-100">
                            {survey.name === "" ? "Anonymous" : survey.name}
                          </strong>
                          <span className="ml-2.5 text-gray-600 dark:text-gray-400 text-sm">
                            {new Date(survey.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="mb-2">
                          <div className="mb-1">
                            {survey.topics.map((topic) => (
                              <span
                                key={topic}
                                className="inline-block py-1 px-2 bg-gray-200 dark:bg-gray-700 rounded mr-2 mb-1 text-sm text-gray-900 dark:text-gray-100"
                              >
                                📂 {topic}
                              </span>
                            ))}
                          </div>
                          <div>
                            {survey.podcast_formats.map((format) => (
                              <span
                                key={format}
                                className="inline-block py-1 px-2 bg-gray-200 dark:bg-gray-700 rounded mr-2 mb-1 text-sm text-gray-900 dark:text-gray-100"
                              >
                                🎙️ {format}
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="my-2.5 text-gray-900 dark:text-gray-100">
                          {survey.description}
                        </p>
                        {survey.suggested_guest && (
                          <p className="my-1 text-gray-600 dark:text-gray-400">
                            <strong>Suggested Guest:</strong>{" "}
                            {survey.suggested_guest}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="mt-8 flex justify-center items-center gap-2.5 flex-wrap">
                      <button
                        onClick={() => goToPage(1)}
                        disabled={currentPage === 1}
                        className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        «« First
                      </button>
                      <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        « Prev
                      </button>
                      <span className="px-3 py-2 text-gray-900 dark:text-gray-100">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        Next »
                      </button>
                      <button
                        onClick={() => goToPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        Last »»
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
