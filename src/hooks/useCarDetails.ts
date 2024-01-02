// useFeatures.ts
import useSingleData from "./useSingleData";

export interface CarDetails {
  id: string;
  make_name: string;
  model: string;
  submodel: string;
  generation: string;
  image_url: string;
  acceleration_0_60: number;
  trim_first_released: string;
  carmodel_first_released: string;
  current_price: number;
  customer_and_critic_rating: number;
  average_rating: number;
  // range_combined_mid: number;
  epa_range: number;
  top_speed: number;
  car_description: string;
  make_model_slug: string;
  vehicle_class: string;
}

const useCarDetails = (id: number) => {
  const endpoint = `/cars/${id}`;
  // Here, useData<CarDetail> ensures that we expect to get a CarDetail object from the API.
  const { data: car, error, isLoading } = useSingleData<CarDetails>(endpoint);

  // Since useData already returns an array, and we expect a single object,
  // we need to select the first element of the data array.
  // If your endpoint returns an object instead of an array, you'll need to adjust useData or this hook accordingly.
  
  //const carDetail = data ? data : null;
  //const car = Array.isArray(data) && data.length > 0 ? data[0] : null;
  //const car = data;

  // Handle the error state if the API call returns a 404 or other error
  if (error) {
    return { car: null, error, isLoading };
  }

  return { car, error, isLoading };
};

export default useCarDetails;