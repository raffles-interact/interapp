import { memo, useEffect, useState } from 'react';
import { Combobox, InputBase, useCombobox } from '@mantine/core';

interface SearchableSelectProps {
  defaultValue: string | null;
  allValues: string[];
  onChange: (newValue: string) => void;
  label?: string;
  required?: boolean;
}

const SearchableSelect = ({
  defaultValue,
  allValues,
  onChange,
  label,
  required,
}: SearchableSelectProps) => {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });
  const [value, setValue] = useState<string | null>(defaultValue);
  const [search, setSearch] = useState('');
  useEffect(() => {
    setValue(defaultValue);
    setSearch(defaultValue ?? '');
  }, [defaultValue]);

  useEffect(() => {
    onChange(value ?? '');
  }, [value]);

  const shouldFilterOptions = allValues.every((item) => item !== search);
  const filteredOptions = shouldFilterOptions
    ? allValues.filter((item) => item.toLowerCase().includes(search.toLowerCase().trim()))
    : allValues;

  const options = filteredOptions.map((item) => (
    <Combobox.Option value={item} key={item}>
      {item}
    </Combobox.Option>
  ));

  return (
    <Combobox
      store={combobox}
      withinPortal
      onOptionSubmit={(val) => {
        setValue(val);
        setSearch(val);
        combobox.closeDropdown();
      }}
    >
      <Combobox.Target>
        <InputBase
          label={label}
          required={required}
          rightSection={<Combobox.Chevron />}
          value={search}
          onChange={(event) => {
            combobox.openDropdown();
            combobox.updateSelectedOptionIndex();
            setSearch(event.currentTarget.value);
          }}
          onClick={() => combobox.openDropdown()}
          onFocus={() => combobox.openDropdown()}
          onBlur={() => {
            combobox.closeDropdown();
            setSearch(value || '');
          }}
          placeholder='Search value'
          rightSectionPointerEvents='none'
        />
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options>
          {options.length > 0 ? options : <Combobox.Empty>Nothing found...</Combobox.Empty>}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
};

export default memo(SearchableSelect);
