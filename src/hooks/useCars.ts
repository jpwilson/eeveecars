import useData from "./useData";



export interface Car {
    make_name: string;
    model: string;
    submodel: string;
    generation: string;
    image_url: string;
    trim_first_released: string;
    carmodel_first_released: string;
    current_price: number;
    customer_and_critic_rating: number;
    range_combined_mid: number;
  }
  

const useCars = () => useData<Car>('/cars');

export default useCars;