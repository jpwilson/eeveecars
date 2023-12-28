 
import useSingleData from "./useSingleData";


export interface Submodel {
  id: number;
  submodel: string;
  trim: string;
  image_url: string;
  // ... other submodel specific details
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
    // range_combined_mid: number;
    epa_range: number;
    top_speed: number;
  
    model_description: string; // This is the new field for the model's description
    make_model_slug: string;
    submodels: Submodel[]; // Array of Submodel objects
  };
  submodels: Submodel[];
}


// export interface ModelDetails {
//   id: number;
//   make_name: string;
//   model: string;
//   submodel: string;
//   generation: string;
//   image_url: string;
//   acceleration_0_60: number;
//   trim_first_released: string;
//   carmodel_first_released: string;
//   current_price: number;
//   customer_and_critic_rating: number;
//   average_rating: number;
//   // range_combined_mid: number;
//   epa_range: number;
//   top_speed: number;

//   model_description: string; // This is the new field for the model's description
//   make_model_slug: string;
//   submodels: Submodel[]; // Array of Submodel objects
// }

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