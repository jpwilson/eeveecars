// useFeatures.ts
import useData from "./useData";

export interface Features {
  prices: { [key: string]: number[] };
  acceleration: { [key: string]: number[] };
  top_speed: { [key: string]: number[] };
  // ... add other features as needed
}

const useFeatures = () => {
  // Use your generic useData hook to fetch features data
  const { data, error, isLoading } = useData<Features>('/car_features');

  return { features: data, error, isLoading };
};

export default useFeatures;