 
import useSingleData from "./useSingleData";
import { Make } from './useMakes';

export interface Submodel {
  id: number;
  submodel: string;
  trim: string;
  image_url: string;
  current_price: number;
  acceleration_0_60: number;
  top_speed: number;
  epa_range: number;
  generation?: string | null;
  availability_desc?: string | null;
}

export interface PreviousGeneration {
  generation: string | null;
  image_url: string | null;
  submodels: Submodel[];
}

export interface ModelDetailsResponse {
  representative_model: {
    id: number;
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
    epa_range: number;
    top_speed: number;
    model_webpage: string;
    model_description: string;
    make_model_slug: string;
    submodels: Submodel[];
  };
  submodels: Submodel[];
  make_details: Make;
  previous_generations?: PreviousGeneration[];
}



const useModelDetails = (make_model_slug: string) => {
  const endpoint = `/cars/model-details/${make_model_slug}`; // This endpoint should return model details including submodels
  const { data: modelDetails, error, isLoading } = useSingleData<ModelDetailsResponse>(endpoint);

  // Handle the error state if the API call returns a 404 or other error
  if (error) {
    return { modelDetails: null, error, isLoading };
  }

  return { modelDetails, error, isLoading };
};

export default useModelDetails;