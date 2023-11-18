import useData from "./useData";
import { Make } from "./useMakes";

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
    average_rating: number;
    range_combined_mid: number;
}

// Add an interface for SelectedFeature to detail the expected shape
export interface SelectedFeature {
    featureName: string;
    bucketName: string;
    carIds: number[];
  }

const useCars = (selectedMake?: Make | null, selectedFeature?: SelectedFeature | null) => {
    const { data, error, isLoading } = useData<Car>('/cars');

    let filteredCars = data;

    //TODO add filtering by multiple features.... 17 Nov 2023


  if (selectedMake) {
    filteredCars = filteredCars.filter(car => selectedMake.car_id_list.includes(car.id));
  }

  // Further filter by feature if selected
  if (selectedFeature) {
    filteredCars = filteredCars.filter(car => selectedFeature.carIds.includes(car.id));
  }

  return { data: filteredCars, error, isLoading };
};

export default useCars;

// import useData from "./useData";
// import { Make } from "./useMakes";


// export interface Car {
//     make_name: string;
//     model: string;
//     submodel: string;
//     generation: string;
//     image_url: string;
//     trim_first_released: string;
//     carmodel_first_released: string;
//     current_price: number;
//     customer_and_critic_rating: number;
//     range_combined_mid: number;
//   }
  

// // const useCars = () => useData<Car>('/cars');
// const useCars = (selectedMake?: Make) => {
//   const { data, error, isLoading } = useData<Car>('/cars');
//   if (selectedMake) {
//       return {
//           data: data.filter(car => selectedMake.car_id_list.includes(car.id)),
//           error,
//           isLoading
//       };
//   }
//   return { data, error, isLoading };
// };



// export default useCars;




