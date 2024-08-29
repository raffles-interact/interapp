'use client';
import { PillsInput, Pill, Combobox, CheckIcon, Group, useCombobox } from '@mantine/core';
import { Permissions } from '@/app/routePermissions';
import { ReactNode, useEffect, useState } from 'react';

export const permissionsMap: Record<Permissions, string> = {
  [Permissions.VISTOR]: '🛫 Visitor',
  [Permissions.CLUB_MEMBER]: '🏬 Member',
  [Permissions.SERVICE_IC]: '💼 Service IC',
  [Permissions.MENTORSHIP_IC]: '💼 Mentorship IC',
  [Permissions.EXCO]: '🛠️ Exco',
  [Permissions.ATTENDANCE_MANAGER]: '🛠️ Attendance Manager',
  [Permissions.ADMIN]: '👑 Admin',
};

const getKeyByValue = (object: Record<string, string>, value: string) =>
  Object.keys(object).find((key) => object[key] === value);

const PermissionsInput = ({
  defaultValues,
  error,
  onChange,
}: {
  defaultValues: Permissions[];
  error: ReactNode;
  onChange: (newValues: Permissions[]) => void;
}) => {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
  });
  const [search, setSearch] = useState('');

  const [value, setValue] = useState<Permissions[]>(defaultValues ? [...defaultValues] : []);

  useEffect(() => {
    onChange(value);
  }, [value]);

  const handleValueSelect = (perm: Permissions) => {
    setValue((current) =>
      current.includes(perm) ? current.filter((v) => v !== perm) : [...current, perm],
    );
  };
  const handleValueRemove = (val: Permissions) =>
    setValue((current) => current.filter((v) => v !== val));

  const values = value.map((item) => (
    <Pill key={item} withRemoveButton onRemove={() => handleValueRemove(item)}>
      {permissionsMap[item]}
    </Pill>
  ));

  const options = Object.entries(permissionsMap)
    .filter(([_, name]) => name.toLowerCase().includes(search.trim().toLowerCase()))
    .map(([perm, name]) => (
      <Combobox.Option value={name} key={perm} active={true}>
        <Group gap='sm'>
          {value.includes(Number(perm)) ? <CheckIcon size={12} /> : null}
          <span>{name}</span>
        </Group>
      </Combobox.Option>
    ));
  return (
    <Combobox
      store={combobox}
      onOptionSubmit={(perm) => handleValueSelect(Number(getKeyByValue(permissionsMap, perm)))}
    >
      <Combobox.DropdownTarget>
        <PillsInput onClick={() => combobox.openDropdown()} label='Permissions' error={error}>
          <Pill.Group>
            {values}

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

export default PermissionsInput;
