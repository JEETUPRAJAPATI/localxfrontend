import { FixedSizeList } from "react-window";

// Reusable ListComponent
const ListComponent = ({
  items,
  height = 300, // Adjusted for subcity list
  width = "100%", // Full width to match parent container ListGroup
  itemSize = 50, // this is single element height px value
  renderRow, // Function to render each row
  className = "", // Custom class for styling
}) => {
  const Row = ({ index, style }) => {
    const item = items[index];
    return <div style={style}>{renderRow({ item, index })}</div>;
  };

  return (
    <FixedSizeList
      height={height}
      width={width}
      itemSize={itemSize}
      itemCount={items.length}
      className={className}
    >
      {Row}
    </FixedSizeList>
  );
};

export default ListComponent;

{
  /* <ListComponent
      items={items}
      height={500}
      width={500}
      itemSize={160}
      renderRow={({ item, index }) => (
        <RowComponent item={item} index={index} />
      )}
    /> */
}
