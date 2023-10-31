import useMakes from "../hooks/useMakes";

const ManufacturerList = () => {
  const { makes } = useMakes();
  return (
    <div>
      <ul>
        {makes.map((make) => (
          <li key={make.id}>{make.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default ManufacturerList;
