import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2, CalendarDays } from "lucide-react";
import { createElection } from "../../services/adminElectionService";
import Toast from "../Toast";

const CreateElectionModal = ({ open, onClose, onCreated }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [candidates, setCandidates] = useState(["", ""]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [toastConfig, setToastConfig] = useState(null);
  const [pickerKey, setPickerKey] = useState(0);

  const startTimeRef = useRef(null);
  const endTimeRef = useRef(null);

  const [openPicker, setOpenPicker] = useState(null);

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

  if (!open) return null;

  // update candidate
  const updateCandidate = (index, value) => {
    const updated = [...candidates];
    updated[index] = value;
    setCandidates(updated);
  };

  // add candidate
  const addCandidate = () => {
    setCandidates([...candidates, ""]);
  };

  // remove candidate
  const removeCandidate = (index) => {
    if (candidates.length <= 2) return;

    setCandidates(candidates.filter((_, i) => i !== index));
  };

  // Submit data
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const cleanedCandidates = candidates.map((c) => c.trim()).filter(Boolean);

      await createElection({
        title: title.trim(),
        description: description.trim(),
        candidates: cleanedCandidates,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
      });

      onCreated();
      onClose();

      setTitle("");
      setDescription("");
      setCandidates(["", ""]);
      setStartTime("");
      setEndTime("");
    } catch (error) {
      console.error(error);

      showToast(
        error.response?.data?.message || "Failed to create election",
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
          <h2 className="text-2xl font-bold">Create Election</h2>

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
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 outline-none"
            />

            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 outline-none resize-none h-28"
            />

            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium">Candidates</h3>

                <button
                  type="button"
                  onClick={addCandidate}
                  className="flex items-center gap-2 text-sm text-slate-300"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>

              <div className="space-y-3">
                {candidates.map((candidate, index) => (
                  <div key={index} className="flex gap-3">
                    <input
                      type="text"
                      placeholder={`Candidate ${index + 1}`}
                      value={candidate}
                      onChange={(e) => updateCandidate(index, e.target.value)}
                      className="flex-1 px-5 py-4 rounded-2xl bg-white/5 border border-white/10 outline-none"
                    />

                    <button
                      type="button"
                      onClick={() => removeCandidate(index)}
                      className="px-4 rounded-2xl bg-red-500/20 text-red-300"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
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
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-5 py-4 pr-14 rounded-2xl bg-white/5 border border-white/10 outline-none appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
                />

                <button
                  type="button"
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
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-5 py-4 pr-14 rounded-2xl bg-white/5 border border-white/10 outline-none appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
                />

                <button
                  type="button"
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

          {/* Create Button */}
          <div className="shrink-0 px-8 py-4 border-t border-white/10 bg-[#0d1117]/95">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-white text-black font-semibold disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Election"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateElectionModal;
