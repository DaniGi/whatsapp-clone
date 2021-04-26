import { useEffect, useState } from 'react';

type Keys = 'contacts' | 'conversations' | 'id';
type InitialValue = [] | (() => {}) | undefined;

type UseLocalStorageFunc = <T>(
  key: Keys,
  initialValue: InitialValue,
) => [T, React.Dispatch<React.SetStateAction<T>>];

const PREFIX = 'whatsapp-clone-';

const useLocalStorage: UseLocalStorageFunc = (key, initialValue) => {
  const prefixedKey = PREFIX + key;
  const [value, setValue] = useState(() => {
    const jsonValue = localStorage.getItem(prefixedKey);
    if (jsonValue != null) return JSON.parse(jsonValue);
    if (typeof initialValue === 'function') {
      return initialValue();
    }
    return initialValue;
  });

  useEffect(() => {
    localStorage.setItem(prefixedKey, JSON.stringify(value));
  }, [prefixedKey, value]);

  return [value, setValue];
};

export default useLocalStorage;
