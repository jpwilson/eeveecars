// useFeatures.ts
import useData from "./useData";

export interface CarDetails {
  make_name: string;
  model: string;
  submodel: string;
  generation: string;
  image_url: string;
  trim_first_released: string;
  carmodel_first_released: string;
  current_price: number;
  customer_and_critic_rating: number;
  average_rating: number;
  range_combined_mid: number;
}

const useCarDetails = (id: string) => {
  const endpoint = `/cars/${id}`;
  // Here, useData<CarDetail> ensures that we expect to get a CarDetail object from the API.
  const { data, error, isLoading } = useData<CarDetails>(endpoint);

  // Since useData already returns an array, and we expect a single object,
  // we need to select the first element of the data array.
  // If your endpoint returns an object instead of an array, you'll need to adjust useData or this hook accordingly.
  const car = data;

  return { car, error, isLoading };
};

export default useCarDetails;