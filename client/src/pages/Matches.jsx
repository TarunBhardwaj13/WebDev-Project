import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import {
  Search,
  Filter,
  Sparkles,
  Send,
  GraduationCap,
  Star,
  Award,
  BookOpen,
  X,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Users,
} from "lucide-react";

export default function Matches() {
  const { user } = useAuth();

  const [partners, setPartners] = useState([]);
  const [requestStatuses, setRequestStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedMode, setSelectedMode] = useState("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [teachSkill, setTeachSkill] = useState("");
  const [learnSkill, setLearnSkill] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [toast, setToast] = useState(null);

  // =====================================
  // TOAST NOTIFICATION
  // =====================================

  const showToast = (message, type = "success") => {
    setToast({ message, type });

    window.setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // =====================================
  // FETCH PARTNERS AND REQUEST STATUS
  // =====================================

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setApiError("");

      const [matchesResponse, requestsResponse] =
        await Promise.all([
          api.get("/matches"),
          api.get("/requests/my"),
        ]);

      const partnerData = matchesResponse.data?.data || [];
      const requestData = requestsResponse.data?.data || {};

      const received = requestData.received || [];
      const sent = requestData.sent || [];

      const statusMap = {};

      // Requests sent by the current user
      sent.forEach((request) => {
        const receiverId =
          request.receiver?._id || request.receiver;

        if (receiverId) {
          statusMap[String(receiverId)] = request.status;
        }
      });

      // Requests received from other users
      received.forEach((request) => {
        const senderId = request.sender?._id || request.sender;

        if (!senderId) return;

        const key = String(senderId);
        const existingStatus = statusMap[key];

        // An accepted connection takes priority.
        if (
          request.status === "accepted" ||
          !existingStatus
        ) {
          statusMap[key] = request.status;
        }
      });

      setPartners(partnerData);
      setRequestStatuses(statusMap);
    } catch (error) {
      console.error("Failed to load matches:", error);

      setApiError(
        error.response?.data?.message ||
          "Unable to load skill partners. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // =====================================
  // OPEN REQUEST MODAL
  // =====================================

  const handleOpenModal = (partner) => {
    const status = requestStatuses[String(partner._id)];

    if (status === "accepted") {
      showToast("You are already connected with this user.", "info");
      return;
    }

    if (status === "pending") {
      showToast("A request is already pending with this user.", "info");
      return;
    }

    setSelectedPartner(partner);

    setTeachSkill(
      user?.skillsToTeach?.[0]?.name || ""
    );

    setLearnSkill(
      partner.skillsToTeach?.[0]?.name || ""
    );

    setCustomMessage(
      `Hi ${partner.name?.split(" ")[0] || ""}, I would like to exchange skills with you!`
    );

    setIsModalOpen(true);
  };

  // =====================================
  // SEND REQUEST
  // =====================================

  const handleSubmitRequest = async (event) => {
    event.preventDefault();

    if (!selectedPartner || submitting) return;

    if (!teachSkill.trim() || !learnSkill.trim()) {
      showToast("Please enter both skills.", "error");
      return;
    }

    try {
      setSubmitting(true);

      const response = await api.post("/requests", {
        receiverId: selectedPartner._id,

        // These field names must match requestController.js.
        skillOffered: teachSkill.trim(),
        skillWanted: learnSkill.trim(),

        message: customMessage.trim(),
      });

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Unable to send request."
        );
      }

      const partnerId = String(selectedPartner._id);

      setRequestStatuses((previous) => ({
        ...previous,
        [partnerId]: "pending",
      }));

      const partnerName = selectedPartner.name;

      setIsModalOpen(false);
      setSelectedPartner(null);

      showToast(
        `Request sent successfully to ${partnerName}!`
      );

      // Refresh the backend data.
      await fetchData();
    } catch (error) {
      console.error("Send request failed:", error);

      const statusCode = error.response?.status;
      const errorCode = error.response?.data?.code;

      if (
        statusCode === 409 &&
        errorCode === "ALREADY_CONNECTED"
      ) {
        setRequestStatuses((previous) => ({
          ...previous,
          [String(selectedPartner._id)]: "accepted",
        }));

        setIsModalOpen(false);
        showToast("You are already connected with this user.", "info");
      } else if (
        statusCode === 409 ||
        errorCode === "REQUEST_ALREADY_PENDING"
      ) {
        setRequestStatuses((previous) => ({
          ...previous,
          [String(selectedPartner._id)]: "pending",
        }));

        setIsModalOpen(false);
        showToast("A request is already pending.", "info");
      } else {
        showToast(
          error.response?.data?.message ||
            error.message ||
            "Failed to send request. Please try again.",
          "error"
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================
  // MATCH BADGE STYLE
  // =====================================

  const getScoreBadgeClass = (score) => {
    if (score >= 85) {
      return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30";
    }

    if (score >= 70) {
      return "bg-teal-500/10 text-teal-300 border border-teal-500/30";
    }

    return "bg-slate-700/60 text-slate-300 border border-slate-600";
  };

  // =====================================
  // BUTTON STATE
  // =====================================

  const getButtonDetails = (partner) => {
    const status = requestStatuses[String(partner._id)];

    if (status === "accepted") {
      return {
        label: "Connected",
        disabled: true,
        className:
          "bg-slate-700 text-emerald-400 cursor-not-allowed",
        icon: <CheckCircle2 className="w-4 h-4" />,
      };
    }

    if (status === "pending") {
      return {
        label: "Request Sent",
        disabled: true,
        className:
          "bg-slate-700 text-amber-300 cursor-not-allowed",
        icon: <CheckCircle2 className="w-4 h-4" />,
      };
    }

    if (status === "rejected") {
      return {
        label: "Send Again",
        disabled: false,
        className:
          "bg-emerald-500 hover:bg-emerald-400 text-slate-950",
        icon: <Send className="w-4 h-4" />,
      };
    }

    return {
      label: "Connect",
      disabled: false,
      className:
        "bg-emerald-500 hover:bg-emerald-400 text-slate-950",
      icon: <Send className="w-4 h-4" />,
    };
  };

  // =====================================
  // FILTER PARTNERS
  // =====================================

  const filteredPartners = partners.filter((partner) => {
    if (
      String(partner._id) === String(user?._id)
    ) {
      return false;
    }

    const term = searchTerm.toLowerCase();

    const teachSkills = partner.skillsToTeach || [];
    const learnSkills = partner.skillsToLearn || [];

    const matchesSearch =
      partner.name?.toLowerCase().includes(term) ||
      teachSkills.some((skill) =>
        skill.name?.toLowerCase().includes(term)
      ) ||
      learnSkills.some((skill) =>
        skill.name?.toLowerCase().includes(term)
      );

    const matchesCategory =
      selectedCategory === "All" ||
      partner.category === selectedCategory;

    const matchesMode =
      selectedMode === "All" ||
      partner.learningMode === selectedMode ||
      partner.learningMode === "Both";

    return matchesSearch && matchesCategory && matchesMode;
  });

  // =====================================
  // UI
  // =====================================

  return (
    <div className="min-h-screen bg-slate-900 px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* Toast Notification */}
        {toast && (
          <div
            role="status"
            className={`fixed right-4 top-4 z-[100] flex max-w-md items-center gap-3 rounded-xl border p-4 text-sm font-semibold shadow-2xl ${
              toast.type === "error"
                ? "border-rose-500/40 bg-slate-800 text-rose-300"
                : toast.type === "info"
                ? "border-sky-500/40 bg-slate-800 text-sky-300"
                : "border-emerald-500/40 bg-slate-800 text-emerald-300"
            }`}
          >
            {toast.type === "error" ? (
              <AlertCircle className="h-5 w-5 shrink-0" />
            ) : (
              <CheckCircle2 className="h-5 w-5 shrink-0" />
            )}

            <span>{toast.message}</span>

            <button
              type="button"
              onClick={() => setToast(null)}
              className="ml-2"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* API Error */}
        {apiError && (
          <div className="flex items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{apiError}</span>

            <button
              type="button"
              onClick={fetchData}
              className="ml-auto underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Header */}
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <Sparkles className="h-3.5 w-3.5" />
            Reciprocal Match Engine
          </div>

          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
            Find Your Skill Buddy
          </h1>

          <p className="mt-1 max-w-xl text-sm text-slate-400">
            Discover peers with compatible learning goals and exchange skills.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-700/80 bg-slate-800/60 p-4 shadow-lg sm:p-5 md:flex-row">
          <div className="relative flex-grow">
            <Search className="absolute left-3.5 top-3 h-5 w-5 text-slate-500" />

            <input
              type="text"
              placeholder="Search by skill or student name..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2.5 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 shrink-0 text-slate-400" />

            <select
              value={selectedCategory}
              onChange={(event) =>
                setSelectedCategory(event.target.value)
              }
              className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none sm:text-sm"
            >
              <option value="All">All Categories</option>
              <option value="Programming">Programming</option>
              <option value="Design">Design</option>
              <option value="AI/ML">AI & Machine Learning</option>
              <option value="Soft Skills">Soft Skills</option>
            </select>

            <select
              value={selectedMode}
              onChange={(event) =>
                setSelectedMode(event.target.value)
              }
              className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none sm:text-sm"
            >
              <option value="All">All Modes</option>
              <option value="Online">Online Only</option>
              <option value="Offline">Offline Only</option>
              <option value="Both">Online / Offline</option>
            </select>
          </div>
        </div>

        {/* Partners */}
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-sm text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
            <span>Loading skill partners...</span>
          </div>
        ) : filteredPartners.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPartners.map((partner) => {
              const button = getButtonDetails(partner);

              return (
                <div
                  key={partner._id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-700/80 bg-slate-800/60 p-6 shadow-lg transition duration-200 hover:border-emerald-500/50"
                >
                  <div>
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-lg font-black text-slate-950">
                          {partner.name
                            ? partner.name.charAt(0).toUpperCase()
                            : "U"}
                        </div>

                        <div>
                          <h3 className="text-base font-bold leading-snug text-white">
                            {partner.name}
                          </h3>

                          <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                            <GraduationCap className="h-3.5 w-3.5" />
                            {partner.college || "Peer Student"}
                          </div>
                        </div>
                      </div>

                      <div
                        className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-black ${getScoreBadgeClass(
                          partner.matchScore || 75
                        )}`}
                      >
                        {partner.matchScore
                          ? `${partner.matchScore}% Match`
                          : "Match"}
                      </div>
                    </div>

                    <p className="mb-4 line-clamp-2 text-xs leading-relaxed text-slate-300">
                      {partner.bio ||
                        "Ready to exchange skills and knowledge."}
                    </p>

                    {/* Skills to Teach */}
                    <div className="mb-5 space-y-3">
                      <div>
                        <span className="mb-1.5 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                          <Award className="h-3.5 w-3.5" />
                          Can Teach
                        </span>

                        <div className="flex flex-wrap gap-1.5">
                          {partner.skillsToTeach?.length ? (
                            partner.skillsToTeach.map(
                              (skill, index) => (
                                <span
                                  key={`${skill.name}-${index}`}
                                  className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-200"
                                >
                                  {skill.name}
                                  {skill.level && (
                                    <span className="ml-1 text-[10px] text-emerald-400">
                                      ({skill.level})
                                    </span>
                                  )}
                                </span>
                              )
                            )
                          ) : (
                            <span className="text-xs italic text-slate-500">
                              No teaching skills listed
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Skills to Learn */}
                      <div>
                        <span className="mb-1.5 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-sky-400">
                          <BookOpen className="h-3.5 w-3.5" />
                          Wants to Learn
                        </span>

                        <div className="flex flex-wrap gap-1.5">
                          {partner.skillsToLearn?.length ? (
                            partner.skillsToLearn.map(
                              (skill, index) => (
                                <span
                                  key={`${skill.name}-${index}`}
                                  className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-200"
                                >
                                  {skill.name}
                                </span>
                              )
                            )
                          ) : (
                            <span className="text-xs italic text-slate-500">
                              No learning goals listed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="flex items-center justify-between border-t border-slate-700/60 pt-4">
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <div className="flex items-center gap-1 font-semibold text-amber-400">
                        <Star className="h-3.5 w-3.5 fill-amber-400" />
                        {Number(partner.rating ?? 5).toFixed(1)}
                      </div>

                      <div>{partner.xp ?? 0} XP</div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenModal(partner)}
                      disabled={button.disabled}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold shadow-md transition disabled:opacity-80 ${button.className}`}
                    >
                      {button.icon}
                      {button.label}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-800 bg-slate-800/20 py-20 text-center text-sm text-slate-400">
            <Users className="mx-auto mb-3 h-8 w-8 text-slate-500" />

            {searchTerm
              ? "No partners match your search."
              : "No skill partners found yet. Try again later."}
          </div>
        )}
      </div>

      {/* Request Modal */}
      {isModalOpen && selectedPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-800 p-6 shadow-2xl sm:p-8">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute right-5 top-5 text-slate-400 hover:text-white"
              aria-label="Close request form"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                Skill Exchange Invitation
              </span>

              <h3 className="mt-1 text-xl font-bold text-white">
                Connect with {selectedPartner.name}
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                Propose a skill exchange with this user.
              </p>
            </div>

            <form
              onSubmit={handleSubmitRequest}
              className="space-y-4"
            >
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Skill You Want to Learn
                </label>

                <input
                  type="text"
                  value={learnSkill}
                  onChange={(event) =>
                    setLearnSkill(event.target.value)
                  }
                  placeholder="e.g. Python, AI, React"
                  maxLength={100}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Skill You Can Teach in Return
                </label>

                <input
                  type="text"
                  value={teachSkill}
                  onChange={(event) =>
                    setTeachSkill(event.target.value)
                  }
                  placeholder="e.g. Java, React, SQL"
                  maxLength={100}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Personal Note
                </label>

                <textarea
                  rows={3}
                  value={customMessage}
                  onChange={(event) =>
                    setCustomMessage(event.target.value)
                  }
                  placeholder="Introduce yourself..."
                  maxLength={1000}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="w-1/2 rounded-xl bg-slate-700 py-2.5 text-sm font-bold text-white transition hover:bg-slate-600 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-1/2 items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 text-sm font-extrabold text-slate-950 shadow-lg transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}

                  {submitting ? "Sending..." : "Send Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
