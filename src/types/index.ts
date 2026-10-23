export * from '../../server/src/schema.js';

export interface UploadedFileItem {
  id: string;
  file?: File;
  name: string;
  size: number;
  type: string;
  category: 'image' | 'pdf' | 'audio' | 'document';
  previewUrl?: string;
  isPresetSample?: boolean;
}

export interface ScenarioPreset {
  id: 'road-hazard' | 'disaster-assistance' | 'healthcare-paperwork';
  title: string;
  category: string;
  badge: string;
  iconName: string;
  shortDescription: string;
  sampleInputText: string;
  sampleFiles: {
    name: string;
    type: 'image' | 'pdf' | 'audio';
    size: number;
    sizeDisplay: string;
    description: string;
    previewUrl?: string;
  }[];
}
