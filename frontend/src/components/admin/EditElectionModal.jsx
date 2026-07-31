import React, { useState, useRef, useEffect } from "react";
import { X, Plus, Trash2, CalendarDays, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import {
  updateElection,
  addCandidate,
  removeCandidate,
} from "../../services/adminElectionService";

import { formatForDateTimeInput } from "../../utils/dateTime";
import Toast from "../Toast";

const EditElectionModal = ({ open, onClose, election, onUpdated }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [originalCandidates, setOriginalCandidates] = useState([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [candidateLoading, setCandidateLoading] = useState(false);
  const [toastConfig, setToastConfig] = useState(null);
  const [openPicker, setOpenPicker] = useState(null);
  const [pickerKey, setPickerKey] = useState(0);

  const startTimeRef = useRef(null);
  const endTimeRef = useRef(null);

  const showToast = (message, type = "info") => {
    setToastConfig({
      message,
      type,
    });
  };

  // Esc button support
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && openPicker) {
        if (openPicker === "start") {
          startTimeRef.current?.blur();
        }

        if (openPicker === "end") {
          endTimeRef.current?.blur();
        }

        setOpenPicker(null);
      }
    };

    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [openPicker]);

  const isEditable = election?.status === "upcoming";
  const isDateEditable = election?.status === "upcoming" || election?.status === "active";

  // form prefill
  useEffect(() => {
    if (!election) return;

    setTitle(election.title || "");
    setDescription(election.description || "");
    const cleanedCandidates =
      election?.candidates?.filter((candidate) => candidate?.name?.trim()) || [];

    setCandidates(cleanedCandidates);

    setOriginalCandidates(cleanedCandidates);

    setStartTime(formatForDateTimeInput(election.startTime));

    setEndTime(formatForDateTimeInput(election.endTime));
  }, [election]);

  if (!open) return null;

  // Add Candidate
  const handleAddCandidate = () => {
    setCandidates((prev) => [...prev, { name: "", imageFile: null, preview: null }]);
  };

  // update candidate
  const updateCandidate = (index, key, value) => {
    const updated = [...candidates];

    updated[index][key] = value;
    
    if (key === "imageFile" && value) {
      updated[index].preview = URL.createObjectURL(value);
    }

    setCandidates(updated);
  };

  // Remove Candidate
  const handleRemoveCandidate = (index) => {
    if (candidates.length <= 2) {
      showToast("Minimum 2 candidates required", "error");

      return;
    }

    setCandidates(candidates.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // new candidates
      const addedCandidates = candidates.filter(
        (candidate) => !candidate._id && candidate.name.trim() && candidate.imageFile,
      );

      // removed candidates
      const removedCandidates = originalCandidates.filter(
        (origCandidate) => !candidates.some(c => c._id === origCandidate._id),
      );

      // add candidates
      for (const candidate of addedCandidates) {
        const formData = new FormData();
        formData.append("name", candidate.name.trim());
        formData.append("candidateImage", candidate.imageFile);
        await addCandidate(election._id, formData);
      }

      // remove candidates
      for (const candidate of removedCandidates) {
        await removeCandidate(election._id, candidate._id);
      }

      await updateElection(election._id, {
        title,
        description,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
      });

      onUpdated();
      onClose();

      setTitle("");
      setDescription("");
      setCandidates(["", ""]);
      setStartTime("");
      setEndTime("");
    } catch (error) {
      console.error(error);

      showToast(
        error.response?.data?.message || "Failed to update election",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-md pt-24 pb-6 px-4 overflow-hidden">
      {/* Toast */}
      <AnimatePresence>
        {toastConfig && (
          <Toast
            message={toastConfig.message}
            type={toastConfig.type}
            onClose={() => setToastConfig(null)}
          />
        )}
      </AnimatePresence>
      <div className="w-full max-w-2xl h-[78vh] rounded-[32px] border border-white/10 bg-[#0d1117]/95 backdrop-blur-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-8 pb-6 border-b border-white/10 shrink-0">
          <h2 className="text-2xl font-bold">Update Election</h2>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition"
          >
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          {/* Modal Content */}
          <div
            className="flex-1 overflow-y-auto px-8 py-6 space-y-5 custom-scrollbar min-h-0"
            data-lenis-prevent
          >
            <input
              type="text"
              placeholder="Election title"
              value={title}
              disabled={!isEditable}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 outline-none disabled:opacity-60"
            />

            <textarea
              placeholder="Description"
              value={description}
              disabled={!isEditable}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 outline-none resize-none h-28 disabled:opacity-60"
            />

            {/* Candidates */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Candidates</h3>

                {isEditable && (
                  <button
                    type="button"
                    onClick={handleAddCandidate}
                    disabled={candidateLoading}
                    className="flex items-center gap-2 text-sm text-slate-300"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {candidates.map((candidate, index) => (
                  <div key={index} className="flex gap-3 items-center">
                    <label className={`flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 border border-white/10 overflow-hidden shrink-0 ${!candidate._id && isEditable ? 'cursor-pointer hover:bg-white/10 transition' : ''}`}>
                      {!candidate._id && isEditable && (
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) updateCandidate(index, "imageFile", file);
                          }}
                        />
                      )}
                      
                      {candidate.preview || candidate.image ? (
                        <img
                          src={candidate.preview || candidate.image}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-slate-400" />
                      )}
                    </label>
                    <input
                      type="text"
                      value={candidate.name || ""}
                      disabled={!isEditable || candidate._id}
                      placeholder={`Candidate ${index + 1}`}
                      onChange={(e) => updateCandidate(index, "name", e.target.value)}
                      className="flex-1 px-5 py-4 rounded-2xl bg-white/5 border border-white/10 outline-none disabled:opacity-60 h-14"
                    />

                    {isEditable && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCandidate(index)}
                        className="px-4 h-14 rounded-2xl bg-red-500/20 text-red-300 hover:bg-red-500/30 transition shrink-0"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Date Time */}
            <div className="grid grid-cols-2 gap-4">
              {/* Start Time */}
              <div className="relative">
                <input
                  key={`start-${pickerKey}`}
                  ref={startTimeRef}
                  type="datetime-local"
                  value={startTime}
                  disabled={!isDateEditable}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-5 py-4 pr-14 rounded-2xl bg-white/5 border border-white/10 outline-none appearance-none [&::-webkit-calendar-picker-indicator]:hidden disabled:opacity-60"
                />

                <button
                  type="button"
                  disabled={!isDateEditable}
                  onClick={() => {
                    const input = startTimeRef.current;

                    if (!input) return;

                    if (openPicker === "start") {
                      setOpenPicker(null);

                      setPickerKey((prev) => prev + 1);

                      return;
                    }

                    setOpenPicker("start");

                    requestAnimationFrame(() => {
                      input.showPicker?.();
                    });
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                >
                  <CalendarDays className="w-5 h-5" />
                </button>
              </div>

              {/* End Time */}
              <div className="relative">
                <input
                  key={`end-${pickerKey}`}
                  ref={endTimeRef}
                  type="datetime-local"
                  value={endTime}
                  disabled={!isDateEditable}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-5 py-4 pr-14 rounded-2xl bg-white/5 border border-white/10 outline-none appearance-none [&::-webkit-calendar-picker-indicator]:hidden disabled:opacity-60"
                />

                <button
                  type="button"
                  disabled={!isDateEditable}
                  onClick={() => {
                    const input = endTimeRef.current;

                    if (!input) return;

                    if (openPicker === "end") {
                      setOpenPicker(null);

                      setPickerKey((prev) => prev + 1);

                      return;
                    }

                    setOpenPicker("end");

                    requestAnimationFrame(() => {
                      input.showPicker?.();
                    });
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                >
                  <CalendarDays className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Update Button */}
          <div className="shrink-0 px-8 py-4 border-t border-white/10 bg-[#0d1117]/95">
            <button
              type="submit"
              disabled={loading || !isDateEditable}
              className="w-full py-4 rounded-2xl bg-white text-black font-semibold disabled:opacity-50"
            >
              {!isDateEditable
                ? "Election Locked"
                : loading
                  ? "Updating..."
                  : "Update Election"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditElectionModal;
