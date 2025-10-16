import { useState, memo, useMemo } from "react";
import PropTypes from "prop-types";
import { Dropdown, Form, InputGroup } from "react-bootstrap";

const CustomMultiSelectDropDown = ({
  dropdownKey,
  options,
  groups = [],
  selectedValues,
  onChange,
  onBlur,
  placeholder,
  maxHeight = 300,
  showGroup = true,
  dropDownToggleStyle = {},
  dropDownToggleClassName = "",
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  // Determine if all visible options are selected
  const isAllSelected =
    filteredOptions.length > 0 &&
    filteredOptions.every((opt) => selectedValues.includes(opt.value));

  // Toggle single option
  const toggleOption = (value) => {
    const newSelected = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    onChange(newSelected);
  };

  // Toggle Select All
  const toggleSelectAll = () => {
    if (isAllSelected) {
      const remaining = selectedValues.filter(
        (v) => !filteredOptions.some((opt) => opt.value === v)
      );
      onChange(remaining);
    } else {
      const filteredValues = filteredOptions.map((opt) => opt.value);
      const uniqueValues = Array.from(
        new Set([...selectedValues, ...filteredValues])
      );
      onChange(uniqueValues);
    }
  };

  // Display selected labels
  const selectedLabels = useMemo(() => {
    return selectedValues
      .map((val) => options.find((opt) => opt.value === val)?.label)
      .filter(Boolean);
  }, [selectedValues, options]);

  return (
    <Dropdown
      key={dropdownKey}
      show={showDropdown}
      onToggle={(isOpen) => {
        setShowDropdown(isOpen);
        if (!isOpen) onBlur(selectedValues); // Call onBlur when dropdown closes
      }}
      className="customMultiSelectDropdown"
    >
      <Dropdown.Toggle
        className={`dropdown-toggle-fullwidth ${dropDownToggleClassName}`}
        as={"div"}
        title={
          selectedLabels.length === 0
            ? placeholder
            : isAllSelected
            ? `All Selected (${selectedLabels.length})`
            : selectedLabels.length <= 5
            ? selectedLabels.join(", ")
            : `${selectedLabels.length} selected`
        }
        style={dropDownToggleStyle}
      >
        {selectedLabels.length === 0
          ? placeholder
          : isAllSelected
          ? `All Selected (${selectedLabels.length})`
          : selectedLabels.length <= 5
          ? selectedLabels.join(", ")
          : `${selectedLabels.length} selected`}
      </Dropdown.Toggle>

      <Dropdown.Menu
        style={{
          maxHeight: `${maxHeight}px`,
          overflowY: "auto",
          minWidth: "300px",
        }}
      >
        <InputGroup className="p-2">
          <Form.Control
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>

        <Form.Check
          type="checkbox"
          id={`SelectAll-${dropdownKey}`}
          label="Select All"
          className="ms-2"
          checked={isAllSelected}
          onChange={toggleSelectAll}
        />
        <Dropdown.Divider />

        {showGroup && groups.length > 0
          ? groups.map((group) => (
              <div key={group.label}>
                <Dropdown.Header>{group.label}</Dropdown.Header>
                {filteredOptions
                  .filter((opt) => opt.group === group.label)
                  .map((option) => (
                    <div
                      className={`option-item ${
                        selectedValues.includes(option.value)
                          ? "selected-item"
                          : ""
                      }`}
                      key={option.key}
                      onClick={() => toggleOption(option.value)}
                    >
                      <Form.Check
                        htmlFor={`${dropdownKey}-${option.key}`}
                        type="checkbox"
                        label={option.label}
                        checked={selectedValues.includes(option.value)}
                        className="ms-3 w-100"
                        readOnly
                      />
                    </div>
                  ))}
                <Dropdown.Divider />
              </div>
            ))
          : filteredOptions.map((option) => (
              <div
                className={`option-item ${
                  selectedValues.includes(option.value) ? "selected-item" : ""
                }`}
                key={option.key}
                onClick={() => toggleOption(option.value)}
              >
                <Form.Check
                  htmlFor={`${dropdownKey}-${option.key}`}
                  type="checkbox"
                  label={option.label}
                  checked={selectedValues.includes(option.value)}
                  className="ms-3 w-100"
                  readOnly
                />
              </div>
            ))}

        {filteredOptions.length === 0 && (
          <div className="text-center p-2">No options found</div>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};

CustomMultiSelectDropDown.propTypes = {
  showGroup: PropTypes.bool,
  options: PropTypes.array.isRequired,
  groups: PropTypes.array,
  selectedValues: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  placeholder: PropTypes.string,
  maxHeight: PropTypes.number,
  dropDownToggleStyle: PropTypes.object,
  dropDownToggleClassName: PropTypes.string,
  dropdownKey: PropTypes.string.isRequired,
};

export default memo(CustomMultiSelectDropDown);
