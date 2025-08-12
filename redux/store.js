
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import cartReducer from './slice'; // Adjust the path as needed
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';


const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['cart'], // only persist cart slice
};

const rootReducer = combineReducers({
  cart: cartReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export function makeStore() {
  return configureStore({
    reducer: persistedReducer,
    devTools: process.env.NODE_ENV !== 'production',
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }),
  });
}
