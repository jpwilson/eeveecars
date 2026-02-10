import useSingleData from "./useSingleData";
import { Make } from "./useMakes";

const useManufacturerDetail = (makeId: string) => {
  const endpoint = `/makes/${makeId}`;
  const { data, error, isLoading } = useSingleData<Make>(endpoint);
  return { make: data, error, isLoading };
};

export default useManufacturerDetail;
