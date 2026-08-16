import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface KycState {
  activeDocumentTab: string;
  isSubmitModalOpen: boolean;
  uploadProgress: Record<string, number>; // docType -> percentage
  setActiveTab: (tab: string) => void;
  setSubmitModalOpen: (open: boolean) => void;
  setUploadProgress: (docType: string, progress: number) => void;
}

const isDev = process.env.NODE_ENV !== 'production';

export const useKycStore = create<KycState>()(
  isDev
    ? devtools(
        (set) => ({
          activeDocumentTab: 'all',
          isSubmitModalOpen: false,
          uploadProgress: {},
          setActiveTab: (tab) => set({ activeDocumentTab: tab }, false, 'kyc/setActiveTab'),
          setSubmitModalOpen: (open) => set({ isSubmitModalOpen: open }, false, 'kyc/setSubmitModalOpen'),
          setUploadProgress: (docType, progress) =>
            set((s) => ({ uploadProgress: { ...s.uploadProgress, [docType]: progress } }), false, 'kyc/setUploadProgress'),
        }),
        { name: 'KycStore' }
      )
    : (set) => ({
        activeDocumentTab: 'all',
        isSubmitModalOpen: false,
        uploadProgress: {},
        setActiveTab: (tab) => set({ activeDocumentTab: tab }),
        setSubmitModalOpen: (open) => set({ isSubmitModalOpen: open }),
        setUploadProgress: (docType, progress) =>
          set((s) => ({ uploadProgress: { ...s.uploadProgress, [docType]: progress } })),
      })
);
