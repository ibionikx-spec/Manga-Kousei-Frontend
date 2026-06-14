import { useReducer, useCallback, useMemo, useState } from "react";
import api from "../services/api";
import { uploadImageToCloudinary } from "../utils/imageUpload";
import { useGenres } from "./useGenres";
import type { Character, CreateWorkFormData } from "../types/createWork";

type FormAction =
  | {
      type: "UPDATE_FIELD";
      key: keyof CreateWorkFormData;
      value: CreateWorkFormData[keyof CreateWorkFormData];
    }
  | { type: "ADD_CHARACTER" }
  | { type: "REMOVE_CHARACTER"; id: number }
  | {
      type: "UPDATE_CHARACTER";
      id: number;
      key: keyof Character;
      value: string;
    }
  | { type: "RESET_FORM" };

const initialState: CreateWorkFormData = {
  title: "",
  genreIds: [],
  targetAudience: "",
  synopsis: "",
  characters: [{ id: Date.now(), name: "", role: "", description: "" }],
  nameSummary: "",
  sketchImage: null,
  sketchPreview: "",
};

const formReducer = (
  state: CreateWorkFormData,
  action: FormAction,
): CreateWorkFormData => {
  switch (action.type) {
    case "UPDATE_FIELD":
      return { ...state, [action.key]: action.value };
    case "ADD_CHARACTER":
      return {
        ...state,
        characters: [
          ...state.characters,
          { id: Date.now(), name: "", role: "", description: "" },
        ],
      };
    case "REMOVE_CHARACTER":
      return {
        ...state,
        characters: state.characters.filter((c) => c.id !== action.id),
      };
    case "UPDATE_CHARACTER":
      return {
        ...state,
        characters: state.characters.map((c) =>
          c.id === action.id ? { ...c, [action.key]: action.value } : c,
        ),
      };
    case "RESET_FORM":
      return initialState;
    default:
      return state;
  }
};

const TOTAL_STEPS = 5;

export const useCreateWorkForm = () => {
  const [form, dispatch] = useReducer(formReducer, initialState);
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const genresList = useGenres();

  const updateField = useCallback(
    <K extends keyof CreateWorkFormData>(
      key: K,
      value: CreateWorkFormData[K],
    ) => {
      dispatch({ type: "UPDATE_FIELD", key, value });
    },
    [],
  );

  const addCharacter = useCallback(
    () => dispatch({ type: "ADD_CHARACTER" }),
    [],
  );

  const removeCharacter = useCallback((id: number) => {
    dispatch({ type: "REMOVE_CHARACTER", id });
  }, []);

  const updateCharacter = useCallback(
    (id: number, key: keyof Character, value: string) => {
      dispatch({ type: "UPDATE_CHARACTER", id, key, value });
    },
    [],
  );

  const resetForm = useCallback(() => {
    if (form.sketchPreview) URL.revokeObjectURL(form.sketchPreview);
    dispatch({ type: "RESET_FORM" });
    setSubmitted(false);
    setStep(1);
    setSubmitError(null);
  }, [form.sketchPreview]);

  const submitProposal = useCallback(
    async (tantouId: number | null) => {
      if (!tantouId) {
        alert("Vui lòng chọn Tantou phụ trách trước khi nộp.");
        return;
      }

      setIsSubmitting(true);
      setSubmitError(null);

      try {
        let sketchImageUrl = "";
        if (form.sketchImage) {
          sketchImageUrl = await uploadImageToCloudinary(form.sketchImage);
        }

        const payload = {
          workingTitle: form.title,
          synopsis: form.synopsis,
          targetAudience: form.targetAudience,
          nameSummary: form.nameSummary,
          sketchImageUrl,
          genreIds: form.genreIds,
          tantouId,
          characters: form.characters.map((c) => ({
            characterName: c.name,
            role: c.role,
            description: c.description,
          })),
        };

        const response = await api.post("/proposals", payload);
        if (response.status === 200 || response.status === 201) {
          setSubmitted(true);
        } else {
          throw new Error("Gửi proposal thất bại, mã lỗi: " + response.status);
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Có lỗi xảy ra khi gửi proposal";
        setSubmitError(message);
        alert(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [form],
  );

  const canProceed = useMemo(() => {
    if (step === 1) {
      return Boolean(
        form.title.trim() &&
        form.genreIds.length &&
        form.targetAudience &&
        form.synopsis.trim(),
      );
    }
    if (step === 2) {
      return form.characters.every((c) =>
        Boolean(c.name.trim() && c.role.trim()),
      );
    }
    return true;
  }, [
    step,
    form.title,
    form.genreIds,
    form.targetAudience,
    form.synopsis,
    form.characters,
  ]);

  const handleSetStep = useCallback((dir: "inc" | "dec") => {
    setStep((prev) => {
      if (dir === "inc") return Math.min(TOTAL_STEPS, prev + 1);
      return Math.max(1, prev - 1);
    });
  }, []);

  return {
    form,
    step,
    submitted,
    isSubmitting,
    submitError,
    genresList,
    updateField,
    addCharacter,
    removeCharacter,
    updateCharacter,
    submitProposal,
    resetForm,
    setStep: handleSetStep,
    canProceed,
  };
};
