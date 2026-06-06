import React from "react";
import SelectLib from "react-select";

const MultiSelect = ({ value = [], onChange, options = [], placeholder = "Select", error, label, ...rest }) => {
  const accentColor = "var(--color-accent)";
  const accentSoftColor = "color-mix(in srgb, var(--color-accent) 18%, white)";

  const customStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: "#fff",
      borderColor: error ? "#f87171" : state.isFocused ? accentColor : "#d1d5db",
      boxShadow: "none",
      color: "#111827",
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: "#fff",
      color: "#111827",
      zIndex: 9999,
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
      fontFamily: "Manrope, sans-serif",
      fontSize: "0.875rem",
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "#f3f4f6",
      borderRadius: "4px",
      padding: "0 2px",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "#111827",
      fontSize: "0.875rem",
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: "#6b7280",
      ":hover": {
        backgroundColor: "#f87171",
        color: "#fff",
      },
    }),
    option: (base, { isFocused, isSelected }) => ({
      ...base,
      backgroundColor: isSelected ? accentColor : isFocused ? accentSoftColor : "#fff",
      color: isSelected ? "#fff" : "#111827",
      cursor: "pointer",
    }),
    placeholder: (base) => ({
      ...base,
      color: "#6b7280",
    }),
  };

  return (
    <div className="w-full">
      {label && <label className="block mb-1 text-sm font-medium text-gray-800">{label}</label>}
      <SelectLib
        isMulti
        options={options}
        value={options.filter((opt) => value.includes(opt.value))}
        onChange={(selected) => onChange(selected ? selected.map((s) => s.value) : [])}
        placeholder={placeholder}
        styles={customStyles}
        classNamePrefix="react-select"
        menuPortalTarget={document.body}
        classNames={{
          menuList: () => "app-scrollbar",
        }}
        {...rest}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default MultiSelect;
