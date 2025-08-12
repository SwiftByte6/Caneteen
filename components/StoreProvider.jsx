'use client'
import { useRef, useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { makeStore, persistor as persistedPersistor } from '@/redux/store';
import { PersistGate } from 'redux-persist/integration/react';

export default function StoreProvider({ children }) {
  const storeRef = useRef(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  // Create persistor only once, after store creation
  const [persistor, setPersistor] = useState(null);

  useEffect(() => {
    import('redux-persist').then(({ persistStore }) => {
      setPersistor(persistStore(storeRef.current));
    });
  }, []);

  if (!persistor) {
    // Can show a loading indicator or just null until rehydration completes
    return null;
  }

  return (
    <Provider store={storeRef.current}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
