import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '@/config/supabase';
import i18n from '@/lib/i18n';
import type { SupportedLanguage } from '@/lib/i18n';

interface LanguageState {
  currentLanguage: SupportedLanguage;
  loading: boolean;
  error: string | null;
  isAutoDetected: boolean;
}

const initialState: LanguageState = {
  currentLanguage: 'fr',
  loading: false,
  error: null,
  isAutoDetected: false,
};

// Action asynchrone pour charger la langue utilisateur depuis Supabase
export const loadUserLanguage = createAsyncThunk(
  'language/loadUserLanguage',
  async (userId: string, { rejectWithValue }) => {
    try {
      // Vérifier d'abord le localStorage
      const savedLanguage = localStorage.getItem('wedding-app-language');
      if (savedLanguage && ['fr', 'en', 'es'].includes(savedLanguage)) {
        await i18n.changeLanguage(savedLanguage);
        return {
          language: savedLanguage as SupportedLanguage,
          isAutoDetected: false,
        };
      }

      // Charger depuis Supabase si pas dans localStorage
      const { data, error } = await supabase
        .from('profiles')
        .select('language')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      let language: SupportedLanguage = 'fr';
      let isAutoDetected = false;

      if (data?.language && ['fr', 'en', 'es'].includes(data.language)) {
        language = data.language as SupportedLanguage;
      } else {
        // Auto-détection depuis le navigateur
        const browserLanguage = navigator.language.split('-')[0];
        if (['fr', 'en', 'es'].includes(browserLanguage)) {
          language = browserLanguage as SupportedLanguage;
          isAutoDetected = true;
        }
      }

      // Changer la langue dans i18n
      await i18n.changeLanguage(language);

      return { language, isAutoDetected };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Erreur lors du chargement de la langue'
      );
    }
  }
);

// Action asynchrone pour sauvegarder la langue utilisateur dans Supabase
export const saveUserLanguage = createAsyncThunk(
  'language/saveUserLanguage',
  async ({ userId, language }: { userId: string; language: SupportedLanguage }, { rejectWithValue }) => {
    try {
      // Sauvegarder dans Supabase
      const { error } = await supabase
        .from('profiles')
        .update({ language })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      // Sauvegarder dans localStorage
      localStorage.setItem('wedding-app-language', language);

      // Changer la langue dans i18n
      await i18n.changeLanguage(language);

      return language;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Erreur lors de la sauvegarde de la langue'
      );
    }
  }
);

// Action pour changer la langue sans utilisateur connecté (mode démo)
export const changeLanguageDemo = createAsyncThunk(
  'language/changeLanguageDemo',
  async (language: SupportedLanguage) => {
    // Sauvegarder dans localStorage
    localStorage.setItem('wedding-app-language', language);
    
    // Changer la langue dans i18n
    await i18n.changeLanguage(language);
    
    return language;
  }
);

export const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    setCurrentLanguage: (state, action: PayloadAction<SupportedLanguage>) => {
      state.currentLanguage = action.payload;
      state.isAutoDetected = false;
    },
    setAutoDetected: (state, action: PayloadAction<boolean>) => {
      state.isAutoDetected = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Load User Language
      .addCase(loadUserLanguage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadUserLanguage.fulfilled, (state, action) => {
        state.loading = false;
        state.currentLanguage = action.payload.language;
        state.isAutoDetected = action.payload.isAutoDetected;
      })
      .addCase(loadUserLanguage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Save User Language
      .addCase(saveUserLanguage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveUserLanguage.fulfilled, (state, action) => {
        state.loading = false;
        state.currentLanguage = action.payload;
        state.isAutoDetected = false;
      })
      .addCase(saveUserLanguage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Change Language Demo
      .addCase(changeLanguageDemo.fulfilled, (state, action) => {
        state.currentLanguage = action.payload;
        state.isAutoDetected = false;
      });
  },
});

export const { 
  setCurrentLanguage, 
  setAutoDetected, 
  clearError, 
  reset 
} = languageSlice.actions;

export default languageSlice.reducer; 