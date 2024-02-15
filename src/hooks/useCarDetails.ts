// useFeatures.ts
import useSingleData from "./useSingleData";

export interface CarDetails {
  id: string;
  make_name: string;
  model: string;
  submodel: string;
  acceleration_0_60: number;
  average_rating: number;
  battery_capacity: number;
  car_description: string;
  carmodel_first_released: string;
  current_price: number;
  customer_and_critic_rating: { [key: string]: number };
  drive_type: string;
  epa_range: number;
  generation: string;
  image_url: string;
  make_model_slug: string;
  power: number;
  reviews: { description: string; url: string }[];
  top_speed: number;
  torque: number;
  trim_first_released: string;
  // range_combined_mid: number;
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