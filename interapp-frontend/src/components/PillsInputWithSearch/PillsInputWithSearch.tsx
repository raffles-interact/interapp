'use client';
import { PillsInput, Pill, Combobox, CheckIcon, Group, useCombobox } from '@mantine/core';
import { memo, useEffect, useState } from 'react';

export interface PillsInputWithSearchProps<T> {
  defaultValues?: T[];
  allValues: T[];
  onChange: (newValues: T[]) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const PillsInputWithSearch = <T extends string>({
  defaultValues,
  allValues,
  onChange,
  label,
  required,
  disabled,
  className,
}: PillsInputWithSearchProps<T>) => {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
  });
  const [search, setSearch] = useState('');

  const [value, setValue] = useState<T[]>([]);

  useEffect(() => {
    if (defaultValues) setValue(defaultValues);
  }, [defaultValues]);

  useEffect(() => {
    onChange(value);
  }, [value]);

  const handleValueSelect = (value: T) => {
    // when an option is selected, add it to the list of values or remove it if it already exists
    setValue((current) =>
      current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
    );
  };
  const handleValueRemove = (val: T) => setValue((current) => current.filter((v) => v !== val));

  const options = allValues
    .filter((v) => v.toLowerCase().includes(search.trim().toLowerCase()))
    .map((v) => (
      <Combobox.Option value={v} key={v} active={true}>
        <Group gap='sm'>
          {value.includes(v) ? <CheckIcon size={12} /> : null}
          <span>{v}</span>
        </Group>
      </Combobox.Option>
    ));
  return (
    <Combobox
      store={combobox}
      onOptionSubmit={(v) => handleValueSelect(v as T)}
      disabled={disabled ?? false}
    >
      <Combobox.DropdownTarget>
        <PillsInput
          onClick={() => combobox.openDropdown()}
          label={label}
          required={required}
          className={className}
        >
          <Pill.Group>
            {value.map((item) => (
              <Pill
                key={item}
                withRemoveButton={!disabled ?? true}
                onRemove={() => handleValueRemove(item)}
              >
                {item}
              </Pill>
            ))}

            <Combobox.EventsTarget>
              <PillsInput.Field
                onFocus={() => combobox.openDropdown()}
                onBlur={() => combobox.closeDropdown()}
                value={search}
                placeholder='Search values'
                onChange={(event) => {
                  combobox.updateSelectedOptionIndex();
                  setSearch(event.currentTarget.value);
                }}
                disabled={disabled ?? false}
              />
            </Combobox.EventsTarget>
          </Pill.Group>
        </PillsInput>
      </Combobox.DropdownTarget>

      <Combobox.Dropdown>
        <Combobox.Options>
          {options.length > 0 ? options : <Combobox.Empty>Nothing found...</Combobox.Empty>}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
};

export default memo(PillsInputWithSearch);
