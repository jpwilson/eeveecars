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

const useCars = (selectedMake?: Make | null) => {
    const { data, error, isLoading } = useData<Car>('/cars');

    // If a make is selected, filter the cars
    const filteredCars = selectedMake
        ? data.filter(car => selectedMake.car_id_list.includes(car.id))
        : data;

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




